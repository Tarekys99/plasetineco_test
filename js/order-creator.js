// Order Creation Functions
console.log('order-creator.js loaded');

// Create order
async function createOrder(customerData) {
    try {
        console.log('Starting order creation process...');

        // 1. Get UserID
        const userID = getUserID();
        if (!userID) {
            throw new Error('يجب تسجيل الدخول أولاً');
        }

        // 2. Get active shift
        const shiftID = await loadActiveShift();
        if (!shiftID) {
            throw new Error('لا يوجد شفت نشط حالياً');
        }

        // 3. Validate selected zone is still active
        if (window.selectedZone && window.selectedZone.id) {
            const zones = await loadDeliveryZones();
            const selectedZoneData = zones.find(zone => zone.ZoneID === window.selectedZone.id);

            if (!selectedZoneData || !selectedZoneData.IsActive) {
                throw new Error('عذراً، التوصيل غير متاح لهذه المنطقة حالياً. يرجى اختيار منطقة أخرى.');
            }
        }

        // 4. Get or create address
        // 4. Get or create address
        let addressID = null;

        if (window.selectedAddress && window.selectedAddress.AddressID) {
            // Use existing address
            addressID = window.selectedAddress.AddressID;
        } else {
            // Create new address
            if (!window.selectedZone || !window.selectedZone.id) {
                throw new Error('يجب اختيار منطقة التوصيل أولاً');
            }

            addressID = await createNewAddress({
                name: customerData.name,
                city: customerData.city,
                street: customerData.street,
                building: customerData.building,
                phone: customerData.phone,
                zoneId: window.selectedZone.id
            });

            if (!addressID) {
                throw new Error('فشل في إنشاء العنوان');
            }
        }

        // 5. Get payment method
        // 5. Get payment method
        if (!window.selectedPaymentMethod || !window.selectedPaymentMethod.id) {
            throw new Error('يجب اختيار طريقة الدفع');
        }

        // 6. Prepare cart items
        // 6. Prepare cart items
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            throw new Error('السلة فارغة');
        }

        const items = cart.map(item => ({
            Quantity: item.quantity,
            VariantID: item.variantID
        }));

        // Final validation - check if all items have VariantID
        const invalidItems = items.filter(item => !item.VariantID || isNaN(item.VariantID));
        if (invalidItems.length > 0) {
            throw new Error(`خطأ في بيانات ${invalidItems.length} منتج. يرجى إعادة إضافة المنتجات من صفحة المنيو`);
        }

        // 7. Create order request
        // 7. Create order request
        const orderData = {
            AddressID: addressID,
            OrderNotes: customerData.notes || "",
            PaymentID: window.selectedPaymentMethod.id,
            ShiftID: shiftID,
            UserID: userID,
            items: items
        };

        // 8. Send order to API
        const result = await cartApiCall('/orders/create', 'POST', orderData);

        if (result.success) {
            // Clear cart and form
            localStorage.setItem('cart', '[]');

            // Update cart display
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }

            // Trigger order created event for account page auto-refresh
            const orderCreatedEvent = new CustomEvent('orderCreated', {
                detail: { orderID: result.data.OrderID, userID: userID }
            });
            document.dispatchEvent(orderCreatedEvent);
            console.log('Order created event dispatched');

            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً');
            } else {
                alert('تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً');
            }

            // Redirect to login (account page) or refresh page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

            return true;
        } else {
            throw new Error(result.data.message || 'فشل في إرسال الطلب');
        }

    } catch (error) {
        console.error('Order creation error:', error);

        if (typeof showNotification === 'function') {
            showNotification('خطأ: ' + error.message);
        } else {
            alert('خطأ: ' + error.message);
        }

        return false;
    }
}

// Make functions available globally
window.createOrder = createOrder;

console.log('Order creation functions loaded');
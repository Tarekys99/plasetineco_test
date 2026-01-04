// Zone and Payment Management Functions
console.log('zone-payment-manager.js loaded');

// Load delivery zones (only active ones)
async function loadDeliveryZones() {
    try {
        const result = await cartApiCall('/zones/all_zones');

        if (result.success) {
            // Filter only active zones for customer selection
            return result.data.filter(zone => zone.IsActive === true);
        } else {
            console.error('Failed to load zones:', result.data.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading zones:', error);
        return [];
    }
}

// Show delivery area selection modal with API data
async function selectDeliveryArea() {
    console.log('selectDeliveryArea called');

    try {
        // Load zones from API
        console.log('Loading zones from API...');
        const zones = await loadDeliveryZones();
        console.log('Zones loaded:', zones);

        if (zones.length === 0) {
            if (typeof showError === 'function') {
                showError('خطأ في تحميل المناطق. يرجى المحاولة مرة أخرى.');
            } else {
                alert('خطأ في تحميل المناطق. يرجى المحاولة مرة أخرى.');
            }
            return;
        }

        // Show zones modal
        const modal = document.createElement('div');
        modal.className = 'area-modal';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.8) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 99999 !important;
        `;

        modal.innerHTML = `
            <div class="area-modal-content" style="
                background: rgba(30, 30, 30, 0.95) !important;
                padding: 30px !important;
                border-radius: 15px !important;
                border: 2px solid #fac564 !important;
                text-align: center !important;
                max-width: 500px !important;
                width: 90% !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
                position: relative !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
            ">
                <button onclick="closeAreaModal()" style="
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    font-size: 24px;
                    font-weight: bold;
                    line-height: 1;
                    padding: 0;
                    width: auto;
                    height: auto;
                    transition: color 0.3s ease;
                " onmouseover="this.style.color='#fac564'" onmouseout="this.style.color='#999'">×</button>
                <h3 style="color: #fff; margin-bottom: 20px;">اختر منطقة التوصيل</h3>
                <div class="area-options" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                ">
                    ${zones.map(zone => `
                        <button class="area-option" onclick="selectZone(${zone.ZoneID}, '${zone.ZoneName}', ${zone.DeliveryCost})" style="
                            padding: 15px 20px;
                            border: 2px solid #fac564;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 10px;
                            cursor: pointer;
                            transition: all 0.3s;
                            color: #fff;
                            font-size: 16px;
                            font-weight: 500;
                            text-align: center;
                        " onmouseover="this.style.background='#fac564'; this.style.color='#000';" 
                           onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='#fff';">
                            <span style="display: block; font-weight: bold; margin-bottom: 5px;">${zone.ZoneName}</span>
                            <small style="display: block; font-size: 14px; opacity: 0.8;">رسوم التوصيل: ${zone.DeliveryCost} EGP</small>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        console.log('Modal created and added to page');

    } catch (error) {
        console.error('Error in selectDeliveryArea:', error);
        if (typeof showError === 'function') {
            showError('خطأ في تحميل المناطق: ' + error.message);
        } else {
            alert('خطأ في تحميل المناطق: ' + error.message);
        }
    }
}

// Select zone and update delivery fee
async function selectZone(zoneId, zoneName, deliveryCost) {
    try {
        // Double-check zone status from API before allowing selection
        const zones = await loadDeliveryZones();
        const selectedZoneData = zones.find(zone => zone.ZoneID === zoneId);

        if (!selectedZoneData) {
            alert("عذراً، التوصيل غير متاح لهذه المنطقة حالياً");
            closeAreaModal();
            return;
        }

        if (!selectedZoneData.IsActive) {
            alert("عذراً، التوصيل غير متاح لهذه المنطقة حالياً");
            closeAreaModal();
            return;
        }

        // Store selected zone
        window.selectedZone = {
            id: zoneId,
            name: zoneName,
            cost: parseFloat(deliveryCost)
        };

        // Clear selected address since zone changed
        window.selectedAddress = null;

        // Don't automatically fill city field - let user enter their own city
        // document.getElementById('customer-city').value = zoneName;

        // Update delivery fee in summary
        document.getElementById('delivery-fee').textContent = `${deliveryCost} EGP`;

        // Recalculate total
        if (typeof updateSummary === 'function') {
            updateSummary();
        }

        closeAreaModal();

        // Show success message
        if (typeof showNotification === 'function') {
            showNotification(`تم اختيار ${zoneName} - رسوم التوصيل: ${deliveryCost} EGP`);
        } else {
            alert(`تم اختيار ${zoneName} - رسوم التوصيل: ${deliveryCost} EGP`);
        }
    } catch (error) {
        console.error('Error validating zone:', error);
        alert("عذراً، حدث خطأ في التحقق من المنطقة. يرجى المحاولة مرة أخرى.");
        closeAreaModal();
    }
}

// Close area modal
function closeAreaModal() {
    const modal = document.querySelector('.area-modal');
    if (modal) {
        modal.remove();
    }
}

// Load payment methods from API
async function loadPaymentMethods() {
    try {
        const result = await cartApiCall('/payment/all_payment_methods');

        if (result.success) {
            // Filter only active payment methods
            return result.data.filter(method => method.IsActive);
        } else {
            console.error('Failed to load payment methods:', result.data.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading payment methods:', error);
        return [];
    }
}

// Show payment methods modal with API data
async function showPaymentMethods() {
    console.log('showPaymentMethods called');

    try {
        // Load payment methods from API
        console.log('Loading payment methods from API...');
        const methods = await loadPaymentMethods();
        console.log('Payment methods loaded:', methods);

        if (methods.length === 0) {
            if (typeof showError === 'function') {
                showError('خطأ في تحميل طرق الدفع. يرجى المحاولة مرة أخرى.');
            } else {
                alert('خطأ في تحميل طرق الدفع. يرجى المحاولة مرة أخرى.');
            }
            return;
        }

        // Show payment methods modal
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.8) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 99999 !important;
        `;

        modal.innerHTML = `
            <div style="
                background: rgba(30, 30, 30, 0.95) !important;
                padding: 30px !important;
                border-radius: 15px !important;
                border: 2px solid #fac564 !important;
                text-align: center !important;
                max-width: 400px !important;
                width: 90% !important;
                position: relative !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
            ">
                <button onclick="closePaymentModal()" style="
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    font-size: 24px;
                    font-weight: bold;
                    line-height: 1;
                    padding: 0;
                    width: auto;
                    height: auto;
                    transition: color 0.3s ease;
                " onmouseover="this.style.color='#fac564'" onmouseout="this.style.color='#999'">×</button>
                <h3 style="margin-bottom: 20px; color: #fff; font-size: 18px;">اختر طريقة الدفع</h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                ">
                    ${methods.map(method => `
                        <button onclick="selectPaymentMethod(${method.PaymentID}, '${method.PaymentName}')" style="
                            padding: 20px 15px;
                            border: 2px solid #fac564;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 10px;
                            cursor: pointer;
                            transition: all 0.3s;
                            color: #fff;
                            font-size: 16px;
                            font-weight: 500;
                            text-align: center;
                        " onmouseover="this.style.background='#fac564'; this.style.color='#000';" 
                           onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='#fff';">
                            <i class="${method.PaymentName.includes('كاش') ? 'icon-money' : 'icon-wallet'}" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                            <span>${method.PaymentName}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        console.log('Payment modal created and added to page');

    } catch (error) {
        console.error('Error in showPaymentMethods:', error);
        if (typeof showError === 'function') {
            showError('خطأ في تحميل طرق الدفع: ' + error.message);
        } else {
            alert('خطأ في تحميل طرق الدفع: ' + error.message);
        }
    }
}

// Select payment method
function selectPaymentMethod(paymentId, paymentName) {
    // Store selected payment method
    window.selectedPaymentMethod = {
        id: paymentId,
        name: paymentName
    };

    // Update UI
    document.getElementById('selected-payment').textContent = paymentName;

    closePaymentModal();

    // Show success message
    if (typeof showNotification === 'function') {
        showNotification(`تم اختيار طريقة الدفع: ${paymentName}`);
    }
}

// Close payment modal
function closePaymentModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.remove();
    }
}

// Make functions available globally
window.loadDeliveryZones = loadDeliveryZones;
window.selectDeliveryArea = selectDeliveryArea;
window.selectZone = selectZone;
window.closeAreaModal = closeAreaModal;
window.loadPaymentMethods = loadPaymentMethods;
window.showPaymentMethods = showPaymentMethods;
window.selectPaymentMethod = selectPaymentMethod;
window.closePaymentModal = closePaymentModal;

console.log('Zone and payment management functions loaded');
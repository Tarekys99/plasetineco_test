// User Orders Handler
console.log('user-orders.js loaded');

function showDeliveryConfirmDialog(orderNumber) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'delivery-confirm-modal';
        overlay.style.cssText = `
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

        overlay.innerHTML = `
            <div style="
                background: rgba(30, 30, 30, 0.95) !important;
                padding: 25px 20px !important;
                border-radius: 15px !important;
                border: 2px solid #fac564 !important;
                text-align: center !important;
                max-width: 380px !important;
                width: 90% !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
                direction: rtl !important;
                color: #fff !important;
                font-family: 'Cairo', 'Poppins', sans-serif !important;
            ">
                <h3 style="margin-bottom: 10px; font-size: 18px;">تأكيد استلام الطلب</h3>
                <p style="margin-bottom: 20px; font-size: 15px; color: #ddd;">
                    هل أنت متأكد من تأكيد استلام الطلب رقم ${orderNumber}؟
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="confirm-delivery-yes" style="
                        padding: 8px 18px;
                        border-radius: 20px;
                        border: none;
                        background: #28a745;
                        color: #fff;
                        font-weight: bold;
                        cursor: pointer;
                        min-width: 100px;
                    ">تأكيد</button>
                    <button id="confirm-delivery-no" style="
                        padding: 8px 18px;
                        border-radius: 20px;
                        border: 1px solid #ccc;
                        background: transparent;
                        color: #fff;
                        cursor: pointer;
                        min-width: 100px;
                    ">إلغاء</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        function cleanup(result) {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            resolve(result);
        }

        const yesButton = overlay.querySelector('#confirm-delivery-yes');
        const noButton = overlay.querySelector('#confirm-delivery-no');

        if (yesButton) {
            yesButton.addEventListener('click', function () {
                cleanup(true);
            });
        }

        if (noButton) {
            noButton.addEventListener('click', function () {
                cleanup(false);
            });
        }

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                cleanup(false);
            }
        });
    });
}

// Handle confirm delivery button click
async function handleConfirmDelivery(orderId, orderNumber, buttonElement) {
    // Show confirmation dialog
    const userConfirmed = await showDeliveryConfirmDialog(orderNumber);
    if (!userConfirmed) {
        return;
    }

    // Show loading state
    const button = buttonElement;
    const originalText = button.innerHTML;

    button.innerHTML = '<i class="icon-user" style="animation: spin 1s linear infinite; margin-left: 5px;"></i> جاري التأكيد...';
    button.disabled = true;

    console.log(`Confirming delivery for Order ID: ${orderId}, Order Number: ${orderNumber}`);

    try {
        const result = await confirmOrderDelivery(orderId);

        if (result.success) {
            // Show success message
            button.innerHTML = '<i class="icon-user" style="margin-left: 5px;"></i> تم التأكيد بنجاح';
            button.style.background = '#28a745';

            // Trigger order status changed event for account page auto-refresh
            const statusChangedEvent = new CustomEvent('orderStatusChanged', {
                detail: { orderID: orderId, orderNumber: orderNumber, newStatus: 'delivered' }
            });
            document.dispatchEvent(statusChangedEvent);
            console.log('Order status changed event dispatched');

            // Reload orders after 1 second to show updated status
            setTimeout(() => {
                const userID = getUserID();
                if (userID) {
                    loadUserOrders(userID);
                }
            }, 1000);

        } else {
            // Show error message
            console.error('Order update failed:', result.error);
            if (typeof showError === 'function') {
                showError(`خطأ في تأكيد الاستلام: ${result.error}`);
            } else {
                alert(`خطأ في تأكيد الاستلام: ${result.error}`);
            }
            button.innerHTML = originalText;
            button.disabled = false;
        }

    } catch (error) {
        console.error('Error in handleConfirmDelivery:', error);
        if (typeof showError === 'function') {
            showError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        } else {
            alert('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        }
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Update order status to delivered
async function confirmOrderDelivery(orderId) {
    try {
        console.log(`Updating order ${orderId} to delivered status`);

        // Send new_status as query parameter, not in body
        const response = await fetch(`https://pizza-alslam-apis.onrender.com/orders/${orderId}/status?new_status=delivered`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            // Try to get error details from response
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                console.log('Error response:', errorData);
                errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage;
            } catch (e) {
                console.log('Could not parse error response');
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Order updated successfully:', result);
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Load user orders
async function loadUserOrders(userID) {
    try {
        console.log(`Loading orders for user: ${userID}`);
        const ordersContainer = document.getElementById('orders-container');

        if (!userID) {
            console.error('No userID provided');
            ordersContainer.innerHTML = '<p style="color: #dc3545;">خطأ: معرف المستخدم غير موجود</p>';
            return;
        }

        // Make API call to get user orders
        console.log(`Fetching orders from: https://pizza-alslam-apis.onrender.com/orders/user_orders/${userID}`);
        const response = await fetch(`https://pizza-alslam-apis.onrender.com/orders/user_orders/${userID}`);

        console.log(`Orders API response status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const orders = await response.json();
        console.log('Orders received from API:', orders);
        console.log(`Total orders count: ${orders ? orders.length : 0}`);

        if (!Array.isArray(orders) || orders.length === 0) {
            console.log('No orders found for user');
            ordersContainer.innerHTML = `
                <div style="text-align: center; color: #666; padding: 20px;">
                    <i class="icon-tag" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    <p>لا توجد طلبات سابقة</p>
                </div>
            `;
            return;
        }

        // Sort orders by OrderTimestamp (newest first) then take last 3
        const sortedOrders = orders.sort((a, b) => new Date(b.OrderTimestamp) - new Date(a.OrderTimestamp));
        console.log('Orders sorted by date (newest first):', sortedOrders);

        // Take first 3 (which are the newest after sorting)
        const recentOrders = sortedOrders.slice(0, 3);
        console.log('Recent orders to display:', recentOrders);

        // Generate orders HTML
        const ordersHTML = recentOrders.map(order => {
            const orderDate = new Date(order.OrderTimestamp);
            const formattedDate = orderDate.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Translate order status to Arabic - Only 4 statuses
            const statusMap = {
                'preparing': 'قيد التحضير',
                'in_delivery': 'في الطريق',
                'delivered': 'تم التوصيل',
                'cancelled': 'ملغي'
            };

            const statusArabic = statusMap[order.OrderStatus] || order.OrderStatus;

            // Status color - Only 4 statuses
            const statusColors = {
                'preparing': '#17a2b8',
                'in_delivery': '#fd7e14',
                'delivered': '#28a745',
                'cancelled': '#dc3545'
            };

            const statusColor = statusColors[order.OrderStatus] || '#6c757d';

            // Determine if order can be confirmed as delivered
            // Show button for any order that is not already delivered or cancelled
            const canConfirmDelivery = order.OrderStatus !== 'delivered' && order.OrderStatus !== 'cancelled';
            const isCompleted = order.OrderStatus === 'delivered';
            const isCancelled = order.OrderStatus === 'cancelled';

            console.log(`Order ${order.OrderNumber}: Status = ${order.OrderStatus}, Can confirm = ${canConfirmDelivery}`);

            return `
                <div class="order-item" style="
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: white;
                    transition: box-shadow 0.2s;
                " onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                   onmouseout="this.style.boxShadow='none'">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="font-weight: bold; color: #333;">
                            <i class="icon-tag" style="margin-left: 5px; color: #fac564;"></i>
                            طلب رقم ${order.OrderNumber}
                        </div>
                        <div style="
                            background: ${statusColor};
                            color: white;
                            padding: 4px 12px;
                            border-radius: 15px;
                            font-size: 12px;
                            font-weight: bold;
                        ">
                            ${statusArabic}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #666;">
                            <i class="icon-shopping-cart" style="margin-left: 5px;"></i>
                            المبلغ الإجمالي:
                        </span>
                        <span style="color: #333; font-weight: bold;">${parseFloat(order.TotalPrice).toFixed(2)} EGP</span>
                    </div>
                    
                    <div style="color: #666; font-size: 14px; margin-bottom: 10px;">
                        <i class="icon-user" style="margin-left: 5px;"></i>
                        ${formattedDate}
                    </div>

                    ${canConfirmDelivery ? `
                        <div style="text-align: center; margin-top: 15px;">
                            <button onclick="handleConfirmDelivery(${order.OrderID}, ${order.OrderNumber}, this)" 
                                    style="
                                        background: #28a745;
                                        color: white;
                                        border: none;
                                        padding: 8px 20px;
                                        border-radius: 20px;
                                        cursor: pointer;
                                        font-size: 14px;
                                        font-weight: bold;
                                        transition: background 0.3s;
                                    "
                                    onmouseover="this.style.background='#218838'"
                                    onmouseout="this.style.background='#28a745'">
                                <i class="icon-user" style="margin-left: 5px;"></i>
                                تأكيد الاستلام
                            </button>
                        </div>
                    ` : ''}

                    ${isCompleted ? `
                        <div style="text-align: center; margin-top: 15px;">
                            <div style="
                                background: #d4edda;
                                color: #155724;
                                padding: 8px 15px;
                                border-radius: 20px;
                                font-size: 14px;
                                font-weight: bold;
                                border: 1px solid #c3e6cb;
                            ">
                                <i class="icon-user" style="margin-left: 5px;"></i>
                                تم اكتمال الطلب
                            </div>
                        </div>
                    ` : ''}

                    ${isCancelled ? `
                        <div style="text-align: center; margin-top: 15px;">
                            <div style="
                                background: #f8d7da;
                                color: #721c24;
                                padding: 8px 15px;
                                border-radius: 20px;
                                font-size: 14px;
                                font-weight: bold;
                                border: 1px solid #f5c6cb;
                            ">
                                <i class="icon-user" style="margin-left: 5px;"></i>
                                طلب ملغي
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        ordersContainer.innerHTML = ordersHTML;

    } catch (error) {
        console.error('Error loading user orders:', error);
        const ordersContainer = document.getElementById('orders-container');
        ordersContainer.innerHTML = `
            <div style="text-align: center; color: #dc3545; padding: 20px;">
                <i class="icon-user" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                <p>خطأ في تحميل الطلبات</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Make functions available globally
window.loadUserOrders = loadUserOrders;
window.handleConfirmDelivery = handleConfirmDelivery;

console.log('User orders handler loaded');
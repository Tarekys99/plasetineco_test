// Account Page Handler
console.log('account-page.js loaded');

// Auto-refresh system for account page
let ordersRefreshInterval = null;
let isAccountPageActive = false;

// Event listeners for automatic updates
function setupAccountPageAutoRefresh() {
    // Listen for order creation events
    document.addEventListener('orderCreated', function () {
        console.log('Order created event detected - refreshing account page');
        if (isAccountPageActive) {
            setTimeout(() => {
                refreshOrdersIfAccountActive();
            }, 2000); // Wait 2 seconds for order to be processed
        }
    });

    // Listen for order status change events
    document.addEventListener('orderStatusChanged', function () {
        console.log('Order status changed event detected - refreshing account page');
        if (isAccountPageActive) {
            setTimeout(() => {
                refreshOrdersIfAccountActive();
            }, 1000); // Wait 1 second for status to be updated
        }
    });

    // Listen for cart updates (when user adds items)
    document.addEventListener('cartUpdated', function () {
        console.log('Cart updated - account page may need refresh on next visit');
    });
}

// Refresh orders only if account page is currently active
function refreshOrdersIfAccountActive() {
    if (isAccountPageActive) {
        const user = getCurrentUser();
        if (user && user.userID) {
            console.log('Auto-refreshing orders for active account page');
            loadUserOrders(user.userID);
        }
    }
}

// Enhanced auto-refresh with shorter intervals and event-based updates
function startAccountPageAutoRefresh(userID) {
    // Clear any existing interval
    if (ordersRefreshInterval) {
        clearInterval(ordersRefreshInterval);
    }

    // Set up periodic refresh every 15 seconds (reduced from 30)
    ordersRefreshInterval = setInterval(() => {
        if (isAccountPageActive) {
            console.log('Periodic auto-refresh of orders...');
            loadUserOrders(userID);
        }
    }, 15000);

    // Store interval ID globally
    window.ordersRefreshInterval = ordersRefreshInterval;
}

// Stop auto-refresh when leaving account page
function stopAccountPageAutoRefresh() {
    isAccountPageActive = false;
    if (ordersRefreshInterval) {
        clearInterval(ordersRefreshInterval);
        ordersRefreshInterval = null;
    }
    if (window.ordersRefreshInterval) {
        clearInterval(window.ordersRefreshInterval);
        window.ordersRefreshInterval = null;
    }
}

// Show Account Page for logged in users
function showAccountPage(user) {
    const loginContainer = document.querySelector('.login-container');

    // Add top margin to avoid offers banner
    loginContainer.style.marginTop = '120px';

    loginContainer.innerHTML = `
        <div class="login-card">
            <div class="account-header" style="text-align: center; margin-bottom: 30px;">
                <i class="icon-user" style="font-size: 48px; color: #fac564; margin-bottom: 15px;"></i>
                <h2 style="color: #333; margin-bottom: 10px;">حسابي</h2>
                <p style="color: #666;">مرحباً بك ${user.firstName || ''} ${user.lastName || ''}</p>
            </div>

            <div class="account-info" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">معلومات الحساب</h3>
                
                ${user.firstName ? `<div class="info-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #666;">الاسم الأول:</span>
                    <span style="color: #333; font-weight: bold;">${user.firstName}</span>
                </div>` : ''}
                
                ${user.lastName ? `<div class="info-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #666;">الاسم الأخير:</span>
                    <span style="color: #333; font-weight: bold;">${user.lastName}</span>
                </div>` : ''}
                
                <div class="info-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #666;">رقم الهاتف:</span>
                    <span style="color: #333; font-weight: bold;">${user.phone}</span>
                </div>
            </div>

            <!-- Recent Orders Section -->
            <div class="recent-orders" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: #333; font-size: 18px; margin: 0;">
                        <i class="icon-tag"></i> آخر الطلبات
                    </h3>
                    <button onclick="refreshOrders()" style="
                        background: #fac564;
                        color: #000;
                        border: none;
                        padding: 5px 15px;
                        border-radius: 15px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: bold;
                    ">
                        <i class="icon-refresh"></i> تحديث
                    </button>
                </div>
                <div id="orders-container" style="text-align: center; color: #666;">
                    <i class="icon-user" style="animation: spin 1s linear infinite;"></i> جاري تحميل الطلبات...
                </div>
            </div>

            <div class="account-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="window.location.href='index.html'" class="submit-btn" style="flex: 1; background: #fac564; color: #000;">
                    <i class="icon-home"></i> الصفحة الرئيسية
                </button>
                
                <button onclick="window.location.href='menu.html'" class="submit-btn" style="flex: 1; background: #28a745; color: white;">
                    <i class="icon-menu"></i> المنيو
                </button>
                
                <button onclick="window.location.href='cart.html'" class="submit-btn" style="flex: 1; background: #17a2b8; color: white;">
                    <i class="icon-shopping-cart"></i> المشتريات
                </button>
                
                <button onclick="confirmLogout()" class="submit-btn" style="flex: 1; background: #dc3545; color: white;">
                    <i class="icon-login"></i> تسجيل الخروج
                </button>
            </div>
        </div>
    `;

    // Load user orders after rendering the page
    console.log('Loading orders for user in account page:', user.userID);
    loadUserOrders(user.userID);

    // Mark account page as active
    isAccountPageActive = true;

    // Set up enhanced auto-refresh system
    startAccountPageAutoRefresh(user.userID);

    // Update navbar to show account page as active
    setTimeout(() => {
        // Remove active class from all nav items
        document.querySelectorAll('.navbar .nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to login nav item (account page)
        const loginNavItem = document.querySelector('.navbar .nav-item a[href="login.html"]');
        if (loginNavItem) {
            loginNavItem.parentElement.classList.add('active');
        }

        // Ensure icons are visible
        ensureIconFontsLoaded();
    }, 200);
}

// Confirm logout function
function confirmLogout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        // Stop auto-refresh system
        stopAccountPageAutoRefresh();
        logout();
    }
}

// Refresh orders function
function refreshOrders() {
    const user = getCurrentUser();
    console.log('Refreshing orders for user:', user);

    if (user && user.userID) {
        const ordersContainer = document.getElementById('orders-container');
        ordersContainer.innerHTML = '<i class="icon-user" style="animation: spin 1s linear infinite;"></i> جاري تحديث الطلبات...';
        console.log('Calling loadUserOrders with userID:', user.userID);
        loadUserOrders(user.userID);
    } else {
        console.error('No user found or userID missing');
        if (typeof showError === 'function') {
            showError('خطأ: لم يتم العثور على معرف المستخدم');
        } else {
            alert('خطأ: لم يتم العثور على معرف المستخدم');
        }
    }
}

// Make functions available globally
window.showAccountPage = showAccountPage;
window.confirmLogout = confirmLogout;
window.refreshOrders = refreshOrders;
window.setupAccountPageAutoRefresh = setupAccountPageAutoRefresh;
window.stopAccountPageAutoRefresh = stopAccountPageAutoRefresh;

// Initialize auto-refresh system when page loads
document.addEventListener('DOMContentLoaded', function () {
    setupAccountPageAutoRefresh();
});

console.log('Account page handler loaded');

// Stop auto-refresh when page is about to unload or user navigates away
window.addEventListener('beforeunload', function () {
    console.log('Page unloading - stopping account page auto-refresh');
    stopAccountPageAutoRefresh();
});

// Stop auto-refresh when page visibility changes (user switches tabs)
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        console.log('Page hidden - pausing account page auto-refresh');
        isAccountPageActive = false;
    } else {
        console.log('Page visible - resuming account page auto-refresh if on account page');
        // Only resume if we're actually on the account page
        const loginContainer = document.querySelector('.login-container .account-header');
        if (loginContainer) {
            isAccountPageActive = true;
        }
    }
});
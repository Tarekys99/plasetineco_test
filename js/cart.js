// Shopping Cart Management System

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add item to cart
function addToCart(item) {
    // Validate item data
    if (!item.name || !item.price || !item.image) {
        console.error('Invalid item data:', item);
        showNotification('خطأ في إضافة المنتج');
        return false;
    }

    // Check if item already exists in cart (including variantID for exact match)
    const existingItemIndex = cart.findIndex(cartItem =>
        cartItem.name === item.name && cartItem.variantID === item.variantID
    );

    if (existingItemIndex > -1) {
        // Item exists, increase quantity
        cart[existingItemIndex].quantity += (item.quantity || 1);
    } else {
        // New item, add to cart with complete data including variantID
        cart.push({
            name: item.name,
            price: parseFloat(item.price) || 0,
            image: item.image || 'right_images/logo.png',
            description: item.description || '',
            quantity: parseInt(item.quantity) || 1,
            size: item.size || '',
            variantID: item.variantID || null // حفظ VariantID
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count in navbar
    updateCartCount();

    // Show notification
    showNotification(`تم إضافة ${item.name} إلى المشتريات`);

    // Dispatch custom event for cart update
    document.dispatchEvent(new CustomEvent('cartUpdated'));

    return true;
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    document.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Update item quantity
function updateCartQuantity(index, quantity) {
    if (quantity < 1) {
        removeFromCart(index);
        return;
    }
    cart[index].quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    document.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart count badge in navbar
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
    const count = getCartItemCount();

    console.log('updateCartCount called - Count:', count, 'Elements found:', cartCountElements.length);

    cartCountElements.forEach((element, index) => {
        if (element) {
            console.log(`Updating element ${index}:`, element);
            element.textContent = count;
            if (count > 0) {
                element.style.display = 'inline-block';
            } else {
                element.style.display = 'none';
            }
        }
    });

    // Update cart summary bar
    updateCartSummaryBar();
}

// Update cart summary bar
function updateCartSummaryBar() {
    const cartBar = document.getElementById('cart-summary-bar');
    const cartBarCount = document.getElementById('cart-bar-count');
    const cartBarTotal = document.getElementById('cart-bar-total');

    console.log('updateCartSummaryBar called');
    console.log('cartBar element:', cartBar);

    if (!cartBar) {
        console.log('Cart bar element not found');
        return;
    }

    const count = getCartItemCount();
    const total = getCartTotal();

    console.log('Cart count:', count, 'Total:', total);

    if (count > 0) {
        cartBar.classList.add('show');
        console.log('Showing cart bar');

        if (cartBarCount) {
            cartBarCount.textContent = count + ' عنصر';
            cartBarCount.style.direction = 'rtl';
            cartBarCount.style.unicodeBidi = 'normal';
        }

        if (cartBarTotal) {
            cartBarTotal.textContent = total.toFixed(2) + ' EGP';
            cartBarTotal.style.direction = 'ltr';
            cartBarTotal.style.unicodeBidi = 'embed';
        }
    } else {
        cartBar.classList.remove('show');
        console.log('Hiding cart bar - no items');
    }

    // cartBar.classList.add('show');
}

// Clear entire cart
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Show notification
function showNotification(message) {
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.cart-notification');
    existingNotifications.forEach(n => n.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="icon-check"></i>
        <span>${message}</span>
    `;

    // Add styles with !important for mobile compatibility
    notification.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        background: #ffffff !important;
        color: #000 !important;
        -webkit-text-fill-color: #000 !important;
        text-shadow: none !important;
        padding: 20px 30px !important;
        border-radius: 10px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        z-index: 99999 !important;
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        font-weight: bold !important;
        font-size: 16px !important;
        border: 2px solid #fac564 !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
        max-width: 90vw !important;
        text-align: center !important;
    `;

    // Add to page first
    document.body.appendChild(notification);

    // Force reflow then show with opacity
    notification.offsetHeight;
    notification.style.opacity = '1';

    // Remove after 2.5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2500);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function () {
    // Small delay to ensure DOM is fully ready
    setTimeout(function () {
        updateCartCount();
        console.log('Cart count initialized on page load');
    }, 100);

    // Add cart link to navbar if it doesn't exist
    const navbar = document.querySelector('.navbar-nav');
    if (navbar && !document.querySelector('a[href="cart.html"]')) {
        const cartLink = document.createElement('li');
        cartLink.className = 'nav-item';
        cartLink.innerHTML = `
            <a href="cart.html" class="nav-link">
                Cart <span class="badge badge-warning cart-count" style="display: none;">0</span>
            </a>
        `;
        navbar.appendChild(cartLink);
        updateCartCount();
    }
});

// Listen for storage events to update cart count across tabs/windows
window.addEventListener('storage', function (e) {
    if (e.key === 'cart') {
        // Update cart data from localStorage
        cart = JSON.parse(e.newValue || '[]');
        updateCartCount();

        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    }
});

// Also listen for custom cart update events within the same page
document.addEventListener('cartUpdated', function () {
    updateCartCount();
});

// Update cart count when page becomes visible (tab switching)
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        // Refresh cart data from localStorage when page becomes visible
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        updateCartCount();
    }
});

// Periodically check and update cart count (fallback mechanism)
setInterval(function () {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentCount = currentCart.reduce((count, item) => count + item.quantity, 0);
    const displayedCount = parseInt(document.querySelector('.cart-count')?.textContent || '0');

    if (currentCount !== displayedCount) {
        cart = currentCart;
        updateCartCount();
    }
}, 2000); // Check every 2 seconds

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartTotal,
        getCartItemCount,
        clearCart,
        cart
    };
}

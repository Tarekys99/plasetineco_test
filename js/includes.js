// Load Header and Footer includes
(function () {
    'use strict';

    // Function to load HTML content
    function loadHTML(elementId, filePath, callback) {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = data;
                    if (callback) callback();
                }
            })
            .catch(error => {
                console.error('Error loading ' + filePath + ':', error);
            });
    }

    // Function to set active nav item based on current page
    function setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.classList.remove('active');
            const pageName = item.getAttribute('data-page');
            if (pageName === currentPage) {
                item.classList.add('active');
            }
        });
    }

    // Load header and footer when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        // Load header
        loadHTML('header-placeholder', 'includes/header.html', function () {
            setActiveNavItem();
            // Update cart count after header is loaded
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
        });

        // Load footer
        loadHTML('footer-placeholder', 'includes/footer.html');
    });
})();

// Simple includes system using jQuery
(function () {
    'use strict';

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
    $(document).ready(function () {
        var headerLoaded = false;
        var footerLoaded = false;

        function checkAllLoaded() {
            if (headerLoaded && footerLoaded) {
                // Hide loader after includes are loaded
                setTimeout(function () {
                    if ($('#ftco-loader').length > 0) {
                        $('#ftco-loader').removeClass('show');
                    }
                }, 100);
            }
        }

        // Load header
        $('#header-placeholder').load('includes/header.html', function () {
            setActiveNavItem();
            // Update cart count after header is loaded
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
            headerLoaded = true;
            checkAllLoaded();
        });

        // Load footer
        $('#footer-placeholder').load('includes/footer.html', function () {
            footerLoaded = true;
            checkAllLoaded();
        });
    });
})();

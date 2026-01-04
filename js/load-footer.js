// Load footer and mobile nav dynamically
document.addEventListener('DOMContentLoaded', function () {
    // Load Footer
    fetch('includes/footer.html?v=2')
        .then(response => response.text())
        .then(data => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
            }
        })
        .catch(error => console.error('Error loading footer:', error));

    // Load Mobile Nav
    fetch('includes/mobile_nav.html')
        .then(response => response.text())
        .then(data => {
            const mobileNavPlaceholder = document.getElementById('mobile-nav-placeholder');
            if (mobileNavPlaceholder) {
                mobileNavPlaceholder.innerHTML = data;
                // Highlight active page
                highlightActiveMobilePage();
            }
        })
        .catch(error => console.error('Error loading mobile nav:', error));
});

function highlightActiveMobilePage() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const mobileItems = document.querySelectorAll('.mobile-nav-item');
    mobileItems.forEach(item => {
        if (item.getAttribute('data-page') === currentPage) {
            item.classList.add('active');
        }
    });
}

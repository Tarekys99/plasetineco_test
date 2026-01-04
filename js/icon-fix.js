// Icon Fonts Fix
console.log('icon-fix.js loaded');

// Ensure icon fonts are loaded (simplified since CSS files are now properly loaded)
function ensureIconFontsLoaded() {
    // Simple refresh for navbar icons
    setTimeout(() => {
        const navbarIcons = document.querySelectorAll('.navbar .nav-link i[class*="icon-"]');
        navbarIcons.forEach(icon => {
            // Ensure proper display
            icon.style.display = 'inline-block';
        });
    }, 100);
}

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Make functions available globally
window.ensureIconFontsLoaded = ensureIconFontsLoaded;

console.log('Icon fonts fix loaded (simplified - CSS files now properly loaded)');
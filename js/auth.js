// Authentication Helper Functions

document.addEventListener('DOMContentLoaded', function () {
    updateNavbarForUser();
});

function updateNavbarForUser() {
    const currentUser = getCurrentUser();
    const loginNavItem = document.querySelector('a[href="login.html"]');

    if (currentUser && loginNavItem) {
        // User is logged in, show user name and logout option
        const navItem = loginNavItem.parentElement;
        navItem.innerHTML = `
            <a href="login.html" class="nav-link">
                <i class="icon-user"></i> ${currentUser.firstName || 'المستخدم'}
            </a>
        `;

        // No dropdown functionality needed anymore - direct link to login.html
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function logout() {
    const userName = getCurrentUser()?.firstName || 'المستخدم';
    localStorage.removeItem('currentUser');

    // Show logout notification if available
    if (typeof showSuccess === 'function') {
        showSuccess('تم تسجيل الخروج بنجاح. إلى اللقاء ' + userName);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } else {
        window.location.href = 'login.html';
    }
}

function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Add user dropdown styles
const style = document.createElement('style');
style.textContent = `
    .user-menu {
        position: relative !important;
    }
    
    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 150px;
        z-index: 1000;
        margin-top: 5px;
    }
    
    .user-dropdown .dropdown-item {
        display: block;
        padding: 10px 15px;
        color: #333;
        text-decoration: none;
        border-radius: 6px;
        margin: 5px;
        transition: background 0.2s;
    }
    
    .user-dropdown .dropdown-item:hover {
        background: #f8f9fa;
        color: #C41E3A;
    }
    
    .user-dropdown .dropdown-item i {
        margin-left: 8px;
        color: #C41E3A;
    }
`;
document.head.appendChild(style);
// Core Authentication Functions
console.log('auth-core.js loaded');

const API_BASE_URL = 'https://plasetineco-apis.onrender.com';

// API call helper function
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(API_BASE_URL + endpoint, options);
        const result = await response.json();

        return {
            success: response.ok,
            data: result,
            status: response.status
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            data: { message: 'خطأ في الاتصال بالخادم' },
            status: 500
        };
    }
}

// Utility function to get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Utility function to get UserID
function getUserID() {
    const user = getCurrentUser();
    return user ? user.userID : null;
}

// Utility function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Utility function to logout
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

// Make functions available globally
window.apiCall = apiCall;
window.getCurrentUser = getCurrentUser;
window.getUserID = getUserID;
window.isLoggedIn = isLoggedIn;
window.logout = logout;

console.log('Core authentication functions loaded');
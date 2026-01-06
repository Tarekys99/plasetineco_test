// Cart Helper Functions
console.log('cart-helpers.js loaded');

const API_BASE_URL = 'https://plasetineco-apis.onrender.com';

// Helper function to get UserID
function getUserID() {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.userID) {
        console.log('Found UserID in currentUser:', user.userID);
        return user.userID;
    }

    user = JSON.parse(localStorage.getItem('user'));
    if (user && user.UserID) {
        console.log('Found UserID in user:', user.UserID);
        return user.UserID;
    }

    if (user && user.userID) {
        console.log('Found userID in user:', user.userID);
        return user.userID;
    }

    console.log('No UserID found in localStorage');
    return null;
}

// API call helper function
async function cartApiCall(endpoint, method = 'GET', data = null) {
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
        console.error('Cart API Error:', error);
        return {
            success: false,
            data: { message: 'خطأ في الاتصال بالخادم' },
            status: 500
        };
    }
}

// Load active shift
async function loadActiveShift() {
    try {
        const result = await cartApiCall('/shifts/all_shifts');

        if (result.success) {
            // Find the active shift
            const activeShift = result.data.find(shift => shift.IsActive === true);
            return activeShift ? activeShift.ShiftID : null;
        } else {
            console.error('Failed to load shifts:', result.data.message);
            return null;
        }
    } catch (error) {
        console.error('Error loading shifts:', error);
        return null;
    }
}

// Make functions available globally
window.getUserID = getUserID;
window.cartApiCall = cartApiCall;
window.loadActiveShift = loadActiveShift;

console.log('Cart helper functions loaded');
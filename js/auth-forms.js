// Authentication Forms Handler
console.log('auth-forms.js loaded');

// دالة مساعدة لاستخراج رسالة الخطأ من API
function getApiErrorMessage(apiResponse) {
    // محاولة استخراج الرسالة من مختلف الأماكن المحتملة في الاستجابة
    if (!apiResponse) {
        return 'حدث خطأ غير متوقع';
    }

    // التحقق من وجود رسالة مباشرة
    if (typeof apiResponse === 'string') {
        return apiResponse;
    }

    // التحقق من الحقول الشائعة للرسائل
    if (apiResponse.message) {
        return apiResponse.message;
    }

    if (apiResponse.error) {
        return apiResponse.error;
    }

    if (apiResponse.msg) {
        return apiResponse.msg;
    }

    if (apiResponse.Error) {
        return apiResponse.Error;
    }

    if (apiResponse.Message) {
        return apiResponse.Message;
    }

    // إذا كان هناك حقل details
    if (apiResponse.details) {
        return apiResponse.details;
    }

    // محاولة تحويل الكائن إلى نص
    try {
        const jsonStr = JSON.stringify(apiResponse);
        if (jsonStr !== '{}') {
            return jsonStr;
        }
    } catch (e) {
        // تجاهل الخطأ
    }

    return 'حدث خطأ غير متوقع';
}

// Toggle between signup and login forms
function toggleForms() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const signupToggle = document.getElementById('signup-toggle');
    const loginToggle = document.getElementById('login-toggle');

    if (!signupForm || !loginForm || !signupToggle || !loginToggle) {
        console.error('Form elements not found for toggle functionality');
        return;
    }

    signupToggle.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Switching to signup form');
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
        signupToggle.classList.add('active');
        loginToggle.classList.remove('active');
    });

    loginToggle.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Switching to login form');
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        signupToggle.classList.remove('active');
        loginToggle.classList.add('active');
    });

    // Also handle touch events for better mobile support
    signupToggle.addEventListener('touchend', function (e) {
        e.preventDefault();
        signupToggle.click();
    });

    loginToggle.addEventListener('touchend', function (e) {
        e.preventDefault();
        loginToggle.click();
    });
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    console.log('Signup form submitted');

    const formData = {
        FName: document.getElementById('first-name').value,
        LName: document.getElementById('last-name').value,
        PhoneNumber: document.getElementById('phone-register').value,
        Email: document.getElementById('email-register').value
    };

    console.log('Form data:', formData);

    if (!formData.FName || !formData.LName || !formData.PhoneNumber) {
        showWarning('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    // Show loading notification
    showInfo('جاري إنشاء الحساب...');

    try {
        console.log('Calling API for registration...');
        const result = await apiCall('/users/register', 'POST', formData);
        console.log('Registration API result:', result);

        if (result.success) {
            // Store user data
            const userData = {
                userID: result.data.UserID,
                firstName: formData.FName,
                lastName: formData.LName,
                phone: formData.PhoneNumber,
                email: formData.Email
            };

            console.log('Storing user data:', userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // Show success message
            showSuccess('تم إنشاء الحساب بنجاح! مرحباً بك في بيتزا السلام');

            // Redirect to menu after a short delay
            console.log('Redirecting to menu.html...');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        } else {
            console.log('Registration failed:', result.data);
            // استخدام رسالة الخطأ من API مباشرة
            const errorMessage = getApiErrorMessage(result.data);
            showError(errorMessage);
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('خطأ في الاتصال بالخادم');
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    console.log('Login form submitted');

    const phoneNumber = document.getElementById('phone-login').value;
    console.log('Phone number:', phoneNumber);

    if (!phoneNumber) {
        showWarning('يرجى إدخال رقم الهاتف');
        return;
    }

    // Show loading notification
    showInfo('جاري تسجيل الدخول...');

    try {
        console.log('Calling API for login...');
        const result = await apiCall('/users/login', 'POST', { PhoneNumber: phoneNumber });
        console.log('Login API result:', result);

        if (result.success) {
            // Store user data
            const userData = {
                userID: result.data.UserID,
                firstName: result.data.FName,
                lastName: result.data.LName,
                phone: phoneNumber,
                email: result.data.Email || ''
            };

            console.log('Storing user data:', userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // Show success message
            showSuccess('تم تسجيل الدخول بنجاح! مرحباً بك ' + result.data.FName);

            // Redirect to menu after a short delay
            console.log('Redirecting to menu.html...');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        } else {
            console.log('Login failed:', result.data);
            // استخدام رسالة الخطأ من API مباشرة
            const errorMessage = getApiErrorMessage(result.data);
            showError(errorMessage);

            // إذا كان الخطأ بسبب عدم وجود المستخدم، اقترح التسجيل
            if (result.status === 404 || errorMessage.includes('not found') || errorMessage.includes('غير مسجل') || errorMessage.includes('غير موجود')) {
                const signupToggle = document.getElementById('signup-toggle');
                if (signupToggle) {
                    setTimeout(() => signupToggle.click(), 2000);
                }
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('خطأ في الاتصال بالخادم');
    }
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - initializing auth forms');

    // Check if user is already logged in
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);

    if (currentUser) {
        // User is already logged in, show account page
        console.log('User already logged in, showing account page');
        showAccountPage(currentUser);
        return;
    }

    // Initialize form toggles
    console.log('Initializing form toggles');
    toggleForms();

    // Add form event listeners
    const signupForm = document.getElementById('register-form');
    const loginForm = document.getElementById('signin-form');

    console.log('Signup form element:', signupForm);
    console.log('Login form element:', loginForm);

    if (signupForm) {
        console.log('Adding event listener to signup form');
        signupForm.addEventListener('submit', handleSignup);
    } else {
        console.error('Signup form not found!');
    }

    if (loginForm) {
        console.log('Adding event listener to login form');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found!');
    }
});

// Make functions available globally
window.toggleForms = toggleForms;
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;

console.log('Authentication forms handler loaded');

// Additional mobile-specific event handling
function setupMobileEventHandlers() {
    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll('.toggle-btn, .submit-btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function (e) {
            // Add visual feedback for touch
            this.style.transform = 'scale(0.98)';
        });

        button.addEventListener('touchend', function (e) {
            // Remove visual feedback
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });

    // Improve input handling on mobile
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"]');
    inputs.forEach(input => {
        // Prevent zoom on focus for iOS
        input.addEventListener('focus', function () {
            if (window.innerWidth <= 768) {
                // Temporarily increase font size to prevent zoom
                this.style.fontSize = '16px';
            }
        });

        // Handle virtual keyboard on mobile
        input.addEventListener('blur', function () {
            // Scroll back to top if needed
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
            }
        });
    });
}

// Call mobile setup after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(setupMobileEventHandlers, 500);
});
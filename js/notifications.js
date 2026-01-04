// نظام الإشعارات الموحد - يعمل على جميع الأجهزة
console.log('notifications.js loaded');

// أنواع الإشعارات
const NotificationType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// إنشاء حاوية الإشعارات
function createNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            pointer-events: none;
            width: 90%;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    return container;
}

// الحصول على أيقونة حسب النوع
function getNotificationIcon(type) {
    switch (type) {
        case NotificationType.SUCCESS:
            return '✓';
        case NotificationType.ERROR:
            return '✕';
        case NotificationType.WARNING:
            return '⚠';
        case NotificationType.INFO:
        default:
            return 'ℹ';
    }
}

// الحصول على ألوان حسب النوع - ألوان متناسقة مع الموقع
function getNotificationColors(type) {
    switch (type) {
        case NotificationType.SUCCESS:
            // ذهبي - لون الموقع الرئيسي
            return { bg: '#fff8e6', border: '#fac564', text: '#8a6d3b', icon: '#fac564' };
        case NotificationType.ERROR:
            // أحمر داكن - لون الموقع
            return { bg: '#fce4e8', border: '#C41E3A', text: '#8b1a2d', icon: '#C41E3A' };
        case NotificationType.WARNING:
            // برتقالي ذهبي
            return { bg: '#fff3e0', border: '#e0a030', text: '#7a5a1a', icon: '#e0a030' };
        case NotificationType.INFO:
        default:
            // رمادي داكن مع ذهبي
            return { bg: '#f5f5f5', border: '#333', text: '#333', icon: '#333' };
    }
}

// دالة الإشعار الرئيسية
function showNotification(message, type = NotificationType.INFO, duration = 3000) {
    console.log(`Notification [${type}]: ${message}`);

    // التأكد من أن الصفحة جاهزة
    if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => {
            showNotification(message, type, duration);
        });
        return null;
    }

    const container = createNotificationContainer();
    const colors = getNotificationColors(type);
    const icon = getNotificationIcon(type);

    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = 'app-notification';
    notification.style.cssText = `
        background: ${colors.bg} !important;
        border: 2px solid ${colors.border} !important;
        border-radius: 12px !important;
        padding: 15px 20px !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        pointer-events: auto !important;
        opacity: 0 !important;
        transform: translateY(-20px) !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
        box-sizing: border-box !important;
        direction: rtl !important;
        font-family: 'Cairo', 'Poppins', sans-serif !important;
        -webkit-font-smoothing: antialiased !important;
    `;

    // أيقونة الإشعار
    const iconElement = document.createElement('div');
    iconElement.style.cssText = `
        width: 32px !important;
        height: 32px !important;
        min-width: 32px !important;
        border-radius: 50% !important;
        background: ${colors.icon} !important;
        color: white !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 16px !important;
        font-weight: bold !important;
        flex-shrink: 0 !important;
    `;
    iconElement.textContent = icon;

    // نص الإشعار
    const textElement = document.createElement('div');
    textElement.style.cssText = `
        color: ${colors.text} !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
        flex: 1 !important;
        word-break: break-word !important;
    `;
    textElement.textContent = message;

    // زر الإغلاق
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
        background: none !important;
        border: none !important;
        color: ${colors.text} !important;
        font-size: 20px !important;
        cursor: pointer !important;
        padding: 5px !important;
        margin: 0 !important;
        opacity: 0.6 !important;
        transition: opacity 0.2s !important;
        flex-shrink: 0 !important;
        line-height: 1 !important;
        min-width: 30px !important;
        min-height: 30px !important;
    `;
    closeButton.textContent = '×';
    closeButton.onclick = () => removeNotification(notification);
    closeButton.ontouchend = (e) => {
        e.preventDefault();
        removeNotification(notification);
    };

    notification.appendChild(iconElement);
    notification.appendChild(textElement);
    notification.appendChild(closeButton);

    container.appendChild(notification);

    // إظهار الإشعار بتأثير
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });

    // إزالة الإشعار تلقائياً
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
    }

    return notification;
}

// إزالة الإشعار
function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;

    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// دوال مختصرة للاستخدام السهل
function showSuccess(message, duration = 3000) {
    return showNotification(message, NotificationType.SUCCESS, duration);
}

function showError(message, duration = 4000) {
    return showNotification(message, NotificationType.ERROR, duration);
}

function showWarning(message, duration = 3500) {
    return showNotification(message, NotificationType.WARNING, duration);
}

function showInfo(message, duration = 3000) {
    return showNotification(message, NotificationType.INFO, duration);
}

// استبدال alert الافتراضي
const originalAlert = window.alert;
window.alert = function (message) {
    // تحديد نوع الرسالة تلقائياً
    let type = NotificationType.INFO;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('نجاح') || lowerMessage.includes('تم') || lowerMessage.includes('مرحب')) {
        type = NotificationType.SUCCESS;
    } else if (lowerMessage.includes('خطأ') || lowerMessage.includes('فشل') || lowerMessage.includes('error')) {
        type = NotificationType.ERROR;
    } else if (lowerMessage.includes('تحذير') || lowerMessage.includes('يرجى') || lowerMessage.includes('يجب')) {
        type = NotificationType.WARNING;
    }

    showNotification(message, type, 4000);
};

// جعل الدوال متاحة عالمياً
window.showNotification = showNotification;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.NotificationType = NotificationType;

console.log('Notification system loaded successfully');

// Notifications System

// Create notification container
function createNotificationContainer() {
    if (document.getElementById('notification-container')) return;

    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
}

// Show notification
function showNotification(message, type = 'success') {
    createNotificationContainer();
    const container = document.getElementById('notification-container');

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Shorthand functions
function notifySuccess(message) {
    showNotification(message, 'success');
}

function notifyError(message) {
    showNotification(message, 'error');
}

function notifyWarning(message) {
    showNotification(message, 'warning');
}

function notifyInfo(message) {
    showNotification(message, 'info');
}

// Make globally available
window.showNotification = showNotification;
window.notifySuccess = notifySuccess;
window.notifyError = notifyError;
window.notifyWarning = notifyWarning;
window.notifyInfo = notifyInfo;

/**
 * Toast Manager
 * Manages toast notifications for the instructor interface
 */
export class ToastManager {
  constructor() {
    this.toastContainer = null;
    this.toasts = [];
    
    // Create toast container
    this.createToastContainer();
  }
  
  /**
   * Create the toast container
   */
  createToastContainer() {
    // Check if container already exists
    this.toastContainer = document.querySelector('.toast-container');
    
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
  }
  
  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.title - Toast title
   * @param {string} options.message - Toast message
   * @param {string} options.type - Toast type (success, error, info)
   * @param {number} options.duration - Duration in ms (default: 3000)
   */
  showToast({ title, message, type = 'info', duration = 3000 }) {
    console.log(`Showing ${type} toast: ${title}`);
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Get icon based on type
    let icon;
    switch(type) {
      case 'success':
        icon = 'check-circle';
        break;
      case 'error':
        icon = 'exclamation-circle';
        break;
      default:
        icon = 'info-circle';
    }
    
    // Set content
    toast.innerHTML = `
      <div class="toast-icon text-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <div class="toast-close">
        <i class="fas fa-times"></i>
      </div>
    `;
    
    // Add to container
    this.toastContainer.appendChild(toast);
    
    // Set up close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    // Auto-remove after duration
    setTimeout(() => {
      this.removeToast(toast);
    }, duration);
    
    // Track toast
    this.toasts.push(toast);
  }
  
  /**
   * Remove a toast notification
   * @param {HTMLElement} toast - Toast element to remove
   */
  removeToast(toast) {
    // Add slide-out animation
    toast.classList.add('slide-out');
    
    // Remove after animation completes
    setTimeout(() => {
      if (toast.parentNode === this.toastContainer) {
        this.toastContainer.removeChild(toast);
      }
      
      // Remove from tracking array
      const index = this.toasts.indexOf(toast);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    }, 300); // Animation duration
  }
}

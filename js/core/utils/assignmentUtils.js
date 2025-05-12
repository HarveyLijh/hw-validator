/**
 * Escapes HTML special characters to prevent XSS when displaying code
 * @param {string} text - Text to escape
 * @returns {string} - HTML-escaped text
 */
export function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}

/**
 * Gets the return URL from URL parameters or document.referrer
 * This is especially useful when dealing with Canvas LMS which may not pass the referrer
 * @returns {string|null} - Return URL if available, or null
 */
export function getReturnUrl() {
  // First check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('returnUrl');
  
  if (returnUrl) {
    return decodeURIComponent(returnUrl);
  }
  
  // Fall back to document.referrer if available
  return document.referrer || null;
}
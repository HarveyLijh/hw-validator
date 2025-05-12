/**
 * Helper functions for input components
 */

/**
 * Helper function to format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted file size string
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}
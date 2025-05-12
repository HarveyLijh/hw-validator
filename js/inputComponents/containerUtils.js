// Input container utilities

/**
 * Creates an input container with the specified inputs
 * @param {Array} inputs - Array of input component objects
 * @returns {string} - HTML string with all inputs
 */
export function createInputContainer(inputs) {
  // Handle cases where inputs is undefined or not an array
  if (!inputs || !Array.isArray(inputs)) {
    console.warn('createInputContainer was called with invalid inputs:', inputs);
    return '<div class="space-y-4 input-container"></div>';
  }
  
  return `
    <div class="space-y-4 input-container">
      ${inputs.map(input => input.html).join('')}
    </div>
  `;
}
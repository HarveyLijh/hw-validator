// Collaborator input component

/**
 * Creates a text input component for collaborators
 * @param {Object} config - Configuration for the collaborator input
 * @param {string} config.id - The ID for the textarea element
 * @param {string} config.label - Label text for the textarea
 * @param {string} config.placeholder - Placeholder text
 * @param {number} config.rows - Number of rows for the textarea
 * @param {boolean} config.required - Whether the input is required
 * @returns {Object} - Object containing HTML string and summary function
 */
export function createCollaboratorInput(config) {
  const { 
    id = 'collaborators-input',
    label = 'Collaborators',
    placeholder = 'Enter one email per line',
    rows = 3,
    required = false
  } = config;

  const html = `
    <div class="input-component collaborator-input" data-component-type="collaborator">
      <label class="block">
        <strong class="text-gray-700 mb-2 flex items-center">
          <i class="fas fa-users text-indigo-500 mr-2"></i>${label}${required ? ' <span class="text-red-500 ml-1">*</span>' : ''}:
        </strong>
        <textarea id="${id}" rows="${rows}"
          placeholder="${placeholder}"
          class="mt-2 w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ${required ? 'required' : ''}></textarea>
      </label>
    </div>

    <script>
      document.getElementById('${id}').addEventListener('input', function(e) {
        // Dispatch custom event for input changes
        const event = new CustomEvent('input-changed', { 
          detail: { type: 'collaborator', id: '${id}' }
        });
        document.dispatchEvent(event);
      });
    </script>
  `;

  /**
   * Generates a summary of the collaborator input
   * @param {HTMLElement} element - The textarea element
   * @returns {string} - HTML string with the collaborator summary
   */
  const getSummary = (element) => {
    const collaborators = element.value.trim().split('\n').filter(l => l.trim());
    if (!collaborators.length) return '';

    return `
      <div class="flex items-start">
        <i class="fas fa-users text-indigo-500 mr-2 mt-1"></i>
        <div>
          <strong>${collaborators.length} Collaborator${collaborators.length > 1 ? 's' : ''}:</strong>
          <ul class="list-disc ml-5 mt-1">
            ${collaborators.map(email => `<li>${email}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  };

  /**
   * Validates the collaborator input
   * @param {HTMLElement} element - The textarea element
   * @returns {Object} - Object with isValid and error properties
   */
  const validate = (element) => {
    const collaborators = element.value.trim().split('\n').filter(l => l.trim());
    
    if (required && !collaborators.length) {
      return { 
        isValid: false, 
        error: `Please enter at least one collaborator for "${label}"` 
      };
    }
    
    return { isValid: true };
  };

  return { html, getSummary, validate, id };
}
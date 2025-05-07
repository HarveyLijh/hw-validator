// filepath: /Users/harveyli/Documents/GitHub/unity-hw-validator/js/inputComponents/componentBase.js
/**
 * BaseComponent - A base class for all input components
 * This class follows the Template Method design pattern to provide
 * common functionality and structure for all input components.
 */
export class BaseComponent {
  /**
   * Creates a new component instance
   * @param {Object} config - Common configuration parameters for components
   * @param {string} config.id - The ID for the input element
   * @param {string} config.label - Label text for the input
   * @param {boolean} config.required - Whether the input is required
   * @param {string} config.icon - Font Awesome icon class for the label
   * @param {string} config.componentType - Type identifier for the component
   */
  constructor(config) {
    this.id = config.id;
    this.label = config.label;
    this.required = config.required || false;
    this.icon = config.icon || 'circle';
    this.componentType = config.componentType || 'base';
    
    // Validate required properties
    if (!this.id) {
      throw new Error('Component ID is required');
    }
    
    if (!this.label) {
      throw new Error('Component label is required');
    }
  }

  /**
   * Generate the component HTML - to be implemented by child classes
   * @returns {string} HTML string representing the component
   */
  generateHTML() {
    throw new Error('Child components must implement generateHTML method');
  }

  /**
   * Generate the script for the component
   * @param {Function} onChangeHandler - Custom handler for input changes
   * @returns {string} JavaScript code as a string
   */
  generateScript(onChangeHandler) {
    return `
      <script>
        document.getElementById('${this.id}').addEventListener('input', function(e) {
          // Dispatch custom event for input changes
          const event = new CustomEvent('input-changed', { 
            detail: { type: '${this.componentType}', id: '${this.id}' }
          });
          document.dispatchEvent(event);
          ${onChangeHandler ? `(${onChangeHandler.toString()})(e);` : ''}
        });
      </script>
    `;
  }

  /**
   * Generate common label HTML
   * @returns {string} HTML string for the label
   */
  generateLabel() {
    return `
      <strong class="text-gray-700 mb-2 flex items-center">
        <i class="fas fa-${this.icon} text-indigo-500 mr-2"></i>${this.label}${this.required ? ' <span class="text-red-500 ml-1">*</span>' : ''}:
      </strong>
    `;
  }

  /**
   * Generate the full HTML including wrapper, label, and content
   * @returns {string} Complete HTML for the component
   */
  render() {
    return `
      <div class="input-component ${this.componentType}-component" data-component-type="${this.componentType}">
        <label class="block">
          ${this.generateLabel()}
          ${this.generateHTML()}
        </label>
        ${this.generateScript()}
      </div>
    `;
  }

  /**
   * Generates a summary of the input value
   * @param {HTMLElement} element - The input element
   * @returns {string} - HTML string with the summary
   */
  getSummary(element) {
    throw new Error('Child components must implement getSummary method');
  }

  /**
   * Validates the input
   * @param {HTMLElement} element - The input element
   * @returns {Object} - Object with isValid and error properties
   */
  validate(element) {
    // Default validation for required fields
    if (this.required && (!element.value || element.value.trim() === '')) {
      return {
        isValid: false,
        error: `Please enter a value for "${this.label}"`
      };
    }
    return { isValid: true };
  }

  /**
   * Factory method to create and return the component interface
   * @returns {Object} Object containing html and methods for the component
   */
  create() {
    return {
      html: this.render(),
      getSummary: (el) => this.getSummary(el),
      validate: (el) => this.validate(el),
      id: this.id
    };
  }
}
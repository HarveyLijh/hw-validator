// Collaborator input component
import { BaseComponent } from './componentBase.js';

/**
 * CollaboratorInputComponent class for handling collaborator email inputs
 * @extends BaseComponent
 */
export class CollaboratorInputComponent extends BaseComponent {
  /**
   * Creates a new collaborator input component
   * @param {Object} config - Configuration for the collaborator input
   * @param {string} config.id - The ID for the textarea element
   * @param {string} config.label - Label text for the textarea
   * @param {string} config.placeholder - Placeholder text
   * @param {number} config.rows - Number of rows for the textarea
   * @param {boolean} config.required - Whether the input is required
   */
  constructor(config) {
    super({
      ...config,
      id: config.id || 'collaborators-input',
      label: config.label || 'Collaborators',
      icon: 'users',
      componentType: 'collaborator'
    });

    this.placeholder = config.placeholder || 'Enter one email per line';
    this.rows = config.rows || 3;
  }

  /**
   * Generate the component HTML for collaborator input
   * @returns {string} HTML string representing the component
   */
  generateHTML() {
    return `
      <textarea id="${this.id}" rows="${this.rows}"
        placeholder="${this.placeholder}"
        class="mt-2 w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ${this.required ? 'required' : ''}></textarea>
    `;
  }

  /**
   * Generates a summary of the collaborator input
   * @param {HTMLElement} element - The textarea element
   * @returns {string} - HTML string with the collaborator summary
   */
  getSummary(element) {
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
  }

  /**
   * Validates the collaborator input
   * @param {HTMLElement} element - The textarea element
   * @returns {Object} - Object with isValid and error properties
   */
  validate(element) {
    const collaborators = element.value.trim().split('\n').filter(l => l.trim());
    
    if (this.required && !collaborators.length) {
      return { 
        isValid: false, 
        error: `Please enter at least one collaborator for "${this.label}"` 
      };
    }
    
    return { isValid: true };
  }
}

/**
 * Creates a text input component for collaborators
 * @param {Object} config - Configuration for the collaborator input
 * @returns {Object} - Object containing HTML string and summary function
 */
export function createCollaboratorInput(config = {}) {
  const component = new CollaboratorInputComponent(config);
  return component.create();
}
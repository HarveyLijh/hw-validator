// assignments/assignmentTemplate.js
import AssignmentBase from '../core/assignmentBase.js';
import { createFileUploader, createCollaboratorInput, createInputContainer } from '../inputComponents/index.js';
import { escapeHtml } from '../core/utils/index.js';

/**
 * Template Assignment class - Use this as a starting point for new assignments
 * @extends AssignmentBase
 */
export class TemplateAssignment extends AssignmentBase {
  // Initialize component inputs
  inputs = [
    createFileUploader({
      id: 'submission-files',
      label: 'Assignment Files',
      accept: '.zip,.pdf,.docx',
      maxSize: 25 * 1024 * 1024, // 25 MB
      required: true,
      icon: 'file-archive'
    }),
    
    createCollaboratorInput({
      id: 'collaborators',
      label: 'Project Collaborators',
      required: false,
      icon: 'users'
    })
  ];

  /**
   * @returns {string} Assignment name
   */
  assignmentName() {
    return 'Template Assignment';
  }

  /**
   * @returns {string} HTML for the submission form
   */
  get submissionFormHtml() {
    // Create a container with all the inputs
    return createInputContainer({
      title: 'Assignment Submission',
      description: 'Submit your files and enter required information below.',
      inputs: this.inputs
    });
  }

  /**
   * @returns {Array} Validation rules
   */
  get validationRules() {
    return [
      {
        name: 'Checking file structure',
        test: async (form) => {
          const fileInput = form.querySelector('#submission-files');
          // Basic file validation - customize based on your needs
          return fileInput.files.length > 0;
        },
        success: '✅ File structure verified',
        failure: '❌ Could not verify file structure',
        stopOnFail: true
      },
      
      {
        name: 'Checking for required content',
        test: async (form) => {
          // Add custom validation logic here
          return true;
        },
        success: '✅ Required content found',
        failure: '❌ Required content missing',
        stopOnFail: false
      }
    ];
  }

  /**
   * Collect relevant data from the form for the artifact
   * @param {HTMLElement} formEl - The form element
   * @returns {Object} - Collected form data
   */
  collectFormData(formEl) {
    const fileInput = formEl.querySelector('#submission-files');
    const collaboratorsInput = formEl.querySelector('#collaborators');
    
    return {
      fileName: fileInput.files[0]?.name || 'No file selected',
      collaborators: collaboratorsInput.value || 'None'
    };
  }

  /**
   * Generate artifact HTML
   * @param {HTMLElement} formEl - The form element
   * @param {Object} testResults - Results from validation
   * @returns {string} - HTML for the artifact
   */
  generateArtifactBody(formEl, testResults) {
    const { fileName, collaborators } = testResults.formData;
    
    return `
      <div class="artifact-content">
        <h3 class="text-lg font-bold">Template Assignment Results</h3>
        <p>Submitted file: ${escapeHtml(fileName)}</p>
        <p>Collaborators: ${escapeHtml(collaborators)}</p>
        
        <h4 class="mt-4 font-bold">Validation Results</h4>
        <ul class="list-disc pl-5">
          ${testResults.results.map(result => `
            <li class="${result.passed ? 'text-green-600' : 'text-red-600'}">
              ${result.message}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
}

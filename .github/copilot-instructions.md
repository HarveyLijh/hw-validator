# Homework Validator - GitHub Copilot Instructions

This document provides custom instructions for GitHub Copilot to understand the Homework Validator project structure, conventions, and patterns. By following these guidelines, Copilot can generate more accurate and appropriate suggestions when working in this repository.

## Project Overview

Homework Validator is a web-based tool that enables instructors to create and customize validation workflows for student assignment submissions. The application follows a component-based architecture with a focus on extensibility and validation.

## Code Structure

```
js/
  main.js                     # Application entry point
  assignments/                # Assignment implementation directory
    assignmentUnity.js        # Example assignment implementation
  core/                       # Core framework functionality
    artifactGenerator.js      # Generates submission artifacts
    assignmentBase.js         # Base class for all assignments
    uiManager.js              # Manages UI state transitions
    utils/                    # Utility functions
      assignmentUtils.js      # Helper functions for assignments
      index.js                # Exports utilities
  inputComponents/            # UI component system
    collaboratorInput.js      # Collaborator input component
    componentBase.js          # Base class for all components
    containerUtils.js         # Container utilities for components
    fileUploader.js           # File upload component
    helper.js                 # Helper functions for components
    index.js                  # Exports all components
css/
  style.css                   # Main stylesheet
```

## Architecture Patterns

### Object-Oriented Design Pattern

The project uses inheritance hierarchies for both components and assignments:

```
BaseComponent
├── FileUploaderComponent
├── CollaboratorInputComponent
└── [Other components]

AssignmentBase
├── UnityAssignment
└── [Other assignment types]
```

### Component System

Components follow the Template Method pattern, providing common structure while allowing customization:

```javascript
// Base component with template methods
export class BaseComponent {
  constructor(config) {
    this.id = config.id;
    this.label = config.label;
    this.required = config.required || false;
    this.icon = config.icon || 'circle';
    this.componentType = config.componentType || 'base';
  }
  
  // Template methods to be overridden
  generateHTML() { throw new Error('Must implement generateHTML'); }
  getSummary(element) { throw new Error('Must implement getSummary'); }
  validate(element) { /* Default implementation */ }
  
  // Factory method
  create() {
    return {
      html: this.render(),
      getSummary: (el) => this.getSummary(el),
      validate: (el) => this.validate(el),
      id: this.id
    };
  }
}
```

### Assignment System

Assignments define their form structure and validation rules:

```javascript
export default class AssignmentBase {
  // Abstract methods/properties
  assignmentName() { throw new Error('Not implemented'); }
  get submissionFormHtml() { throw new Error('Not implemented'); }
  get validationRules() { throw new Error('Not implemented'); }
  
  // Validation pipeline
  async runTests(formEl, updateResult) {
    // Implementation of test runner
  }
  
  // Artifact generation
  generateArtifactBody(formEl, testResults) { 
    throw new Error('Not implemented');
  }
}
```

## Code Examples

### Creating a New Component

When creating a new component, follow this pattern:

```javascript
import { BaseComponent } from './componentBase.js';

/**
 * DatePickerComponent for selecting dates
 * @extends BaseComponent
 */
export class DatePickerComponent extends BaseComponent {
  /**
   * Creates a new date picker component
   * @param {Object} config - Configuration parameters
   * @param {string} config.format - Date format to use (default: 'YYYY-MM-DD')
   */
  constructor(config) {
    super({
      ...config,
      id: config.id || 'date-input',
      label: config.label || 'Select Date',
      icon: config.icon || 'calendar',
      componentType: 'datepicker'
    });
    
    this.format = config.format || 'YYYY-MM-DD';
  }

  /**
   * Generate the component HTML 
   * @returns {string} HTML string
   */
  generateHTML() {
    return `
      <div class="mt-2">
        <input type="date" id="${this.id}" 
          class="w-full px-3 py-2 border rounded-lg" 
          ${this.required ? 'required' : ''}>
      </div>
    `;
  }

  /**
   * Generates a summary of the selected date
   * @param {HTMLElement} element - The input element
   * @returns {string} - HTML string with the summary
   */
  getSummary(element) {
    if (!element.value) return '';
    
    return `
      <div class="flex items-center">
        <i class="fas fa-${this.icon} text-indigo-500 mr-2"></i>
        <div>${element.value}</div>
      </div>
    `;
  }
}

/**
 * Factory function to create date picker components
 * @param {Object} config - Configuration object
 * @returns {Object} - Component interface
 */
export function createDatePicker(config = {}) {
  const component = new DatePickerComponent(config);
  return component.create();
}
```

### Creating a New Assignment Type

Follow this pattern when creating a new assignment type:

```javascript
import AssignmentBase from '../core/assignmentBase.js';
import { createFileUploader, createDatePicker } from '../inputComponents/index.js';

/**
 * Example assignment for Python submissions
 * @extends AssignmentBase
 */
export default class PythonAssignment extends AssignmentBase {
  /**
   * Initialize the assignment
   */
  constructor() {
    super();
  }

  /**
   * @returns {string} Assignment name
   */
  assignmentName() {
    return 'Python Programming Assignment';
  }

  /**
   * @returns {string} HTML for the submission form
   */
  get submissionFormHtml() {
    // Create components using factory functions
    const fileUploader = createFileUploader({
      id: 'python-files',
      label: 'Python Files',
      accept: '.py,.ipynb',
      required: true
    });

    const dueDate = createDatePicker({
      id: 'due-date',
      label: 'Submission Date',
      required: true
    });
    
    // Return combined HTML
    return `
      <div class="assignment-form">
        <h2 class="text-xl font-bold mb-4">Python Assignment Submission</h2>
        ${fileUploader.html}
        ${dueDate.html}
      </div>
    `;
  }

  /**
   * @returns {Array} Validation rules
   */
  get validationRules() {
    return [
      {
        name: 'Checking file structure',
        test: async (form) => {
          const files = form.querySelector('#python-files').files;
          return files.length > 0;
        },
        success: '✅ File structure verified',
        failure: '❌ Could not verify file structure',
        stopOnFail: true
      },
      {
        name: 'Validating Python syntax',
        test: async (form) => {
          // Validation implementation...
          return true;
        },
        success: '✅ Python syntax is valid',
        failure: '❌ Python syntax errors detected',
        stopOnFail: false
      }
    ];
  }

  /**
   * Collect form data for the artifact
   * @param {HTMLElement} formEl - The form element
   * @returns {Object} - Collected form data
   */
  collectFormData(formEl) {
    return {
      fileName: formEl.querySelector('#python-files').files[0]?.name,
      submissionDate: formEl.querySelector('#due-date').value
    };
  }

  /**
   * Generate artifact HTML
   * @param {HTMLElement} formEl - The form element
   * @param {Object} testResults - Results from validation
   * @returns {string} - HTML for the artifact
   */
  generateArtifactBody(formEl, testResults) {
    const { fileName, submissionDate } = testResults.formData;
    
    return `
      <div class="artifact-content">
        <h3 class="text-lg font-bold">Python Assignment Results</h3>
        <p>Submitted file: ${fileName}</p>
        <p>Submission date: ${submissionDate}</p>
        
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
```

## Coding Conventions & Best Practices

### Naming Conventions

- Class names: PascalCase (e.g., `FileUploaderComponent`)
- Methods/Functions: camelCase (e.g., `createFileUploader`)
- Variables: camelCase (e.g., `fileNameDisplay`)
- Constants: UPPER_CASE or camelCase depending on context
- Component IDs: kebab-case (e.g., `file-uploader`)

### Documentation Standards

- Use JSDoc for all classes, methods, and functions
- Include descriptive comments for complex logic
- Document parameters and return values

```javascript
/**
 * Validates a file against size and type restrictions
 * @param {File} file - The file object to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes
 * @param {string[]} options.allowedTypes - Array of allowed MIME types
 * @returns {Object} - Object with isValid and error properties
 */
function validateFile(file, { maxSize, allowedTypes }) {
  // Implementation...
}
```

### Error Handling

- Use specific error messages that help identify the issue
- Implement proper validation at both component and assignment levels
- Provide clear user feedback for validation failures

```javascript
// Example of proper error handling
try {
  const result = await validateSubmission(file);
  if (!result.isValid) {
    displayError(result.error);
    return false;
  }
  return true;
} catch (error) {
  console.error('Validation error:', error);
  displayError('An unexpected error occurred during validation.');
  return false;
}
```

### Component Design Principles

1. **Single Responsibility**: Each component should handle one specific input type
2. **Encapsulation**: Internal state should be hidden from component consumers
3. **Configurability**: Use configuration objects with sensible defaults
4. **Consistency**: Use the BaseComponent pattern for all new components

### Testing Guidelines

1. Test inputs with valid and invalid data
2. Test edge cases (empty inputs, maximum sizes, etc.)
3. Validate component rendering and interaction
4. Ensure proper error handling and validation

## Development Workflow

When extending the application:

1. Identify if you need a new component or can reuse existing ones
2. Implement and test new components in isolation
3. Create assignment implementations using the components
4. Test the full validation workflow

## Common Pitfalls to Avoid

- Hardcoding values instead of using configuration
- Skipping validation at either the component or assignment level
- Not providing clear feedback for validation failures
- Manual DOM manipulation instead of using the component system
- Inconsistent error handling

## Dependencies

The project uses:

- Vanilla JavaScript with ES6+ features
- TailwindCSS for styling
- FontAwesome icons for UI elements
- No build process or transpilation (runs directly in browser)

## Performance Considerations

- Keep component renders efficient (minimize DOM operations)
- Handle large file uploads appropriately
- Consider lazy loading for heavy validation logic
- Use async/await for potentially long-running operations
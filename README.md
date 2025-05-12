# 📝 Homework Validator - GitHub Template

A customizable web-based tool for validating assignments. This repository is set up as a **GitHub Template** to help instructors quickly create validation workflows for student homework submissions.

## 📋 Using This Template

This repository is set up as a GitHub template. To use it for your own assignment validation:

1. Click the green "Use this template" button at the top of the repository
2. Select "Create a new repository"
3. Choose your repository name and settings
4. Clone your new repository locally
5. Customize the assignment validation by either:
   - Modifying the existing `UnityAssignment` in `js/assignments/assignmentUnity.js`
   - Creating a new assignment class based on the `TemplateAssignment` in `js/assignments/assignmentTemplate.js`
6. Update the `main.js` file to use your custom assignment

## Overview

The Homework Validator is designed to help instructors validate student assignments by providing a web interface for file uploads, metadata collection, and automated validation. The system can be easily extended to support different types of assignments and custom validation logic.
## For Instructors: Customization Guide

### Project Structure

- `js/core/` - Core functionality including the base assignment class and UI manager
- `js/assignments/` - Assignment-specific implementations
- `js/inputComponents/` - Reusable UI components for input collection
- `css/` - Styling for the application

### Working with Input Components

The validator uses a component-based architecture for all UI input elements. All components extend from a base `BaseComponent` class which provides common functionality.

#### Using Existing Input Components

To use existing components in your assignment:

```javascript
import { createCollaboratorInput, createFileUploader } from '../inputComponents/index.js';

// Create a file uploader component
const fileUploader = createFileUploader({
  id: 'unity-file',
  label: 'Unity Project ZIP',
  accept: '.zip',
  required: true,
  icon: 'file-archive'
});

// Create a collaborator input component
const collaboratorInput = createCollaboratorInput({
  id: 'collaborators',
  label: 'Project Collaborators',
  required: false
});
```

#### Creating New Input Components

To create a new input component:

1. Create a new file in the `js/inputComponents/` directory
2. Extend the `BaseComponent` class
3. Implement the required methods
4. Export both the component class and a factory function

Example template for a new component:

```javascript
// newComponent.js
import { BaseComponent } from './componentBase.js';

/**
 * NewComponent class for handling specific input type
 * @extends BaseComponent
 */
export class NewComponent extends BaseComponent {
  /**
   * Creates a new component instance
   * @param {Object} config - Configuration parameters
   */
  constructor(config) {
    super({
      ...config,
      id: config.id || 'default-id',
      label: config.label || 'Default Label',
      icon: config.icon || 'circle',
      componentType: 'custom-type'
    });
    
    // Add component-specific properties here
    this.customProperty = config.customProperty || 'default';
  }

  /**
   * Generate the component HTML
   * @returns {string} HTML string
   */
  generateHTML() {
    return `
      <input id="${this.id}" type="text"
        placeholder="${this.placeholder}"
        class="mt-2 w-full px-3 py-2 border rounded-lg"
        ${this.required ? 'required' : ''}>
    `;
  }

  /**
   * Generates a summary of the input value
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

  /**
   * Validates the input
   * @param {HTMLElement} element - The input element
   * @returns {Object} - Validation result
   */
  validate(element) {
    // Custom validation logic
    // First call super.validate(element) for common validation
    const baseValidation = super.validate(element);
    if (!baseValidation.isValid) return baseValidation;
    
    // Add custom validation logic here
    
    return { isValid: true };
  }
}

/**
 * Factory function to create the component
 * @param {Object} config - Configuration object
 * @returns {Object} - Component interface
 */
export function createNewComponent(config = {}) {
  const component = new NewComponent(config);
  return component.create();
}
```

5. Add the new component to the index.js file in the inputComponents directory:

```javascript
// Update js/inputComponents/index.js
export { createNewComponent } from './newComponent.js';
```

### Creating New Assignment Types

To create a new assignment type:

1. Create a new file in the `js/assignments/` directory
2. Extend the `AssignmentBase` class from `../core/assignmentBase.js`
3. Implement the required methods

Example of creating a new assignment type:

```javascript
// newAssignment.js
import { AssignmentBase } from '../core/assignmentBase.js';
import { createFileUploader, createCollaboratorInput } from '../inputComponents/index.js';

/**
 * Custom assignment implementation
 * @extends AssignmentBase
 */
export class NewAssignment extends AssignmentBase {
  /**
   * Initialize the assignment
   */
  constructor() {
    super({
      name: "Custom Assignment",
      description: "Description of the custom assignment"
    });
  }

  /**
   * Create the input components for this assignment
   * @returns {Array} Array of component objects
   */
  createComponents() {
    // Create components specific to this assignment
    const fileUploader = createFileUploader({
      id: 'custom-file',
      label: 'Assignment Files',
      accept: '.zip,.rar',
      required: true
    });

    const collaboratorInput = createCollaboratorInput({
      id: 'team-members',
      label: 'Team Members'
    });

    // Add all components to the assignment
    return [fileUploader, collaboratorInput];
  }

  /**
   * Validate the submitted assignment
   * @param {Object} inputs - Object containing references to the DOM elements
   * @returns {Promise<Object>} - Validation results
   */
  async validate(inputs) {
    // Perform validation logic specific to this assignment
    const file = inputs['custom-file'].files[0];
    
    // Example validation logic
    let validationResults = {
      success: true,
      messages: []
    };

    // Check file type, size, content, etc.
    // Add messages to validationResults.messages
    
    return validationResults;
  }
}

// Export a function to create this assignment
export function createNewAssignment() {
  return new NewAssignment();
}
```

4. Register the new assignment in your main.js file:

```javascript
import { createNewAssignment } from './assignments/newAssignment.js';

// Add to your assignment registry or initialization code
const assignments = {
  // ...existing assignments
  'new-assignment': createNewAssignment()
};
```

### Best Practices

1. **Component Extensibility**: Use the BaseComponent class for all input components to ensure consistent behavior.
2. **Validation Logic**: Keep validation logic within the assignment classes rather than in the UI components.
3. **Code Organization**: Maintain separation between UI components, assignment logic, and core functionality.
4. **Error Handling**: Provide clear error messages and validation feedback.
5. **Configuration**: Use configuration objects with sensible defaults for components and assignments.

## Local Development

To run the validator locally:

1. Clone the repository
2. Open index.html in a web browser (or use a local server)

## License

See the LICENSE file for details.
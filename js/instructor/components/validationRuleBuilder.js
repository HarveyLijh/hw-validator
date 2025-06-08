/**
 * Validation Rule Builder
 * Manages the validation rule creation and configuration UI
 */
export class ValidationRuleBuilder {
  constructor() {
    this.rulesContainer = null;
    this.rules = [];
    this.nextRuleId = 1;
  }
  
  /**
   * Initialize the validation rule builder
   */
  initialize() {
    console.log('Initializing Validation Rule Builder...');
    this.rulesContainer = document.getElementById('validation-rules-container');
    
    // Listen for clicks on the container for rule events
    this.rulesContainer.addEventListener('click', this.handleRuleContainerClick.bind(this));
    
    // Listen for rule type changes to update params
    this.rulesContainer.addEventListener('change', this.handleRuleTypeChange.bind(this));
  }
  
  /**
   * Handle clicks within the rule container
   * @param {MouseEvent} e - Click event
   */
  handleRuleContainerClick(e) {
    // Delete rule button
    if (e.target.closest('.rule-delete-btn')) {
      const ruleEl = e.target.closest('.validation-rule');
      if (ruleEl) {
        const ruleId = ruleEl.dataset.ruleId;
        this.removeRule(ruleId);
      }
    }
    
    // Add file button in file structure rule
    if (e.target.closest('.add-file-btn')) {
      const ruleEl = e.target.closest('.validation-rule');
      if (ruleEl) {
        const filesContainer = ruleEl.querySelector('.required-files-container');
        if (filesContainer) {
          this.addFilePathInput(filesContainer);
        }
      }
    }
    
    // Remove file button
    if (e.target.closest('.remove-file-btn')) {
      const fileItem = e.target.closest('.required-file-item');
      if (fileItem && fileItem.parentElement.children.length > 1) {
        fileItem.remove();
      }
    }
  }
  
  /**
   * Handle rule type change to update parameters
   * @param {Event} e - Change event
   */
  handleRuleTypeChange(e) {
    if (e.target.classList.contains('rule-type')) {
      const ruleEl = e.target.closest('.validation-rule');
      if (ruleEl) {
        const ruleType = e.target.value;
        const paramsContainer = ruleEl.querySelector('.rule-params-container');
        
        // Clear existing params
        paramsContainer.innerHTML = '';
        
        // Add new params based on rule type
        if (ruleType === 'fileStructure') {
          const template = document.getElementById('file-structure-params-template');
          const clone = template.content.cloneNode(true);
          paramsContainer.appendChild(clone);
        }
        
        // Other rule types would have their own templates
      }
    }
  }
  
  /**
   * Add a file path input to a container
   * @param {HTMLElement} container - Container element
   */
  addFilePathInput(container) {
    const fileItem = document.createElement('div');
    fileItem.className = 'required-file-item flex mb-2 items-center';
    fileItem.innerHTML = `
      <input type="text" class="required-file-path w-full px-3 py-2 border rounded-lg" 
        placeholder="e.g., Assets/Scripts/Player.cs">
      <button class="remove-file-btn ml-2 text-red-500">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(fileItem);
  }
  
  /**
   * Add a new validation rule
   * @param {string} ruleType - Type of rule to add
   */
  addRule(ruleType) {
    // Create a unique ID for this rule
    const id = `rule-${this.nextRuleId++}`;
    
    // Create rule configuration
    const rule = {
      id,
      type: ruleType,
      name: this.getDefaultRuleName(ruleType),
      successMessage: this.getDefaultSuccessMessage(ruleType),
      failureMessage: this.getDefaultFailureMessage(ruleType),
      stopOnFail: true,
      params: this.getDefaultParams(ruleType)
    };
    
    // Add to rules array
    this.rules.push(rule);
    
    // Render the rule
    this.renderRule(rule);
    
    // Update the "Add Rule" button position
    const addBtn = document.getElementById('add-rule-btn');
    this.rulesContainer.appendChild(addBtn);
  }
  
  /**
   * Get default name for a rule type
   * @param {string} ruleType - Type of rule
   * @returns {string} - Default name
   */
  getDefaultRuleName(ruleType) {
    switch(ruleType) {
      case 'fileStructure': return 'Check Project Structure';
      case 'fileContent': return 'Validate File Content';
      case 'fileExtension': return 'Check File Extensions';
      case 'imageSize': return 'Validate Image Dimensions';
      case 'custom': return 'Custom Validation Rule';
      default: return 'New Validation Rule';
    }
  }
  
  /**
   * Get default success message for a rule type
   * @param {string} ruleType - Type of rule
   * @returns {string} - Default success message
   */
  getDefaultSuccessMessage(ruleType) {
    switch(ruleType) {
      case 'fileStructure': return '✅ Project structure verified';
      case 'fileContent': return '✅ File content validated';
      case 'fileExtension': return '✅ File extensions are correct';
      case 'imageSize': return '✅ Image dimensions verified';
      case 'custom': return '✅ Custom validation passed';
      default: return '✅ Validation passed';
    }
  }
  
  /**
   * Get default failure message for a rule type
   * @param {string} ruleType - Type of rule
   * @returns {string} - Default failure message
   */
  getDefaultFailureMessage(ruleType) {
    switch(ruleType) {
      case 'fileStructure': return '❌ Missing required project files';
      case 'fileContent': return '❌ Invalid file content';
      case 'fileExtension': return '❌ Incorrect file extensions';
      case 'imageSize': return '❌ Images do not meet size requirements';
      case 'custom': return '❌ Custom validation failed';
      default: return '❌ Validation failed';
    }
  }
  
  /**
   * Get default parameters for a rule type
   * @param {string} ruleType - Type of rule
   * @returns {Object} - Default parameters
   */
  getDefaultParams(ruleType) {
    switch(ruleType) {
      case 'fileStructure':
        return { requiredFiles: ['Assets/Scripts/Player.cs'] };
      case 'fileContent':
        return { pattern: '', caseSensitive: false };
      case 'fileExtension':
        return { allowedExtensions: ['.cs', '.unity'] };
      case 'imageSize':
        return { minWidth: 800, minHeight: 600, maxWidth: 1920, maxHeight: 1080 };
      case 'custom':
        return {};
      default:
        return {};
    }
  }
  
  /**
   * Render a validation rule in the UI
   * @param {Object} rule - Rule configuration
   */
  renderRule(rule) {
    const template = document.getElementById('validation-rule-template');
    const clone = template.content.cloneNode(true);
    
    const ruleEl = clone.querySelector('.validation-rule');
    ruleEl.dataset.ruleId = rule.id;
    ruleEl.dataset.ruleType = rule.type;
    
    // Set values
    const nameInput = clone.querySelector('.rule-name');
    nameInput.value = rule.name;
    
    const typeSelect = clone.querySelector('.rule-type');
    if (typeSelect) {
      typeSelect.value = rule.type;
    }
    
    const successMessage = clone.querySelector('.success-message');
    if (successMessage) {
      successMessage.value = rule.successMessage;
    }
    
    const failureMessage = clone.querySelector('.failure-message');
    if (failureMessage) {
      failureMessage.value = rule.failureMessage;
    }
    
    const stopOnFail = clone.querySelector('.stop-on-fail');
    if (stopOnFail) {
      stopOnFail.checked = rule.stopOnFail;
    }
    
    // Add rule params
    const paramsContainer = clone.querySelector('.rule-params-container');
    if (paramsContainer && rule.type === 'fileStructure') {
      const paramsTemplate = document.getElementById('file-structure-params-template');
      const paramsClone = paramsTemplate.content.cloneNode(true);
      paramsContainer.appendChild(paramsClone);
      
      // Add file path inputs for each required file
      const filesContainer = paramsContainer.querySelector('.required-files-container');
      if (filesContainer && rule.params.requiredFiles) {
        // Clear existing items
        filesContainer.innerHTML = '';
        
        // Add an input for each file
        rule.params.requiredFiles.forEach(filePath => {
          const fileItem = document.createElement('div');
          fileItem.className = 'required-file-item flex mb-2 items-center';
          fileItem.innerHTML = `
            <input type="text" class="required-file-path w-full px-3 py-2 border rounded-lg" 
              value="${filePath}" placeholder="e.g., Assets/Scripts/Player.cs">
            <button class="remove-file-btn ml-2 text-red-500">
              <i class="fas fa-times"></i>
            </button>
          `;
          filesContainer.appendChild(fileItem);
        });
      }
    }
    
    // Insert before the "Add Rule" button
    const addBtn = document.getElementById('add-rule-btn');
    this.rulesContainer.insertBefore(clone, addBtn);
  }
  
  /**
   * Remove a validation rule
   * @param {string} id - Rule ID
   */
  removeRule(id) {
    const index = this.rules.findIndex(r => r.id === id);
    
    if (index !== -1) {
      this.rules.splice(index, 1);
      
      // Remove from DOM
      const ruleEl = this.rulesContainer.querySelector(`[data-rule-id="${id}"]`);
      if (ruleEl) {
        ruleEl.remove();
      }
    }
  }
  
  /**
   * Get all validation rules
   * @returns {Array} - Array of rule configurations
   */
  getRules() {
    // Need to collect current values from the DOM
    const ruleDOMElements = this.rulesContainer.querySelectorAll('.validation-rule');
    
    return Array.from(ruleDOMElements).map(ruleEl => {
      const id = ruleEl.dataset.ruleId;
      const type = ruleEl.querySelector('.rule-type').value;
      const name = ruleEl.querySelector('.rule-name').value;
      const successMessage = ruleEl.querySelector('.success-message').value;
      const failureMessage = ruleEl.querySelector('.failure-message').value;
      const stopOnFail = ruleEl.querySelector('.stop-on-fail').checked;
      
      // Collect params based on rule type
      let params = {};
      if (type === 'fileStructure') {
        const filePathInputs = ruleEl.querySelectorAll('.required-file-path');
        const requiredFiles = Array.from(filePathInputs)
          .map(input => input.value.trim())
          .filter(path => path !== '');
        
        params = { requiredFiles };
      }
      
      return {
        id,
        type,
        name,
        successMessage,
        failureMessage,
        stopOnFail,
        params
      };
    });
  }
  
  /**
   * Get HTML for previewing validation rules
   * @returns {string} - HTML string
   */
  getRulesPreviewHtml() {
    if (this.rules.length === 0) {
      return '<li class="text-gray-500">No validation rules defined</li>';
    }
    
    return this.getRules().map(rule => {
      return `<li>${rule.name}</li>`;
    }).join('');
  }
}

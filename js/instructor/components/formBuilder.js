/**
 * Form Builder
 * Manages the form building area where components are dropped and arranged
 */
export class FormBuilder {
  constructor() {
    this.formBuilderEl = null;
    this.components = [];
    this.nextComponentId = 1;
  }
  
  /**
   * Initialize the form builder
   */
  initialize() {
    console.log('Initializing Form Builder...');
    this.formBuilderEl = document.getElementById('form-builder');
    
    // Set up drop zone
    this.formBuilderEl.addEventListener('dragover', this.handleDragOver.bind(this));
    this.formBuilderEl.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.formBuilderEl.addEventListener('drop', this.handleDrop.bind(this));
    
    // Handle component selection
    this.formBuilderEl.addEventListener('click', this.handleComponentClick.bind(this));
    
    // Custom event listener for component updates
    document.addEventListener('component:updated', (e) => {
      console.log('Component updated:', e.detail);
      this.updateComponent(e.detail.id, e.detail.properties);
    });
    
    // Empty placeholder message
    this.updateEmptyState();
  }
  
  /**
   * Handle drag over event
   * @param {DragEvent} e - The drag event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.formBuilderEl.classList.add('drag-over');
  }
  
  /**
   * Handle drag leave event
   * @param {DragEvent} e - The drag event
   */
  handleDragLeave(e) {
    e.preventDefault();
    this.formBuilderEl.classList.remove('drag-over');
  }
  
  /**
   * Handle drop event
   * @param {DragEvent} e - The drag event
   */
  handleDrop(e) {
    e.preventDefault();
    this.formBuilderEl.classList.remove('drag-over');
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.type === 'new-component') {
        this.addComponent(data.componentType);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }
  
  /**
   * Handle component click for selection
   * @param {MouseEvent} e - The click event
   */
  handleComponentClick(e) {
    const componentEl = e.target.closest('.component-preview');
    if (!componentEl) return;
    
    // Deselect any previously selected component
    const allComponents = this.formBuilderEl.querySelectorAll('.component-preview');
    allComponents.forEach(el => el.classList.remove('selected'));
    
    // Select this component
    componentEl.classList.add('selected');
    
    // Find the component data
    const componentId = componentEl.dataset.componentId;
    const component = this.components.find(c => c.id === componentId);
    
    // Dispatch selection event
    if (component) {
      const event = new CustomEvent('component:selected', {
        detail: { component }
      });
      document.dispatchEvent(event);
    }
    
    // If edit button was clicked
    if (e.target.closest('.component-edit-btn')) {
      console.log('Edit button clicked for component:', componentId);
    }
    
    // If delete button was clicked
    if (e.target.closest('.component-delete-btn')) {
      console.log('Delete button clicked for component:', componentId);
      this.removeComponent(componentId);
    }
  }
  
  /**
   * Add a new component to the form
   * @param {string} componentType - The type of component to add
   */
  addComponent(componentType) {
    console.log(`Adding new ${componentType} component`);
    
    // Create a unique ID for this component
    const id = `${componentType}-${this.nextComponentId++}`;
    
    // Create default configuration based on component type
    const component = this.createDefaultComponent(componentType, id);
    
    // Add to components array
    this.components.push(component);
    
    // Render the component in the form builder
    this.renderComponents();
    
    // Update empty state
    this.updateEmptyState();
    
    // Trigger component selected event to show properties
    const event = new CustomEvent('component:selected', {
      detail: { component }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Create default configuration for a component
   * @param {string} type - Component type
   * @param {string} id - Component ID
   * @returns {Object} - Component configuration
   */
  createDefaultComponent(type, id) {
    const defaults = {
      fileUploader: {
        label: 'File Upload',
        accept: '.zip,.pdf,.doc,.docx',
        required: true,
        maxSize: 10,
        multiple: false
      },
      textInput: {
        label: 'Text Input',
        placeholder: 'Enter text...',
        required: false
      },
      collaboratorInput: {
        label: 'Collaborators',
        maxCollaborators: 3,
        required: false
      },
      checkbox: {
        label: 'Checkbox Option',
        description: 'Check this option',
        required: false
      },
      dropdown: {
        label: 'Select Option',
        options: ['Option 1', 'Option 2', 'Option 3'],
        required: false
      },
      dateInput: {
        label: 'Select Date',
        required: false
      }
    };
    
    return {
      id,
      type,
      ...defaults[type]
    };
  }
  
  /**
   * Update a component's properties
   * @param {string} id - Component ID
   * @param {Object} properties - New properties
   */
  updateComponent(id, properties) {
    const index = this.components.findIndex(c => c.id === id);
    
    if (index !== -1) {
      this.components[index] = {
        ...this.components[index],
        ...properties
      };
      
      // Re-render components
      this.renderComponents();
    }
  }
  
  /**
   * Remove a component from the form
   * @param {string} id - Component ID
   */
  removeComponent(id) {
    const index = this.components.findIndex(c => c.id === id);
    
    if (index !== -1) {
      this.components.splice(index, 1);
      
      // Re-render components
      this.renderComponents();
      
      // Update empty state
      this.updateEmptyState();
    }
  }
  
  /**
   * Render all components in the form builder
   */
  renderComponents() {
    // Clear existing components except empty state message
    const emptyState = this.formBuilderEl.querySelector('.text-center');
    if (emptyState) {
      this.formBuilderEl.innerHTML = '';
    }
    
    // Render each component
    this.components.forEach(component => {
      const template = document.getElementById('component-preview-template');
      const clone = template.content.cloneNode(true);
      
      const previewEl = clone.querySelector('.component-preview');
      previewEl.dataset.componentId = component.id;
      previewEl.dataset.componentType = component.type;
      
      const labelEl = clone.querySelector('.component-preview-label');
      labelEl.textContent = component.label || 'Component';
      
      const contentEl = clone.querySelector('.component-preview-content');
      contentEl.innerHTML = this.getComponentPreviewHtml(component);
      
      this.formBuilderEl.appendChild(clone);
    });
  }
  
  /**
   * Get HTML preview for a component
   * @param {Object} component - Component configuration
   * @returns {string} - HTML string
   */
  getComponentPreviewHtml(component) {
    switch(component.type) {
      case 'fileUploader':
        return `
          <div class="mt-2">
            <input type="file" id="${component.id}" 
              class="w-full px-3 py-2 border rounded-lg" 
              ${component.accept ? `accept="${component.accept}"` : ''}
              ${component.multiple ? 'multiple' : ''}
              ${component.required ? 'required' : ''} disabled>
            <p class="text-sm text-gray-500 mt-1">
              ${component.accept ? `Accepted formats: ${component.accept}` : 'All files accepted'}
              ${component.maxSize ? ` (Max: ${component.maxSize}MB)` : ''}
            </p>
          </div>
        `;
        
      case 'textInput':
        return `
          <div class="mt-2">
            <input type="text" id="${component.id}" 
              class="w-full px-3 py-2 border rounded-lg" 
              placeholder="${component.placeholder || ''}"
              ${component.required ? 'required' : ''} disabled>
          </div>
        `;
        
      case 'collaboratorInput':
        return `
          <div class="mt-2">
            <div class="border rounded-lg p-3 bg-gray-50">
              <p class="text-sm mb-2">Add up to ${component.maxCollaborators} collaborators</p>
              <div class="flex items-center">
                <input type="text" placeholder="Add collaborator..." 
                  class="w-full px-3 py-2 border rounded-lg" disabled>
                <button class="ml-2 px-3 py-2 bg-indigo-600 text-white rounded-lg" disabled>
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        
      case 'checkbox':
        return `
          <div class="mt-2 flex items-center">
            <input type="checkbox" id="${component.id}" 
              class="mr-2" ${component.required ? 'required' : ''} disabled>
            <label for="${component.id}">${component.description || 'Check this option'}</label>
          </div>
        `;
        
      case 'dropdown':
        return `
          <div class="mt-2">
            <select id="${component.id}" 
              class="w-full px-3 py-2 border rounded-lg"
              ${component.required ? 'required' : ''} disabled>
              <option value="">Select an option...</option>
              ${(component.options || []).map(option => 
                `<option value="${option}">${option}</option>`
              ).join('')}
            </select>
          </div>
        `;
        
      case 'dateInput':
        return `
          <div class="mt-2">
            <input type="date" id="${component.id}" 
              class="w-full px-3 py-2 border rounded-lg" 
              ${component.required ? 'required' : ''} disabled>
          </div>
        `;
        
      default:
        return `<div class="mt-2 p-4 border rounded-lg bg-gray-100">Unknown component type</div>`;
    }
  }
  
  /**
   * Update the empty state message
   */
  updateEmptyState() {
    if (this.components.length === 0) {
      this.formBuilderEl.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-arrow-left text-3xl mb-2"></i>
          <p>Drag components from the palette to build your form</p>
        </div>
      `;
    }
  }
  
  /**
   * Get all components in the form
   * @returns {Array} - Array of component configurations
   */
  getComponents() {
    return [...this.components];
  }
  
  /**
   * Get HTML for previewing all components
   * @returns {string} - HTML string
   */
  getComponentsPreviewHtml() {
    if (this.components.length === 0) {
      return '<p class="text-gray-500">No components added yet</p>';
    }
    
    return this.components.map(component => {
      return `
        <div class="mb-4">
          <label class="block font-bold mb-1">${component.label || 'Component'}</label>
          ${this.getComponentPreviewHtml(component)}
        </div>
      `;
    }).join('');
  }
}

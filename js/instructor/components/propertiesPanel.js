/**
 * Properties Panel
 * Manages the properties panel for editing component settings
 */
export class PropertiesPanel {
  constructor() {
    this.propertiesPanelEl = null;
    this.currentComponent = null;
  }
  
  /**
   * Initialize the properties panel
   */
  initialize() {
    console.log('Initializing Properties Panel...');
    this.propertiesPanelEl = document.getElementById('properties-panel');
    
    // Listen for component selection events
    document.addEventListener('component:selected', (e) => {
      this.showComponentProperties(e.detail.component);
    });
  }
  
  /**
   * Show properties for the selected component
   * @param {Object} component - Component configuration
   */
  showComponentProperties(component) {
    console.log('Showing properties for component:', component);
    this.currentComponent = component;
    
    // Clear existing content
    this.propertiesPanelEl.innerHTML = '';
    
    // Get the appropriate template for this component type
    let templateId;
    switch(component.type) {
      case 'fileUploader':
        templateId = 'file-uploader-props-template';
        break;
      default:
        // For now, we'll just use the file uploader template for demo purposes
        templateId = 'file-uploader-props-template';
    }
    
    const template = document.getElementById(templateId);
    if (!template) {
      this.propertiesPanelEl.innerHTML = `
        <div class="text-gray-500 text-center py-8">
          <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
          <p>No properties editor available for this component type</p>
        </div>
      `;
      return;
    }
    
    // Clone the template
    const clone = template.content.cloneNode(true);
    
    // Fill in values from the component
    const idInput = clone.querySelector('#component-id');
    if (idInput) idInput.value = component.id || '';
    
    const labelInput = clone.querySelector('#component-label');
    if (labelInput) labelInput.value = component.label || '';
    
    const fileTypesInput = clone.querySelector('#file-types');
    if (fileTypesInput) fileTypesInput.value = component.accept || '';
    
    const maxFileSizeInput = clone.querySelector('#max-file-size');
    if (maxFileSizeInput) maxFileSizeInput.value = component.maxSize || '';
    
    const requiredField = clone.querySelector('#required-field');
    if (requiredField) requiredField.checked = component.required || false;
    
    const allowMultiple = clone.querySelector('#allow-multiple');
    if (allowMultiple) allowMultiple.checked = component.multiple || false;
    
    // Set up update button
    const updateBtn = clone.querySelector('.update-component-btn');
    if (updateBtn) {
      updateBtn.addEventListener('click', this.handleUpdateComponent.bind(this));
    }
    
    // Add to the panel
    this.propertiesPanelEl.appendChild(clone);
  }
  
  /**
   * Handle component update from properties panel
   */
  handleUpdateComponent() {
    if (!this.currentComponent) return;
    
    // Collect values from the form
    const id = document.getElementById('component-id').value;
    const label = document.getElementById('component-label').value;
    const accept = document.getElementById('file-types')?.value;
    const maxSize = document.getElementById('max-file-size')?.value;
    const required = document.getElementById('required-field')?.checked;
    const multiple = document.getElementById('allow-multiple')?.checked;
    
    // Create updated properties object
    const updatedProps = {
      id,
      label,
      accept,
      maxSize: maxSize ? parseInt(maxSize, 10) : undefined,
      required,
      multiple
    };
    
    console.log('Updating component with properties:', updatedProps);
    
    // Dispatch update event
    const event = new CustomEvent('component:updated', {
      detail: {
        id: this.currentComponent.id,
        properties: updatedProps
      }
    });
    document.dispatchEvent(event);
  }
}

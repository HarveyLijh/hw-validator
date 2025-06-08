/**
 * Modal Manager
 * Manages the modal system for the instructor interface
 */
export class ModalManager {
  constructor() {
    this.modalContainer = null;
    this.modalTitle = null;
    this.modalContent = null;
    this.closeBtn = null;
    this.callback = null;
  }
  
  /**
   * Initialize the modal manager
   */
  initialize() {
    console.log('Initializing Modal Manager...');
    this.modalContainer = document.getElementById('modal-container');
    this.modalTitle = document.getElementById('modal-title');
    this.modalContent = document.getElementById('modal-content');
    this.closeBtn = document.getElementById('close-modal-btn');
    
    // Set up close button
    this.closeBtn.addEventListener('click', this.closeModal.bind(this));
    
    // Close on background click
    this.modalContainer.addEventListener('click', (e) => {
      if (e.target === this.modalContainer) {
        this.closeModal();
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modalContainer.classList.contains('hidden')) {
        this.closeModal();
      }
    });
  }
  
  /**
   * Open a modal with content from a template
   * @param {string} templateId - ID of the template to use
   * @param {string} title - Modal title
   * @param {Function} callback - Callback function when modal is closed
   */
  openModal(templateId, title, callback) {
    console.log(`Opening modal: ${templateId}`);
    this.callback = callback;
    
    // Set title
    this.modalTitle.textContent = title;
    
    // Get content from template
    const template = document.getElementById(templateId);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return;
    }
    
    // Clear existing content
    this.modalContent.innerHTML = '';
    
    // Clone template content
    const content = template.content.cloneNode(true);
    this.modalContent.appendChild(content);
    
    // Show modal
    this.modalContainer.classList.remove('hidden');
    this.modalContainer.classList.add('visible');
    
    // Set up event handlers based on template type
    if (templateId === 'add-rule-modal-template') {
      this.setupRuleOptionHandlers();
    } else if (templateId === 'export-modal-template') {
      this.setupExportHandlers();
    }
  }
  
  /**
   * Set up handlers for rule option clicks
   */
  setupRuleOptionHandlers() {
    const ruleOptions = this.modalContent.querySelectorAll('.rule-option');
    
    ruleOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        ruleOptions.forEach(o => o.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Get rule type
        const ruleType = option.dataset.ruleType;
        
        // Trigger callback after a slight delay for visual feedback
        setTimeout(() => {
          this.closeModal(ruleType);
        }, 200);
      });
    });
  }
  
  /**
   * Set up handlers for export modal
   */
  setupExportHandlers() {
    // These are setup in the main UI manager
  }
  
  /**
   * Close the modal
   * @param {*} result - Result to pass to callback
   */
  closeModal(result) {
    console.log('Closing modal');
    this.modalContainer.classList.remove('visible');
    
    // Wait for animation to complete
    setTimeout(() => {
      this.modalContainer.classList.add('hidden');
      
      // Call callback if provided
      if (this.callback) {
        this.callback(result);
        this.callback = null;
      }
    }, 300);
  }
}

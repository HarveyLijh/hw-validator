// Instructor interface main entry point
import { ComponentPalette } from './components/componentPalette.js';
import { FormBuilder } from './components/formBuilder.js';
import { PropertiesPanel } from './components/propertiesPanel.js';
import { ValidationRuleBuilder } from './components/validationRuleBuilder.js';
import { ModalManager } from './components/modalManager.js';
import { ToastManager } from './components/toastManager.js';
import { AssignmentConfig } from './models/assignmentConfig.js';
import { ExportManager } from './utils/exportManager.js';

/**
 * Instructor UI Manager
 * Coordinates all components of the instructor interface
 */
class InstructorUIManager {
  constructor() {
    // Initialize assignment configuration model
    this.assignmentConfig = new AssignmentConfig();
    
    // Initialize UI components
    this.componentPalette = new ComponentPalette();
    this.formBuilder = new FormBuilder();
    this.propertiesPanel = new PropertiesPanel();
    this.validationRuleBuilder = new ValidationRuleBuilder();
    this.modalManager = new ModalManager();
    this.toastManager = new ToastManager();
    this.exportManager = new ExportManager(this.assignmentConfig);
    
    // Store currently selected element
    this.selectedElement = null;
  }
  
  /**
   * Initialize the UI
   */
  initialize() {
    console.log('Initializing Instructor UI...');
    
    // Initialize all components
    this.componentPalette.initialize();
    this.formBuilder.initialize();
    this.propertiesPanel.initialize();
    this.validationRuleBuilder.initialize();
    this.modalManager.initialize();
    this.exportManager.initialize();
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Show welcome toast
    this.toastManager.showToast({
      title: 'Welcome to Homework Validator Builder',
      message: 'Drag components from the palette to build your assignment',
      type: 'info'
    });
  }
  
  /**
   * Set up event handlers for the UI
   */
  setupEventHandlers() {
    // Add rule button
    document.getElementById('add-rule-btn').addEventListener('click', () => {
      console.log('Add validation rule clicked');
      this.modalManager.openModal('add-rule-modal-template', 'Add Validation Rule', (ruleType) => {
        if (ruleType) {
          console.log(`Adding new rule of type: ${ruleType}`);
          this.validationRuleBuilder.addRule(ruleType);
          this.toastManager.showToast({
            title: 'Rule Added',
            message: `New ${ruleType} validation rule added`,
            type: 'success'
          });
        }
      });
    });
    
    // Preview button
    document.getElementById('preview-btn').addEventListener('click', () => {
      console.log('Preview button clicked');
      const previewHtml = this.generatePreview();
      this.modalManager.openModal('preview-modal-template', 'Assignment Preview', null);
      document.getElementById('preview-content').innerHTML = previewHtml;
    });
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', () => {
      console.log('Export button clicked');
      // Collect data from all components
      const assignmentName = document.getElementById('assignment-name').value;
      const assignmentDescription = document.getElementById('assignment-description').value;
      
      // Update the config
      this.assignmentConfig.setBasicInfo(assignmentName, assignmentDescription);
      this.assignmentConfig.setComponents(this.formBuilder.getComponents());
      this.assignmentConfig.setValidationRules(this.validationRuleBuilder.getRules());
      
      // Show export modal
      this.modalManager.openModal('export-modal-template', 'Export Configuration', null);
      
      // Display JSON in the preview
      const jsonPreview = document.getElementById('json-preview');
      if (jsonPreview) {
        const configJson = this.assignmentConfig.toJSON();
        jsonPreview.textContent = JSON.stringify(configJson, null, 2);
      }
      
      // Set up format toggle
      const exportFormat = document.getElementById('export-format');
      if (exportFormat) {
        exportFormat.addEventListener('change', () => {
          const format = exportFormat.value;
          const jsonContainer = document.getElementById('export-json-container');
          const urlContainer = document.getElementById('export-url-container');
          
          if (format === 'json') {
            jsonContainer.classList.remove('hidden');
            urlContainer.classList.add('hidden');
          } else {
            jsonContainer.classList.add('hidden');
            urlContainer.classList.remove('hidden');
            
            // Generate shareable URL
            const shareableUrl = this.exportManager.generateShareableUrl();
            document.getElementById('shareable-url').value = shareableUrl;
          }
        });
      }
      
      // Set up download button
      const downloadBtn = document.getElementById('download-json-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          this.exportManager.downloadConfiguration();
          this.toastManager.showToast({
            title: 'Export Successful',
            message: 'Configuration downloaded successfully',
            type: 'success'
          });
        });
      }
      
      // Set up copy button
      const copyUrlBtn = document.getElementById('copy-url-btn');
      if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', () => {
          const urlInput = document.getElementById('shareable-url');
          urlInput.select();
          document.execCommand('copy');
          
          this.toastManager.showToast({
            title: 'URL Copied',
            message: 'Shareable URL copied to clipboard',
            type: 'success'
          });
        });
      }
    });
  }
  
  /**
   * Generate preview of student-facing UI
   */
  generatePreview() {
    const assignmentName = document.getElementById('assignment-name').value || 'Unnamed Assignment';
    const assignmentDescription = document.getElementById('assignment-description').value || 'No description provided';
    
    // Simple preview generation - in a real implementation this would render 
    // the actual components as they would appear to students
    return `
      <div class="assignment-preview">
        <h2 class="text-xl font-bold mb-4">${assignmentName}</h2>
        <p class="mb-6">${assignmentDescription}</p>
        
        <div class="component-container">
          ${this.formBuilder.getComponentsPreviewHtml()}
        </div>
        
        <div class="mt-8">
          <h3 class="font-bold">Validation Rules:</h3>
          <ul class="list-disc pl-5 mt-2">
            ${this.validationRuleBuilder.getRulesPreviewHtml()}
          </ul>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Submit Assignment
          </button>
        </div>
      </div>
    `;
  }
}

// Initialize the UI when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const ui = new InstructorUIManager();
  ui.initialize();
});

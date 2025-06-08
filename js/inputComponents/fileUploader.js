// File uploader component
import { BaseComponent } from './componentBase.js';
import { formatFileSize } from './helper.js';

/**
 * FileUploaderComponent class for handling file uploads
 * @extends BaseComponent
 */
export class FileUploaderComponent extends BaseComponent {
  /**
   * Creates a new file uploader component
   * @param {Object} config - Configuration for the file uploader
   * @param {string} config.id - The ID for the file input element
   * @param {string} config.label - Label text for the file input
   * @param {string} config.accept - Accepted file formats (e.g., '.zip,.rar')
   * @param {number} config.maxSize - Maximum file size in bytes
   * @param {boolean} config.required - Whether the input is required
   * @param {string} config.icon - Font Awesome icon class for the label
   */
  constructor(config) {
    super({
      ...config,
      id: config.id || 'file-input',
      label: config.label || 'File Upload',
      icon: config.icon || 'file-archive',
      componentType: 'file'
    });

    this.accept = config.accept || '*';
    this.maxSize = config.maxSize || 50 * 1024 * 1024; // Default 50MB
    this.maxSizeMB = (this.maxSize / (1024 * 1024)).toFixed(0);
    this.acceptFormats = this.accept.split(',').map(format => format.trim()).join(', ');
  }

  /**
   * Generate the component HTML for file uploader
   * @returns {string} HTML string representing the component
   */
  generateHTML() {
    return `
      <div class="mt-2 relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
        <input type="file" id="${this.id}" accept="${this.accept}" ${this.required ? 'required' : ''} 
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          data-max-size="${this.maxSize}">
        <div class="text-center">
          <i class="fas fa-cloud-upload-alt text-4xl text-indigo-400 mb-2"></i>
          <p class="text-sm text-gray-600">Drag & drop your file here or click to browse</p>
          <p class="text-xs text-gray-500 mt-1">Accepted formats: ${this.acceptFormats || 'All files'}</p>
          ${this.maxSize ? `<p class="text-xs text-gray-500">File must be less than ${this.maxSizeMB}MB</p>` : ''}
        </div>
        <p id="${this.id}-display" class="text-sm text-indigo-600 text-center mt-2 hidden"></p>
      </div>
    `;
  }

  /**
   * Generate the script for the file uploader
   * @returns {string} JavaScript code as a string
   */
  generateScript() {
    return `
      <script>
        // Add file name display when a file is selected
        document.getElementById('${this.id}').addEventListener('change', function(e) {
          const fileNameDisplay = document.getElementById('${this.id}-display');
          if (this.files[0]) {
            fileNameDisplay.textContent = this.files[0].name;
            fileNameDisplay.classList.remove('hidden');
          } else {
            fileNameDisplay.classList.add('hidden');
          }
          
          // Dispatch custom event for input changes
          const event = new CustomEvent('input-changed', { 
            detail: { type: 'file', id: '${this.id}' }
          });
          document.dispatchEvent(event);
        });
      </script>
    `;
  }

  /**
   * Generates a summary of the file input
   * @param {HTMLElement} element - The file input element
   * @returns {string} - HTML string with the file summary
   */
  getSummary(element) {
    const file = element.files[0];
    if (!file) return '';

    const fileSize = formatFileSize(file.size);
    const isValid = file.size <= this.maxSize;

    return `
      <div class="flex items-center ${!isValid ? 'text-red-600' : ''}">
        <i class="fas fa-${this.icon} ${isValid ? 'text-indigo-500' : 'text-red-500'} mr-2"></i>
        <div>
          <strong>${file.name}</strong> (${fileSize})
          ${!isValid ? `<p class="text-red-500 text-xs mt-1">File exceeds maximum size of ${this.maxSizeMB}MB</p>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Validates the file input
   * @param {HTMLElement} element - The file input element
   * @returns {Object} - Object with isValid and error properties
   */
  validate(element) {
    const file = element.files[0];
    
    if (this.required && !file) {
      return { 
        isValid: false, 
        error: `Please select a file for "${this.label}"` 
      };
    }
    
    if (file) {
      // Validate file size
      if (file.size > this.maxSize) {
        return { 
          isValid: false, 
          error: `File "${file.name}" exceeds maximum size of ${this.maxSizeMB}MB` 
        };
      }
      
      // Validate file extension if accept parameter is specified and not wildcard
      if (this.accept && this.accept !== '*') {
        const fileName = file.name.toLowerCase();
        const acceptedExtensions = this.accept.split(',').map(ext => ext.trim().toLowerCase());
        const hasValidExtension = acceptedExtensions.some(ext => {
          // Handle both .ext and ext formats
          const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
          return fileName.endsWith(normalizedExt);
        });
        
        if (!hasValidExtension) {
          const extensionList = acceptedExtensions.map(ext => 
            ext.startsWith('.') ? ext : `.${ext}`
          ).join(', ');
          return {
            isValid: false,
            error: `File "${file.name}" must have one of these extensions: ${extensionList}`
          };
        }
      }

      // Additional validation for specific file types
      const fileName = file.name.toLowerCase();
      
      // Validate PDF files
      if (fileName.endsWith('.pdf')) {
        // Basic MIME type check for PDF
        if (file.type && !file.type.includes('pdf')) {
          return {
            isValid: false,
            error: `File "${file.name}" does not appear to be a valid PDF file`
          };
        }
      }
      
      // Validate ZIP files  
      if (fileName.endsWith('.zip')) {
        // Basic MIME type check for ZIP
        if (file.type && !file.type.includes('zip') && !file.type.includes('compressed')) {
          return {
            isValid: false,
            error: `File "${file.name}" does not appear to be a valid ZIP file`
          };
        }
      }
    }
    
    return { isValid: true };
  }
}

/**
 * Creates a file upload component with configurable parameters
 * @param {Object} config - Configuration for the file uploader
 * @returns {Object} - Object containing HTML string and summary function
 */
export function createFileUploader(config = {}) {
  const component = new FileUploaderComponent(config);
  return component.create();
}
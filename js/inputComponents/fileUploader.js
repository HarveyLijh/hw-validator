// File uploader component
import { formatFileSize } from './helper.js';

/**
 * Creates a file upload component with configurable parameters
 * @param {Object} config - Configuration for the file uploader
 * @param {string} config.id - The ID for the file input element
 * @param {string} config.label - Label text for the file input
 * @param {string} config.accept - Accepted file formats (e.g., '.zip,.rar')
 * @param {number} config.maxSize - Maximum file size in bytes
 * @param {boolean} config.required - Whether the input is required
 * @param {string} config.icon - Font Awesome icon class for the label
 * @returns {Object} - Object containing HTML string and summary function
 */
export function createFileUploader(config) {
  const { 
    id = 'file-input',
    label = 'File Upload',
    accept = '*',
    maxSize = 50 * 1024 * 1024, // Default 50MB
    required = true,
    icon = 'file-archive'
  } = config;

  const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
  const acceptFormats = accept.split(',').map(format => format.trim()).join(', ');

  const html = `
    <div class="input-component file-uploader" data-component-type="file" data-max-size="${maxSize}">
      <label class="block">
        <strong class="text-gray-700 mb-2 flex items-center">
          <i class="fas fa-${icon} text-indigo-500 mr-2"></i>${label}${required ? ' <span class="text-red-500 ml-1">*</span>' : ''}:
        </strong>
        <div class="mt-2 relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <input type="file" id="${id}" accept="${accept}" ${required ? 'required' : ''} 
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-max-size="${maxSize}">
          <div class="text-center">
            <i class="fas fa-cloud-upload-alt text-4xl text-indigo-400 mb-2"></i>
            <p class="text-sm text-gray-600">Drag & drop your file here or click to browse</p>
            <p class="text-xs text-gray-500 mt-1">Accepted formats: ${acceptFormats || 'All files'}</p>
            ${maxSize ? `<p class="text-xs text-gray-500">File must be less than ${maxSizeMB}MB</p>` : ''}
          </div>
          <p id="${id}-display" class="text-sm text-indigo-600 text-center mt-2 hidden"></p>
        </div>
      </label>
    </div>

    <script>
      // Add file name display when a file is selected
      document.getElementById('${id}').addEventListener('change', function(e) {
        const fileNameDisplay = document.getElementById('${id}-display');
        if (this.files[0]) {
          fileNameDisplay.textContent = this.files[0].name;
          fileNameDisplay.classList.remove('hidden');
        } else {
          fileNameDisplay.classList.add('hidden');
        }
        
        // Dispatch custom event for input changes
        const event = new CustomEvent('input-changed', { 
          detail: { type: 'file', id: '${id}' }
        });
        document.dispatchEvent(event);
      });
    </script>
  `;

  /**
   * Generates a summary of the file input
   * @param {HTMLElement} element - The file input element
   * @returns {string} - HTML string with the file summary
   */
  const getSummary = (element) => {
    const file = element.files[0];
    if (!file) return '';

    const fileSize = formatFileSize(file.size);
    const isValid = file.size <= maxSize;

    return `
      <div class="flex items-center ${!isValid ? 'text-red-600' : ''}">
        <i class="fas fa-${icon} ${isValid ? 'text-indigo-500' : 'text-red-500'} mr-2"></i>
        <div>
          <strong>${file.name}</strong> (${fileSize})
          ${!isValid ? `<p class="text-red-500 text-xs mt-1">File exceeds maximum size of ${maxSizeMB}MB</p>` : ''}
        </div>
      </div>
    `;
  };

  /**
   * Validates the file input
   * @param {HTMLElement} element - The file input element
   * @returns {Object} - Object with isValid and error properties
   */
  const validate = (element) => {
    const file = element.files[0];
    
    if (required && !file) {
      return { 
        isValid: false, 
        error: `Please select a file for "${label}"` 
      };
    }
    
    if (file && file.size > maxSize) {
      return { 
        isValid: false, 
        error: `File "${file.name}" exceeds maximum size of ${maxSizeMB}MB` 
      };
    }
    
    return { isValid: true };
  };

  return { html, getSummary, validate, id };
}
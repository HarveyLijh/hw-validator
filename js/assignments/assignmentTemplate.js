// assignments/assignmentTemplate.js
import AssignmentBase from '../core/assignmentBase.js';
import { createFileUploader, createCollaboratorInput, createInputContainer } from '../inputComponents/index.js';
import { escapeHtml } from '../core/utils/index.js';

/**
 * Reads the first n bytes of a file
 * @param {File} file - The file to read
 * @param {number} bytes - Number of bytes to read
 * @returns {Promise<ArrayBuffer>} - Promise resolving to the file header bytes
 */
function readFileHeader(file, bytes) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file header"));
    
    // Read only the first bytes of the file
    const blob = file.slice(0, bytes);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Compare two byte arrays for equality
 * @param {Uint8Array} arr1 - First array
 * @param {Uint8Array} arr2 - Second array
 * @returns {boolean} - True if arrays have the same content
 */
function compareArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  
  return true;
}

/**
 * Unity Assignment class for Python project validation
 * @extends AssignmentBase
 */
export class UnityAssignment extends AssignmentBase {
  // Initialize component inputs
  inputs = [
    createFileUploader({
      id: 'zip-input',
      label: 'Python Source Code',
      accept: '.zip',
      maxSize: 25 * 1024 * 1024, // 25 MB
      required: true,
      icon: 'file-archive'
    }),
    createFileUploader({
      id: 'report-input',
      label: 'Project Report',
      accept: '.pdf',
      maxSize: 25 * 1024 * 1024, // 25 MB
      required: true,
      icon: 'file-pdf'
    }),
    
    createCollaboratorInput({
      id: 'collaborators',
      label: 'Project Collaborators',
      placeholder: 'alice@ucsc.edu',
      required: true,
      rows: 3,
      icon: 'users'
    })
  ];

  /**
   * @returns {string} Assignment name
   */
  assignmentName() {
    return 'Unity Assignment';
  }

  /**
   * @returns {string} HTML for the submission form
   */
  get submissionFormHtml() {
    // Create a container with all the inputs
    return createInputContainer(this.inputs);
  }

  /**
   * @returns {Array} Validation rules
   */
  get validationRules() {
    return [
      {
        name: 'ZIP file selected',
        test: form => {
          const f = form.querySelector('#zip-input').files[0];
          return Boolean(f);
        },
        success: '✅ ZIP file present.',
        failure: '❌ Please select a ZIP file.',
        stopOnFail: true
      },
      {
        name: 'PDF file selected',
        test: form => {
          const f = form.querySelector('#report-input').files[0];
          return Boolean(f);
        },
        success: '✅ PDF file present.',
        failure: '❌ Please select a PDF file.',
        stopOnFail: true
      },
      {
        name: 'Verify ZIP format',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          
          // Check file extension
          const fileName = f.name.toLowerCase();
          if (!fileName.endsWith('.zip')) {
            return false;
          }
          
          // Try to load as ZIP to verify it's actually a valid ZIP file
          try {
            // Check for ZIP signature in file header
            const fileHeader = await readFileHeader(f, 4);
            // ZIP files start with the signature bytes: 0x50 0x4B 0x03 0x04 (PK..)
            const zipSignature = new Uint8Array([0x50, 0x4B, 0x03, 0x04]);
            const isValidSignature = compareArrays(new Uint8Array(fileHeader), zipSignature);
            
            if (!isValidSignature) {
              return false;
            }
            
            // Also attempt to load with JSZip as final validation
            await JSZip.loadAsync(f);
            return true;
          } catch (error) {
            console.error("ZIP validation error:", error);
            return false;
          }
        },
        success: '✅ Valid ZIP format confirmed.',
        failure: '❌ File must be a valid ZIP archive.',
        stopOnFail: true
      },
      {
        name: 'Verify PDF format',
        test: async form => {
          const f = form.querySelector('#report-input').files[0];
          
          // Check file extension
          const fileName = f.name.toLowerCase();
          if (!fileName.endsWith('.pdf')) {
            return false;
          }
          
          try {
            // Check for PDF signature in file header
            const fileHeader = await readFileHeader(f, 5);
            // PDF files start with the signature bytes: %PDF-
            const pdfSignature = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]);
            const isValidSignature = compareArrays(new Uint8Array(fileHeader), pdfSignature);
            
            return isValidSignature;
          } catch (error) {
            console.error("PDF validation error:", error);
            return false;
          }
        },
        success: '✅ Valid PDF format confirmed.',
        failure: '❌ File must be a valid PDF document.',
        stopOnFail: true
      },
      {
        name: 'ZIP size ≤ 25 MB',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          return f.size <= 25 * 1024 * 1024;
        },
        success: '✅ ZIP size OK.',
        failure: '❌ ZIP exceeds 25 MB.',
        stopOnFail: true
      },
      {
        name: 'PDF size ≤ 25 MB',
        test: async form => {
          const f = form.querySelector('#report-input').files[0];
          return f.size <= 25 * 1024 * 1024;
        },
        success: '✅ PDF size OK.',
        failure: '❌ PDF exceeds 25 MB.',
        stopOnFail: true
      },
      {
        name: 'No __MACOSX folder',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          const zip = await JSZip.loadAsync(f);
          return !Object.keys(zip.files).some(p => p.startsWith('__MACOSX/'));
        },
        success: '✅ "__MACOSX" folder absent.',
        failure: '❌ "__MACOSX" folder found.',
        stopOnFail: true
      },
      {
        name: 'scripts/unity_bot.py exists',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          const zip = await JSZip.loadAsync(f);
          return Object.keys(zip.files)
            .map(p => p.replace(/^[^\/]+\/?/, ''))  // strip root folder if any
            .includes('scripts/unity_bot.py');
        },
        success: '✅ Required Python file found.',
        failure: '❌ scripts/unity_bot.py missing.',
        stopOnFail: true,
        preview: async form => {
          try {
            const f = form.querySelector('#zip-input').files[0];
            const zip = await JSZip.loadAsync(f);
            const entry = Object.entries(zip.files)
              .find(([path]) =>
                path.endsWith('scripts/unity_bot.py')
              );
              
            if (!entry) return '';
            
            const text = await zip.file(entry[0]).async('text');
            return `
              <div style="margin-top: 20px;">
              <h4 style="font-size: 0.875rem; font-weight: 500; color: #4a5568; margin-bottom: 8px;">File Content:</h4>
              <div style="background-color: #1a202c; border-radius: 8px; padding: 16px; overflow: auto; max-height: 384px; border: 1px solid #2d3748;">
                <pre style="color: #48bb78; font-size: 0.75rem; width: 100%; margin: 0;"><code>${escapeHtml(text)}</code></pre>
              </div>
              </div>
              <style>
              pre {
                white-space: pre;
                font-family: monospace;
                tab-size: 4;
                overflow-x: auto;
              }
              div[style*="overflow: auto"] {
                scrollbar-width: thin;
                scrollbar-color: #4a5568 #2d3748;
              }
              div[style*="overflow: auto"]::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              div[style*="overflow: auto"]::-webkit-scrollbar-track {
                background: #2d3748;
                border-radius: 4px;
              }
              div[style*="overflow: auto"]::-webkit-scrollbar-thumb {
                background: #4a5568;
                border-radius: 4px;
              }
              div[style*="overflow: auto"]::-webkit-scrollbar-thumb:hover {
                background: #718096;
              }
              </style>
            `;
          } catch (error) {
            console.error("Error generating preview:", error);
            return '';
          }
        }
      },
      {
        name: 'step signature present',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          const zip = await JSZip.loadAsync(f);
          const entry = Object.entries(zip.files)
            .find(([path]) =>
              path.endsWith('scripts/unity_bot.py')
            );
          const text = await zip.file(entry[0]).async('text');
          return /def\s+step\(self,\s+state\):/.test(text);
        },
        success: '✅ step signature OK.',
        failure: '❌ step signature missing or changed.',
        stopOnFail: true
      },
      {
        name: 'get_best signature present',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          const zip = await JSZip.loadAsync(f);
          const entry = Object.entries(zip.files)
            .find(([path]) =>
              path.endsWith('scripts/unity_bot.py')
            );
          const text = await zip.file(entry[0]).async('text');
          return /def\s+get_best\(self,\s+state\):/.test(text);
        },
        success: '✅ get_best signature OK.',
        failure: '❌ get_best signature missing or changed.',
        stopOnFail: true
      },
      {
        name: 'print_tree signature present',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          const zip = await JSZip.loadAsync(f);
          const entry = Object.entries(zip.files)
            .find(([path]) =>
              path.endsWith('scripts/unity_bot.py')
            );
          const text = await zip.file(entry[0]).async('text');
          return /def\s+print_tree\(self,\s+indent\s*=\s*0\):/.test(text);
        },
        success: '✅ print_tree signature OK.',
        failure: '❌ print_tree signature missing or changed.',
        stopOnFail: true
      },
    ];
  }

  /**
   * Collect relevant data from the form for the artifact
   * @param {HTMLElement} formEl - The form element
   * @returns {Object} - Collected form data
   */
  collectFormData(formEl) {
    const zipInput = formEl.querySelector('#zip-input');
    const reportInput = formEl.querySelector('#report-input');
    const collaboratorsInput = formEl.querySelector('#collaborators');
    
    const zipFile = zipInput.files[0];
    const reportFile = reportInput.files[0];
    
    return {
      zipFile,
      reportFile,
      allFiles: [zipFile, reportFile].filter(Boolean), // Array of all files for artifact generator
      collaborators: collaboratorsInput.value.split('\n').map(l => l.trim()).filter(l => l)
    };
  }

  /**
   * Generate artifact HTML
   * @param {HTMLElement} formEl - The form element
   * @param {Object} testResults - Results from validation
   * @returns {string} - HTML for the artifact
   */
  async generateArtifactBody(formEl, testResults) {
    const { zipFile, reportFile, collaborators } = testResults.formData;
    
    // Array to hold rendered tests with their previews
    const renderedTests = [];
    
    // Process each test result and add previews where available
    for (let i = 0; i < testResults.results.length; i++) {
      const r = testResults.results[i];
      const rule = this.validationRules[i];
      
      // Start with the basic test result display
      let testHtml = `
        <div class="${r.passed ? 'test-passed' : 'test-failed'} mb-4 rounded-lg overflow-hidden">
          <h3 class="font-medium px-4 py-3 ${r.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${r.passed ? '<i class="fas fa-check-circle mr-2"></i>' : '<i class="fas fa-times-circle mr-2"></i>'}
            ${r.name}
          </h3>
          <div class="px-4 py-3">
            <p>${r.message}</p>
            
            <!-- Preview content will be added here if available -->
            ${rule.preview && r.passed ? await rule.preview(formEl) : ''}
          </div>
        </div>
      `;
      
      renderedTests.push(testHtml);
    }
    
    // Join all tests together
    const testsHtml = renderedTests.join('');

    const collabSection = collaborators.length
      ? `
        <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h2 class="text-xl font-medium text-blue-800 mb-3 flex items-center">
            <i class="fas fa-users mr-2"></i>Collaborators
          </h2>
          <ul class="list-disc ml-6 space-y-1 text-blue-700">
            ${collaborators.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
          </ul>
        </div>`
      : '';

    return `
      <div class="max-w-3xl mx-auto">
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Unity Assignment Validation Results</h2>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">Submitted Files</h3>
            <div class="space-y-2">
              <div class="flex items-center">
                <i class="fas fa-file-archive text-indigo-500 mr-2"></i>
                <span>Python Code: ${escapeHtml(zipFile.name)}</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-file-pdf text-red-500 mr-2"></i>
                <span>Report: ${escapeHtml(reportFile.name)}</span>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            ${testsHtml}
          </div>
          ${collabSection}
          <p class="mt-8 text-center text-gray-600">
            <i class="fas fa-check-circle text-green-500 mr-2"></i>
            <em>All done—your Unity project has been validated.</em>
          </p>
        </div>
        
        <!-- Add syntax highlighting styles for code previews -->
        <style>
          pre code {
            white-space: pre;
            font-family: monospace;
            tab-size: 4;
          }
          .max-h-96 {
            max-height: 24rem;
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #2d3748;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background: #4a5568;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
        </style>
      </div>
    `;
  }
}

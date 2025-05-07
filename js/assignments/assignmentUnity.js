// assignments/assignmentUnity.js
import AssignmentBase from '../core/assignmentBase.js';
import { createFileUploader, createCollaboratorInput, createInputContainer } from '../inputComponents/index.js';

/**
 * Escapes HTML special characters to prevent XSS when displaying code
 * @param {string} text - Text to escape
 * @returns {string} - HTML-escaped text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

// assumes JSZip is loaded globally via <script src="…jszip.min.js">
export class UnityAssignment extends AssignmentBase {
  // Initialize inputs property before calling the parent constructor
  inputs = [
    createFileUploader({
      id: 'zip-input',
      label: 'Unity Project ZIP',
      accept: '.zip',
      maxSize: 50 * 1024 * 1024, // 50 MB
      required: true,
      icon: 'file-archive'
    }),
    
    // createCollaboratorInput({
    //   id: 'collaborators-input',
    //   label: 'Collaborators',
    //   placeholder: 'alice@ucsc.edu',
    //   rows: 3,
    //   required: false
    // })
  ];
  
  constructor() {
    super();
  }

  assignmentName() {
    return 'Unity C# Project';
  }

  get submissionFormHtml() {
    return createInputContainer(this.inputs);
  }

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
        name: 'Size ≤ 50 MB',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          return f.size <= 50 * 1024 * 1024;
        },
        success: '✅ ZIP size OK.',
        failure: '❌ ZIP exceeds 50 MB.',
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
        name: 'Assets/Scripts/assignment2/PathFinder.cs exists',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          const zip = await JSZip.loadAsync(f);
          return Object.keys(zip.files)
            .map(p => p.replace(/^[^\/]+\/?/, ''))  // strip root folder if any
            .includes('Assets/Scripts/assignment2/PathFinder.cs');
        },
        success: '✅ Required C# file found.',
        failure: '❌ PathFinder.cs missing.',
        stopOnFail: true,
        preview: async form => {
          try {
            const f = form.querySelector('#zip-input').files[0];
            const zip = await JSZip.loadAsync(f);
            const entry = Object.entries(zip.files)
              .find(([path]) =>
                path.endsWith('Assets/Scripts/assignment2/PathFinder.cs')
              );
              
            if (!entry) return '';
            
            const text = await zip.file(entry[0]).async('text');
            return `
              <div class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">File Content:</h4>
                <div class="bg-gray-800 rounded-lg p-4 overflow-auto max-h-96">
                  <pre class="text-green-400 text-xs"><code>${escapeHtml(text)}</code></pre>
                </div>
              </div>
            `;
          } catch (error) {
            console.error("Error generating preview:", error);
            return '';
          }
        }
      },
      {
        name: 'AStar signature present',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          const zip = await JSZip.loadAsync(f);
          const entry = Object.entries(zip.files)
            .find(([path]) =>
              path.endsWith('Assets/Scripts/assignment2/PathFinder.cs')
            );
          const text = await zip.file(entry[0]).async('text');
          return /public\s+static\s*\(List<Vector3>,\s*int\)\s*AStar\s*\(/.test(text);
        },
        success: '✅ AStar signature OK.',
        failure: '❌ AStar signature missing.',
        stopOnFail: true
      },
      {
        name: 'No "REMOVE THIS COMMENT"',
        test: async form => {
          const f = form.querySelector('#zip-input').files[0];
          const zip = await JSZip.loadAsync(f);
          const entry = Object.entries(zip.files)
            .find(([path]) =>
              path.endsWith('Assets/Scripts/assignment2/PathFinder.cs')
            );
          const text = await zip.file(entry[0]).async('text');
          return !/\/\/\s*REMOVE THIS COMMENT/.test(text);
        },
        success: '✅ No extraneous comments.',
        failure: '❌ Found "REMOVE THIS COMMENT".',
        stopOnFail: false
      }
    ];
  }

  // package up for artifactGenerator
  collectFormData(form) {
    const file = form.querySelector('#zip-input').files[0];
    // const collab = form
    //   .querySelector('#collaborators-input')
    //   .value.split('\n')
    //   .map(l => l.trim())
    //   .filter(l => l);
    return { zipFile: file};//, collaborators: collab };
  }

  async generateArtifactBody(form, { results, formData }) {
    // Array to hold rendered tests with their previews
    const renderedTests = [];
    
    // Process each test result and add previews where available
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
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
            ${rule.preview && r.passed ? await rule.preview(form) : ''}
          </div>
        </div>
      `;
      
      renderedTests.push(testHtml);
    }
    
    // Join all tests together
    const testsHtml = renderedTests.join('');

    const collabSection = "";
    // const collabSection = formData.collaborators.length
    //   ? `
    //     <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
    //       <h2 class="text-xl font-medium text-blue-800 mb-3 flex items-center">
    //         <i class="fas fa-users mr-2"></i>Collaborators
    //       </h2>
    //       <ul class="list-disc ml-6 space-y-1 text-blue-700">
    //         ${formData.collaborators.map(e => `<li>${e}</li>`).join('')}
    //       </ul>
    //     </div>`
    //   : '';

    return `
      <div class="max-w-3xl mx-auto">
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Validation Results</h2>
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
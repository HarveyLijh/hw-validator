// core/uiManager.js
import { getReturnUrl } from './utils/index.js';

export default class UIManager {
  constructor(assignment) {
    this.assignment = assignment;
    this.stepsContainer = document.getElementById('steps-container');
    this.lastTestData = null;
    this.hasInputs = false;
    this.validationErrors = [];
    this.inputComponents = []; // Will store the input components
    
    // Log document.referrer for testing purposes
    console.log('Testing document.referrer:', document.referrer);
    
    // Get the return URL (from URL parameter or referrer)
    this.returnUrl = getReturnUrl();
    console.log('Return URL:', this.returnUrl);
  }

  initialize() {
    document.getElementById('subtitle').textContent = this.assignment.assignmentName();
    this.renderSteps();
    this.bindEvents();
  }

  renderSteps() {
    // Identify input components if available
    if (this.assignment.inputs && Array.isArray(this.assignment.inputs)) {
      this.inputComponents = this.assignment.inputs;
    }

    // Step 1
    const step1 = document.createElement('div');
    step1.className = 'step active';
    step1.innerHTML = `
      <h3><span class="step-number">1</span> Submit ${this.assignment.assignmentName()}</h3>
      <div id="step1-form" class="mt-4">${this.assignment.submissionFormHtml}</div>
      <div id="validation-errors" class="mt-4 hidden">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="text-red-700 text-sm font-semibold mb-2 flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>Please correct the following errors:
          </h4>
          <ul id="error-list" class="text-red-600 text-sm list-disc ml-6"></ul>
        </div>
      </div>
      <div id="input-feedback" class="mt-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="text-blue-700 text-sm font-semibold mb-2 flex items-center">
            <i class="fas fa-info-circle mr-2"></i>Input Summary
          </h4>
          <div id="feedback-content" class="text-blue-600 text-sm space-y-3"></div>
          <p id="no-input-message" class="text-gray-500 italic text-sm text-center py-2">No input provided yet</p>
        </div>
      </div>
      <div class="mt-6">
        <button id="btn-validate-step1" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-all">
          <i class="fas fa-check-circle"></i>Continue
        </button>
      </div>
    `;
    
    // Step 2
    const step2 = document.createElement('div');
    step2.className = 'step disabled';
    step2.id = 'step-2';
    step2.innerHTML = `
      <h3><span class="step-number">2</span> Run Validation</h3>
        <div id="step2-info" class="text-sm mt-3 hidden">
          <p class="text-indigo-600">
            <i class="fas fa-arrow-circle-down mr-1 animate-bounce"></i>
            Click the button to start validation
          </p>
        </div>
      <div class="mt-4">
        <button id="btn-run-tests" disabled class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-all">
          <i class="fas fa-play-circle"></i>Run Tests
        </button>
      </div>
      <div id="step2-results" class="mt-4"></div>
    `;
    
    // Step 3
    const step3 = document.createElement('div');
    step3.className = 'step disabled';
    step3.innerHTML = `
      <h3><span class="step-number">3</span> Download Artifact</h3>
      <button id="btn-download-artifact" disabled class="bg-indigo-600 hover:bg-indigo-700 mt-4 text-white font-semibold py-2 px-4 rounded transition-all">
        <i class="fas fa-download"></i>Download Artifact
      </button>
    `;
    
    // Add elements to container
    this.stepsContainer.append(step1, step2, step3);
    
    // Add Step 4 (Submit) if returnUrl is available
    if (this.returnUrl) {
      try {
        // Create step 4 with the return URL
        const url = new URL(this.returnUrl);
        const hostname = url.hostname;
        
        const step4 = document.createElement('div');
        step4.className = 'step disabled';
        step4.id = 'step-4';
        step4.innerHTML = `
          <h3><span class="step-number">4</span> Submit Artifact</h3>
          <div class="mt-4">
            <p class="text-sm text-gray-600 mb-3">
              <i class="fas fa-info-circle text-blue-500 mr-1"></i>
              Return to <a href="${this.returnUrl}" class="text-blue-600 hover:underline">${hostname}</a> to submit your artifact.
            </p>
            <button id="btn-submit-artifact" disabled class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-all">
              <i class="fas fa-external-link-alt"></i>Return to Submission Page
            </button>
          </div>
        `;
        this.stepsContainer.append(step4);
      } catch (err) {
        console.error('Error creating return URL step:', err);
      }
    }
    
    console.log('Steps rendered');

    // Add step number styling
    const stepNumberStyle = document.createElement('style');
    stepNumberStyle.textContent = `
      .step-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: #e5e7eb;
        color: #374151;
        border-radius: 50%;
        margin-right: 10px;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .step.active .step-number {
        background: #4f46e5;
        color: white;
      }
      .step.completed .step-number {
        background: #10b981;
        color: white;
      }
      .step.failed .step-number {
        background: #ef4444;
        color: white;
      }
      .step.error .step-number {
        background: #f59e0b;
        color: white;
      }
      .highlight-step {
        animation: pulse-border 2s infinite;
      }
      @keyframes pulse-border {
        0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
        70% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
        100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
      }
    `;
    document.head.appendChild(stepNumberStyle);
  }

  bindEvents() {
    const formEl = this.stepsContainer.querySelector('#step1-form');
    const runBtn = this.stepsContainer.querySelector('#btn-run-tests');
    const downloadBtn = this.stepsContainer.querySelector('#btn-download-artifact');
    const validateStep1Btn = this.stepsContainer.querySelector('#btn-validate-step1');
    const validationErrors = this.stepsContainer.querySelector('#validation-errors');
    const errorList = this.stepsContainer.querySelector('#error-list');
    const inputFeedback = this.stepsContainer.querySelector('#input-feedback');
    const feedbackContent = this.stepsContainer.querySelector('#feedback-content');
    const noInputMessage = this.stepsContainer.querySelector('#no-input-message');
    const step2Info = this.stepsContainer.querySelector('#step2-info');
    const step2 = this.stepsContainer.querySelector('#step-2');

    // Listen for custom input-changed events from our components
    document.addEventListener('input-changed', () => {
      this.updateInputFeedback();
      validationErrors.classList.add('hidden');
    });

    // Also listen for standard input events on the form
    formEl.addEventListener('input', () => {
      validationErrors.classList.add('hidden');
    });

    // Update input feedback when any input changes
    this.updateInputFeedback = () => {
      let hasAnyInput = false;
      feedbackContent.innerHTML = '';
      
      // If we have input components defined, use them for feedback
      if (this.inputComponents.length > 0) {
        this.inputComponents.forEach(component => {
          const element = document.getElementById(component.id);
          if (element) {
            const summary = component.getSummary(element);
            if (summary) {
              hasAnyInput = true;
              const summaryDiv = document.createElement('div');
              summaryDiv.innerHTML = summary;
              feedbackContent.appendChild(summaryDiv);
            }
          }
        });
      } else {
        // Legacy fallback for assignments that don't use the component system
        // This is for backwards compatibility
        const fileInput = formEl.querySelector('input[type="file"]');
        const collaboratorsInput = formEl.querySelector('textarea');
        
        if (fileInput && fileInput.files[0]) {
          hasAnyInput = true;
          const file = fileInput.files[0];
          const fileSize = this.formatFileSize(file.size);
          const fileDiv = document.createElement('div');
          fileDiv.innerHTML = `
            <div class="flex items-center">
              <i class="fas fa-file-archive text-indigo-500 mr-2"></i>
              <strong>${file.name}</strong> (${fileSize})
            </div>
          `;
          feedbackContent.appendChild(fileDiv);
        }
        
        if (collaboratorsInput) {
          const collaborators = collaboratorsInput.value.trim().split('\n').filter(l => l.trim());
          if (collaborators.length > 0) {
            hasAnyInput = true;
            const collabDiv = document.createElement('div');
            collabDiv.innerHTML = `
              <div class="flex items-start">
                <i class="fas fa-users text-indigo-500 mr-2 mt-1"></i>
                <div>
                  <strong>${collaborators.length} Collaborator${collaborators.length > 1 ? 's' : ''}:</strong>
                  <ul class="list-disc ml-5 mt-1">
                    ${collaborators.map(email => `<li>${email}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `;
            feedbackContent.appendChild(collabDiv);
          }
        }
      }
      
      // Update visibility of messages
      if (hasAnyInput) {
        noInputMessage.classList.add('hidden');
        this.hasInputs = true;
      } else {
        noInputMessage.classList.remove('hidden');
        this.hasInputs = false;
      }
    };

    // Call once to initialize
    this.updateInputFeedback();

    // Validate step 1 inputs
    const validateStep1 = () => {
      this.validationErrors = [];
      
      // If we have input components, use their validation methods
      if (this.inputComponents.length > 0) {
        this.inputComponents.forEach(component => {
          const element = document.getElementById(component.id);
          if (element) {
            const validation = component.validate(element);
            if (!validation.isValid && validation.error) {
              this.validationErrors.push(validation.error);
            }
          }
        });
      } else {
        // Legacy fallback validation
        const fileInput = formEl.querySelector('input[type="file"]');
        if (fileInput && !fileInput.files[0]) {
          this.validationErrors.push('Please select a file');
        }
      }
      
      // Display errors if any
      if (this.validationErrors.length > 0) {
        errorList.innerHTML = '';
        this.validationErrors.forEach(error => {
          const li = document.createElement('li');
          li.textContent = error;
          errorList.appendChild(li);
        });
        validationErrors.classList.remove('hidden');
        return false;
      }
      
      // All inputs are valid
      validationErrors.classList.add('hidden');
      return true;
    };
    
    // Step 1 validation button
    validateStep1Btn.addEventListener('click', () => {
      if (validateStep1()) {
        // Mark step 1 as completed
        this.updateStepStatus(1, 'completed');
        
        // Activate step 2
        this.updateStepStatus(2, 'active');
        runBtn.disabled = false;
        
        // Highlight step 2
        step2.classList.add('highlight-step');
        step2Info.classList.remove('hidden');
        runBtn.classList.add('animate-pulse');
        
        // Scroll to step 2
        step2.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
          step2.classList.remove('highlight-step');
          runBtn.classList.remove('animate-pulse');
        }, 5000);
      }
    });

    // Initialize input monitoring for real-time feedback
    const initializeInputMonitoring = () => {
      // For file inputs
      formEl.querySelectorAll('input[type="file"]').forEach(fileInput => {
        fileInput.addEventListener('change', () => {
          this.updateInputFeedback();
        });
      });
      
      // For textarea inputs
      formEl.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', () => {
          this.updateInputFeedback();
        });
      });
    };
    
    // Initialize input monitoring
    initializeInputMonitoring();

    runBtn.addEventListener('click', async () => {
      this.clearResults();
      runBtn.disabled = true;
      runBtn.classList.remove('animate-pulse');
      step2Info.classList.add('hidden');
      runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Running Tests...';
      this.updateStepStatus(2, 'loading');

      try {
        const data = await this.assignment.runTests(formEl, msg => this.appendResult(msg));
        this.lastTestData = data;
        this.updateStepStatus(2, data.passed ? 'completed' : 'failed');
        this.updateStepStatus(3, data.passed ? 'active' : 'disabled');
        downloadBtn.disabled = !data.passed;
        runBtn.innerHTML = '<i class="fas fa-play-circle"></i>Run Tests';
        
        if (data.passed) {
          // Highlight step 3
          const step3 = this.stepsContainer.querySelectorAll('.step')[2];
          step3.classList.add('highlight-step');
          setTimeout(() => step3.classList.remove('highlight-step'), 5000);
        }
      } catch (err) {
        this.appendResult(`❌ ${err.message}`);
        this.updateStepStatus(2, 'error');
        runBtn.innerHTML = '<i class="fas fa-play-circle"></i>Run Tests';
      } finally {
        runBtn.disabled = false;
      }
    });

    downloadBtn.addEventListener('click', async () => {
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Generating...';
      this.updateStepStatus(3, 'loading');

      try {
        // Fix: Await the result of generateArtifactBody since it's an async function
        const bodyHtml = await this.assignment.generateArtifactBody(formEl, this.lastTestData);
        
        // Collect all files from file uploader components
        const allFiles = this.collectAllFiles(formEl);
        
        const { generateArtifactHTML } = await import('./artifactGenerator.js');
        const full = await generateArtifactHTML({
          files: allFiles,
          title: this.assignment.assignmentName(),
          bodyHtml
        });
        const blob = new Blob([full], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.assignment.assignmentName().toLowerCase().replace(/\s+/g,'-')}-artifact.html`;
        document.body.append(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        this.updateStepStatus(3, 'completed');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>Download Artifact';
        
        // If step 4 exists (returnUrl is available), activate it
        if (this.returnUrl) {
          const submitBtn = this.stepsContainer.querySelector('#btn-submit-artifact');
          if (submitBtn) {
            const step4 = this.stepsContainer.querySelector('#step-4');
            this.updateStepStatus(4, 'active');
            submitBtn.disabled = false;
            
            // Highlight step 4
            step4.classList.add('highlight-step');
            setTimeout(() => step4.classList.remove('highlight-step'), 5000);
            
            // Scroll to step 4
            step4.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } catch (err) {
        this.appendResult(`❌ Artifact Error: ${err.message}`);
        this.updateStepStatus(3, 'error');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>Download Artifact';
      } finally {
        downloadBtn.disabled = false;
      }
    });
    
    // Add event listener for submit button if it exists
    const submitBtn = this.stepsContainer.querySelector('#btn-submit-artifact');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        // Navigate back to the return URL
        window.location.href = this.returnUrl;
      });
    }
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  updateStepStatus(stepNum, status) {
    const steps = this.stepsContainer.querySelectorAll('.step');
    const el = steps[stepNum - 1];
    el.classList.remove('active','disabled','loading','completed','failed','error');
    el.classList.add(status);
  }

  appendResult(msg) {
    const div = this.stepsContainer.querySelector('#step2-results');
    const p = document.createElement('p');
    
    // Style different result types
    if (msg.startsWith('✅')) {
      p.classList.add('bg-green-50', 'text-green-800');
      p.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-2"></i>${msg.substring(2)}`;
    } else if (msg.startsWith('❌')) {
      p.classList.add('bg-red-50', 'text-red-800');
      p.innerHTML = `<i class="fas fa-times-circle text-red-500 mr-2"></i>${msg.substring(2)}`;
    } else if (msg.startsWith('🔎')) {
      p.classList.add('bg-blue-50', 'text-blue-800'); 
      p.innerHTML = `<i class="fas fa-search text-blue-500 mr-2"></i>${msg.substring(2)}`;
    } else {
      p.classList.add('text-gray-700');
      p.textContent = msg;
    }
    
    div.append(p);
    // Auto-scroll to the bottom of the results
    div.scrollTop = div.scrollHeight;
  }

  clearResults() {
    const div = this.stepsContainer.querySelector('#step2-results');
    div.innerHTML = '';
  }

  /**
   * Collect all files from file uploader components
   * @param {HTMLElement} formEl - The form element
   * @returns {Array<File>} - Array of all uploaded files
   */
  collectAllFiles(formEl) {
    const files = [];
    
    // Look for all file input elements in the form
    const fileInputs = formEl.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
      if (input.files && input.files[0]) {
        files.push(input.files[0]);
      }
    });
    
    return files;
  }
}
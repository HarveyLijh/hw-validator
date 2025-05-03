// All DOM wiring & state
import { runZipTests } from "./zipChecker.js";
import { generateReport } from "./reportGenerator.js";

// UI Elements
const zipInput = document.getElementById("zip-input");
const runBtn = document.getElementById("run-tests");
const resultBtn = document.getElementById("test-result");
const resultsList = document.getElementById("results-list");
const submissionData = document.getElementById("submission-data");
const downloadBtn = document.getElementById("download-report");
const fileStatus = document.getElementById("file-status");
const stepsContainer = document.getElementById("steps-container");

// Define max file size constant (50MB in bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024; 

let lastTestData = null;

// Step management
const STEPS = {
  UPLOAD: 1,
  RUN_TESTS: 2,
  DOWNLOAD: 3
};

// Initialize the step system
function initializeSteps() {
  // Create step elements if they don't exist
  if (!stepsContainer.querySelector('.step')) {
    // Step 1: Upload
    const step1 = createStepElement(
      STEPS.UPLOAD, 
      "Upload Unity ZIP File", 
      "Select a .zip file containing your Unity project (max 50MB)"
    );
    
    // Step 2: Run Tests
    const step2 = createStepElement(
      STEPS.RUN_TESTS, 
      "Run Validation Tests", 
      "Analyze your project structure and files"
    );
    
    // Step 3: Download Report
    const step3 = createStepElement(
      STEPS.DOWNLOAD, 
      "Download HTML Report", 
      "Save the validation results as an HTML file"
    );
    
    // Add steps to container
    stepsContainer.appendChild(step1);
    stepsContainer.appendChild(step2);
    stepsContainer.appendChild(step3);
    
    // Initially, only step 1 is active
    updateStepStatus(STEPS.UPLOAD, 'active');
    updateStepStatus(STEPS.RUN_TESTS, 'disabled');
    updateStepStatus(STEPS.DOWNLOAD, 'disabled');
    
    // Move the file input to the first step
    setupFileUploadStep();
  }
}

function setupFileUploadStep() {
  const stepAction = document.getElementById(`step-action-${STEPS.UPLOAD}`);
  
  // Create file input label and move the actual input inside it
  const fileInputLabel = document.createElement('label');
  fileInputLabel.className = 'file-input-label';
  fileInputLabel.innerHTML = '<span>Select Unity ZIP</span>';
  fileInputLabel.appendChild(zipInput);
  
  // Add file input to step 1
  stepAction.appendChild(fileInputLabel);
  
  // Add file status to step 1
  stepAction.appendChild(fileStatus);
}

function createStepElement(stepNum, title, instructions) {
  const stepEl = document.createElement('div');
  stepEl.className = 'step';
  stepEl.dataset.step = stepNum;
  
  stepEl.innerHTML = `
    <div class="step-number">${stepNum}</div>
    <div class="step-content">
      <h3>${title}</h3>
      <p>${instructions}</p>
      <div class="step-action" id="step-action-${stepNum}"></div>
      ${stepNum === STEPS.RUN_TESTS ? '<div class="step-results hidden" id="step-results"></div>' : ''}
    </div>
  `;
  
  return stepEl;
}

function updateStepStatus(stepNum, status) {
  const stepEl = stepsContainer.querySelector(`.step[data-step="${stepNum}"]`);
  if (!stepEl) return;
  
  // Remove all status classes
  stepEl.classList.remove('active', 'completed', 'disabled', 'error', 'loading', 'failed');
  
  // Add the new status class
  stepEl.classList.add(status);
  
  // Update UI components based on step status
  switch (stepNum) {
    case STEPS.UPLOAD:
      // Upload step is managed by the file input change event
      break;
      
    case STEPS.RUN_TESTS:
      if (status === 'active') {
        // Move run button to step 2
        const step2Action = document.getElementById(`step-action-${STEPS.RUN_TESTS}`);
        step2Action.appendChild(runBtn);
        step2Action.appendChild(resultBtn);
        runBtn.classList.remove('hidden');
      }
      break;
      
    case STEPS.DOWNLOAD:
      if (status === 'active') {
        // Move download button to step 3
        const step3Action = document.getElementById(`step-action-${STEPS.DOWNLOAD}`);
        step3Action.appendChild(downloadBtn);
        downloadBtn.classList.remove('hidden');
      } else {
        downloadBtn.classList.add('hidden');
      }
      break;
  }
}

function clearResults() {
  resultsList.innerHTML = "";
  submissionData.innerHTML = "";
  
  // Clear step 2 results as well
  const stepResults = document.getElementById('step-results');
  if (stepResults) {
    stepResults.innerHTML = "";
    stepResults.classList.add('hidden');
  }
}

function addResult(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  resultsList.append(li);
}

function displaySubmissionData(file) {
  const submissionDate = new Date().toLocaleString();
  const fileSize = (file.size / 1024 / 1024).toFixed(2);
  
  submissionData.innerHTML = `
    <div class="submission-info">
      <p><strong>Filename:</strong> ${file.name}</p>
      <p><strong>File Size:</strong> ${fileSize} MB</p>
      <p><strong>Submission Date:</strong> ${submissionDate}</p>
    </div>
  `;
}

function showFileStatus(message, isError = false) {
  fileStatus.textContent = message;
  fileStatus.className = `file-status ${isError ? 'status-error' : 'status-success'}`;
  fileStatus.classList.remove('hidden');
}

function validateFile(file) {
  // Check if file exists
  if (!file) {
    return { valid: false, message: "No file selected." };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      message: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds 50MB limit.` 
    };
  }
  
  // Check file type (must be .zip)
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return {
      valid: false,
      message: "File must be a ZIP archive."
    };
  }
  
  return { 
    valid: true, 
    message: `File received: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` 
  };
}

// New function to display test results below step 2
function displayTestResultsInStep(testResults) {
  const stepResults = document.getElementById('step-results');
  if (!stepResults) return;
  
  stepResults.classList.remove('hidden');
  stepResults.innerHTML = '<h4>Test Results:</h4>';
  
  const resultsList = document.createElement('ul');
  resultsList.className = 'step-results-list';
  
  // Add all executed tests
  if (testResults && testResults.length > 0) {
    testResults.forEach(result => {
      const li = document.createElement('li');
      li.className = result.passed ? 'test-passed' : 'test-failed';
      li.textContent = result.message;
      resultsList.appendChild(li);
    });
  }
  
  // Display any unreached tests
  const allTestNames = [
    "No __MACOSX folder",
    "PathFinder.cs file check",
    "AStar method signature",
    "Remove comment check"
  ];
  
  // Find which tests weren't reached
  const executedTestNames = testResults.map(test => test.name);
  const unreachedTests = allTestNames.filter(name => !executedTestNames.includes(name));
  
  if (unreachedTests.length > 0) {
    const unreachedHeader = document.createElement('h4');
    unreachedHeader.textContent = 'Unreached Tests:';
    stepResults.appendChild(unreachedHeader);
    
    const unreachedList = document.createElement('ul');
    unreachedList.className = 'unreached-tests-list';
    
    unreachedTests.forEach(testName => {
      const li = document.createElement('li');
      li.className = 'test-unreached';
      li.textContent = `❓ ${testName} - Not evaluated`;
      unreachedList.appendChild(li);
    });
    
    stepResults.appendChild(unreachedList);
  }
  
  stepResults.appendChild(resultsList);
}

// Initialize steps when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSteps);

// Event Listeners
zipInput.addEventListener("change", () => {
  // Clear any previous status messages
  fileStatus.classList.add("hidden");
  
  const file = zipInput.files[0];
  const validation = validateFile(file);
  
  if (!validation.valid) {
    showFileStatus(validation.message, true);
    updateStepStatus(STEPS.UPLOAD, 'error');
    updateStepStatus(STEPS.RUN_TESTS, 'disabled');
    updateStepStatus(STEPS.DOWNLOAD, 'disabled');
    runBtn.disabled = true;
  } else {
    showFileStatus(validation.message, false);
    updateStepStatus(STEPS.UPLOAD, 'completed');
    updateStepStatus(STEPS.RUN_TESTS, 'active');
    updateStepStatus(STEPS.DOWNLOAD, 'disabled');
    runBtn.disabled = false;
  }
});

runBtn.addEventListener("click", async () => {
  clearResults();
  
  // Show loading state
  updateStepStatus(STEPS.RUN_TESTS, 'loading');
  runBtn.disabled = true;
  
  resultsList.classList.add("hidden");
  downloadBtn.classList.add("hidden");
  
  const file = zipInput.files[0];
  
  try {
    // Display submission data
    displaySubmissionData(file);
    
    lastTestData = await runZipTests(file, addResult);
    
    // Show results
    resultsList.classList.remove("hidden");
    
    // Display test results in step 2
    displayTestResultsInStep(lastTestData.testResults);
    
    // Update step status based on test results
    if (lastTestData.passed) {
      updateStepStatus(STEPS.RUN_TESTS, 'completed');
      resultBtn.innerHTML = 'Tests Passed ✓';
      resultBtn.classList.add('passed');
      resultBtn.classList.remove('hidden');
      updateStepStatus(STEPS.DOWNLOAD, 'active');
    } else {
      updateStepStatus(STEPS.RUN_TESTS, 'failed'); // New status for failed tests
      resultBtn.innerHTML = 'Tests Failed ✗';
      resultBtn.classList.add('failed');
      resultBtn.classList.remove('hidden');
      updateStepStatus(STEPS.DOWNLOAD, 'disabled');
    }
  } catch (error) {
    // Handle any errors during processing
    resultsList.classList.remove("hidden");
    addResult(`❌ ERROR: ${error.message}`);
    
    // Update step status
    updateStepStatus(STEPS.RUN_TESTS, 'error');
    resultBtn.innerHTML = 'Test Failed ✗';
    resultBtn.classList.remove('hidden');
    resultBtn.classList.add('failed');
    updateStepStatus(STEPS.DOWNLOAD, 'disabled');
  } finally {
    runBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", async () => {
  if (!lastTestData || !lastTestData.passed) return;
  
  // Show loading state
  downloadBtn.disabled = true;
  updateStepStatus(STEPS.DOWNLOAD, 'loading');
  
  try {
    const reportHtml = await generateReport(lastTestData);
    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unity-validator-report.html";
    document.body.append(a);
    a.click();
    a.remove();
    
    // Clean up blob URL after download
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    // Update UI
    updateStepStatus(STEPS.DOWNLOAD, 'completed');
    downloadBtn.innerHTML = 'Download Complete ✓';
  } catch (error) {
    console.error("Report generation failed:", error);
    updateStepStatus(STEPS.DOWNLOAD, 'error');
    downloadBtn.innerHTML = 'Download Failed ✗';
  } finally {
    downloadBtn.disabled = false;
  }
});
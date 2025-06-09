import { openModal, closeModal } from "./modal.js";
import { renderFormBuilder, addComponent, renderComponentContent, renderPropertiesPanel, setComponentCounter } from "./componentHandler.js";

// Global state
let formComponents = [];
let validationRules = [];
let draggedComponent = null;
let draggedFromPalette = false;

// Make these available globally for the component handler
window.draggedComponent = null;
window.draggedFromPalette = false;

// Initialize drag and drop
document.addEventListener("DOMContentLoaded", function () {
  initializeDragAndDrop();
  // Initialize the properties panel display
  renderPropertiesPanel(formComponents);
});

function initializeDragAndDrop() {
  const componentItems = document.querySelectorAll(".component-item");
  const formBuilder = document.getElementById("formBuilder");

  componentItems.forEach((item) => {
    item.addEventListener("dragstart", handlePaletteDragStart);
  });

  formBuilder.addEventListener("dragover", handleDragOver);
  formBuilder.addEventListener("drop", handleDrop);
  formBuilder.addEventListener("dragenter", handleDragEnter);
  formBuilder.addEventListener("dragleave", handleDragLeave);
}

function handlePaletteDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.component);
  e.target.classList.add("dragging");
  draggedFromPalette = true;
  window.draggedFromPalette = true;
}

function handleDragOver(e) {
  e.preventDefault();

  if (!draggedFromPalette && (draggedComponent || window.draggedComponent)) {
    const formBuilder = document.getElementById("formBuilder");
    const afterElement = getDragAfterElement(formBuilder, e.clientY);
    const dropIndicators = formBuilder.querySelectorAll(".drop-indicator");

    // Remove all existing indicators
    dropIndicators.forEach((indicator) => indicator.remove());

    // Add new indicator
    const indicator = document.createElement("div");
    indicator.className = "drop-indicator active";

    if (afterElement == null) {
      formBuilder.appendChild(indicator);
    } else {
      formBuilder.insertBefore(indicator, afterElement);
    }
  }
}

function handleDragEnter(e) {
  e.preventDefault();
  if (draggedFromPalette) {
    e.target.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  if (draggedFromPalette) {
    e.target.classList.remove("drag-over");
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.target.classList.remove("drag-over");

  // Remove drop indicators
  const dropIndicators = document.querySelectorAll(".drop-indicator");
  dropIndicators.forEach((indicator) => indicator.remove());

  if (draggedFromPalette) {
    const componentType = e.dataTransfer.getData("text/plain");
    if (componentType) {
      addComponent(componentType, formComponents, () => renderFormBuilder(formComponents));
    }
  } else if (draggedComponent || window.draggedComponent) {
    // Handle reordering
    const formBuilder = document.getElementById("formBuilder");
    const afterElement = getDragAfterElement(formBuilder, e.clientY);
    const currentDraggedComponent = draggedComponent || window.draggedComponent;
    const draggedId = currentDraggedComponent.dataset.componentId;

    // Find the component in our array
    const componentIndex = formComponents.findIndex((c) => c.id === draggedId);
    if (componentIndex !== -1) {
      const component = formComponents.splice(componentIndex, 1)[0];

      // Find new position
      let newIndex = formComponents.length;
      if (afterElement) {
        const afterId = afterElement.dataset.componentId;
        newIndex = formComponents.findIndex((c) => c.id === afterId);
      }

      // Insert at new position
      formComponents.splice(newIndex, 0, component);
      renderFormBuilder(formComponents);
    }
  }

  // Clean up
  document.querySelectorAll(".component-item").forEach((item) => {
    item.classList.remove("dragging");
  });

  if (draggedComponent) {
    draggedComponent.classList.remove("dragging");
    draggedComponent = null;
  }

  draggedFromPalette = false;
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".form-component:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function addValidationRule() {
  const ruleTypes = [
    {
      type: "fileStructure",
      name: "File Structure Check",
      icon: "fas fa-folder-tree",
      description: "Checks if required files or folders exist",
    },
    {
      type: "fileContent",
      name: "File Content Check",
      icon: "fas fa-file-code",
      description: "Checks for specific content within files",
    },
    {
      type: "fileExtension",
      name: "File Extension Check",
      icon: "fas fa-file-alt",
      description: "Validates file extensions",
    },
    {
      type: "imageSize",
      name: "Image Size Check",
      icon: "fas fa-image",
      description: "Checks image dimensions and size",
    },
    {
      type: "custom",
      name: "Custom Rule",
      icon: "fas fa-code",
      description: "Define custom validation logic",
    },
  ];

  const modalContent = `
        <p style="margin-bottom: 1rem;">Select a validation rule type:</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          ${ruleTypes
            .map(
              (rule) => `
            <div class="rule-option" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;" 
                 onclick="createValidationRule('${rule.type}')">
              <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <i class="${rule.icon}" style="color: #667eea; margin-right: 0.5rem;"></i>
                <strong>${rule.name}</strong>
              </div>
              <p style="font-size: 0.875rem; color: #64748b;">${rule.description}</p>
            </div>
          `
            )
            .join("")}
        </div>
      `;

  openModal("Add Validation Rule", modalContent);
}

function getDefaultRuleParameters(type) {
  switch (type) {
    case "fileStructure":
      return { requiredFiles: ["Assets/", "ProjectSettings/"] };
    case "fileContent":
      return { searchPattern: "", targetFiles: ["*.cs"] };
    case "fileExtension":
      return { allowedExtensions: [".cs", ".unity", ".prefab"] };
    case "imageSize":
      return { minWidth: 512, minHeight: 512, maxSize: 2048 };
    case "custom":
      return { script: "Custom validation logic here" };
    default:
      return {};
  }
}

function renderValidationRules() {
  const container = document.getElementById("validationRules");

  const rulesHtml = validationRules
    .map(
      (rule) => `
        <div class="validation-rule">
          <div class="rule-header">
            <h3>${rule.name}</h3>
            <div>
              <button onclick="editValidationRule('${rule.id}')" style="background: none; border: none; color: #64748b; cursor: pointer; margin-right: 0.5rem;">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteValidationRule('${rule.id}')" style="background: none; border: none; color: #64748b; cursor: pointer;">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p style="color: #64748b; font-size: 0.875rem;">${rule.type} validation</p>
          <div style="margin-top: 0.5rem;">
            <span style="background: #ecfdf5; color: #059669; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
              ${rule.successMessage}
            </span>
            <span style="background: #fef2f2; color: #dc2626; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; margin-left: 0.5rem;">
              ${rule.failureMessage}
            </span>
          </div>
        </div>
      `
    )
    .join("");

  container.innerHTML =
    rulesHtml +
    `
        <button class="add-rule-btn" onclick="addValidationRule()">
          <i class="fas fa-plus"></i>
          Add Validation Rule
        </button>
      `;
}

function deleteValidationRule(ruleId) {
  if (confirm("Are you sure you want to delete this validation rule?")) {
    validationRules = validationRules.filter((r) => r.id !== ruleId);
    renderValidationRules();
  }
}

function openPreview() {
  const assignmentName =
    document.getElementById("assignmentName").value || "Untitled Assignment";
  const assignmentDescription =
    document.getElementById("assignmentDescription").value ||
    "No description provided.";

  const previewContent = `
        <div class="preview-container">
          <div class="preview-header">
            <h3>Student View Preview</h3>
            <p>This is how students will see your assignment validator</p>
          </div>
          <div style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.5rem; background: white;">
            <h2 style="margin-bottom: 1rem; color: #1e293b;">${assignmentName}</h2>
            <p style="margin-bottom: 2rem; color: #64748b;">${assignmentDescription}</p>
            
            ${formComponents
              .map(
                (component) => `
              <div style="margin-bottom: 1.5rem;">
                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem; color: #374151;">
                  ${component.label} ${
                  component.required
                    ? '<span style="color: #dc2626;">*</span>'
                    : ""
                }
                </label>
                ${renderComponentContent(component).replace("disabled", "")}
              </div>
            `
              )
              .join("")}
            
            ${
              validationRules.length > 0
                ? `
              <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                <h3 style="margin-bottom: 1rem; color: #1e293b;">Validation Rules</h3>
                ${validationRules
                  .map(
                    (rule) => `
                  <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: white; border-radius: 0.25rem; border-left: 3px solid #667eea;">
                    <strong>${rule.name}</strong> - ${rule.type}
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            
            <button style="background: #667eea; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; margin-top: 1rem;">
              Submit Assignment
            </button>
          </div>
        </div>
      `;

  openModal("Assignment Preview", previewContent);
}

/**
 * Safely encode a string to Base64, handling Unicode characters
 * @param {string} str - The string to encode
 * @returns {string} - Base64 encoded string
 */
function safeBase64Encode(str) {
  try {
    // First, encode the string as UTF-8, then to Base64
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
  } catch (error) {
    console.warn('Failed to encode string to Base64:', error);
    // Fallback: create a simple hash-like identifier
    return str.split('').reduce((hash, char) => {
      const charCode = char.charCodeAt(0);
      return ((hash << 5) - hash + charCode) & 0xffffffff;
    }, 0).toString(36);
  }
}

function exportConfiguration() {
  const config = {
    assignment: {
      name:
        document.getElementById("assignmentName").value ||
        "Untitled Assignment",
      description: document.getElementById("assignmentDescription").value || "",
    },
    components: formComponents,
    validationRules: validationRules,
    createdAt: new Date().toISOString(),
  };

  // Generate the shareable URL identifier safely
  const configHash = safeBase64Encode(JSON.stringify(config)).slice(0, 10);

  const exportContent = `
        <div>
          <p style="margin-bottom: 1rem;">Your assignment validator configuration:</p>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Export Format</label>
            <select id="exportFormat" class="form-input" onchange="toggleExportFormat()">
              <option value="json">JSON File</option>
              <option value="url">Shareable URL</option>
            </select>
          </div>
          
          <div id="jsonExport">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Configuration Preview</label>
            <pre style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-size: 0.75rem; max-height: 300px;">${JSON.stringify(
              config,
              null,
              2
            )}</pre>
            <button onclick="downloadConfig()" class="btn btn-primary" style="margin-top: 1rem; background: #667eea; color: white;">
              <i class="fas fa-download"></i>
              Download Configuration
            </button>
          </div>
          
          <div id="urlExport" style="display: none;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Shareable URL</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" class="form-input" id="shareableUrl" readonly value="https://validator.example.com/assignment/${configHash}">
              <button onclick="copyUrl()" class="btn btn-primary" style="background: #667eea; color: white;">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">Share this URL with students to access your validator</p>
          </div>
        </div>
      `;

  openModal("Export Configuration", exportContent);
}

function toggleExportFormat() {
  const format = document.getElementById("exportFormat").value;
  const jsonExport = document.getElementById("jsonExport");
  const urlExport = document.getElementById("urlExport");

  if (format === "json") {
    jsonExport.style.display = "block";
    urlExport.style.display = "none";
  } else {
    jsonExport.style.display = "none";
    urlExport.style.display = "block";
  }
}

function downloadConfig() {
  const config = {
    assignment: {
      name:
        document.getElementById("assignmentName").value ||
        "Untitled Assignment",
      description: document.getElementById("assignmentDescription").value || "",
    },
    components: formComponents,
    validationRules: validationRules,
    createdAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.assignment.name
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}_validator_config.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyUrl() {
  const urlInput = document.getElementById("shareableUrl");
  urlInput.select();
  document.execCommand("copy");

  // Show feedback
  const button = event.target.closest("button");
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i>';
  setTimeout(() => {
    button.innerHTML = originalText;
  }, 1000);
}

function importConfiguration() {
  const importContent = `
    <div>
      <p style="margin-bottom: 1rem;">Import a previously exported configuration:</p>
      
      <div class="form-group">
        <label class="form-label">Select Configuration File</label>
        <input type="file" id="configFile" class="form-input" accept=".json" onchange="handleFileSelect()">
        <small style="color: #64748b; margin-top: 0.5rem; display: block;">
          Select a JSON configuration file exported from the Homework Validator
        </small>
      </div>
      
      <div id="importPreview" style="display: none; margin-top: 1rem;">
        <label class="form-label">Configuration Preview</label>
        <div id="configPreviewContent" style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; max-height: 200px; overflow-y: auto;">
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button onclick="closeModal()" class="btn" style="background: #e2e8f0; color: #475569;">
            Cancel
          </button>
          <button onclick="confirmImport()" class="btn btn-primary">
            <i class="fas fa-upload"></i>
            Import Configuration
          </button>
        </div>
      </div>
    </div>
  `;

  openModal("Import Configuration", importContent);
}

function handleFileSelect() {
  const fileInput = document.getElementById('configFile');
  const file = fileInput.files[0];
  const previewDiv = document.getElementById('importPreview');
  const previewContent = document.getElementById('configPreviewContent');

  if (!file) {
    previewDiv.style.display = 'none';
    return;
  }

  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    alert('Please select a valid JSON file.');
    fileInput.value = '';
    previewDiv.style.display = 'none';
    return;
  }

  // Check file size (optional - prevent extremely large files)
  if (file.size > 1024 * 1024) { // 1MB limit
    alert('File is too large. Please select a file smaller than 1MB.');
    fileInput.value = '';
    previewDiv.style.display = 'none';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const jsonText = e.target.result;
      
      // Remove any BOM or comments that might be in the JSON file
      const cleanJson = jsonText.replace(/^\uFEFF/, '').replace(/\/\/.*$/gm, '');
      console.log('Parsed configuration:', cleanJson);
      
      const config = JSON.parse(cleanJson);
      // Validate the configuration structure
      if (!validateConfigStructure(config)) {
        alert('Invalid configuration file structure. Please ensure you are importing a valid Homework Validator configuration.\n\nThe file must contain:\n- assignment object with name\n- components array\n- validationRules array');
        fileInput.value = '';
        previewDiv.style.display = 'none';
        return;
      }

      // Store the parsed config for import
      window.pendingImportConfig = config;
      
      // Show preview
      previewContent.innerHTML = `
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: #1e293b;">Assignment: ${config.assignment.name}</h4>
          <p style="margin: 0 0 1rem 0; color: #64748b; font-size: 0.875rem;">${config.assignment.description || 'No description'}</p>
          <p style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.875rem;">
            <strong>Components:</strong> ${config.components.length}
          </p>
          <p style="margin: 0; color: #64748b; font-size: 0.875rem;">
            <strong>Validation Rules:</strong> ${config.validationRules.length}
          </p>
          ${config.components.length > 0 ? `
            <div style="margin-top: 1rem;">
              <strong style="color: #374151; font-size: 0.875rem;">Components:</strong>
              <ul style="margin: 0.5rem 0 0 1rem; color: #64748b; font-size: 0.875rem;">
                ${config.components.map(comp => `<li>${comp.label} (${comp.type})</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${config.validationRules.length > 0 ? `
            <div style="margin-top: 1rem;">
              <strong style="color: #374151; font-size: 0.875rem;">Validation Rules:</strong>
              <ul style="margin: 0.5rem 0 0 1rem; color: #64748b; font-size: 0.875rem;">
                ${config.validationRules.map(rule => `<li>${rule.name} (${rule.type})</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
      
      previewDiv.style.display = 'block';
      
    } catch (error) {
      console.error('JSON parsing error:', error);
      let errorMessage = 'Error parsing JSON file. Please ensure the file is valid JSON.';
      
      if (error.message.includes('Unexpected token')) {
        errorMessage += '\n\nTip: Check for missing commas, brackets, or quotes in the JSON file.';
      }
      
      alert(errorMessage);
      fileInput.value = '';
      previewDiv.style.display = 'none';
    }
  };
  
  reader.onerror = function() {
    alert('Error reading file. Please try again.');
    fileInput.value = '';
    previewDiv.style.display = 'none';
  };
  
  reader.readAsText(file);
}

function validateConfigStructure(config) {
  // Check if config has required top-level properties
  if (!config || typeof config !== 'object') return false;
  if (!config.assignment || typeof config.assignment !== 'object') return false;
  if (!config.components || !Array.isArray(config.components)) return false;
  if (!config.validationRules || !Array.isArray(config.validationRules)) return false;

  // Check assignment structure
  if (typeof config.assignment.name !== 'string') return false;

  // Check components structure - allow for various component types
  for (const component of config.components) {
    if (!component.id || !component.type || !component.label) return false;
    if (typeof component.required !== 'boolean') {
      // Set default if missing
      component.required = false;
    }
  }

  // Validate component types against known types
  const validComponentTypes = ['fileUpload', 'textInput', 'collaborators', 'checkbox', 'dropdown', 'datePicker'];
  for (const component of config.components) {
    if (!validComponentTypes.includes(component.type)) {
      console.warn(`Unknown component type: ${component.type}. Import will continue but component may not render correctly.`);
    }
  }

  return true;
}

function confirmImport() {
  const config = window.pendingImportConfig;
  
  if (!config) {
    alert('No configuration to import.');
    return;
  }

  // Check if there's existing data
  const hasExistingData = formComponents.length > 0 || 
                         validationRules.length > 0 || 
                         document.getElementById('assignmentName').value.trim() !== '' ||
                         document.getElementById('assignmentDescription').value.trim() !== '';

  if (hasExistingData) {
    const confirmReplace = confirm(
      'This will replace your current configuration. All existing components, validation rules, and assignment details will be lost. Are you sure you want to continue?'
    );
    
    if (!confirmReplace) {
      return;
    }
  }

  try {
    // Clear existing data
    formComponents.length = 0;
    validationRules.length = 0;

    // Import assignment info
    document.getElementById('assignmentName').value = config.assignment.name;
    document.getElementById('assignmentDescription').value = config.assignment.description || '';

    // Import components with deep copy to avoid reference issues
    config.components.forEach(component => {
      formComponents.push({ ...component });
    });

    // Import validation rules with deep copy
    config.validationRules.forEach(rule => {
      validationRules.push({ ...rule });
    });

    // Update component counter to avoid ID conflicts
    const maxComponentId = Math.max(
      0,
      ...formComponents.map(comp => {
        const match = comp.id.match(/component_(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
    );
    
    // Update the component counter to avoid conflicts with new components
    setComponentCounter(maxComponentId);

    // Re-render everything
    renderFormBuilder(formComponents);
    renderPropertiesPanel(formComponents);
    renderValidationRules();

    // Close modal and show success message
    closeModal();
    
    // Show success feedback
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      z-index: 10000;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      font-weight: 500;
    `;
    notification.innerHTML = `
      <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
      Configuration imported successfully!
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);

    // Clean up
    delete window.pendingImportConfig;
    
  } catch (error) {
    console.error('Import error:', error);
    alert('An error occurred while importing the configuration. Please try again.');
  }
}

function createValidationRule(type) {
  const parameters = getDefaultRuleParameters(type);
  const ruleId = `rule_${Date.now()}`;
  
  const rule = {
    id: ruleId,
    type: type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Rule`,
    successMessage: `✅ ${type} validation passed`,
    failureMessage: `❌ ${type} validation failed`,
    parameters: parameters
  };
  
  validationRules.push(rule);
  renderValidationRules();
  closeModal();
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Make functions globally available for inline onclick handlers
window.openPreview = openPreview;
window.exportConfiguration = exportConfiguration;
window.importConfiguration = importConfiguration;
window.handleFileSelect = handleFileSelect;
window.confirmImport = confirmImport;
window.closeModal = closeModal;
window.toggleExportFormat = toggleExportFormat;
window.downloadConfig = downloadConfig;
window.copyUrl = copyUrl;
window.addValidationRule = addValidationRule;
window.createValidationRule = createValidationRule;

// Close modal when clicking outside
document.getElementById("modal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal();
  }
});

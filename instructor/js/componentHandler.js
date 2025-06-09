
let selectedComponent = null;
let componentCounter = 0;

export function setComponentCounter(value) {
  componentCounter = value;
}


function handleComponentDragStart(e, setDraggedComponent, setDraggedFromPalette) {
  const draggedElement = e.target.closest(".form-component");
  setDraggedComponent(draggedElement);
  setDraggedFromPalette(false);
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", draggedElement.outerHTML);
  draggedElement.classList.add("dragging");
}

export function addComponent(type, formComponents, renderCallback) {
  const component = createComponent(type);
  formComponents.push(component);
  renderCallback();
}

function createComponent(type) {
  componentCounter++;
  const baseComponent = {
    id: `component_${componentCounter}`,
    type: type,
    label: getDefaultLabel(type),
    required: false,
  };

  switch (type) {
    case "fileUpload":
      return {
        ...baseComponent,
        acceptedTypes: ".zip,.unitypackage",
        maxSize: 100,
        allowMultiple: false,
      };
    case "textInput":
      return {
        ...baseComponent,
        placeholder: "Enter text...",
        maxLength: 500,
      };
    case "collaborators":
      return {
        ...baseComponent,
        maxCollaborators: 5,
      };
    case "checkbox":
      return {
        ...baseComponent,
        text: "I confirm this is my original work",
      };
    case "dropdown":
      return {
        ...baseComponent,
        options: ["Option 1", "Option 2", "Option 3"],
      };
    case "datePicker":
      return {
        ...baseComponent,
        minDate: "",
        maxDate: "",
      };
    default:
      return baseComponent;
  }
}

function getDefaultLabel(type) {
  const labels = {
    fileUpload: "Upload Files",
    textInput: "Text Input",
    collaborators: "Collaborators",
    checkbox: "Confirmation",
    dropdown: "Select Option",
    datePicker: "Select Date",
  };
  return labels[type] || "Component";
}

export function renderFormBuilder(formComponents) {
  const formBuilder = document.getElementById("formBuilder");

  if (formComponents.length === 0) {
    formBuilder.innerHTML = `
          <div class="form-builder-empty">
            <i class="fas fa-arrow-left"></i>
            <p>Drag components from the palette to build your form</p>
            <small style="margin-top: 0.5rem; color: #94a3b8;">You can also drag to reorder existing components</small>
          </div>
        `;
    return;
  }

  formBuilder.innerHTML = formComponents
    .map((component) => renderComponent(component))
    .join("");

  // Add event listeners for component interaction
  formBuilder.querySelectorAll(".form-component").forEach((el) => {
    // Click to select
    el.addEventListener("click", (e) => {
      if (!e.target.closest(".component-actions")) {
        selectComponent(el.dataset.componentId, () => renderFormBuilder(formComponents), () => renderPropertiesPanel(formComponents));
      }
    });

    // Drag handle for reordering
    const dragHandle = el.querySelector(".drag-handle");
    if (dragHandle) {
      dragHandle.addEventListener("mousedown", () => {
        el.draggable = true;
      });

      el.addEventListener("dragstart", (e) => handleComponentDragStart(e, 
        (component) => { window.draggedComponent = component; },
        (value) => { window.draggedFromPalette = value; }
      ));
      el.addEventListener("dragend", () => {
        el.draggable = false;
        el.classList.remove("dragging");
      });
    }
  });

  // Add event listeners for delete buttons
  formBuilder.querySelectorAll(".delete-component").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const componentId = button.getAttribute("data-component-id");
      deleteComponent(componentId, formComponents, () => renderFormBuilder(formComponents), () => renderPropertiesPanel(formComponents));
    });
  });
}

function renderComponent(component) {
  const componentContent = renderComponentContent(component);

  return `
        <div class="form-component ${
          selectedComponent === component.id ? "selected" : ""
        }" 
             data-component-id="${component.id}">
          <div class="component-header">
            <div class="component-label">
              <i class="fas fa-grip-vertical drag-handle"></i>
              <span>${component.label}</span>
            </div>
            <div class="component-actions">
              <button class="delete-component delete-btn" data-component-id="${
                component.id
              }" title="Delete component">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          ${componentContent}
        </div>
      `;
}

export function renderComponentContent(component) {
  switch (component.type) {
    case "fileUpload":
      return `
            <div class="file-upload-area">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Drop files here or click to browse</p>
              <small>Accepted: ${component.acceptedTypes} (Max: ${component.maxSize}MB)</small>
            </div>
          `;
    case "textInput":
      return `
            <input type="text" class="form-input" placeholder="${component.placeholder}" disabled>
          `;
    case "collaborators":
      return `
            <div>
              <input type="text" class="form-input" placeholder="Add collaborator email..." disabled>
              <small>Maximum ${component.maxCollaborators} collaborators</small>
            </div>
          `;
    case "checkbox":
      return `
            <label style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="checkbox" disabled>
              <span>${component.text}</span>
            </label>
          `;
    case "dropdown":
      return `
            <select class="form-input" disabled>
              <option>Select an option...</option>
              ${component.options
                .map((opt) => `<option>${opt}</option>`)
                .join("")}
            </select>
          `;
    case "datePicker":
      return `
            <input type="date" class="form-input" disabled>
          `;
    default:
      return "<p>Unknown component type</p>";
  }
}

function selectComponent(componentId, renderFormCallback, renderPropertiesCallback) {
  selectedComponent = componentId;
  renderFormCallback();
  renderPropertiesCallback();
}

function deleteComponent(componentId, formComponents, renderFormCallback, renderPropertiesCallback) {
  if (confirm("Are you sure you want to delete this component?")) {
    const index = formComponents.findIndex(c => c.id === componentId);
    if (index !== -1) {
      formComponents.splice(index, 1);
    }
    if (selectedComponent === componentId) {
      selectedComponent = null;
    }
    renderFormCallback();
    renderPropertiesCallback();
  }
}

export function renderPropertiesPanel(formComponents) {
  const panel = document.getElementById("propertiesPanel");

  if (!selectedComponent) {
    panel.innerHTML = `
          <div class="properties-empty">
            <i class="fas fa-info-circle"></i>
            <p>Select a component to edit its properties</p>
          </div>
        `;
    return;
  }

  const component = formComponents.find((c) => c.id === selectedComponent);
  if (!component) return;

  panel.innerHTML = renderPropertiesForm(component);

  // Add event listeners for property updates
  panel.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("change", () =>
      updateComponentProperty(component.id, input.name, input.value, input.type, formComponents, () => renderFormBuilder(formComponents))
    );
    input.addEventListener("input", () =>
      updateComponentProperty(component.id, input.name, input.value, input.type, formComponents, () => renderFormBuilder(formComponents))
    );
  });
}

function renderPropertiesForm(component) {
  let specificProperties = "";

  switch (component.type) {
    case "fileUpload":
      specificProperties = `
            <div class="form-group">
              <label class="form-label">Accepted File Types</label>
              <input type="text" class="form-input" name="acceptedTypes" value="${
                component.acceptedTypes
              }">
            </div>
            <div class="form-group">
              <label class="form-label">Max File Size (MB)</label>
              <input type="number" class="form-input" name="maxSize" value="${
                component.maxSize
              }">
            </div>
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" name="allowMultiple" ${
                  component.allowMultiple ? "checked" : ""
                }>
                <span>Allow Multiple Files</span>
              </label>
            </div>
          `;
      break;
    case "textInput":
      specificProperties = `
            <div class="form-group">
              <label class="form-label">Placeholder</label>
              <input type="text" class="form-input" name="placeholder" value="${component.placeholder}">
            </div>
            <div class="form-group">
              <label class="form-label">Max Length</label>
              <input type="number" class="form-input" name="maxLength" value="${component.maxLength}">
            </div>
          `;
      break;
    case "collaborators":
      specificProperties = `
            <div class="form-group">
              <label class="form-label">Max Collaborators</label>
              <input type="number" class="form-input" name="maxCollaborators" value="${component.maxCollaborators}">
            </div>
          `;
      break;
    case "checkbox":
      specificProperties = `
            <div class="form-group">
              <label class="form-label">Checkbox Text</label>
              <input type="text" class="form-input" name="text" value="${component.text}">
            </div>
          `;
      break;
    case "dropdown":
      specificProperties = `
            <div class="form-group">
              <label class="form-label">Options (one per line)</label>
              <textarea class="form-input" name="options" rows="4">${component.options.join(
                "\n"
              )}</textarea>
            </div>
          `;
      break;
  }

  return `
        <div class="form-group">
          <label class="form-label">Component Label</label>
          <input type="text" class="form-input" name="label" value="${
            component.label
          }">
        </div>
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" name="required" ${
              component.required ? "checked" : ""
            }>
            <span>Required Field</span>
          </label>
        </div>
        ${specificProperties}
      `;
}

function updateComponentProperty(componentId, property, value, inputType, formComponents, renderFormCallback) {
  const component = formComponents.find((c) => c.id === componentId);
  if (!component) return;

  if (inputType === "checkbox") {
    component[property] = event.target.checked;
  } else if (property === "options") {
    component[property] = value.split("\n").filter((opt) => opt.trim());
  } else {
    component[property] = value;
  }

  renderFormCallback();
}

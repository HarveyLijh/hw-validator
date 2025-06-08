# Homework Validator - Instructor Interface Development Plan

## Artifact Format Decision

After evaluating the options, I recommend using **JSON** as the artifact format for instructor-created assignment validators for the following reasons:

1. **No-code friendly**: JSON is structured but doesn't require coding knowledge
2. **Universal compatibility**: Can be easily stored, retrieved, and passed between systems
3. **Simple integration**: Can be converted to assignment implementations programmatically
4. **Shareable**: Can be distributed via URL parameters or downloadable files
5. **Versioning**: Easy to version and track changes

## Development Plan

### 1. System Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  Instructor UI      │     │  Student UI         │
│  (Builder Interface)│     │  (Existing System)  │
└─────────────┬───────┘     └─────────┬───────────┘
              │                       │
              ▼                       ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Assignment JSON    │────▶│  Assignment         │
│  Configuration      │     │  Implementation     │
└─────────────────────┘     └─────────────────────┘
```

### 2. Directory Structure Additions

```
js/
  instructor/
    main.js                 # Entry point for instructor interface
    assignmentBuilder.js    # Core builder functionality
    components/
      validationRuleBuilder.js  # UI for creating validation rules
      componentPalette.js       # Available input components  
      artifactPreview.js        # Live preview of student view
    models/
      assignmentConfig.js   # JSON schema and manipulation 
    utils/
      exportUtils.js        # JSON export/import utilities
  core/
    assignmentFactory.js    # New: converts JSON to assignments
```

### 3. JSON Schema Design

```json
{
  "id": "uuid-v4-string",
  "version": "1.0",
  "name": "Unity Project Submission",
  "description": "Submit your Unity project for validation",
  "components": [
    {
      "type": "fileUploader",
      "id": "unity-project",
      "label": "Unity Project Files",
      "required": true,
      "accept": ".unitypackage,.zip",
      "config": {
        "maxSize": 100000000,
        "multiple": false
      }
    }
  ],
  "validationRules": [
    {
      "name": "Check Project Structure",
      "description": "Verifies the project contains required files",
      "test": {
        "type": "fileStructure",
        "params": {
          "requiredFiles": ["Assets/Scripts/Player.cs", "Assets/Scenes/Main.unity"]
        }
      },
      "successMessage": "✅ Project structure verified",
      "failureMessage": "❌ Missing required project files",
      "stopOnFail": true
    }
  ]
}
```

### 4. Implementation Strategy

#### Phase 1: Core Infrastructure

1. **Assignment Configuration Model**
   - Define JSON schema 
   - Create validation helpers
   - Build import/export utilities

2. **Assignment Factory**
   - Create factory that converts JSON to dynamic assignments
   - Implement adapter between JSON schema and existing system

3. **Integration Points**
   - Modify main.js to accept JSON configuration via URL parameter
   - Add routes for UUID-based assignment loading

#### Phase 2: Instructor UI

1. **Builder Interface**
   - Drag-and-drop interface for components
   - Configuration panels for each component
   - Validation rule creator with dropdown and multi-select options

2. **Preview functionality**
   - Live preview of student-facing interface
   - Test mode for validation rules

3. **Export/Share Tools**
   - Generate shareable URLs with embedded JSON or UUID references
   - Download JSON configuration
   - Save to server with UUID (if server storage implemented)

### 5. Integration with Existing System

```javascript
// Example integration in main.js
document.addEventListener('DOMContentLoaded', () => {
  // Check if we have a configuration parameter
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignment');
  const configJson = urlParams.get('config');
  
  let assignment;
  
  if (configJson) {
    // Direct configuration via URL parameter
    const config = JSON.parse(atob(configJson));
    assignment = AssignmentFactory.createFromJson(config);
  } else if (assignmentId) {
    // Load configuration by ID from server
    fetchAssignmentConfig(assignmentId)
      .then(config => {
        assignment = AssignmentFactory.createFromJson(config);
        initializeUI(assignment);
      });
    return; // Async operation, return early
  } else {
    // Fall back to default assignments
    assignment = new UnityAssignment();
  }
  
  initializeUI(assignment);
});

function initializeUI(assignment) {
  const ui = new UIManager(assignment);
  ui.initialize();
}
```

### 6. User Flow

1. **Instructor creates assignment**:
   - Opens instructor interface
   - Drags components from palette 
   - Configures validation rules with dropdowns
   - Tests the validation flow
   - Generates shareable link or downloads JSON

2. **Student submits assignment**:
   - Accesses validator via instructor-provided link
   - System loads JSON configuration
   - Converts to dynamic assignment implementation
   - Student interacts with form and gets validation results

### 7. Technical Challenges and Solutions

1. **Dynamic validation without code**
   - Solution: Pre-built validation rule types with configurable parameters
   - Example: File structure checks, keyword searches, image dimension validations

2. **Integration with existing system**
   - Solution: Assignment factory that implements the AssignmentBase interface

3. **Security considerations**
   - Solution: Server-side validation of JSON configurations
   - UUID-based retrieval rather than embedded JSON for production
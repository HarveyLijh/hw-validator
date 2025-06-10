# 🧑‍🏫 Homework Validator - Instructor Interface

The Instructor Interface is a visual, no-code tool that enables instructors to create, customize, and manage homework validation workflows without writing any code. The interface includes an AI Assistant powered by Chrome's built-in AI to automatically generate validator configurations from natural language descriptions.

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome recommended for AI features)
- Python 3.x installed on your system
- ngrok account and CLI tool (for sharing assignments)

### Running Locally

1. **Start a local web server:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Access the instructor interface:**
   Open your browser and navigate to:
   ```
   http://localhost:8000/instructor/
   ```

3. **Make it accessible to students (optional):**
   ```bash
   # In a new terminal
   ngrok http 8000
   ```
   This will provide a public URL that you can share with students for assignment submissions.

### Alternative Setup

For better performance and development features, you can also run with other local servers:

```bash
# Using Node.js (if you have it installed)
npx serve . -p 8000

# Using PHP (if available)
php -S localhost:8000

# Using Ruby (if available)
ruby -run -e httpd . -p 8000
```

## 🎯 Features Overview

### Visual Assignment Designer

The instructor interface provides a drag-and-drop visual editor for creating assignment validators:

- **Component Palette**: Pre-built input components (file upload, text input, collaborators, etc.)
- **Form Builder**: Drag components to create your assignment submission form
- **Properties Panel**: Configure component settings without coding
- **Validation Rules**: Add custom validation logic through a visual interface

### AI Assistant (Chrome AI Integration)

The AI Assistant leverages Chrome's built-in AI to automatically generate validator configurations:

- **Natural Language Input**: Describe your assignment in plain English
- **Automatic Configuration**: AI generates appropriate components and validation rules
- **Smart Suggestions**: AI recommends best practices based on assignment type
- **Instant Preview**: See generated configuration before importing

### Export & Sharing

- **JSON Export**: Download configuration files for backup or sharing
- **URL Sharing**: Generate shareable links for immediate student access
- **Import/Export**: Transfer configurations between instances

## 🤖 Chrome AI Assistant

### What is Chrome AI?

Chrome's built-in AI (Prompt API) provides on-device language model capabilities that run locally in your browser. This offers several advantages:

- **Privacy**: All processing happens locally - no data sent to external servers
- **Speed**: No network latency for AI responses
- **Offline Capability**: Works without internet connection (once model is downloaded)
- **Cost**: No API fees or usage limits

### Browser Compatibility

The AI Assistant requires Google Chrome with specific flags enabled:

#### Chrome Canary/Dev Channel Setup

1. **Download Chrome Canary** (recommended for latest AI features):
   - Visit [Chrome Canary download page](https://www.google.com/chrome/canary/)

2. **Enable AI flags** in Chrome:
   ```
   chrome://flags/#prompt-api-for-gemini-nano
   chrome://flags/#optimization-guide-on-device-model
   ```
   Set both flags to "Enabled"

3. **Restart Chrome** completely

4. **Verify AI availability**:
   - Open Developer Console (F12)
   - Type: `await LanguageModel.availability()`
   - Should return "available", "downloadable", or "downloading"

#### Alternative Browsers

Currently, Chrome AI is only available in Chrome/Chromium browsers. For other browsers:
- The instructor interface will work normally
- AI Assistant features will be disabled
- Manual configuration creation is still fully supported

### Using the AI Assistant

#### 1. Access the AI Assistant

From the main instructor interface:
- Click the **"AI Assistant"** button in the header
- You'll be taken to the AI-powered assignment generator

#### 2. Check AI Status

The status panel shows:
- ✅ **Available**: AI is ready to use
- 📥 **Downloadable**: Model needs to be downloaded (automatic)
- 🔄 **Downloading**: Model is being downloaded
- ❌ **Unavailable**: Browser doesn't support Chrome AI

#### 3. Generate Assignment Configuration

1. **Describe your assignment** in the chat interface:
   ```
   Create a Python programming assignment where students upload 
   a .py file and a requirements.txt file. The validator should 
   check for proper syntax and ensure the main function exists.
   ```

2. **AI generates configuration** including:
   - Appropriate input components (file uploaders, text fields)
   - Validation rules (file type, content checks)
   - Success/failure messages
   - Assignment metadata

3. **Review and customize** the generated configuration

4. **Import to designer** with one click

#### 4. Supported Assignment Types

The AI Assistant can help create validators for:

- **Programming Assignments**: Python, JavaScript, Java, C++, etc.
- **Document Submissions**: Essays, reports, research papers
- **Media Projects**: Images, videos, audio files
- **Group Projects**: Collaborative assignments with multiple contributors
- **Data Analysis**: CSV files, Jupyter notebooks, datasets
- **Design Projects**: Adobe files, Figma links, mockups

### Example AI Conversations

#### Programming Assignment
```
User: I need a validator for a Python web scraping assignment

AI: I'll create a Python web scraping assignment validator for you:

Components:
- Python file upload (.py files)
- Requirements.txt upload
- README file upload
- URL input for target website
- Collaborator input (if group work)

Validation Rules:
- Check for required imports (requests, beautifulsoup4)
- Verify main() function exists
- Validate URL format
- Check file sizes

Would you like me to add any specific validation rules?
```

#### Design Assignment
```
User: Create a validator for UI/UX design submissions with Figma prototypes

AI: I'll set up a UI/UX design assignment validator:

Components:
- Figma URL input with validation
- Image uploads for mockups/wireframes
- PDF upload for design documentation
- Text area for design rationale

Validation Rules:
- Verify Figma URL accessibility
- Check image formats (PNG, JPG, SVG)
- Validate PDF readability
- Minimum word count for rationale

This will ensure students submit complete design packages.
```

## 🎨 Creating Assignments Without AI

### Manual Assignment Creation

1. **Set Assignment Details**:
   - Assignment name and description
   - Due date and submission requirements

2. **Add Components**:
   - Drag components from the palette to the form builder
   - Configure each component's properties
   - Set required/optional status

3. **Define Validation Rules**:
   - Add validation rules from the validation panel
   - Configure success/failure messages
   - Set rule dependencies

4. **Preview & Test**:
   - Use the preview feature to test student experience
   - Verify all validations work correctly

### Available Components

#### File Upload Component
```javascript
{
  type: "fileUpload",
  label: "Project Files",
  accept: ".zip,.tar.gz", // Accepted file types
  maxSize: 50, // Maximum size in MB
  allowMultiple: true, // Allow multiple files
  required: true
}
```

#### Text Input Component
```javascript
{
  type: "textInput", 
  label: "Project Description",
  placeholder: "Describe your project...",
  maxLength: 1000, // Character limit
  required: true
}
```

#### Collaborator Input Component
```javascript
{
  type: "collaborators",
  label: "Team Members",
  maxCollaborators: 4, // Maximum team size
  required: false
}
```

#### Checkbox Component
```javascript
{
  type: "checkbox",
  label: "Academic Integrity",
  text: "I certify this is my original work",
  required: true
}
```

### Validation Rules

#### File Extension Validation
```javascript
{
  type: "fileExtension",
  name: "Check File Type",
  allowedExtensions: [".py", ".js", ".html"],
  successMessage: "✅ File type is valid",
  failureMessage: "❌ Only Python, JavaScript, and HTML files allowed"
}
```

#### File Content Validation
```javascript
{
  type: "fileContent",
  name: "Check Required Functions", 
  searchPattern: "def main\\(", // Regex pattern
  successMessage: "✅ main() function found",
  failureMessage: "❌ main() function is required"
}
```

#### Custom Validation
```javascript
{
  type: "custom",
  name: "Custom Logic Check",
  validationFunction: "customValidationFunction", // Function name
  parameters: { /* custom parameters */ },
  successMessage: "✅ Custom validation passed",
  failureMessage: "❌ Custom validation failed"
}
```

## 📱 Interface Components

### Main Designer Interface

The main interface consists of several panels:

1. **Header Bar**:
   - AI Assistant button
   - Import/Export controls
   - Preview button

2. **Component Palette** (Left):
   - Available input components
   - Drag-and-drop functionality

3. **Form Builder** (Center):
   - Visual representation of assignment form
   - Drop zones for components
   - Component reordering

4. **Properties Panel** (Right):
   - Component configuration
   - Validation rule management
   - Assignment metadata

### AI Assistant Interface

1. **Status Panel**:
   - AI availability indicator
   - Model download progress
   - Troubleshooting tips

2. **Chat Interface**:
   - Natural language input
   - AI response with generated configuration
   - Conversation history

3. **Configuration Preview**:
   - Generated components list
   - Validation rules summary
   - Import/modify options

## 🔧 Advanced Configuration

### Custom Component Development

To create custom components, extend the BaseComponent class:

```javascript
import { BaseComponent } from './componentBase.js';

export class CustomComponent extends BaseComponent {
  constructor(config) {
    super({
      ...config,
      componentType: 'custom'
    });
  }

  generateHTML() {
    return `<div class="custom-component">...</div>`;
  }

  getSummary(element) {
    return `<div>Custom summary</div>`;
  }

  validate(element) {
    // Custom validation logic
    return { isValid: true, message: 'Valid' };
  }
}
```

### Custom Validation Rules

Add custom validation by creating new rule types:

```javascript
const customRule = {
  type: "custom",
  name: "Complex Validation",
  validator: async (formElement, rule) => {
    // Custom validation logic
    const isValid = await performCustomCheck(formElement);
    return {
      passed: isValid,
      message: isValid ? rule.successMessage : rule.failureMessage
    };
  }
};
```
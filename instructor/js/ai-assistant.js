/**
 * AI Assistant for Homework Validator
 * Leverages Chrome's built-in LLM (Prompt API) to generate homework validator configurations
 */

class AIAssistant {
  constructor() {
    this.session = null;
    this.isAvailable = false;
    this.generatedConfig = null;
    this.chatHistory = [];

    this.init();
  }

  async init() {
    await this.checkAIAvailability();
    this.bindEvents();
  }

  /**
   * Check if Chrome's AI API is available and create a session
   */
  async checkAIAvailability() {
    const AIAvailability = await LanguageModel.availability();
    try {
      if (AIAvailability === "downloadable") {
        this.showUnavailableStatus(
          "This browser supports Chrome AI, but the model is not downloaded yet."
        );
        try {
          this.session = await LanguageModel.create({
            initialPrompts: [
              {
                role: "system",
                content:
                  "You are an expert assistant that helps instructors create homework validator configurations. You understand assignment requirements and can generate valid JSON configurations for the Homework Validator system.",
              },
            ],
          });
          this.showAvailableStatus();
        } catch (error) {
          console.error("Session creation failed:", error);
          this.showUnavailableStatus("Session creation failed");
          return;
        }
      } else if (AIAvailability === "downloading") {
        this.showDownloadingStatus(
          "The AI model is currently downloading. Please wait and try again later."
        );
        return;
      } else if (AIAvailability === "available") {
        // Create the session
        this.session = await LanguageModel.create({
          initialPrompts: [
            {
              role: "system",
              content: `You are an expert assistant that helps instructors create homework validator configurations. 

Your role is to:
1. Understand natural language descriptions of homework assignments
2. Generate valid JSON configurations for the Homework Validator system
3. Include appropriate components (file upload, text input, collaborators, etc.)
4. Suggest relevant validation rules
5. Provide clear explanations of the generated configuration

The JSON format should follow this structure:
{
  "assignment": {
    "name": "Assignment Name",
    "description": "Assignment description"
  },
  "components": [
    {
      "id": "component_1",
      "type": "fileUpload|textInput|collaborators|checkbox|dropdown|datePicker",
      "label": "Component Label",
      "required": true|false,
      // type-specific properties
    }
  ],
  "validationRules": [
    {
      "id": "rule_timestamp",
      "type": "fileExtension|fileContent|imageSize|custom",
      "name": "Rule Name",
      "successMessage": "Success message",
      "failureMessage": "Failure message",
      "parameters": {
        // rule-specific parameters
      }
    }
  ],
  "createdAt": "ISO timestamp"
}

Available component types and their properties:
- fileUpload: acceptedTypes, maxSize (MB), allowMultiple
- textInput: placeholder, maxLength
- collaborators: maxCollaborators
- checkbox: text
- dropdown: options (array)
- datePicker: minDate, maxDate

Always respond with valid JSON that can be parsed and used directly. When creating assignments:

1. For programming assignments (Unity, Python, etc.): Include file uploads for code, collaborator inputs, and file extension validation
2. For web development: Separate uploads for HTML/CSS/JS, image size validation if needed
3. For data science: Include uploads for datasets, notebooks, validation for file formats
4. For reports/documents: PDF uploads, text inputs for descriptions, content validation
5. Always consider adding collaborator input and confirmation checkboxes

Generate unique IDs using timestamps and include appropriate success/failure messages.`,
            },
          ],
        });
        this.showAvailableStatus();
      } else {
        this.showUnavailableStatus(
          "The AI feature is not available in this browser. Please ensure you have the latest version of Chrome and have enabled the experimental AI features."
        );
        return;
      }

      this.isAvailable = true;
      this.enableChatInterface();
    } catch (error) {
      console.error("AI availability check failed:", error);
      this.showUnavailableStatus(error.message);
    }
  }

  /**
   * Show status when AI is available
   */
  showAvailableStatus() {
    const statusContainer = document.getElementById("aiStatus");
    statusContainer.innerHTML = `
      <div class="status-available">
        <i class="fas fa-check-circle"></i>
        <h3>Chrome AI Ready</h3>
        <p>Local language model is available and ready to help!</p>
      </div>
      <div class="status-details">
        <h4>Features Available:</h4>
        <p>✅ Natural language assignment generation<br>
        ✅ JSON configuration creation<br>
        ✅ Privacy-focused local processing</p>
      </div>
    `;
  }

  /**
   * Show status when AI is downloading
   */
  showDownloadingStatus() {
    const statusContainer = document.getElementById("aiStatus");
    statusContainer.innerHTML = `
      <div class="status-loading">
        <i class="fas fa-download"></i>
        <h3>Downloading Model</h3>
        <p>Chrome is downloading the AI model. This may take a few minutes...</p>
      </div>
      <div class="status-details">
        <h4>Please wait:</h4>
        <p>The language model is being downloaded and initialized. This only happens once.</p>
      </div>
    `;
  }

  /**
   * Show status when AI is unavailable
   */
  showUnavailableStatus(reason = "Unknown") {
    const statusContainer = document.getElementById("aiStatus");
    statusContainer.innerHTML = `
      <div class="status-unavailable">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Chrome AI Unavailable</h3>
        <p>The Chrome AI feature is not available.</p>
        <small>Reason: ${reason}</small>
      </div>
      <div class="status-details">
        <h4>To enable Chrome AI:</h4>
        <p>Make sure you have Chrome 127+ and have enabled the experimental AI features.</p>
        <button class="btn btn-primary" onclick="showSetupModal()" style="margin-top: 0.5rem;">
          <i class="fas fa-cog"></i>
          Setup Instructions
        </button>
      </div>
    `;
  }

  /**
   * Enable the chat interface
   */
  enableChatInterface() {
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const quickActionButtons = document.querySelectorAll(".quick-action-btn");

    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.placeholder = "Describe the assignment you want to create...";

    // Enable quick action buttons
    quickActionButtons.forEach((btn) => {
      btn.disabled = false;
    });
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");

    // Send message on button click
    sendButton.addEventListener("click", () => {
      this.sendMessage();
    });

    // Send message on Enter (Shift+Enter for new line)
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    userInput.addEventListener("input", () => {
      userInput.style.height = "auto";
      userInput.style.height = userInput.scrollHeight + "px";
    });
  }

  /**
   * Send a message to the AI
   */
  async sendMessage() {
    if (!this.isAvailable || !this.session) {
      this.showError(
        "AI is not available. Please check the setup instructions."
      );
      return;
    }

    const userInput = document.getElementById("userInput");
    const message = userInput.value.trim();

    if (!message) return;

    // Add user message to chat
    this.addChatMessage(message, "user");
    userInput.value = "";
    userInput.style.height = "auto";

    // Show thinking indicator
    const thinkingId = this.addThinkingMessage();

    try {
      // Prepare the prompt for generating assignment configuration
      const prompt = `Create a homework validator configuration for this assignment:

"${message}"

Based on the description, generate a complete JSON configuration that includes:

1. **Assignment Details**: Create an appropriate name and description
2. **Components**: Choose relevant input types:
   - File uploads with appropriate file types and size limits
   - Text inputs for descriptions or additional info
   - Collaborator inputs if group work is mentioned
   - Checkboxes for confirmations
   - Dropdowns for multiple choice options
   - Date pickers if deadlines are relevant

3. **Validation Rules**: Add rules that make sense:
   - File extension validation for uploaded files
   - Image size validation for graphics assignments
   - Custom validation for specific requirements

Generate unique component IDs using "component_" + numbers and rule IDs using "rule_" + timestamps.

Respond with ONLY the JSON configuration, no other text:`;

      // Get response from AI
      const response = await this.session.prompt(prompt);

      // Remove thinking indicator
      this.removeThinkingMessage(thinkingId);

      // Try to parse the response as JSON
      let parsedConfig = null;
      let cleanResponse = response.trim();

      // Remove any markdown code block formatting
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
      }

      try {
        parsedConfig = JSON.parse(cleanResponse);

        // Add timestamp if missing
        if (!parsedConfig.createdAt) {
          parsedConfig.createdAt = new Date().toISOString();
        }

        // Store the configuration
        this.generatedConfig = parsedConfig;

        // Show success message and display config
        this.addChatMessage(
          `Great! I've generated a configuration for your assignment. The JSON configuration is displayed in the right panel.`,
          "assistant"
        );
        this.displayGeneratedConfig(parsedConfig);
      } catch (jsonError) {
        console.error("JSON parsing failed:", jsonError);
        console.log("Raw response:", response);

        // Fallback: show the response as text and try to fix it
        this.addChatMessage(
          `I generated a response, but there might be an issue with the JSON format. Here's what I created:\n\n${response}\n\nLet me try to fix this...`,
          "assistant"
        );

        // Try to fix common JSON issues and retry
        await this.retryWithFixedPrompt(message);
      }
    } catch (error) {
      console.error("AI request failed:", error);
      this.removeThinkingMessage(thinkingId);
      this.addChatMessage(
        `Sorry, I encountered an error while processing your request: ${error.message}`,
        "assistant",
        true
      );
    }
  }

  /**
   * Retry with a more specific prompt to fix JSON issues
   */
  async retryWithFixedPrompt(originalMessage) {
    try {
      const fixPrompt = `Please create a valid JSON configuration for this assignment: "${originalMessage}"

Use exactly this structure with no additional text:
{
  "assignment": {
    "name": "Assignment Name Here",
    "description": "Description here"
  },
  "components": [
    {
      "id": "component_1",
      "type": "fileUpload",
      "label": "Upload Files",
      "required": true,
      "acceptedTypes": ".zip",
      "maxSize": 50,
      "allowMultiple": false
    }
  ],
  "validationRules": [
    {
      "id": "rule_" + Date.now(),
      "type": "fileExtension",
      "name": "File Extension Check",
      "successMessage": "✅ File validation passed",
      "failureMessage": "❌ File validation failed",
      "parameters": {
        "allowedExtensions": [".zip"]
      }
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}

Respond with valid JSON only.`;

      const response = await this.session.prompt(fixPrompt);
      let cleanResponse = response.trim();

      // Clean markdown formatting
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
      }

      const parsedConfig = JSON.parse(cleanResponse);
      this.generatedConfig = parsedConfig;

      this.addChatMessage(
        `I've fixed the configuration! Please check the right panel for the valid JSON.`,
        "assistant"
      );
      this.displayGeneratedConfig(parsedConfig);
    } catch (retryError) {
      console.error("Retry failed:", retryError);
      this.addChatMessage(
        `I'm having trouble generating valid JSON. Please try rephrasing your request or use the manual designer.`,
        "assistant",
        true
      );
    }
  }

  /**
   * Add a chat message to the conversation
   */
  addChatMessage(content, sender, isError = false) {
    const chatContainer = document.getElementById("chatContainer");
    const messageDiv = document.createElement("div");

    messageDiv.className = `chat-message ${sender}-message${
      isError ? " error" : ""
    }`;
    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-${sender === "user" ? "user" : "robot"}"></i>
      </div>
      <div class="message-content">
        <p>${content.replace(/\n/g, "<br>")}</p>
      </div>
    `;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageDiv;
  }

  /**
   * Add thinking indicator
   */
  addThinkingMessage() {
    const chatContainer = document.getElementById("chatContainer");
    const thinkingDiv = document.createElement("div");
    const thinkingId = "thinking-" + Date.now();

    thinkingDiv.id = thinkingId;
    thinkingDiv.className = "chat-message assistant-message thinking-message";
    thinkingDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <p>Thinking <span class="thinking-dots"><span></span><span></span><span></span></span></p>
      </div>
    `;

    chatContainer.appendChild(thinkingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return thinkingId;
  }

  /**
   * Remove thinking indicator
   */
  removeThinkingMessage(thinkingId) {
    const thinkingMessage = document.getElementById(thinkingId);
    if (thinkingMessage) {
      thinkingMessage.remove();
    }
  }

  /**
   * Display the generated configuration
   */
  displayGeneratedConfig(config) {
    const configContent = document.getElementById("configContent");
    const configActions = document.getElementById("configActions");

    // Create summary
    const summary = this.createConfigSummary(config);

    configContent.innerHTML = `
      <div class="config-summary">
        <h5>📋 Configuration Summary</h5>
        <p><strong>Assignment:</strong> ${config.assignment.name}</p>
        <p><strong>Components:</strong> ${config.components.length}</p>
        <p><strong>Validation Rules:</strong> ${
          config.validationRules.length
        }</p>
        <ul>
          ${config.components
            .map((comp) => `<li>${comp.label} (${comp.type})</li>`)
            .join("")}
        </ul>
      </div>
      <div class="config-preview">
        <h4>Generated JSON Configuration</h4>
        <div class="config-json">${JSON.stringify(config, null, 2)}</div>
      </div>
    `;

    configActions.style.display = "flex";
  }

  /**
   * Create a summary of the configuration
   */
  createConfigSummary(config) {
    const componentTypes = config.components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1;
      return acc;
    }, {});

    const ruleTypes = config.validationRules.reduce((acc, rule) => {
      acc[rule.type] = (acc[rule.type] || 0) + 1;
      return acc;
    }, {});

    return {
      componentTypes,
      ruleTypes,
      totalComponents: config.components.length,
      totalRules: config.validationRules.length,
    };
  }

  /**
   * Show error message
   */
  showError(message) {
    const chatContainer = document.getElementById("chatContainer");
    const errorDiv = document.createElement("div");

    errorDiv.className = "error-message";
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i>${message}`;

    chatContainer.appendChild(errorDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// Initialize the AI Assistant when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.aiAssistant = new AIAssistant();
});

/**
 * Global functions for UI interactions
 */

// Show setup modal
function showSetupModal() {
  document.getElementById("setupModal").classList.add("active");
}

// Close setup modal
function closeSetupModal() {
  document.getElementById("setupModal").classList.remove("active");
}

// Recheck AI availability
async function recheckAI() {
  closeSetupModal();
  if (window.aiAssistant) {
    await window.aiAssistant.checkAIAvailability();
  }
}

// Download generated configuration
function downloadGeneratedConfig() {
  if (!window.aiAssistant || !window.aiAssistant.generatedConfig) {
    alert("No configuration available to download.");
    return;
  }

  const config = window.aiAssistant.generatedConfig;
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.assignment.name
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}_ai_generated_config.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import to designer (opens designer with the configuration)
function importToDesigner() {
  if (!window.aiAssistant || !window.aiAssistant.generatedConfig) {
    alert("No configuration available to import.");
    return;
  }

  // Store the configuration in localStorage to pass to the designer
  localStorage.setItem(
    "aiGeneratedConfig",
    JSON.stringify(window.aiAssistant.generatedConfig)
  );

  // Navigate to the designer
  window.location.href = "index.html?import=ai";
}

// Make functions globally available
window.showSetupModal = showSetupModal;
window.closeSetupModal = closeSetupModal;
window.recheckAI = recheckAI;
window.downloadGeneratedConfig = downloadGeneratedConfig;
window.importToDesigner = importToDesigner;
window.useQuickPrompt = useQuickPrompt;

/**
 * Use a predefined quick prompt for common assignment types
 */
function useQuickPrompt(type) {
  const prompts = {
    unity:
      "Create a Unity 3D game development assignment that accepts zipped Unity projects (.zip), requires team member emails, includes validation for C# scripts and Unity scene files, and has a checkbox for original work confirmation.",

    python:
      "Generate a Python programming assignment that accepts Python files (.py) and Jupyter notebooks (.ipynb), has a text input for algorithm description, requires collaborator emails, validates Python syntax, and includes file content checks for required imports.",

    web: "Create a web development assignment with separate file uploads for HTML (.html), CSS (.css), and JavaScript (.js) files, image uploads for assets (.png, .jpg, .gif), a dropdown for framework selection (Vanilla JS, React, Vue), and validation for proper file structure.",

    ml: "Generate a machine learning assignment that accepts Jupyter notebooks (.ipynb), dataset files (.csv, .json), Python scripts (.py), has a dropdown for model type (Classification, Regression, Clustering), requires a project description text input, and validates image sizes for visualizations.",

    report:
      "Create an assignment that combines code and documentation: accepts PDF reports (.pdf), source code files (.py, .java, .cpp), has a text input for project summary, requires team member emails, includes file extension validation, and has a checkbox for academic integrity confirmation.",
  };

  const userInput = document.getElementById("userInput");
  if (prompts[type] && userInput) {
    userInput.value = prompts[type];

    // Auto-resize the textarea
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";

    // Focus the textarea
    userInput.focus();

    // Optionally auto-send after a short delay
    setTimeout(() => {
      if (window.aiAssistant && window.aiAssistant.isAvailable) {
        window.aiAssistant.sendMessage();
      }
    }, 500);
  }
}

// Close modal when clicking outside
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("setupModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeSetupModal();
      }
    });
  }
});

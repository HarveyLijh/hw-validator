/**
 * Assignment Configuration Model
 * Manages the assignment configuration data
 */
export class AssignmentConfig {
  constructor() {
    this.id = this.generateUUID();
    this.version = '1.0';
    this.name = '';
    this.description = '';
    this.components = [];
    this.validationRules = [];
  }
  
  /**
   * Generate a UUID v4
   * @returns {string} - UUID string
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Set basic assignment info
   * @param {string} name - Assignment name
   * @param {string} description - Assignment description
   */
  setBasicInfo(name, description) {
    this.name = name || 'Unnamed Assignment';
    this.description = description || '';
  }
  
  /**
   * Set components for the assignment
   * @param {Array} components - Component configurations
   */
  setComponents(components) {
    this.components = components || [];
  }
  
  /**
   * Set validation rules for the assignment
   * @param {Array} rules - Validation rule configurations
   */
  setValidationRules(rules) {
    this.validationRules = rules || [];
  }
  
  /**
   * Convert configuration to JSON object
   * @returns {Object} - JSON object
   */
  toJSON() {
    return {
      id: this.id,
      version: this.version,
      name: this.name,
      description: this.description,
      components: this.components,
      validationRules: this.validationRules
    };
  }
  
  /**
   * Create configuration from JSON object
   * @param {Object|string} json - JSON object or string
   * @returns {AssignmentConfig} - Assignment configuration
   */
  static fromJSON(json) {
    const config = new AssignmentConfig();
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    config.id = data.id || config.id;
    config.version = data.version || config.version;
    config.name = data.name || '';
    config.description = data.description || '';
    config.components = data.components || [];
    config.validationRules = data.validationRules || [];
    
    return config;
  }
}

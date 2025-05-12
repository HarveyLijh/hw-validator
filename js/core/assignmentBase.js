// assignmentBase.js
export default class AssignmentBase {
  constructor() {
    // Defer validation to next tick to allow child class initialization to complete
    setTimeout(() => {
      if (!this.submissionFormHtml) {
        console.error('Assignments must define submissionFormHtml');
      }
      if (!Array.isArray(this.validationRules)) {
        console.error('Assignments must define validationRules[]');
      }
    }, 0);
  }

  // Human-readable name
  assignmentName() {
    throw new Error('assignmentName() not implemented');
  }

  // HTML for step-1
  get submissionFormHtml() {
    throw new Error('submissionFormHtml getter not implemented');
  }

  // [{ name, test: async(form)=>bool, success, failure, stopOnFail }]
  get validationRules() {
    throw new Error('validationRules getter not implemented');
  }

  // Collect whatever you need from the form for artifact
  collectFormData(formEl) {
    return {};
  }

  // Default runner: loops through validationRules
  async runTests(formEl, updateResult) {
    const results = [];
    for (const rule of this.validationRules) {
      updateResult(`🔎 ${rule.name}…`);
      let passed = false;
      try {
        passed = await rule.test(formEl);
      } catch (e) {
        passed = false;
      }
      results.push({
        name:    rule.name,
        passed,
        message: passed ? rule.success : rule.failure
      });
      updateResult(results.at(-1).message);
      if (!passed && rule.stopOnFail) {
        return { passed: false, results, formData: this.collectFormData(formEl) };
      }
    }
    // all rules passed
    return { passed: true, results, formData: this.collectFormData(formEl) };
  }

  // Given the form + test results, build inner HTML for the artifact
  generateArtifactBody(formEl, testResults) {
    throw new Error('generateArtifactBody() not implemented');
  }
}
// main.js
import UIManager from './core/uiManager.js';
import { UnityAssignment } from './assignments/assignmentUnity.js';
import { TemplateAssignment } from './assignments/assignmentTemplate.js';
// <-- import other assignments here as you add them

document.addEventListener('DOMContentLoaded', () => {
  // Swap out UnityAssignment for whichever you need
  // Available assignments:
  // - UnityAssignment: For validating Unity projects
  // - TemplateAssignment: Starting point for creating new assignment types
  
  const assignment = new UnityAssignment();
  // const assignment = new TemplateAssignment(); // Uncomment to use the template assignment
  
  const ui = new UIManager(assignment);
  ui.initialize();
});
// main.js
import UIManager from './core/uiManager.js';
import { UnityAssignment } from './assignments/assignmentUnity.js';
// <-- import other assignments here as you add them

document.addEventListener('DOMContentLoaded', () => {
  // Swap out UnityAssignment for whichever you need
  const assignment = new UnityAssignment();
  const ui = new UIManager(assignment);
  ui.initialize();
});
/**
 * Component Palette
 * Manages the draggable component palette UI
 */
export class ComponentPalette {
  constructor() {
    this.componentItems = [];
  }
  
  /**
   * Initialize the component palette
   */
  initialize() {
    console.log('Initializing Component Palette...');
    this.componentItems = Array.from(document.querySelectorAll('.component-item'));
    
    // Set up drag and drop for component palette items
    this.componentItems.forEach(item => {
      item.addEventListener('dragstart', this.handleDragStart.bind(this));
      item.addEventListener('dragend', this.handleDragEnd.bind(this));
    });
  }
  
  /**
   * Handle drag start event
   * @param {DragEvent} e - The drag event
   */
  handleDragStart(e) {
    console.log('Component drag started');
    const target = e.target.closest('.component-item');
    
    if (!target) return;
    
    // Add dragging class for visual feedback
    target.classList.add('dragging');
    
    // Set data for drag operation
    const componentType = target.dataset.componentType;
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'new-component',
      componentType: componentType
    }));
    
    // Set drag image and effects
    e.dataTransfer.effectAllowed = 'copy';
  }
  
  /**
   * Handle drag end event
   * @param {DragEvent} e - The drag event
   */
  handleDragEnd(e) {
    console.log('Component drag ended');
    const target = e.target.closest('.component-item');
    
    if (target) {
      target.classList.remove('dragging');
    }
  }
}

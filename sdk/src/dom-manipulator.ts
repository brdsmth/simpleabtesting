import { DOMChange } from './types';
import { debugLog } from './utils';

export class DOMManipulator {
  /**
   * Apply a set of DOM changes
   */
  static applyChanges(changes: DOMChange[]): void {
    changes.forEach(change => {
      try {
        this.applyChange(change);
      } catch (error) {
        console.warn('[SimpleAB] Failed to apply change:', change, error);
      }
    });
  }

  /**
   * Apply a single DOM change
   */
  private static applyChange(change: DOMChange): void {
    const elements = document.querySelectorAll(change.selector);
    
    if (elements.length === 0) {
      debugLog(`No elements found for selector: ${change.selector}`);
      return;
    }

    debugLog(`Applying ${change.type} change to ${elements.length} elements:`, change);

    elements.forEach(element => {
      switch (change.type) {
        case 'text':
          this.changeText(element, change.value);
          break;
        case 'html':
          this.changeHTML(element, change.value);
          break;
        case 'style':
          this.changeStyle(element, change.value);
          break;
        case 'attribute':
          this.changeAttribute(element, change.attribute!, change.value);
          break;
        case 'class':
          this.changeClass(element, change.value);
          break;
        default:
          console.warn(`Unknown change type: ${change.type}`);
      }
    });
  }

  private static changeText(element: Element, value: string): void {
    element.textContent = value;
  }

  private static changeHTML(element: Element, value: string): void {
    element.innerHTML = value;
  }

  private static changeStyle(element: Element, value: string): void {
    if (element instanceof HTMLElement) {
      // Parse CSS-like string "color: red; background: blue"
      const styles = value.split(';').filter(s => s.trim());
      styles.forEach(style => {
        const [property, val] = style.split(':').map(s => s.trim());
        if (property && val) {
          element.style.setProperty(property, val);
        }
      });
    }
  }

  private static changeAttribute(element: Element, attribute: string, value: string): void {
    element.setAttribute(attribute, value);
  }

  private static changeClass(element: Element, value: string): void {
    // Value can be: "add:class1,class2" or "remove:class1,class2" or "toggle:class1"
    const [action, classes] = value.split(':');
    const classList = classes ? classes.split(',').map(c => c.trim()) : [];

    switch (action) {
      case 'add':
        classList.forEach(cls => element.classList.add(cls));
        break;
      case 'remove':
        classList.forEach(cls => element.classList.remove(cls));
        break;
      case 'toggle':
        classList.forEach(cls => element.classList.toggle(cls));
        break;
      default:
        // Default to add if no action specified
        element.classList.add(value);
    }
  }
}

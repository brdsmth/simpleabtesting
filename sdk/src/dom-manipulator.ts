import { DOMChange } from './types';
import { debugLog } from './utils';

export class DOMManipulator {
  /**
   * Apply a set of DOM changes
   */
  static applyChanges(changes: DOMChange[]): void {
    debugLog('Applying changes:', changes);
    changes.forEach(change => {
      this.waitForElement(change.selector, (elements) => {
        try {
          this.applyChange(change, elements);
        } catch (error) {
          console.warn('[SimpleAB] Failed to apply change:', change, error);
        }
      });
    });
  }

  /**
   * Apply a single DOM change to a set of elements
   */
  private static applyChange(change: DOMChange, elements: NodeListOf<Element>): void {
    debugLog(`Applying ${change.type} change to ${elements.length} elements for selector: ${change.selector}`);

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
          console.warn(`[SimpleAB] Unknown change type: ${change.type}`);
      }
    });
  }

  /**
   * Wait for an element to appear in the DOM and then execute a callback
   */
  private static waitForElement(selector: string, callback: (elements: NodeListOf<Element>) => void): void {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      debugLog(`Elements found immediately for selector: ${selector}`);
      callback(elements);
      return;
    }

    debugLog(`Waiting for elements with selector: ${selector}`);
    const observer = new MutationObserver((mutations, obs) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        debugLog(`Elements found after mutation for selector: ${selector}`);
        obs.disconnect();
        callback(elements);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Optional: Timeout to stop observing after a while
    setTimeout(() => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        debugLog(`Timeout waiting for selector: ${selector}`);
        observer.disconnect();
      }
    }, 5000); // 5 seconds
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
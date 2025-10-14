/**
 * Visual Selector Mode for SDK
 * Activated when ?ab-visual-mode=true is in URL
 */

export class VisualSelector {
  private overlay: HTMLElement | null = null;
  private tooltip: HTMLElement | null = null;
  private banner: HTMLElement | null = null;
  private currentHighlight: Element | null = null;
  private isActive = false;

  init() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.injectStyles();
    this.createUI();
    this.attachEventListeners();
    this.notifyParent('VISUAL_MODE_READY');
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.id = 'ab-visual-selector-styles';
    style.textContent = `
      .ab-selector-highlight {
        outline: 3px solid #3ecf8e !important;
        outline-offset: 2px !important;
        cursor: pointer !important;
        position: relative !important;
      }
      .ab-selector-tooltip {
        position: fixed !important;
        background: #1e293b !important;
        color: white !important;
        padding: 8px 14px !important;
        border-radius: 8px !important;
        font-size: 13px !important;
        font-family: Monaco, Consolas, monospace !important;
        pointer-events: none !important;
        z-index: 999999 !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
        font-weight: 600 !important;
      }
      .ab-selector-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.15) !important;
        z-index: 999998 !important;
        cursor: crosshair !important;
      }
      .ab-selector-banner {
        position: fixed !important;
        top: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: #3ecf8e !important;
        color: #1e293b !important;
        padding: 12px 24px !important;
        border-radius: 10px !important;
        font-weight: 700 !important;
        font-size: 15px !important;
        box-shadow: 0 8px 24px rgba(62,207,142,0.4) !important;
        z-index: 999999 !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }

  private createUI() {
    // Create banner
    this.banner = document.createElement('div');
    this.banner.className = 'ab-selector-banner';
    this.banner.textContent = '👆 Hover and click to select an element';
    document.body.appendChild(this.banner);

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'ab-selector-overlay';
    document.body.appendChild(this.overlay);

    // Create tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'ab-selector-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }

  private attachEventListeners() {
    if (!this.overlay) return;

    this.overlay.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.overlay.addEventListener('click', (e) => this.handleClick(e));
    
    // Also listen on document to catch clicks on elements
    document.addEventListener('click', (e) => this.handleDocumentClick(e), true);
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.tooltip) return;
    
    // Get element at mouse position, excluding our overlay
    if (this.overlay) {
      this.overlay.style.pointerEvents = 'none';
    }
    
    const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
    
    if (this.overlay) {
      this.overlay.style.pointerEvents = 'auto';
    }
    
    if (!elementAtPoint || elementAtPoint === this.tooltip || elementAtPoint === this.banner) {
      return;
    }

    if (this.currentHighlight && this.currentHighlight !== elementAtPoint) {
      this.currentHighlight.classList.remove('ab-selector-highlight');
    }

    this.currentHighlight = elementAtPoint;
    elementAtPoint.classList.add('ab-selector-highlight');

    // Update tooltip
    const selector = this.generateSelector(elementAtPoint);
    this.tooltip.textContent = selector;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${e.clientX + 10}px`;
    this.tooltip.style.top = `${e.clientY + 10}px`;
  }

  private handleClick(e: MouseEvent) {
    // This handles clicks on the overlay itself
    this.handleDocumentClick(e);
  }

  private handleDocumentClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    // Get element at click position
    if (this.overlay) {
      this.overlay.style.pointerEvents = 'none';
    }
    
    const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
    
    if (this.overlay) {
      this.overlay.style.pointerEvents = 'auto';
    }
    
    if (!elementAtPoint || elementAtPoint === this.tooltip || elementAtPoint === this.banner) {
      return;
    }

    const selector = this.generateSelector(elementAtPoint);
    this.notifyParent('ELEMENT_SELECTED', selector);
    this.cleanup();
  }

  private generateSelector(element: Element): string {
    // Prioritize ID
    if (element.id) {
      return `#${element.id}`;
    }

    // Use classes if available
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => 
        c && !c.startsWith('ab-selector')
      );
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }

    // Fallback to tag + nth-child
    const parent = element.parentElement;
    if (!parent) {
      return element.tagName.toLowerCase();
    }

    const siblings = Array.from(parent.children).filter(
      child => child.tagName === element.tagName
    );

    if (siblings.length === 1) {
      return element.tagName.toLowerCase();
    }

    const index = siblings.indexOf(element) + 1;
    return `${element.tagName.toLowerCase()}:nth-child(${index})`;
  }

  private notifyParent(type: string, data?: any) {
    if (window.parent !== window) {
      window.parent.postMessage({ 
        type: `AB_SDK_${type}`, 
        data 
      }, '*');
    }
  }

  private cleanup() {
    // Remove event listeners
    document.removeEventListener('click', (e) => this.handleDocumentClick(e), true);
    
    if (this.overlay) this.overlay.remove();
    if (this.tooltip) this.tooltip.remove();
    if (this.banner) this.banner.remove();
    if (this.currentHighlight) {
      this.currentHighlight.classList.remove('ab-selector-highlight');
    }
    
    const style = document.getElementById('ab-visual-selector-styles');
    if (style) style.remove();
    
    this.isActive = false;
  }

  destroy() {
    this.cleanup();
  }
}


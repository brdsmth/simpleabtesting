import { Experiment, DOMChange } from './types';

export class DebugPanel {
  private panel: HTMLElement | null = null;
  private experiments: Map<string, { experiment: Experiment; variation: string; changes: DOMChange[] }> = new Map();
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private position = { x: 20, y: 20 };
  private sdkInstance: any = null;
  
  init(sdkInstance?: any): void {
    this.sdkInstance = sdkInstance;
    this.loadPosition();
    this.createPanel();
    this.attachStyles();
    this.setupDragging();
    this.setupControls();
  }
  
  private createPanel(): void {
    this.panel = document.createElement('div');
    this.panel.id = 'simple-ab-debug-panel';
    
    // Position the panel - if saved position exists, use it as left/top
    // Otherwise use default bottom-right positioning
    const hasSavedPosition = localStorage.getItem('simple_ab_debug_position');
    if (hasSavedPosition) {
      this.panel.style.left = `${this.position.x}px`;
      this.panel.style.top = `${this.position.y}px`;
      this.panel.style.right = 'auto';
      this.panel.style.bottom = 'auto';
    }
    
    this.panel.innerHTML = `
      <div class="debug-header" id="debug-header">
        <strong style="cursor: move; user-select: none;">A/B Testing Debug Panel</strong>
        <button class="close-btn" id="close-debug-panel">×</button>
      </div>
      <div class="debug-content" id="debug-content">
        <div class="no-experiments">No active experiments</div>
      </div>
      <div class="debug-controls">
        <button class="control-btn" id="clear-assignments">Clear Assignments</button>
        <button class="control-btn" id="clear-events">Clear Events</button>
        <button class="control-btn" id="reset-visitor">Reset Visitor</button>
      </div>
      <div class="sdk-data" id="sdk-data"></div>
    `;
    
    document.body.appendChild(this.panel);
    
    // Handle close button
    const closeBtn = this.panel.querySelector('#close-debug-panel');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hide();
    });
  }
  
  private attachStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      #simple-ab-debug-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 500px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        z-index: 999999;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: box-shadow 0.2s ease;
      }
      
      #simple-ab-debug-panel.dragging {
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        opacity: 0.95;
      }
      
      #simple-ab-debug-panel .debug-header {
        background: linear-gradient(135deg, #3ecf8e 0%, #2da771 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
      }
      
      #simple-ab-debug-panel .close-btn {
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      #simple-ab-debug-panel .close-btn:hover {
        background: rgba(255,255,255,0.2);
      }
      
      #simple-ab-debug-panel .debug-content {
        padding: 16px;
        overflow-y: auto;
        max-height: 430px;
      }
      
      #simple-ab-debug-panel .no-experiments {
        color: #999;
        text-align: center;
        padding: 20px;
        font-style: italic;
      }
      
      #simple-ab-debug-panel .experiment-item {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
      }
      
      #simple-ab-debug-panel .experiment-name {
        font-weight: 600;
        color: #212529;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      #simple-ab-debug-panel .experiment-id {
        font-size: 11px;
        color: #6c757d;
        font-family: monospace;
        margin-bottom: 8px;
      }
      
      #simple-ab-debug-panel .variation-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #3ecf8e;
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      #simple-ab-debug-panel .changes-section {
        margin-top: 8px;
      }
      
      #simple-ab-debug-panel .changes-header {
        font-weight: 600;
        color: #495057;
        font-size: 12px;
        margin-bottom: 6px;
      }
      
      #simple-ab-debug-panel .change-item {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 6px;
        font-size: 12px;
      }
      
      #simple-ab-debug-panel .change-item:last-child {
        margin-bottom: 0;
      }
      
      #simple-ab-debug-panel .change-type {
        display: inline-block;
        background: #e7f5ff;
        color: #0c5ba8;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        margin-right: 6px;
      }
      
      #simple-ab-debug-panel .change-selector {
        color: #6c757d;
        font-family: monospace;
        font-size: 11px;
        margin-top: 4px;
        word-break: break-all;
      }
      
      #simple-ab-debug-panel .change-value {
        color: #212529;
        margin-top: 4px;
        padding: 4px 6px;
        background: #f8f9fa;
        border-radius: 3px;
        font-family: monospace;
        font-size: 11px;
        word-break: break-word;
      }
      
      #simple-ab-debug-panel .no-changes {
        color: #6c757d;
        font-style: italic;
        font-size: 12px;
        padding: 8px;
        background: white;
        border-radius: 4px;
        text-align: center;
      }
      
      #simple-ab-debug-panel .debug-controls {
        padding: 12px 16px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      #simple-ab-debug-panel .control-btn {
        flex: 1;
        min-width: 100px;
        padding: 8px 12px;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      #simple-ab-debug-panel .control-btn:hover {
        background: #3ecf8e;
        color: white;
        border-color: #3ecf8e;
        transform: translateY(-1px);
      }
      
      #simple-ab-debug-panel .sdk-data {
        padding: 12px 16px;
        background: #f1f3f5;
        border-top: 1px solid #e9ecef;
        max-height: 150px;
        overflow-y: auto;
      }
      
      #simple-ab-debug-panel .sdk-data pre {
        margin: 0;
        font-size: 10px;
        font-family: 'Monaco', 'Courier New', monospace;
        color: #495057;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    `;
    document.head.appendChild(style);
  }
  
  private setupControls(): void {
    if (!this.panel) return;
    
    const clearAssignments = this.panel.querySelector('#clear-assignments');
    const clearEvents = this.panel.querySelector('#clear-events');
    const resetVisitor = this.panel.querySelector('#reset-visitor');
    
    clearAssignments?.addEventListener('click', () => {
      localStorage.removeItem('simple_ab_assignments');
      window.location.reload();
    });
    
    clearEvents?.addEventListener('click', () => {
      localStorage.removeItem('simple_ab_events');
      window.location.reload();
    });
    
    resetVisitor?.addEventListener('click', () => {
      if (this.sdkInstance?.reset) {
        this.sdkInstance.reset();
        window.location.reload();
      }
    });
  }
  
  addExperiment(experiment: Experiment, variationId: string): void {
    const variation = experiment.variations.find(v => v.id === variationId);
    if (!variation) return;
    
    this.experiments.set(experiment.id, {
      experiment,
      variation: variationId,
      changes: variation.changes || []
    });
    
    this.render();
  }
  
  private render(): void {
    if (!this.panel) return;
    
    const content = this.panel.querySelector('#debug-content');
    const sdkDataEl = this.panel.querySelector('#sdk-data');
    if (!content) return;
    
    if (this.experiments.size === 0) {
      content.innerHTML = '<div class="no-experiments">No active experiments</div>';
    } else {
      let html = '';
      
      this.experiments.forEach((data, experimentId) => {
        const { experiment, variation, changes } = data;
        const variationObj = experiment.variations.find(v => v.id === variation);
        const variationName = variationObj?.name || variation;
        
        html += `
          <div class="experiment-item">
            <div class="experiment-name">
              ${this.escapeHtml(experiment.name)}
            </div>
            <div class="experiment-id">ID: ${this.escapeHtml(experimentId)}</div>
            <div class="variation-badge">
              ✓ ${this.escapeHtml(variationName)}
            </div>
            
            <div class="changes-section">
              <div class="changes-header">DOM Changes (${changes.length})</div>
              ${this.renderChanges(changes)}
            </div>
          </div>
        `;
      });
      
      content.innerHTML = html;
    }
    
    // Update SDK data
    if (sdkDataEl) {
      const sdkData = {
        visitorId: localStorage.getItem('simple_ab_visitor_id'),
        assignments: JSON.parse(localStorage.getItem('simple_ab_assignments') || '{}'),
        events: this.sdkInstance?.getEvents?.() || []
      };
      sdkDataEl.innerHTML = `<pre>${JSON.stringify(sdkData, null, 2)}</pre>`;
    }
  }
  
  private renderChanges(changes: DOMChange[]): string {
    if (changes.length === 0) {
      return '<div class="no-changes">No DOM modifications</div>';
    }
    
    return changes.map(change => {
      let valueDisplay = '';
      
      if (change.type === 'style') {
        valueDisplay = `<div class="change-value">CSS: ${this.escapeHtml(change.value)}</div>`;
      } else if (change.type === 'attribute') {
        valueDisplay = `<div class="change-value">${this.escapeHtml(change.attribute || 'attr')}: ${this.escapeHtml(change.value)}</div>`;
      } else if (change.type === 'class') {
        valueDisplay = `<div class="change-value">Class: ${this.escapeHtml(change.value)}</div>`;
      } else {
        // text or html
        const truncated = change.value.length > 60 
          ? change.value.substring(0, 60) + '...' 
          : change.value;
        valueDisplay = `<div class="change-value">${this.escapeHtml(truncated)}</div>`;
      }
      
      return `
        <div class="change-item">
          <div>
            <span class="change-type">${this.escapeHtml(change.type)}</span>
          </div>
          <div class="change-selector">→ ${this.escapeHtml(change.selector)}</div>
          ${valueDisplay}
        </div>
      `;
    }).join('');
  }
  
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  show(): void {
    if (this.panel) {
      this.panel.style.display = 'flex';
    }
  }
  
  hide(): void {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  }
  
  toggle(): void {
    if (this.panel) {
      if (this.panel.style.display === 'none') {
        this.show();
      } else {
        this.hide();
      }
    }
  }
  
  clear(): void {
    this.experiments.clear();
    this.render();
  }
  
  private setupDragging(): void {
    if (!this.panel) return;
    
    const header = this.panel.querySelector('#debug-header') as HTMLElement;
    if (!header) return;
    
    header.addEventListener('mousedown', (e: MouseEvent) => {
      // Don't drag if clicking the close button
      if ((e.target as HTMLElement).classList.contains('close-btn')) {
        return;
      }
      
      this.isDragging = true;
      const rect = this.panel!.getBoundingClientRect();
      
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
      
      // Add dragging class for visual feedback
      this.panel!.classList.add('dragging');
      
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging || !this.panel) return;
      
      const x = e.clientX - this.dragOffset.x;
      const y = e.clientY - this.dragOffset.y;
      
      // Keep panel within window bounds
      const maxX = window.innerWidth - this.panel.offsetWidth;
      const maxY = window.innerHeight - this.panel.offsetHeight;
      
      const boundedX = Math.max(0, Math.min(x, maxX));
      const boundedY = Math.max(0, Math.min(y, maxY));
      
      this.panel.style.left = `${boundedX}px`;
      this.panel.style.top = `${boundedY}px`;
      this.panel.style.right = 'auto';
      this.panel.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
      if (this.isDragging && this.panel) {
        this.isDragging = false;
        this.panel.classList.remove('dragging');
        
        // Save position
        const rect = this.panel.getBoundingClientRect();
        this.position.x = Math.round(rect.left);
        this.position.y = Math.round(rect.top);
        this.savePosition();
      }
    });
  }
  
  private loadPosition(): void {
    try {
      const saved = localStorage.getItem('simple_ab_debug_position');
      if (saved) {
        const pos = JSON.parse(saved);
        this.position = pos;
      }
    } catch (e) {
      // Use default position
    }
  }
  
  private savePosition(): void {
    try {
      localStorage.setItem('simple_ab_debug_position', JSON.stringify(this.position));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}


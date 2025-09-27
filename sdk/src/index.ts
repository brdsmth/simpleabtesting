import { SDKConfig, Experiment, TrackingEvent } from './types';
import { getVisitorId, assignVariation, debugLog } from './utils';
import { DOMManipulator } from './dom-manipulator';

class SimpleABTesting {
  private config: SDKConfig = {};
  private visitorId: string = '';
  private assignments: { [experimentId: string]: string } = {};

  /**
   * Initialize the SDK
   */
  async init(config: SDKConfig): Promise<void> {
    this.config = { 
      apiUrl: 'http://localhost:3000',
      ...config 
    };
    this.visitorId = getVisitorId();
    
    // Store debug flag globally so debugLog can access it
    if (config.debug) {
      (window as any).SimpleABTesting.debug = true;
    }
    
    debugLog('Initializing SDK', { config, visitorId: this.visitorId });

    // Load existing assignments from localStorage
    this.loadAssignments();

    // Fetch experiments if API key is provided
    if (config.apiKey) {
      try {
        const experiments = await this.fetchExperiments(config.apiKey);
        this.processExperiments(experiments);
      } catch (error) {
        console.error('[SimpleAB] Failed to fetch experiments:', error);
        debugLog('Failed to fetch experiments', error);
      }
    } else if (config.experiments) {
      // Process experiments if provided directly
      this.processExperiments(config.experiments);
    }

    debugLog('SDK initialized successfully');
  }

  /**
   * Fetch experiments from API using API key
   */
  private async fetchExperiments(apiKey: string): Promise<Experiment[]> {
    const url = `${this.config.apiUrl}/experiments?apiKey=${encodeURIComponent(apiKey)}`;
    
    debugLog('Fetching experiments from API', { url });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    debugLog('Experiments fetched successfully', data);
    
    return data.experiments || [];
  }

  /**
   * Process and apply experiments
   */
  private processExperiments(experiments: Experiment[]): void {
    experiments.forEach(experiment => {
      if (experiment.status !== 'active') {
        debugLog(`Skipping inactive experiment: ${experiment.name}`);
        return;
      }

      // Check if user should be included in this experiment
      if (!this.shouldIncludeInExperiment(experiment)) {
        debugLog(`User excluded from experiment: ${experiment.name}`);
        return;
      }

      // Get or assign variation
      let variationId = this.assignments[experiment.id];
      
      if (!variationId) {
        variationId = assignVariation(experiment.id, this.visitorId, experiment.variations);
        this.assignments[experiment.id] = variationId;
        this.saveAssignments();
        debugLog(`New assignment: ${variationId} for ${experiment.name}`);
      } else {
        debugLog(`Existing assignment: ${variationId} for ${experiment.name}`);
      }

      // Apply variation changes
      const variation = experiment.variations.find(v => v.id === variationId);
      if (variation && variation.changes.length > 0) {
        DOMManipulator.applyChanges(variation.changes);
        
        // Track the view
        this.track(experiment.id, 'view');
      }
    });
  }

  /**
   * Check if user should be included in experiment based on traffic allocation
   */
  private shouldIncludeInExperiment(experiment: Experiment): boolean {
    if (experiment.trafficAllocation >= 100) {
      return true;
    }

    const hash = this.visitorId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    return Math.abs(hash % 100) < experiment.trafficAllocation;
  }

  /**
   * Get the assigned variation for an experiment
   */
  getVariation(experimentId: string): string | null {
    return this.assignments[experimentId] || null;
  }

  /**
   * Track an event (view or conversion)
   */
  track(experimentId: string, eventType: 'view' | 'conversion' = 'view'): void {
    const variationId = this.assignments[experimentId];
    if (!variationId) {
      debugLog(`No assignment found for experiment: ${experimentId}`);
      return;
    }

    const event: TrackingEvent = {
      experimentId,
      variationId,
      eventType,
      timestamp: Date.now(),
      visitorId: this.visitorId,
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    debugLog('Tracking event:', event);

    // Send event to server if API key is available
    debugLog('API key check:', { hasApiKey: !!this.config.apiKey, apiKey: this.config.apiKey });
    if (this.config.apiKey) {
      debugLog('Sending to server...');
      this.sendEventToServer(event);
    } else {
      debugLog('No API key, storing locally');
      // fallback, store event locally if no API key
      this.storeEvent(event);
    }
  }

  /**
   * Load assignments from localStorage
   */
  private loadAssignments(): void {
    try {
      const stored = localStorage.getItem('simple_ab_assignments');
      if (stored) {
        this.assignments = JSON.parse(stored);
        debugLog('Loaded assignments:', this.assignments);
      } else {
        this.assignments = {};
        debugLog('No existing assignments - starting fresh');
      }
    } catch (error) {
      this.assignments = {};
      debugLog('Failed to load assignments:', error);
    }
  }

  /**
   * Save assignments to localStorage
   */
  private saveAssignments(): void {
    try {
      localStorage.setItem('simple_ab_assignments', JSON.stringify(this.assignments));
    } catch (error) {
      debugLog('Failed to save assignments:', error);
    }
  }

  /**
   * Send tracking event to server
   */
  private async sendEventToServer(event: TrackingEvent): Promise<void> {
    try {
      const url = `${this.config.apiUrl}/analytics/track`;
      
      debugLog('Sending event to server', { url, event });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          event
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      debugLog('Event sent successfully', result);
      
      // Also store locally for debugging purposes
      this.storeEvent(event);
      
    } catch (error) {
      console.error('[SimpleAB] Failed to send event to server:', error);
      debugLog('Failed to send event, storing locally as fallback', error);
      
      // Fallback: store locally if server request fails
      this.storeEvent(event);
    }
  }

  /**
   * Store tracking event locally
   */
  private storeEvent(event: TrackingEvent): void {
    try {
      const key = 'simple_ab_events';
      const stored = localStorage.getItem(key);
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep only last 100 events to avoid storage bloat
      if (events.length > 5) {
        events.splice(0, events.length - 5);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      debugLog('Failed to store event:', error);
    }
  }

  /**
   * Get stored events (for debugging)
   */
  getEvents(): TrackingEvent[] {
    try {
      const stored = localStorage.getItem('simple_ab_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      debugLog('Failed to get events:', error);
      return [];
    }
  }

  /**
   * Clear all stored data
   */
  reset(): void {
    localStorage.removeItem('simple_ab_visitor_id');
    localStorage.removeItem('simple_ab_assignments');
    localStorage.removeItem('simple_ab_events');
    this.assignments = {};
    this.visitorId = getVisitorId();
    debugLog('SDK reset complete');
  }
}

// Create global instance
const sdk = new SimpleABTesting();

// Auto-initialize if config is provided via script tag
if (typeof window !== 'undefined') {
  (window as any).SimpleABTesting = sdk;
  
  // Check for auto-init from script tag attributes
  document.addEventListener('DOMContentLoaded', async () => {
    const script = document.querySelector('script[data-simple-ab]');
    if (script) {
      const config: SDKConfig = {
        debug: script.getAttribute('data-debug') === 'true'
      };
      
      // Look for API key in data attribute
      const apiKey = script.getAttribute('data-api-key');
      if (apiKey) {
        config.apiKey = apiKey;
      }
      
      // Look for custom API URL
      const apiUrl = script.getAttribute('data-api-url');
      if (apiUrl) {
        config.apiUrl = apiUrl;
      }
      
      // Look for experiments in data attribute (fallback)
      const experimentsData = script.getAttribute('data-experiments');
      if (experimentsData) {
        try {
          config.experiments = JSON.parse(experimentsData);
        } catch (error) {
          console.error('[SimpleAB] Failed to parse experiments data:', error);
        }
      }
      
      await sdk.init(config);
    }
  });
}

export default sdk;

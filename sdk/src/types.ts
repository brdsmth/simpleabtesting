export interface SDKConfig {
  debug?: boolean;
  experiments?: Experiment[];
}

export interface Experiment {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'stopped';
  variations: Variation[];
  trafficAllocation: number;
}

export interface Variation {
  id: string;
  name: string;
  weight: number;
  changes: DOMChange[];
}

export interface DOMChange {
  selector: string;
  type: 'text' | 'html' | 'style' | 'attribute' | 'class';
  value: string;
  attribute?: string;
}

export interface TrackingEvent {
  experimentId: string;
  variationId: string;
  eventType: 'view' | 'conversion';
  timestamp: number;
}

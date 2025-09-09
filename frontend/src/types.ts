// Shared types with the SDK
export interface Experiment {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'stopped';
  variations: Variation[];
  trafficAllocation: number; // 0-100
}

export interface Variation {
  id: string;
  name: string;
  weight: number; // 0-100
  changes: DOMChange[];
}

export interface DOMChange {
  selector: string;
  type: 'text' | 'html' | 'style' | 'attribute' | 'class';
  value: string;
  attribute?: string; // for attribute changes
}

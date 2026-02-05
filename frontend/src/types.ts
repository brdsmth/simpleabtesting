// Project represents a website or application
export interface Project {
  project_id: string;
  name: string;
  url?: string;
  description?: string;
  settings?: Record<string, any>;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Shared types with the SDK
export interface Experiment {
  id: string;
  name: string;
  project_id?: string; // Link to project
  status: 'active' | 'paused' | 'stopped';
  variations: Variation[];
  trafficAllocation: number; // 0-100
  archived?: boolean;
  winningVariation?: string; // ID of the winning variation
  stoppedAt?: string;
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

import { Experiment } from './types';

export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'cta' | 'content' | 'design' | 'layout';
  icon: string;
  template: Omit<Experiment, 'id' | 'name'>;
  targetUrl?: string; // Optional target URL for the experiment
}

export const experimentTemplates: ExperimentTemplate[] = [
  {
    id: 'button-color',
    name: 'Button Color Test',
    description: 'Test different button colors to see which drives more clicks',
    category: 'cta',
    icon: 'Color',
    template: {
      status: 'paused',
      trafficAllocation: 100,
      variations: [
        {
          id: 'control',
          name: 'Original',
          weight: 50,
          changes: []
        },
        {
          id: 'var-1',
          name: 'Green Button',
          weight: 50,
          changes: [
            {
              selector: '.cta-button',
              type: 'style',
              value: 'backgroundColor: #10b981',
              attribute: 'style.backgroundColor'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'button-text',
    name: 'Button Text Test',
    description: 'Test different call-to-action phrases to improve conversion',
    category: 'cta',
    icon: 'Text',
    template: {
      status: 'paused',
      trafficAllocation: 100,
      variations: [
        {
          id: 'control',
          name: 'Original',
          weight: 50,
          changes: []
        },
        {
          id: 'var-1',
          name: 'New CTA',
          weight: 50,
          changes: [
            {
              selector: '.cta-button',
              type: 'text',
              value: 'Get Started Free'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'headline-test',
    name: 'Headline Test',
    description: 'Compare different headlines to see which resonates best',
    category: 'content',
    icon: 'H1',
    template: {
      status: 'paused',
      trafficAllocation: 100,
      variations: [
        {
          id: 'control',
          name: 'Original Headline',
          weight: 50,
          changes: []
        },
        {
          id: 'var-1',
          name: 'Alternative Headline',
          weight: 50,
          changes: [
            {
              selector: 'h1',
              type: 'text',
              value: 'Your new headline here'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'hero-image',
    name: 'Hero Image A/B Test',
    description: 'Test different hero images to see which captures attention',
    category: 'design',
    icon: 'Img',
    template: {
      status: 'paused',
      trafficAllocation: 100,
      variations: [
        {
          id: 'control',
          name: 'Original Image',
          weight: 50,
          changes: []
        },
        {
          id: 'var-1',
          name: 'Alternative Image',
          weight: 50,
          changes: [
            {
              selector: '.hero-image',
              type: 'attribute',
              value: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop&auto=format',
              attribute: 'src'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'pricing-display',
    name: 'Pricing Display Test',
    description: 'Test different ways to display pricing information',
    category: 'content',
    icon: '$',
    template: {
      status: 'paused',
      trafficAllocation: 100,
      variations: [
        {
          id: 'control',
          name: 'Original Pricing',
          weight: 50,
          changes: []
        },
        {
          id: 'var-1',
          name: 'Alternative Pricing',
          weight: 50,
          changes: [
            {
              selector: '.pricing-amount',
              type: 'text',
              value: '$29/month'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'form-layout',
    name: 'Form Layout Test',
    description: 'Test different form layouts to improve completion rates',
    category: 'layout',
    icon: 'Form',
    template: {
      status: 'paused',
      trafficAllocation: 100,
      variations: [
        {
          id: 'control',
          name: 'Original Form',
          weight: 50,
          changes: []
        },
        {
          id: 'var-1',
          name: 'Simplified Form',
          weight: 50,
          changes: [
            {
              selector: '.optional-field',
              type: 'style',
              value: 'display: none',
              attribute: 'style.display'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'trust-badge',
    name: 'Trust Badge Test',
    description: 'Test adding trust badges/security indicators',
    category: 'design',
    icon: 'Lock',
    template: {
      status: 'paused',
      trafficAllocation: 100,
      variations: [
        {
          id: 'control',
          name: 'Without Badge',
          weight: 50,
          changes: []
        },
        {
          id: 'var-1',
          name: 'With Badge',
          weight: 50,
          changes: [
            {
              selector: '.checkout-form',
              type: 'html',
              value: '<div class="trust-badge">🔒 Secure Checkout</div>'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'video-vs-image',
    name: 'Video vs Image Test',
    description: 'Compare video content against static images',
    category: 'design',
    icon: 'Video',
    template: {
      status: 'paused',
      trafficAllocation: 100,
      variations: [
        {
          id: 'control',
          name: 'Static Image',
          weight: 50,
          changes: []
        },
        {
          id: 'var-1',
          name: 'Video Content',
          weight: 50,
          changes: [
            {
              selector: '.hero-media',
              type: 'html',
              value: '<video autoplay loop><source src="hero-video.mp4" type="video/mp4"></video>'
            }
          ]
        }
      ]
    }
  }
];

export function getTemplatesByCategory(category?: string): ExperimentTemplate[] {
  if (!category) return experimentTemplates;
  return experimentTemplates.filter(t => t.category === category);
}

export function getTemplateById(id: string): ExperimentTemplate | undefined {
  return experimentTemplates.find(t => t.id === id);
}

export function createExperimentFromTemplate(
  template: ExperimentTemplate, 
  name: string
): Experiment {
  return {
    id: `exp-${Date.now()}`,
    name,
    status: template.template.status,
    trafficAllocation: template.template.trafficAllocation,
    variations: template.template.variations.map((v, index) => ({
      ...v,
      // Keep clean IDs: control, variation-a, variation-b, etc.
      id: v.id === 'control' ? 'control' : `variation-${String.fromCharCode(97 + index - 1)}`
    }))
  };
}


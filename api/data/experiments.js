// Mock database of experiments by API key
const experimentsDatabase = {
  'demo-api-key-123': [
    {
      "id": "exp-1758898330832",
      "name": "Button & Text Color Test",
      "status": "active",
      "trafficAllocation": 100,
      "variations": [
        {
          "id": "control",
          "name": "Control (Original Blue)",
          "weight": 33,
          "changes": [
            {
              "selector": ".btn-primary",
              "type": "text",
              "value": "Original Button"
            }
          ]
        },
        {
          "id": "variation-a",
          "name": "Green Button Variation",
          "weight": 33,
          "changes": [
            {
              "selector": ".btn-primary",
              "type": "style",
              "value": "background-color: #28a745; border-color: #28a745;"
            },
            {
              "selector": ".btn-primary",
              "type": "text",
              "value": "Green Action Button"
            }
          ]
        },
        {
          "id": "variation-b",
          "name": "Red Button + Header Text",
          "weight": 34,
          "changes": [
            {
              "selector": ".btn-primary",
              "type": "style",
              "value": "background-color: #dc3545; border-color: #dc3545;"
            },
            {
              "selector": ".btn-primary",
              "type": "text",
              "value": "Red CTA Button"
            },
            {
              "selector": "h1",
              "type": "style",
              "value": "color: #dc3545;"
            },
            {
              "selector": "h1",
              "type": "text",
              "value": "Simple A/B Testing Demo"
            }
          ]
        }
      ]
    }
  ],
  'demo-exp-example-demo-1759012391585': [
    {
      "id": "exp-example-demo",
      "name": "Button & Text Color Test (Example)",
      "status": "active",
      "trafficAllocation": 100,
      "variations": [
        {
          "id": "control",
          "name": "Control (Original Blue)",
          "weight": 33,
          "changes": [
            {
              "selector": ".btn-primary",
              "type": "text",
              "value": "Original Button"
            }
          ]
        },
        {
          "id": "variation-a",
          "name": "Green Button Variation",
          "weight": 33,
          "changes": [
            {
              "selector": ".btn-primary",
              "type": "style",
              "value": "background-color: #28a745; border-color: #28a745;"
            },
            {
              "selector": ".btn-primary",
              "type": "text",
              "value": "Green Action Button"
            }
          ]
        },
        {
          "id": "variation-b",
          "name": "Red Button + Header Text",
          "weight": 34,
          "changes": [
            {
              "selector": ".btn-primary",
              "type": "style",
              "value": "background-color: #dc3545; border-color: #dc3545;"
            },
            {
              "selector": ".btn-primary",
              "type": "text",
              "value": "Red CTA Button"
            },
            {
              "selector": "h1",
              "type": "style",
              "value": "color: #dc3545;"
            },
            {
              "selector": "h1",
              "type": "text",
              "value": "Simple A/B Testing Demo"
            }
          ]
        }
      ]
    }
  ],
  'test-key-456': [
    {
      "id": "exp-header-test",
      "name": "Header Text Test",
      "status": "active", 
      "trafficAllocation": 50,
      "variations": [
        {
          "id": "control",
          "name": "Original Header",
          "weight": 50,
          "changes": []
        },
        {
          "id": "variation-a",
          "name": "New Header",
          "weight": 50,
          "changes": [
            {
              "selector": "h1",
              "type": "text",
              "value": "Welcome to Our Amazing Product!"
            }
          ]
        }
      ]
    }
  ]
};

export default experimentsDatabase;

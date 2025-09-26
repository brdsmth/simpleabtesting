// Mock database of experiments by API key
const experimentsDatabase = {
  'demo-api-key-123': [
    {
      "id": "exp-1758898330832",
      "name": "Button Color Test",
      "status": "active",
      "trafficAllocation": 100,
      "variations": [
        {
          "id": "control",
          "name": "Control (Original)",
          "weight": 50,
          "changes": [
            {
              "selector": ".btn-primary",
              "type": "html",
              "value": "Original Button"
            }
          ]
        },
        {
          "id": "variation-a",
          "name": "Green Button",
          "weight": 50,
          "changes": [
            {
              "selector": ".btn-primary",
              "type": "style",
              "value": "background-color: #28a745; border-color: #28a745;"
            },
            {
              "selector": ".btn-primary",
              "type": "text",
              "value": "Green Test Button"
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

module.exports = experimentsDatabase;

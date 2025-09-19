# Getting Started

## Prerequisites
- Node.js 18+
- Docker and Docker Compose

## Quick Start

This project uses Docker Compose to manage its services.

### 1. Setup and Run

To get the application running quickly:

```bash
npm run setup
docker-compose up -d
```

### 2. Access Services

Once the services are up, you can access them at:

- **Lander**: [http://localhost:8080](http://localhost:8080)
- **Frontend Dashboard**: [http://localhost:8081](http://localhost:8081)
- **API (serves SDK)**: [http://localhost:3000](http://localhost:3000)
- **Demo Application**: [http://localhost:8082](http://localhost:8082)

### 3. Create Your First Experiment

1. Open the Frontend Dashboard: [http://localhost:8081](http://localhost:8081)
2. Create a new experiment with variations.
3. The SDK is served by the `api` service at [http://localhost:3000/sdk.js](http://localhost:3000/sdk.js). The demo page is already configured to load it.
4. Test it on the Demo page: [http://localhost:8082](http://localhost:8082)

### 4. Testing A/B Variations on the Demo Page

To see different A/B variations on the demo page, you need to reset your visitor ID and assignments. The demo page provides buttons for this:

- **Clear Assignments**: Clears only the experiment assignments.
- **Clear Events**: Clears only the tracking events.
- **Clear Visitor ID (Full Reset)**: Clears visitor ID, assignments, and events. This is recommended to get a new variation.

After clicking "Clear Visitor ID (Full Reset)", refresh the demo page ([http://localhost:8082](http://localhost:8082)) to be assigned a new variation.

## Example Usage

### Simple Button Color Test

```html
<!-- Add to your website -->
<script src="http://localhost:3000/sdk.js"></script>
<script>
SimpleABTesting.init({
  debug: true,
  experiments: [{
    id: 'button-test',
    name: 'Button Color Test',
    status: 'active',
    trafficAllocation: 100,
    variations: [
      { 
        id: 'control', 
        name: 'Control', 
        weight: 50, 
        changes: [] 
      },
      { 
        id: 'red-button', 
        name: 'Red Button', 
        weight: 50, 
        changes: [{ 
          selector: '.btn-primary', 
          type: 'style', 
          value: 'background: red; color: white' 
        }]
      }
    ]
  }]
});
</script>
```

### Track Conversions

```javascript
// Track when user completes desired action
SimpleABTesting.track('button-test', 'conversion');
```

## How It Works

1. **SDK loads** and reads experiment config
2. **Visitor assigned** to variation based on consistent hash
3. **DOM changes applied** according to assigned variation
4. **Events tracked** in localStorage
5. **Debug info** available in browser console

## Troubleshooting

**SDK not loading?**
- Check that the `api` service is running (port 3000)
- Look for errors in browser console

**No variations showing?**  
- Verify CSS selectors match your page elements
- Check that experiment status is 'active'
- Ensure variation weights sum to 100

**Always same variation?**
- This is expected behavior for consistent user experience.
- To see a new variation, use the "Clear Visitor ID (Full Reset)" button on the demo page, or run `window.SimpleABTesting.reset()` in the browser console, then refresh the page.

## File Structure

```
simple-ab-testing/
├── api/           # Server for SDK
├── demo/          # Demo page
├── docs/          # Documentation
├── frontend/      # React dashboard  
├── lander/        # Homepage
├── sdk/           # TypeScript SDK source
└── README.md
```
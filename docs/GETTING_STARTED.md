# Getting Started

## Prerequisites
- Node.js 18+
- Modern web browser

## Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start Development Servers

**3 terminals needed:**

```bash
# Terminal 1: SDK server (port 3002)
npm run dev:sdk

# Terminal 2: Dashboard (port 3000)  
npm run dev:frontend

# Terminal 3: Demo page (port 3001)
npm run dev:demo
```

### 3. Create Your First Experiment

1. **Dashboard**: Go to http://localhost:3000
2. **Create experiment** with variations and DOM changes
3. **Copy generated SDK code**
4. **Test it**: Go to http://localhost:3001 to see it working

## Example Usage

### Simple Button Color Test

```html
<!-- Add to your website -->
<script src="http://localhost:3002/simple-ab-testing.umd.js"></script>
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
- Check that SDK server is running on port 3002
- Look for errors in browser console

**No variations showing?**  
- Verify CSS selectors match your page elements
- Check that experiment status is 'active'
- Ensure variation weights sum to 100

**Always same variation?**
- This is correct! Same visitor gets same variation
- Clear localStorage to simulate new visitor
- Use `SimpleABTesting.reset()` to reassign

## File Structure

```
simple-ab-testing/
├── sdk/           # TypeScript SDK source
├── frontend/      # React dashboard  
├── demo/          # Demo page
└── README.md      # Main documentation
```

That's it! Simple A/B testing with minimal setup.
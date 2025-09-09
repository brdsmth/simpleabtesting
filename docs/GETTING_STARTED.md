# Getting Started with Simple A/B Testing

## Prerequisites
- Node.js 18+ and npm 9+
- A modern web browser

## Quick Start

### 1. Install Dependencies
```bash
# Install dependencies for all packages
npm run install-all
```

### 2. Start All Development Servers
You'll need **3 terminal windows/tabs**:

**Terminal 1 - SDK Development Server (Port 3002):**
```bash
npm run dev:sdk
```
This compiles the TypeScript SDK and serves it at `http://localhost:3002/simple-ab-testing.umd.js`

**Terminal 2 - Frontend Dashboard (Port 3000):**
```bash
npm run dev:frontend
```
This starts the React dashboard where you create experiments at `http://localhost:3000`

**Terminal 3 - Demo Page (Port 3001):**
```bash
npm run dev:demo
```
This starts the demo website where you can test your experiments at `http://localhost:3001`

### 3. Create Your First Experiment

1. **Open the Dashboard**: Go to http://localhost:3000
2. **Create an Experiment**:
   - Click "New Experiment"
   - Name it (e.g., "Button Color Test")
   - Set traffic allocation (100% for testing)
   - Add variations with DOM changes
3. **Save the Experiment**
4. **Test It**: Click "Open Demo" or go to http://localhost:3001

### 4. Example Experiment Setup

Try creating this simple experiment:

**Experiment Name:** "Homepage Button Test"
**Traffic Allocation:** 100%

**Variation A (Control):**
- Name: "Original"
- Weight: 50%
- Changes: (none)

**Variation B:**
- Name: "Red Button"
- Weight: 50%
- Changes:
  - Selector: `.btn-primary`
  - Type: `style`
  - Value: `background: #ef4444; border-color: #dc2626`

## How It Works

1. **SDK** (Port 3002): Compiles TypeScript into a browser-ready JavaScript library
2. **Frontend** (Port 3000): React app for creating and managing experiments
3. **Demo** (Port 3001): Sample website that loads the SDK and runs experiments

## Troubleshooting

**SDK not loading on demo page?**
- Make sure the SDK server is running on port 3002
- Check browser console for errors
- Verify the SDK URL in the demo page matches `http://localhost:3002`

**Experiments not applying?**
- Check the CSS selectors in your experiment match elements on the demo page
- Open browser dev tools and look for console messages from `[SimpleAB]`
- Try refreshing the demo page to get a different variation

**Ports already in use?**
- SDK: Change port in `sdk/vite.config.ts`
- Frontend: Change port in `frontend/vite.config.ts`
- Demo: Change port in `demo/vite.config.ts`

## Available URLs

- **Frontend Dashboard**: http://localhost:3000
- **Demo Page**: http://localhost:3001  
- **SDK File**: http://localhost:3002/simple-ab-testing.umd.js

## Next Steps

Once everything is running:
1. Create experiments in the dashboard
2. Test them on the demo page
3. Copy the SDK integration code to use on your own websites
4. Check the browser's localStorage to see visitor assignments and tracking data

## Building for Production

```bash
# Build all packages
npm run build:all

# Or build individually
npm run build:sdk      # Creates dist/simple-ab-testing.umd.js
npm run build:frontend # Creates frontend/dist/
npm run build:demo     # Creates demo/dist/
```

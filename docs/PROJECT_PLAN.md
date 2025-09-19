# Simple A/B Testing - Project Plan

## Vision
Build a lightweight, open-source frontend A/B testing tool for product managers. Think Google Optimize but simpler and focused on frontend DOM manipulation.

## Components

### 1. SDK (`/sdk`)
- **Purpose**: Lightweight JavaScript library for A/B testing
- **Size**: ~10KB minified
- **Features**: DOM manipulation, visitor assignment, event tracking
- **Usage**: `<script src="sdk.js"></script>`

### 2. Frontend Dashboard (`/frontend`) 
- **Purpose**: Visual experiment builder
- **Tech**: React + TypeScript + Vite
- **Features**: Create experiments, generate SDK code, preview
- **Output**: Experiment configuration for SDK

### 3. Demo (`/demo`)
- **Purpose**: Test the SDK in action
- **Tech**: React + TypeScript
- **Features**: Load SDK, show different variations, debug info

## Current Status: MVP Complete

- **SDK**: DOM manipulation, visitor assignment, localStorage persistence
- **Frontend**: Experiment builder with variations and DOM changes  
- **Demo**: Working A/B test with multiple button color variations
- **Debug**: Console logging for assignment tracking

## How It Works

1. **Create Experiment**: Use frontend dashboard to build A/B test
2. **Generate Code**: Dashboard outputs SDK integration code
3. **Add to Site**: Include SDK script tag (e.g., from http://localhost:3000/sdk.js) with experiment config
4. **Run Test**: SDK assigns visitors to variations and applies DOM changes
5. **Track Results**: Events stored in localStorage (for now)

## Future Enhancements

### Phase 2
- **API**: Store experiments server-side
- **Real Analytics**: Send events to backend for analysis
- **Advanced Targeting**: Geo, device, user properties
- **Statistical Analysis**: Confidence intervals, significance testing

### Phase 3
- **Visual Editor**: Point-and-click experiment creation
- **Integrations**: Google Analytics, Mixpanel, etc.
- **Team Features**: Collaboration, permissions, approval workflows

## Keep It Simple

The current implementation is intentionally minimal but this is subject to change:
- **No database required** - experiments defined in code
- **No backend API** - direct SDK configuration  
- **No complex analytics** - localStorage tracking
- **No user management** - open frontend tool

This makes it easy to:
- Self-host
- Understand  
- Modify
- Deploy
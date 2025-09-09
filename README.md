# Simple A/B Testing 🧪

> The best open-source frontend A/B testing tool for product managers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

Simple A/B Testing is an open-source alternative to Google Optimize, designed specifically for non-technical and slightly technical product managers who want to run frontend experiments without complexity.

## ✨ Features

### 🎯 Core Features
- **Visual Experiment Editor**: Create A/B tests without coding
- **Lightweight SDK**: < 50KB impact on your site
- **Real-time Analytics**: Statistical significance and conversion tracking
- **Easy Integration**: One script tag to get started
- **Frontend-First**: Optimized for UI/UX testing

### 🚀 Coming Soon
- Multivariate testing
- Advanced targeting (geo, device, etc.)
- Heatmaps and session recordings
- Third-party integrations

## 🏁 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/simple-ab-testing
cd simple-ab-testing
npm run install-all
```

### 2. Start Development Servers
```bash
# Terminal 1: Start SDK development server (port 3002)
npm run dev:sdk

# Terminal 2: Start Frontend dashboard (port 3000)
npm run dev:frontend

# Terminal 3: Start Demo page (port 3001)
npm run dev:demo
```

### 3. Create Your First Experiment
1. Open http://localhost:3000 (Frontend Dashboard)
2. Create a new experiment with variations
3. Copy the generated SDK code
4. Test it on http://localhost:3001 (Demo Page)

### 4. See It In Action
- **Dashboard**: http://localhost:3000 - Build experiments
- **Demo Page**: http://localhost:3001 - See experiments running
- **SDK**: http://localhost:3002 - The compiled SDK file

## 🏗️ Architecture

```
Frontend Dashboard (React + TypeScript)
           ↕
Backend API (Node.js + TypeScript)
           ↕
PostgreSQL Database
           ↕
Client SDK (TypeScript) → Your Website
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Local Setup
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev:backend  # Backend API on :3001
npm run dev:frontend # Frontend on :3000
```

### Project Structure
```
simple-ab-testing/
├── packages/
│   ├── frontend/     # React dashboard
│   ├── backend/      # Node.js API
│   ├── sdk/          # TypeScript SDK
│   └── shared/       # Shared types/utils
├── docs/             # Documentation
├── scripts/          # Build/deployment scripts
└── docker/           # Docker configurations
```

## 📖 Documentation

- [Project Plan & Strategy](./PROJECT_PLAN.md)
- [API Documentation](./docs/API.md) *(coming soon)*
- [SDK Guide](./docs/SDK.md) *(coming soon)*
- [Self-Hosting Guide](./docs/DEPLOYMENT.md) *(coming soon)*
- [Contributing Guidelines](./CONTRIBUTING.md) *(coming soon)*

## 🤝 Contributing

We welcome contributions! This project is in early development, so there are many opportunities to get involved.

### Development Phases
- **Phase 1** (Current): MVP with basic A/B testing
- **Phase 2**: Enhanced features and analytics
- **Phase 3**: Production-ready with advanced capabilities

See our [Project Plan](./PROJECT_PLAN.md) for detailed roadmap.

## 📊 Roadmap

### MVP (Phase 1) - Weeks 1-4
- [x] Project setup and planning
- [ ] User authentication system
- [ ] Basic experiment management
- [ ] Core SDK functionality
- [ ] Simple analytics dashboard

### Enhanced Features (Phase 2) - Weeks 5-8
- [ ] Visual experiment editor
- [ ] Advanced DOM manipulation
- [ ] Real-time analytics
- [ ] Statistical significance testing

### Production Ready (Phase 3) - Weeks 9-12
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Docker containerization
- [ ] Comprehensive documentation

## 💰 Pricing

### Open Source (Free)
- Full feature set
- Self-hosting
- Community support
- MIT License

### Managed Cloud Service
- **Starter**: Free (up to 1,000 visitors/month)
- **Professional**: $29/month (unlimited)
- **Enterprise**: Custom pricing

## 🌟 Why Choose Simple A/B Testing?

| Feature | Simple A/B Testing | Google Optimize | Optimizely | VWO |
|---------|-------------------|-----------------|------------|-----|
| **Open Source** | ✅ | ❌ | ❌ | ❌ |
| **Self-Hosted** | ✅ | ❌ | ❌ | ❌ |
| **Visual Editor** | ✅ | ✅ | ✅ | ✅ |
| **Lightweight SDK** | ✅ (< 50KB) | ❌ | ❌ | ❌ |
| **Non-Technical Friendly** | ✅ | ✅ | ❌ | ✅ |
| **Cost** | Free/Low | Discontinued | High | High |

## 📞 Support

- **Documentation**: Check our [docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/simple-ab-testing/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/simple-ab-testing/discussions)
- **Email**: support@simple-ab-testing.com *(coming soon)*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Google Optimize (RIP)
- Built for the product management community
- Open source contributors and supporters

---

**⭐ Star this repo if you find it useful!**

Made with ❤️ for product managers who want to test without complexity.

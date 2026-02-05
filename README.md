# Simple A/B Testing 🧪

> The best open-source frontend A/B testing tool for product managers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

Simple A/B Testing is an open-source alternative to Google Optimize, designed specifically for product managers who want to run frontend experiments without complexity.

## Features

### Core Features
- **Visual Experiment Editor**: Create A/B tests without coding
- **Lightweight SDK**: < 50KB impact on your site
- **Real-time Analytics**: Statistical significance and conversion tracking
- **Easy Integration**: One script tag to get started
- **Frontend-First**: Optimized for UI/UX testing

### Coming Soon
- Multivariate testing
- Advanced targeting (geo, device, etc.)
- Heatmaps and session recordings
- Third-party integrations

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

## Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Modern web browser

### Local Setup

1.  **Install all dependencies and build local assets:**
    ```bash
    npm run setup
    ```
    *(This script will navigate into each service directory, install dependencies, and build the SDK and Demo applications.)*

2.  **Start all services with Docker Compose:**
    ```bash
    docker-compose up -d
    ```

3.  **Access Services:**
    - **Lander**: [http://localhost:8080](http://localhost:8080)
    - **Frontend Dashboard**: [http://localhost:8081](http://localhost:8081)
    - **API (serves SDK)**: [http://localhost:3000](http://localhost:3000)
    - **Demo Application**: [http://localhost:8082](http://localhost:8082)

To stop the services:
```bash
docker-compose down
```

### Production Deployment

To deploy to AWS using Pulumi:

```bash
# Quick deploy
cd api && npm run build:lambda
cd ../infra && pulumi up
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

**Architecture**: Serverless hybrid with RDS Aurora Serverless v2, Lambda, API Gateway, and CloudFront CDN.

## Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md)
- [Project Plan](./docs/PROJECT_PLAN.md)
- [API Documentation](./api/README.md)
- [Infrastructure Guide](./infra/README.md)

## Contributing

We welcome contributions! This project is in early development, so there are many opportunities to get involved.

### Development Phases
- **Phase 1** (Current): MVP with basic A/B testing
- **Phase 2**: Enhanced features and analytics
- **Phase 3**: Production-ready with advanced capabilities

See our [Project Plan](./docs/PROJECT_PLAN.md) for detailed roadmap.

## Roadmap

### MVP (Phase 1) - Weeks 1-4
- [x] Project setup and planning
- [x] Core SDK functionality
- [ ] Basic experiment management
- [ ] User authentication system
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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

- **Documentation**: Check our [docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/simple-ab-testing/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/simple-ab-testing/discussions)
- **Email**: support@simpleabtesting.com *(coming soon)*

---

**⭐ Star this repo if you find it useful!**

Made with ❤️ for product managers who want to test without complexity.

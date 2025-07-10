# 🌍 Shake Tracker

[![CI](https://github.com/bugracinbat/shake-tracker/workflows/CI/badge.svg)](https://github.com/bugracinbat/shake-tracker/actions/workflows/ci.yml)
[![Deploy](https://github.com/bugracinbat/shake-tracker/workflows/Deploy%20to%20Production/badge.svg)](https://github.com/bugracinbat/shake-tracker/actions/workflows/deploy.yml)
[![Lighthouse](https://img.shields.io/badge/lighthouse-performance-brightgreen)](https://github.com/bugracinbat/shake-tracker/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

A modern, real-time earthquake tracking application built with React, TypeScript, and Material-UI. Monitor seismic activities around the world with an intuitive and beautiful interface.

🔗 **[Live Demo](https://bugracinbat.github.io/shake-tracker/)**

## 📸 Screenshots

### Main Dashboard

![Main Dashboard](./docs/screenshots/dashboard.png)
_Real-time earthquake map and recent activity list_

### Analytics View

![Analytics View](./docs/screenshots/analytics.png)
_Detailed earthquake analytics and statistics_

### Dark Mode

![Dark Mode](./docs/screenshots/dark-mode.png)
_Application in dark mode_

## ✨ Features

- 🌐 Real-time earthquake data visualization
- 📊 Interactive map with earthquake locations powered by Leaflet
- 📈 Comprehensive analytics dashboard with statistics
- 🎯 Advanced risk assessment system
- 🔔 Smart earthquake alert notifications
- 🌙 Dark/Light mode support
- 📱 Responsive design for all devices (mobile-first)
- 🔄 Auto-refresh functionality
- 🔍 Advanced search and filtering with multiple criteria
- 📍 Location-based earthquake tracking
- 📊 Data visualization with charts and graphs
- 🎨 Modern UI with Material-UI v7 and Flexbox layouts
- 🚨 Real-time earthquake alerts with customizable settings

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/bugracinbat/shake-tracker.git
cd shake-tracker
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Testing

This project includes comprehensive testing with Playwright:

```bash
# Run all tests
npm test

# Run tests in Chrome only
npm run test:chrome

# Run Lighthouse performance tests
npm run test:lighthouse

# Run tests with UI mode
npm run test:ui
```

## 🚀 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### Workflows

- **CI** - Runs on every push and PR to main/develop branches

  - ✅ ESLint and TypeScript checking
  - ✅ Build verification
  - ✅ End-to-end tests with Playwright
  - ✅ Lighthouse performance audits
  - ✅ Security vulnerability scanning

- **Deploy** - Automatic deployment to production

  - 🚀 Deploys to GitHub Pages, Netlify, and Vercel
  - 📊 Post-deployment smoke tests
  - 📱 Slack notifications

- **Pull Request Checks** - Enhanced PR workflow

  - 📝 Automatic PR analysis and comments
  - 🎨 Visual regression testing
  - 📊 Performance impact analysis
  - 📦 Bundle size monitoring

- **Dependency Management** - Weekly dependency updates
  - 🔒 Security audit scanning
  - 📦 Automated dependency updates
  - 🤖 Auto-generated update PRs

### Performance Monitoring

- Lighthouse audits run on every PR and deployment
- Performance regression detection
- Bundle size tracking
- Core Web Vitals monitoring
- [📊 How to view Lighthouse reports](docs/lighthouse-reports.md)

## 🔧 Technical Highlights

### Modern Architecture
- **React 19** with latest features and optimizations
- **TypeScript 5.8** for type safety and better developer experience
- **Material-UI v7** with modern design system and Flexbox layouts
- **Vite 6** for lightning-fast development and builds

### Key Components
- **EarthquakeMap**: Interactive map with real-time earthquake markers
- **EarthquakeRiskAssessment**: Advanced risk analysis based on location and earthquake patterns
- **EarthquakeStatsDashboard**: Comprehensive statistics with charts and visualizations
- **EarthquakeFilters**: Advanced filtering system with multiple criteria
- **AlertSettings**: Customizable earthquake alert system

### Recent Improvements
- ✅ Migrated from Material-UI Grid to modern Flexbox layouts
- ✅ Updated to Material-UI v7 with latest components
- ✅ Fixed TypeScript compatibility issues
- ✅ Improved performance and accessibility
- ✅ Enhanced responsive design for better mobile experience

## 🛠️ Built With

- [React](https://reactjs.org/) v19 - Frontend framework
- [TypeScript](https://www.typescriptlang.org/) v5.8 - Type safety
- [Material-UI](https://mui.com/) v7 - UI components with modern design system
- [Vite](https://vitejs.dev/) v6 - Build tool and development server
- [React Router](https://reactrouter.com/) v7 - Client-side routing
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [React-Leaflet](https://react-leaflet.js.org/) - React bindings for Leaflet
- [Recharts](https://recharts.org/) - Chart library for data visualization
- [Axios](https://axios-http.com/) - HTTP client for API calls
- [Date-fns](https://date-fns.org/) - Date manipulation utilities
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [USGS Earthquake API](https://earthquake.usgs.gov/fdsnws/event/1/) - Real-time earthquake data

## 📦 Project Structure

```
shake-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── EarthquakeMap.tsx           # Interactive map component
│   │   ├── EarthquakeList.tsx          # List of earthquakes
│   │   ├── EarthquakeFilters.tsx       # Advanced filtering system
│   │   ├── EarthquakeAnalytics.tsx     # Analytics dashboard
│   │   ├── EarthquakeRiskAssessment.tsx # Risk assessment system
│   │   ├── EarthquakeStatsDashboard.tsx # Statistics dashboard
│   │   ├── AlertSettings.tsx           # Alert configuration
│   │   └── ...                         # Other components
│   ├── hooks/               # Custom React hooks
│   │   ├── useEarthquakeFilters.ts     # Filter management
│   │   └── useEarthquakeAlerts.ts      # Alert system
│   ├── services/            # API services
│   │   └── earthquakeService.ts        # USGS API integration
│   ├── types/               # TypeScript type definitions
│   │   └── earthquake.ts               # Earthquake data types
│   ├── utils/               # Utility functions
│   └── App.tsx              # Main application component
├── public/                  # Static assets
├── tests/                   # Test files
│   ├── lighthouse/          # Performance tests
│   └── ...                  # Other test files
└── docs/                    # Documentation and screenshots
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- USGS for providing the earthquake data API
- Material-UI for the beautiful component library
- All contributors who have helped shape this project

---

Made with ❤️ by [Bora Cinbat]

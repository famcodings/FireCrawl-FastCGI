# InfoBud PoC Frontend

A modern React application for web scraping and crawling operations.

## 🚀 Features

- **Modern React**: Built with React 18+ and modern hooks
- **Real-time Updates**: WebSocket integration for live status updates
- **Error Boundaries**: Graceful error handling with fallback UI
- **Responsive Design**: Mobile-first responsive design
- **Form Validation**: Client-side validation with user-friendly error messages
- **Loading States**: Proper loading indicators and feedback
- **Code Quality**: ESLint and Prettier configuration

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.js # Error boundary for crash protection
│   ├── LoadingSpinner.js # Loading indicators
│   ├── CrawlForm.js     # Main form component
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useCrawl.js      # Main crawl operations hook
│   └── index.js
├── services/            # API and WebSocket services
│   ├── apiService.js    # HTTP API calls
│   ├── webSocketService.js # WebSocket management
│   └── index.js
├── utils/               # Utility functions
│   ├── constants.js     # App constants
│   ├── validation.js    # Form validation utilities
│   └── index.js
├── config/              # Configuration files
│   ├── environment.js   # Environment-specific config
│   └── index.js
└── App.js               # Main application component
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Available Scripts

```bash
# Development
npm start              # Start development server
npm run build          # Build for production

# Code Quality
npm run lint           # Check code with ESLint
npm run lint:fix       # Fix ESLint issues automatically
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting

# Analysis
npm run analyze        # Build and serve for bundle analysis
```

### Environment Configuration

Create a `.env.local` file for local development:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_NAME="InfoBud PoC"
REACT_APP_VERSION=1.0.0
```

## 🏗️ Architecture

### Component Design

- **Functional Components**: All components use modern functional patterns
- **Custom Hooks**: Business logic extracted into reusable hooks
- **Error Boundaries**: Components wrapped in error boundaries for stability
- **Prop Validation**: Runtime prop validation for development

### State Management

- **React Hooks**: useState, useEffect for local state
- **Custom Hooks**: useCrawl for complex state logic
- **Form State**: Controlled components with validation

### API Integration

- **Axios**: HTTP client for API calls
- **WebSocket**: Real-time communication
- **Error Handling**: Comprehensive error handling with user feedback

## 🧪 Testing

Testing setup is not currently configured. You can add Jest and React Testing Library later if needed for your testing requirements.

## 📝 Code Style

- **ESLint**: JavaScript/React linting with react-app config
- **Prettier**: Code formatting with consistent style
- **Husky**: Git hooks for pre-commit checks (optional)

Format code:

```bash
npm run format          # Format all files
npm run lint:fix        # Fix linting issues
```

## 🔧 Configuration Files

- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `package.json` - Dependencies and scripts
- `public/manifest.json` - PWA configuration

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The build folder contains optimized production files.

### Docker

The frontend is containerized using multi-stage Docker build:

- **Build Stage**: Node.js for building the React app
- **Serve Stage**: Nginx for serving static files

## 🔒 Security

- **XSS Protection**: React's built-in XSS protection
- **Input Validation**: Client-side validation (with server-side backup)
- **Error Handling**: Safe error messages without exposing internals
- **Environment Variables**: Secure configuration management

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Follow the established code style
2. Update documentation for new features
3. Use meaningful commit messages
4. Run linting and formatting before committing

## 📄 License

This project is part of the InfoBud PoC application suite.

# FireCrawl - AI-Powered Company Analysis Tool

A modern, containerized full-stack application that uses Firecrawl's Extract API to analyze company websites and extract comprehensive business insights. Built with FastAPI, React (with Tailwind CSS), Redis, and Docker. Features a beautiful macOS-style glass morphism UI with real-time WebSocket updates.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose
- Firecrawl API key

### 1. Clone and Setup
```bash
git clone <repository-url>
cd "FireCrawl - FastCGI"
cp env.example .env
```

### 2. Configure Environment
Edit `.env` file and add your Firecrawl API key:
```env
FIRECRAWL_API_KEY=your_actual_api_key_here
REDIS_URL=redis://redis:6379
HOST=0.0.0.0
PORT=8000
```

### 3. Start the Application

#### For Development (with hot reload)
```bash
# Start development environment with hot reloading
make dev

# Stop development environment
make dev-stop

# View development logs
make dev-logs
```

#### For Production
```bash
# Using Makefile (recommended)
make start

# Or using docker compose directly
docker compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Redis**: localhost:6379

## 🏗️ Architecture

### Modular Backend Structure
```
backend/
├── app.py                   # Main FastAPI application
├── config.py                # Configuration management
├── models.py                # Pydantic models
├── Dockerfile               # Backend container configuration
├── services/                # Service layer
│   ├── __init__.py         # Service package initialization
│   ├── redis_service.py     # Redis operations
│   ├── firecrawl_service.py # Firecrawl API integration
│   └── websocket_service.py # WebSocket management
└── routes/                  # API routes
    ├── __init__.py         # Routes package initialization
    └── api.py              # REST endpoints
```

### Component-Based Frontend
```
frontend/
├── src/
│   ├── App.js              # Main application component
│   ├── index.js            # Application entry point
│   ├── index.css           # Global styles and animations
│   ├── components/          # Reusable UI components
│   │   ├── index.js        # Component exports
│   │   ├── Header.js       # Application header
│   │   ├── CrawlForm.js    # Analysis form with validation
│   │   ├── StatusDisplay.js # Status indicator with animations
│   │   ├── ResultDisplay.js # Results presentation with modal
│   │   ├── LoadingSpinner.js # Loading animations
│   │   └── Modal.js        # Modal component for detailed content
│   ├── services/           # External service integration
│   │   ├── index.js        # Service exports
│   │   ├── apiService.js   # Backend API communication
│   │   └── webSocketService.js # Real-time WebSocket updates
│   ├── hooks/              # Custom React hooks
│   │   ├── index.js        # Hook exports
│   │   └── useCrawl.js     # Crawl operation management
│   ├── config/             # Configuration files
│   │   ├── index.js        # Config exports
│   │   └── environment.js  # Environment-specific settings
│   └── utils/              # Utility functions
│       ├── index.js        # Utility exports
│       ├── constants.js    # Application constants
│       └── validation.js  # Form validation helpers
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   ├── favicon.ico        # Site icon
│   ├── manifest.json      # PWA manifest
│   └── robots.txt         # SEO robots file
├── build/                 # Production build output
├── Dockerfile             # Production container config
├── Dockerfile.dev         # Development container config
├── nginx.conf             # Nginx configuration
├── package.json           # Node.js dependencies
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## 🐳 Docker Management

### Using Makefile (Recommended)
```bash
make start     # Start the application
make stop      # Stop the application
make restart   # Restart the application
make logs      # View application logs
make test      # Run health checks
make clean     # Clean up Docker resources
make help      # Show all available commands
```

### Development Commands
```bash
# Development environment
make dev           # Start development mode with hot reload
make dev-stop      # Stop development environment
make dev-logs      # View development logs

# Additional commands
make build         # Build Docker images
make status        # Show container status
make install       # Install dependencies locally
make lint          # Run linting checks
make format        # Format code
```

### Docker Configurations

#### Production Setup (`docker-compose.yml`)
- Frontend built with Nginx for optimal performance
- Multi-stage builds for smaller image sizes
- Health checks for all services

#### Development Setup (`docker-compose.dev.yml`)
- Frontend runs with `npm start` for hot reloading
- Volume mounting for real-time file sync
- Development environment variables

### Using Docker Compose Directly
```bash
# Production environment
docker compose up -d --build

# Development environment
docker compose -f docker-compose.dev.yml up -d --build

# View logs
docker compose logs -f
# Or for development
docker compose -f docker-compose.dev.yml logs -f

# Stop services
docker compose down
# Or for development
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker compose down -v

# Rebuild specific service
docker compose build backend
docker compose up backend
```

## 🔧 Services

### Redis Service
- **Purpose**: Data persistence and caching
- **Port**: 6379
- **Features**: Request data storage, automatic expiration, health checks

### Backend Service (FastAPI)
- **Purpose**: API server and business logic
- **Port**: 8000
- **Features**: RESTful API, WebSocket support, Firecrawl integration

### Frontend Service (React + Tailwind CSS)
- **Purpose**: User interface with modern glass morphism design
- **Port**: 3000 (development), 80 (production with Nginx)
- **Features**: 
  - Modern React UI with Tailwind CSS
  - macOS-style glass morphism design
  - Real-time WebSocket updates
  - Hot reloading in development mode
  - Responsive design for all devices

## 📡 API Endpoints

### POST /api/crawl
Start a new website analysis.

**Request:**
```json
{
  "url": "https://example.com",
  "company_name": "Example Company"
}
```

**Response:**
```json
{
  "request_id": "uuid-string",
  "status": "started|completed",
  "message": "Crawl started successfully"
}
```

### GET /api/status/{request_id}
Get the status of a crawl request.

**Response:**
```json
{
  "status": "processing|completed|error",
  "url": "https://example.com",
  "company_name": "Example Company",
  "result": {
    "industry": "...",
    "products_services": "...",
    "mission": "...",
    "usp": "...",
    "locations": "...",
    "icp": "..."
  }
}
```

### WebSocket /ws/{request_id}
Real-time updates for crawl progress.

**Message Types:**
- `status`: Current processing status
- `result`: Analysis results when completed
- `error`: Error message if failed

## 🔍 Analysis Features

### Extracted Information
The system analyzes company websites and extracts:

- **Industry**: Company's business sector
- **Products & Services**: What the company offers
- **Mission**: Company's stated or inferred mission
- **USP**: Unique Selling Proposition
- **Locations**: Geographic presence
- **ICP**: Ideal Customer Profile

### Analysis Process
1. **User submits** URL and company name through the React frontend
2. **Backend starts** Firecrawl Extract with specialized sales analysis query
3. **Background polling** checks Firecrawl status every 3 seconds
4. **WebSocket connection** provides real-time updates to the frontend
5. **Results are displayed** when analysis completes

## 🎨 UI Design Features

### Modern Glass Morphism Design
- **macOS-style Interface**: Beautiful glass cards with backdrop blur effects
- **Animated Gradients**: Dynamic background animations and smooth transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Tailwind CSS**: Utility-first CSS framework for rapid development

### Interactive Components
- **Real-time Form Validation**: Instant feedback on user input with URL validation
- **Modal Content Display**: "Show More" buttons open animated modals for detailed content
- **Loading Animations**: Elegant spinners and progress indicators with shimmer effects
- **Status Displays**: Color-coded status updates with smooth transitions and animations
- **Smooth Scrolling**: Automatic scroll to top when starting new analysis

### User Experience
- **Intuitive Navigation**: Clean, modern interface with clear call-to-actions
- **Export Functionality**: Download results as JSON or copy to clipboard
- **Error Handling**: User-friendly error messages with troubleshooting tips
- **Accessibility**: Proper contrast ratios and keyboard navigation support

## 🛠️ Development

### Development Environment Features
- **Hot Reloading**: Frontend changes are reflected immediately without rebuilding
- **Volume Mounting**: Local file changes are synced with Docker containers
- **Separate Dev Containers**: Development and production use different Docker configurations
- **Real-time Updates**: See changes instantly as you code

### Development Setup
#### Docker Development (Recommended)
```bash
# Start full development environment
make dev

# This starts:
# - Frontend with hot reload on port 3000
# - Backend with auto-restart on port 8000
# - Redis for caching
```

#### Local Frontend Development
If you prefer running frontend locally:
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

### File Structure for Development
```
frontend/
├── Dockerfile          # Production build
├── Dockerfile.dev      # Development build with hot reload
├── nginx.conf          # Nginx configuration for production
├── package.json        # Node.js dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── public/             # Static assets (favicon, manifest, etc.)
├── build/              # Production build output
└── src/
    ├── App.js          # Main application component
    ├── index.js        # Application entry point
    ├── index.css       # Global styles and animations
    ├── components/     # React components (Header, CrawlForm, etc.)
    ├── hooks/          # Custom React hooks (useCrawl)
    ├── services/       # API and WebSocket services
    ├── config/         # Environment configuration
    └── utils/          # Utility functions and validation
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `FIRECRAWL_API_KEY` | Your Firecrawl API key | Required |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `HOST` | Backend host | `0.0.0.0` |
| `PORT` | Backend port | `8000` |

### Health Checks
```bash
# Test Redis connection
docker compose exec redis redis-cli ping

# Test backend health
curl http://localhost:8000/docs

# Test frontend
curl http://localhost:3000
```

## 🚀 Production Deployment

### Docker Production Setup
1. **Environment Configuration**: Use production environment variables
2. **SSL/TLS**: Configure certificates for HTTPS
3. **Reverse Proxy**: Use Traefik or Nginx for load balancing
4. **Monitoring**: Add logging and monitoring solutions
5. **Secrets Management**: Use Docker secrets or external secret management

### Scaling Considerations
- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Redis Clustering**: For high availability and performance
- **Database**: Consider PostgreSQL for persistent data storage
- **CDN**: Use CDN for frontend static assets

## 🔧 Troubleshooting

### Common Issues
- **Port Conflicts**: Modify ports in `docker compose.yml` if 3000, 6379, or 8000 are in use
- **Redis Connection**: Ensure Redis service is healthy with `docker compose ps`
- **Firecrawl API**: Verify API key is correctly set in `.env` file
- **WebSocket Issues**: Check CORS settings and firewall rules

### Debugging
```bash
# View service logs
make logs
# Or specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs redis

# Check service status
make status
# Or
docker compose ps

# Access service containers
make shell-backend
make shell-frontend
# Or directly
docker compose exec backend bash
docker compose exec redis redis-cli
```

## 📊 Performance

### Optimization Features
- **Redis Caching**: Request data cached with automatic expiration
- **WebSocket Efficiency**: Real-time updates without polling
- **Docker Optimization**: Multi-stage builds and layer caching
- **Nginx**: Efficient static file serving and API proxying

### Monitoring
- **Health Checks**: Built-in health monitoring for all services
- **Logging**: Structured logging for debugging and monitoring
- **Metrics**: Ready for integration with monitoring solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker Compose
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
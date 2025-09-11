# FireCrawl - Company Analysis Tool

A modern, containerized full-stack application that uses Firecrawl's Extract API to analyze company websites and extract comprehensive business information. Built with FastAPI, React, Redis, and Docker.

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
```bash
# Using the management script
./docker.sh start

# Or using docker-compose directly
docker-compose up -d --build
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
├── services/                # Service layer
│   ├── redis_service.py     # Redis operations
│   ├── firecrawl_service.py # Firecrawl API integration
│   └── websocket_service.py # WebSocket management
└── routes/                  # API routes
    └── api.py              # REST endpoints
```

### Component-Based Frontend
```
frontend/src/
├── App.js                   # Main application component
├── components/              # Reusable UI components
│   ├── Header.js            # Application header
│   ├── CrawlForm.js         # Analysis form
│   ├── StatusDisplay.js     # Status indicator
│   ├── ErrorDisplay.js      # Error messages
│   └── ResultDisplay.js     # Results presentation
├── services/                # External service integration
│   ├── apiService.js        # Backend API communication
│   └── webSocketService.js  # Real-time updates
└── hooks/                   # Custom React hooks
    └── useCrawl.js         # Crawl operation management
```

## 🐳 Docker Management

### Using the Management Script
```bash
./docker.sh start     # Start the application
./docker.sh stop      # Stop the application
./docker.sh restart   # Restart the application
./docker.sh logs      # View application logs
./docker.sh test      # Run health checks
./docker.sh clean     # Clean up Docker resources
```

### Using Docker Compose Directly
```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose up backend
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

### Frontend Service (React + Nginx)
- **Purpose**: User interface
- **Port**: 3000
- **Features**: Modern React UI, API proxying, WebSocket support

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

## 🛠️ Development

### Local Development
For frontend development with hot reload:
```bash
cd frontend
npm install
npm start
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
docker-compose exec redis redis-cli ping

# Test backend health
curl http://localhost:8000/test_firecrawl

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
- **Port Conflicts**: Modify ports in `docker-compose.yml` if 3000, 6379, or 8000 are in use
- **Redis Connection**: Ensure Redis service is healthy with `docker-compose ps`
- **Firecrawl API**: Verify API key is correctly set in `.env` file
- **WebSocket Issues**: Check CORS settings and firewall rules

### Debugging
```bash
# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs redis

# Check service status
docker-compose ps

# Access service containers
docker-compose exec backend bash
docker-compose exec redis redis-cli
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
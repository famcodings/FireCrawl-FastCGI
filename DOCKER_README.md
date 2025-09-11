# FireCrawl - FastCGI Docker Setup

This document explains how to run the FireCrawl application using Docker and Docker Compose.

## Prerequisites

- Docker
- Docker Compose
- FireCrawl API key

## Quick Start

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd "FireCrawl - FastCGI"
   cp env.example .env
   ```

2. **Configure your FireCrawl API key:**
   Edit the `.env` file and add your FireCrawl API key:
   ```
   FIRECRAWL_API_KEY=your_actual_api_key_here
   ```

3. **Run the application:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Redis: localhost:6379

## Services

### Redis
- **Image:** redis:7-alpine
- **Port:** 6379
- **Purpose:** Stores request data and status information
- **Persistence:** Data is persisted in Docker volume `redis_data`

### Backend (FastAPI)
- **Port:** 8000
- **Purpose:** Handles FireCrawl API requests and WebSocket connections
- **Dependencies:** Redis
- **Health Check:** Available at `/test_firecrawl`

### Frontend (React + Nginx)
- **Port:** 3000
- **Purpose:** React application served by Nginx
- **Features:** 
  - Proxies API calls to backend
  - Proxies WebSocket connections to backend
  - Handles React Router for SPA

## Docker Commands

### Build and start all services:
```bash
docker-compose up --build
```

### Start in detached mode:
```bash
docker-compose up -d --build
```

### View logs:
```bash
docker-compose logs -f
```

### Stop services:
```bash
docker-compose down
```

### Stop and remove volumes:
```bash
docker-compose down -v
```

### Rebuild specific service:
```bash
docker-compose build backend
docker-compose up backend
```

## Development

### Hot reload for backend:
The backend is configured with volume mounting for development. Changes to Python files will be reflected immediately.

### Frontend development:
For frontend development, you might want to run the React dev server locally:
```bash
cd frontend
npm install
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FIRECRAWL_API_KEY` | Your FireCrawl API key | Required |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `HOST` | Backend host | `0.0.0.0` |
| `PORT` | Backend port | `8000` |

## Troubleshooting

### Redis connection issues:
- Ensure Redis service is healthy: `docker-compose ps`
- Check Redis logs: `docker-compose logs redis`

### Backend issues:
- Check backend logs: `docker-compose logs backend`
- Verify FireCrawl API key is set correctly
- Test backend health: `curl http://localhost:8000/test_firecrawl`

### Frontend issues:
- Check frontend logs: `docker-compose logs frontend`
- Verify nginx configuration
- Check if backend is accessible from frontend container

### Port conflicts:
If ports 3000, 6379, or 8000 are already in use, modify the `docker-compose.yml` file to use different ports.

## Production Deployment

For production deployment:

1. **Use production environment variables**
2. **Configure proper secrets management**
3. **Set up SSL/TLS certificates**
4. **Configure proper logging and monitoring**
5. **Use a reverse proxy like Traefik or Nginx**

## Data Persistence

- Redis data is persisted in the `redis_data` Docker volume
- To backup Redis data: `docker run --rm -v firecrawl_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .`
- To restore Redis data: `docker run --rm -v firecrawl_redis_data:/data -v $(pwd):/backup alpine tar xzf /backup/redis-backup.tar.gz -C /data`

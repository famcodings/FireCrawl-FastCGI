#!/bin/bash

# FireCrawl Docker Management Script

case "$1" in
    "start")
        echo "🚀 Starting FireCrawl application..."
        docker-compose up -d --build
        echo "✅ Application started!"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:8000"
        ;;
    "stop")
        echo "🛑 Stopping FireCrawl application..."
        docker-compose down
        echo "✅ Application stopped!"
        ;;
    "restart")
        echo "🔄 Restarting FireCrawl application..."
        docker-compose down
        docker-compose up -d --build
        echo "✅ Application restarted!"
        ;;
    "logs")
        echo "📊 Showing logs..."
        docker-compose logs -f
        ;;
    "test")
        echo "🧪 Running tests..."
        ./test_docker.sh
        ;;
    "clean")
        echo "🧹 Cleaning up Docker resources..."
        docker-compose down -v
        docker system prune -f
        echo "✅ Cleanup completed!"
        ;;
    *)
        echo "FireCrawl Docker Management Script"
        echo ""
        echo "Usage: $0 {start|stop|restart|logs|test|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the application"
        echo "  stop    - Stop the application"
        echo "  restart - Restart the application"
        echo "  logs    - Show application logs"
        echo "  test    - Run health checks"
        echo "  clean   - Clean up Docker resources"
        ;;
esac

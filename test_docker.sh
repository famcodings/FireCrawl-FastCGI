#!/bin/bash

# Docker Test Script for FireCrawl Application
echo "🚀 Testing FireCrawl Docker Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from env.example..."
    cp env.example .env
    echo "📝 Please edit .env file and add your FIRECRAWL_API_KEY"
    echo "   Then run this script again."
    exit 1
fi

# Check if FIRECRAWL_API_KEY is set
if ! grep -q "FIRECRAWL_API_KEY=your_firecrawl_api_key_here" .env; then
    echo "✅ FIRECRAWL_API_KEY appears to be configured"
else
    echo "⚠️  Please set your FIRECRAWL_API_KEY in the .env file"
    exit 1
fi

echo "🔧 Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Test Redis connection
echo "🔍 Testing Redis connection..."
if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is running"
else
    echo "❌ Redis connection failed"
    docker-compose logs redis
    exit 1
fi

# Test Backend health
echo "🔍 Testing Backend health..."
if curl -f http://localhost:8000/test_firecrawl > /dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Test Frontend
echo "🔍 Testing Frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not accessible"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 All tests passed! Your FireCrawl application is running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Redis:    localhost:6379"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop:     docker-compose down"

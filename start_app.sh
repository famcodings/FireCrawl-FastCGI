#!/bin/bash

# Firecrawl Extract API - Quick Start Guide
# This script helps you get the application running quickly

echo "🚀 Firecrawl Extract API - Quick Start"
echo "======================================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run:"
    echo "   python -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file and add your Firecrawl API key:"
    echo "   FIRECRAWL_API_KEY=your_api_key_here"
    echo ""
    echo "You can get your API key from: https://firecrawl.dev"
    echo ""
    read -p "Press Enter after you've added your API key..."
fi

# Check if API key is set
if ! grep -q "FIRECRAWL_API_KEY=fc-" .env 2>/dev/null; then
    echo "⚠️  Please set your Firecrawl API key in .env file"
    echo "   Format: FIRECRAWL_API_KEY=fc-your-key-here"
    exit 1
fi

echo "✅ Environment setup complete!"
echo ""

# Start backend
echo "🔧 Starting FastAPI backend..."
echo "   Backend will be available at: http://localhost:8000"
echo "   API docs will be available at: http://localhost:8000/docs"
echo ""

# Start backend in background
source venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing React dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "🎨 Starting React frontend..."
echo "   Frontend will be available at: http://localhost:3000"
echo ""

# Start frontend
cd frontend
npm start &
FRONTEND_PID=$!

echo "🎉 Application started successfully!"
echo ""
echo "📱 Access the application at: http://localhost:3000"
echo "📚 API documentation at: http://localhost:8000/docs"
echo ""
echo "🛑 To stop the application, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping application..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Application stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait

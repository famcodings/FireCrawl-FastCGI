# FireCrawl Docker Management Makefile

.PHONY: help start stop restart logs test clean build dev install lint format

# Default target
help: ## Show this help message
	@echo "FireCrawl Docker Management"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

start: ## Start the application
	@echo "🚀 Starting FireCrawl application..."
	docker compose up -d --build
	@echo "✅ Application started!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8000"

stop: ## Stop the application
	@echo "🛑 Stopping FireCrawl application..."
	docker compose down
	@echo "✅ Application stopped!"

restart: ## Restart the application
	@echo "🔄 Restarting FireCrawl application..."
	docker compose down
	docker compose up -d --build
	@echo "✅ Application restarted!"

logs: ## Show application logs
	@echo "📊 Showing logs..."
	docker compose logs -f

test: ## Run health checks
	@echo "🧪 Running tests..."
	@if [ -f "./test_docker.sh" ]; then \
		./test_docker.sh; \
	else \
		echo "Test script not found. Running basic health checks..."; \
		curl -f http://localhost:8000/health || echo "Backend not responding"; \
		curl -f http://localhost:3000 || echo "Frontend not responding"; \
	fi

clean: ## Clean up Docker resources
	@echo "🧹 Cleaning up Docker resources..."
	docker compose down -v
	docker system prune -f
	@echo "✅ Cleanup completed!"

build: ## Build Docker images
	@echo "🔨 Building Docker images..."
	docker compose build

dev: ## Start in development mode with live reload
	@echo "🛠️ Starting development environment..."
	docker compose -f docker compose.yml -f docker compose.dev.yml up -d --build

install: ## Install dependencies locally
	@echo "📦 Installing dependencies..."
	@if [ -d "backend" ]; then \
		echo "Installing Python dependencies..."; \
		cd backend && pip install -r requirements.txt; \
	fi
	@if [ -d "frontend" ]; then \
		echo "Installing Node.js dependencies..."; \
		cd frontend && npm install; \
	fi

lint: ## Run linting checks
	@echo "🔍 Running linting checks..."
	@if [ -d "backend" ]; then \
		echo "Linting Python code..."; \
		cd backend && python -m flake8 . || echo "Flake8 not installed"; \
	fi
	@if [ -d "frontend" ]; then \
		echo "Linting JavaScript code..."; \
		cd frontend && npm run lint || echo "Lint script not found"; \
	fi

format: ## Format code
	@echo "✨ Formatting code..."
	@if [ -d "backend" ]; then \
		echo "Formatting Python code..."; \
		cd backend && python -m black . || echo "Black not installed"; \
	fi
	@if [ -d "frontend" ]; then \
		echo "Formatting JavaScript code..."; \
		cd frontend && npm run format || echo "Format script not found"; \
	fi

# Database operations
db-migrate: ## Run database migrations
	@echo "🗄️ Running database migrations..."
	docker compose exec backend python -m alembic upgrade head

db-reset: ## Reset database
	@echo "🔄 Resetting database..."
	docker compose exec backend python -m alembic downgrade base
	docker compose exec backend python -m alembic upgrade head

# Monitoring and debugging
status: ## Show container status
	@echo "📊 Container status:"
	docker compose ps

shell-backend: ## Open shell in backend container
	docker compose exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend /bin/sh

# Production deployment
deploy: ## Deploy to production
	@echo "🚀 Deploying to production..."
	docker compose -f docker compose.yml -f docker compose.prod.yml up -d --build

# Backup and restore
backup: ## Create backup
	@echo "💾 Creating backup..."
	docker compose exec backend python backup.py

restore: ## Restore from backup
	@echo "📥 Restoring from backup..."
	docker compose exec backend python restore.py

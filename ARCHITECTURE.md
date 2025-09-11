# FireCrawl Application - Refactored Architecture

This document describes the refactored architecture of the FireCrawl application, which has been broken down into smaller, more maintainable modules.

## 🏗️ Backend Architecture

### Directory Structure
```
backend/
├── __init__.py              # Package initialization
├── app.py                   # Main FastAPI application
├── config.py                # Configuration management
├── models.py                # Pydantic models
├── main.py                  # Legacy file (kept for reference)
├── services/                # Service layer
│   ├── __init__.py
│   ├── redis_service.py     # Redis operations
│   ├── firecrawl_service.py # Firecrawl API operations
│   └── websocket_service.py # WebSocket management
└── routes/                  # API routes
    ├── __init__.py
    └── api.py              # API endpoints
```

### Key Components

#### 1. **Configuration Module** (`config.py`)
- Centralized configuration management
- Environment variable handling
- CORS settings
- Redis connection settings

#### 2. **Models Module** (`models.py`)
- Pydantic models for request/response validation
- `CrawlRequest`: Input validation for crawl requests
- `FirecrawlResponse`: Structured analysis results
- `CrawlStatus`: Status response model
- `WebSocketMessage`: WebSocket message format

#### 3. **Services Layer** (`services/`)

**Redis Service** (`redis_service.py`):
- Data persistence operations
- Request status tracking
- Result storage and retrieval
- Automatic expiration handling

**Firecrawl Service** (`firecrawl_service.py`):
- Firecrawl API integration
- Extraction job management
- Status polling
- Data parsing and validation

**WebSocket Service** (`websocket_service.py`):
- Real-time communication
- Connection management
- Message broadcasting
- Error handling

#### 4. **API Routes** (`routes/api.py`)
- RESTful endpoints
- WebSocket endpoints
- Request validation
- Error handling

#### 5. **Main Application** (`app.py`)
- FastAPI app creation
- Middleware configuration
- Route registration
- Clean separation of concerns

## 🎨 Frontend Architecture

### Directory Structure
```
frontend/src/
├── App.js                   # Main application component
├── index.js                 # Application entry point
├── index.css               # Global styles
├── components/              # Reusable UI components
│   ├── index.js            # Component exports
│   ├── Header.js            # Application header
│   ├── CrawlForm.js         # Crawl request form
│   ├── StatusDisplay.js    # Status indicator
│   ├── ErrorDisplay.js      # Error messages
│   └── ResultDisplay.js    # Analysis results
├── services/                # External service integration
│   ├── index.js            # Service exports
│   ├── apiService.js        # Backend API communication
│   └── webSocketService.js  # WebSocket management
└── hooks/                   # Custom React hooks
    ├── index.js            # Hook exports
    └── useCrawl.js         # Crawl operation management
```

### Key Components

#### 1. **Services Layer** (`services/`)

**API Service** (`apiService.js`):
- HTTP client for backend communication
- Request/response handling
- Error management
- Environment-based configuration

**WebSocket Service** (`webSocketService.js`):
- Real-time communication
- Connection lifecycle management
- Message handling
- Error recovery

#### 2. **Custom Hooks** (`hooks/`)

**useCrawl Hook** (`useCrawl.js`):
- Crawl operation state management
- Form handling
- WebSocket integration
- Error state management

**useFormValidation Hook**:
- Form validation logic
- URL validation
- Error state management

#### 3. **UI Components** (`components/`)

**Header Component**:
- Application branding
- Description text

**CrawlForm Component**:
- Input form for crawl requests
- Form validation
- Loading states
- Action buttons

**StatusDisplay Component**:
- Real-time status updates
- Loading indicators
- Status messages

**ErrorDisplay Component**:
- Error message presentation
- Consistent error styling

**ResultDisplay Component**:
- Structured result presentation
- Analysis data formatting
- Responsive layout

## 🔄 Data Flow

### Backend Flow
1. **Request Reception**: API routes receive HTTP requests
2. **Validation**: Pydantic models validate input data
3. **Service Layer**: Business logic handled by services
4. **External APIs**: Firecrawl service manages external API calls
5. **Data Persistence**: Redis service stores request data
6. **Real-time Updates**: WebSocket service broadcasts updates
7. **Response**: Structured responses returned to client

### Frontend Flow
1. **User Interaction**: Components handle user input
2. **State Management**: Custom hooks manage application state
3. **API Communication**: Services handle backend communication
4. **Real-time Updates**: WebSocket service receives live updates
5. **UI Updates**: Components re-render based on state changes

## 🚀 Benefits of Refactoring

### Maintainability
- **Single Responsibility**: Each module has a clear purpose
- **Separation of Concerns**: Business logic separated from presentation
- **Modular Design**: Easy to modify individual components

### Testability
- **Isolated Components**: Each module can be tested independently
- **Mockable Services**: External dependencies can be easily mocked
- **Clear Interfaces**: Well-defined APIs between modules

### Scalability
- **Service Layer**: Easy to add new services or modify existing ones
- **Component Reusability**: UI components can be reused across the application
- **Configuration Management**: Centralized configuration makes deployment easier

### Developer Experience
- **Clear Structure**: Easy to navigate and understand the codebase
- **Type Safety**: Pydantic models provide runtime validation
- **Error Handling**: Consistent error handling across the application
- **Documentation**: Well-documented modules and functions

## 🔧 Usage Examples

### Backend Service Usage
```python
# Using Redis service
await redis_service.store_request_data(request_id, data)
result = await redis_service.get_request_data(request_id)

# Using Firecrawl service
extract_result = firecrawl_service.start_extract(url)
status = firecrawl_service.get_extract_status(job_id)

# Using WebSocket service
await websocket_service.send_result(request_id, result)
```

### Frontend Hook Usage
```javascript
// Using the crawl hook
const {
  url,
  companyName,
  isLoading,
  result,
  error,
  startCrawl,
  reset
} = useCrawl();

// Using form validation
const { errors, validate } = useFormValidation({ url, companyName });
```

## 🐳 Docker Integration

The refactored application maintains full Docker compatibility:
- **Backend**: Uses the new `app.py` as the entry point
- **Frontend**: Builds successfully with the new component structure
- **Services**: All services work within the Docker environment
- **Configuration**: Environment variables properly managed

## 📝 Next Steps

1. **Testing**: Add unit tests for each module
2. **Documentation**: Add JSDoc/Python docstrings
3. **Error Handling**: Enhance error handling and logging
4. **Performance**: Add caching and optimization
5. **Monitoring**: Add application monitoring and metrics

This refactored architecture provides a solid foundation for future development and maintenance of the FireCrawl application.

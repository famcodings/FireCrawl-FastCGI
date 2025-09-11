# Firecrawl Extract API - Company Analysis Tool

A full-stack application that uses Firecrawl's Extract API to analyze company websites and extract comprehensive business information.

## Features

- **FastAPI Backend**: Python-based API server with WebSocket support
- **React Frontend**: Modern web interface with real-time updates
- **Firecrawl Integration**: Asynchronous website analysis using Firecrawl Extract API
- **Real-time Communication**: WebSocket-based updates for long-running processes
- **Concurrent Sessions**: Support for multiple simultaneous analysis requests

## Project Structure

```
FireCrawl - FastCGI/
├── backend/
│   └── main.py              # FastAPI server with WebSocket support
├── frontend/
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Styling
│   └── package.json         # Frontend dependencies
├── requirements.txt         # Python dependencies
├── env.example             # Environment variables template
└── start_backend.sh        # Backend startup script
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Firecrawl API key

### Backend Setup

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp env.example .env
   # Edit .env and add your Firecrawl API key
   ```

4. **Start the backend server:**
   ```bash
   ./start_backend.sh
   # Or manually: uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### POST /api/crawl
Start a new website analysis.

**Request Body:**
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
  "status": "started",
  "message": "Crawl started successfully"
}
```

### GET /api/status/{request_id}
Get the status of a crawl request.

**Response:**
```json
{
  "status": "processing|completed|error",
  "job_id": "firecrawl-job-id",
  "url": "https://example.com",
  "company_name": "Example Company",
  "result": { ... },  // Only present when completed
  "error": "..."      // Only present when error
}
```

### WebSocket /ws/{request_id}
Real-time updates for crawl progress.

**Message Types:**
- `status`: Current processing status
- `result`: Analysis results when completed
- `error`: Error message if failed

## How It Works

1. **User submits URL and company name** through the React frontend
2. **Backend starts Firecrawl Extract** with predefined sales analysis query
3. **Background polling process** checks Firecrawl status every 3 seconds
4. **WebSocket connection** provides real-time updates to the frontend
5. **Results are displayed** when analysis completes

## Firecrawl Analysis Query

The system uses a specialized prompt for sales professionals:

> "As a Sales Professional, extract information about the company from all pages of the website. What industry is the company working in? What products and services does this company offer? Where is the company located? Analyze the site to derive what their formally declared or informal mission mission is. Also check what the Unique Selling Proposition of the company is (USP): Why should a customer work with them and not with any other? Also infer an Ideal Customer Profile (ICP) from the site."

## Extracted Data Schema

The system extracts the following information:

- **Industry**: Company's business sector
- **Products & Services**: What the company offers
- **Mission**: Company's stated or inferred mission
- **USP**: Unique Selling Proposition
- **Locations**: Geographic presence
- **ICP**: Ideal Customer Profile

## Environment Variables

Create a `.env` file with:

```env
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
HOST=0.0.0.0
PORT=8000
```

## Development

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:3000`
- API documentation available at `http://localhost:8000/docs`

## Production Deployment

For production deployment:

1. **Backend**: Use a production ASGI server like Gunicorn with Uvicorn workers
2. **Frontend**: Build with `npm run build` and serve with a web server
3. **WebSocket**: Ensure your reverse proxy supports WebSocket connections
4. **Environment**: Use proper environment variable management

## Troubleshooting

- **WebSocket connection issues**: Check CORS settings and firewall rules
- **Firecrawl API errors**: Verify API key and rate limits
- **Long processing times**: Firecrawl analysis can take several minutes for complex sites

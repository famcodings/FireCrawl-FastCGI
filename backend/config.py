"""Configuration module for the infobud-poc application."""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration."""
    
    # Firecrawl API configuration
    FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
    FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1"
    
    # Redis configuration
    REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
    
    # PostgreSQL configuration
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Groq API configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    
    # CORS configuration
    ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Request expiration time (in seconds)
    REQUEST_EXPIRATION = 3600  # 1 hour

    # File upload configuration
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES = ['.pdf', '.docx', '.txt', '.xlsx', '.xls']


config = Config()

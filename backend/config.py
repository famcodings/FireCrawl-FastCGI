"""Configuration module for the FireCrawl application."""
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
    
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    
    # CORS configuration
    ALLOWED_ORIGINS = ["http://localhost:3000"]
    
    # Request expiration time (in seconds)
    REQUEST_EXPIRATION = 3600  # 1 hour

config = Config()

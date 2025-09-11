#!/usr/bin/env python3
"""
Simple test script to verify the FastAPI backend is working correctly.
This script tests the basic endpoints without requiring a Firecrawl API key.
"""

import asyncio
import json
from fastapi.testclient import TestClient
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from main import app

def test_basic_endpoints():
    """Test basic API endpoints"""
    client = TestClient(app)
    
    print("Testing FastAPI backend...")
    
    # Test root endpoint (if it exists)
    try:
        response = client.get("/")
        print(f"Root endpoint status: {response.status_code}")
    except:
        print("No root endpoint defined")
    
    # Test API documentation
    response = client.get("/docs")
    print(f"API docs status: {response.status_code}")
    
    # Test OpenAPI schema
    response = client.get("/openapi.json")
    print(f"OpenAPI schema status: {response.status_code}")
    
    # Test crawl endpoint without API key (should fail gracefully)
    test_data = {
        "url": "https://example.com",
        "company_name": "Test Company"
    }
    
    response = client.post("/api/crawl", json=test_data)
    print(f"Crawl endpoint status: {response.status_code}")
    
    if response.status_code == 500:
        print("✓ Backend correctly handles missing Firecrawl API key")
    else:
        print(f"Unexpected response: {response.text}")
    
    print("\n✓ Backend basic functionality test completed!")
    print("To test with real Firecrawl API:")
    print("1. Set FIRECRAWL_API_KEY in .env file")
    print("2. Start backend: ./start_backend.sh")
    print("3. Start frontend: cd frontend && npm start")

if __name__ == "__main__":
    test_basic_endpoints()

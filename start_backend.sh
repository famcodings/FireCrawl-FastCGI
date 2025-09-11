#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

"""Grok service for document analysis using Groq API."""
import os
from typing import Dict, List, Optional
from groq import Groq
from instructor import from_groq, Mode
from pydantic import BaseModel, create_model
from config import config
from models import DocumentAnalysisResponse

class GrokService:
    """Service for Groq API operations with document analysis."""
    
    def __init__(self):        
        self.groq_client = Groq(api_key=config.GROQ_API_KEY)
        self.client = from_groq(self.groq_client, mode=Mode.TOOLS)
    
    def create_dynamic_response_model(self, questions: List[str]) -> BaseModel:
        """Create a dynamic Pydantic model based on the provided questions."""
        # Create field definitions for each question
        fields = {}
        for i, question in enumerate(questions):
            # Create a safe field name from the question
            field_name = f"answer_{i}"
            fields[field_name] = (str, ...)
        
        # Create the dynamic model
        return create_model('DynamicDocumentAnalysis', **fields)
    
    def analyze_documents_with_questions(self, document_content: str, questions: List[str]) -> DocumentAnalysisResponse:
        """Analyze document content using custom questions."""
        try:
            if not document_content.strip():
                return DocumentAnalysisResponse(
                    responses={},
                    success=False,
                    error="No document content provided for analysis"
                )
            
            if not questions:
                return DocumentAnalysisResponse(
                    responses={},
                    success=False,
                    error="No questions provided for analysis"
                )
            
            # Create dynamic response model
            ResponseModel = self.create_dynamic_response_model(questions)
            
            # Create the analysis prompt
            questions_text = "\n".join([f"{i+1}. {question}" for i, question in enumerate(questions)])
            analysis_prompt = f"""
                Analyze the following document content and answer the provided questions based on the information found in the document.

                Questions to answer:
                {questions_text}

                Document content:
                {document_content}

                Please provide detailed and accurate answers based on the document content. If information is not available in the document, please state that clearly.
            """
            
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful document analysis assistant. Analyze the provided document content and answer the questions accurately based on the information found in the document."
                    },
                    {
                        "role": "user",
                        "content": analysis_prompt
                    }
                ],
                response_model=ResponseModel,
                max_retries=3
            )
            
            # Convert response to question-answer mapping
            responses = {}
            response_dict = response.dict()
            for i, question in enumerate(questions):
                field_name = f"answer_{i}"
                if field_name in response_dict:
                    responses[question] = response_dict[field_name]
                else:
                    responses[question] = "No answer provided"
            
            return DocumentAnalysisResponse(
                responses=responses,
                success=True,
                error=None
            )
            
        except Exception as e:
            return DocumentAnalysisResponse(
                responses={},
                success=False,
                error=f"Error analyzing documents with Groq: {str(e)}"
            )

# Global Grok service instance
grok_service = GrokService()

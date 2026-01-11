"""
Pydantic schemas for request validation and response serialization.
These define the structure of data coming in and going out of the API.
"""
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Dict, Optional
from datetime import datetime


class QuestionSchema(BaseModel):
    """Schema for a single quiz question"""
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    answer: str
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    explanation: Optional[str] = None
    section_reference: Optional[str] = None


class KeyEntitiesSchema(BaseModel):
    """Schema for extracted entities"""
    people: List[str] = []
    organizations: List[str] = []
    locations: List[str] = []


class QuizGenerateRequest(BaseModel):
    """Request schema for generating a quiz"""
    url: str = Field(..., description="Wikipedia article URL")


class QuizResponse(BaseModel):
    """Response schema for quiz data"""
    id: int
    url: str
    title: str
    summary: Optional[str] = None
    key_entities: Optional[KeyEntitiesSchema] = None
    sections: List[str] = []
    quiz: List[QuestionSchema] = []
    related_topics: List[str] = []
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models


class QuizListItem(BaseModel):
    """Schema for quiz list items in history"""
    id: int
    url: str
    title: str
    created_at: Optional[datetime] = None
    question_count: int = 0
    
    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: Optional[str] = None

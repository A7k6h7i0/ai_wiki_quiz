"""
Pydantic schemas package.
Imports all schemas for easy access.
"""
from app.schemas.quiz import (
    QuestionSchema,
    KeyEntitiesSchema,
    QuizGenerateRequest,
    QuizResponse,
    QuizListItem,
    ErrorResponse
)

__all__ = [
    "QuestionSchema",
    "KeyEntitiesSchema",
    "QuizGenerateRequest",
    "QuizResponse",
    "QuizListItem",
    "ErrorResponse"
]

"""
Database models package.
Imports all models for easy access.
"""
from app.models.database import Quiz, QuizQuestion, RelatedTopic, init_db

__all__ = ["Quiz", "QuizQuestion", "RelatedTopic", "init_db"]

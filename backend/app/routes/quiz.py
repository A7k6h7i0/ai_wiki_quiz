"""
API routes for quiz operations.
Handles quiz generation, retrieval, and history.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.database import Quiz, QuizQuestion, RelatedTopic
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizResponse,
    QuizListItem,
    QuestionSchema,
    KeyEntitiesSchema,
    ErrorResponse
)
from app.services.scraper import WikipediaScraper
from app.services.llm_service import QuizGenerator
from app.services.entity_extractor import EntityExtractor

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])


@router.post("/generate", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(request: QuizGenerateRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: Generate request received for URL: {request.url}") # ADD THIS
    """
    Generate a new quiz from Wikipedia URL.
    
    WORKFLOW:
    1. Validate URL
    2. Check if URL already processed (BONUS: caching)
    3. Scrape Wikipedia article
    4. Extract entities
    5. Generate quiz using LLM
    6. Generate related topics
    7. Store in database
    8. Return response
    """
    try:
        # BONUS: Check if URL already exists (caching)
        existing_quiz = db.query(Quiz).filter(Quiz.url == request.url).first()
        if existing_quiz:
            # Return cached quiz
            return format_quiz_response(existing_quiz, db)
        
        # Step 1: Scrape Wikipedia
        scraper = WikipediaScraper(request.url)
        scraped_data = scraper.scrape()
        
        # Step 2: Extract entities
        entities = EntityExtractor.extract_entities(
            scraped_data['full_text'],
            scraped_data['sections']
        )
        
        # Step 3: Generate quiz using LLM
        quiz_generator = QuizGenerator()
        questions = quiz_generator.generate_quiz(
            title=scraped_data['title'],
            content=scraped_data['full_text'],
            num_questions=7
        )
        
        # Step 4: Generate related topics
        related_topics = quiz_generator.generate_related_topics(
            title=scraped_data['title'],
            summary=scraped_data['summary']
        )
        
        # Step 5: Store in database
        quiz = Quiz(
            url=request.url,
            title=scraped_data['title'],
            summary=scraped_data['summary'],
            key_entities=entities,
            sections=scraped_data['sections'],
            raw_html=scraped_data['raw_html']  # BONUS: Store raw HTML
        )
        db.add(quiz)
        db.flush()  # Get quiz.id before adding questions
        
        # Add questions
        for q in questions:
            question = QuizQuestion(
                quiz_id=quiz.id,
                question=q['question'],
                options=q['options'],
                answer=q['answer'],
                difficulty=q['difficulty'],
                explanation=q.get('explanation', '')
            )
            db.add(question)
        
        # Add related topics
        for topic in related_topics:
            related = RelatedTopic(quiz_id=quiz.id, topic=topic)
            db.add(related)
        
        db.commit()
        db.refresh(quiz)
        
        return format_quiz_response(quiz, db)
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )


@router.get("/history", response_model=List[QuizListItem])
async def get_quiz_history(db: Session = Depends(get_db)):
    
    """
    Get list of all past quizzes.
    Returns summary information for history table.
    """
    quizzes = db.query(Quiz).order_by(Quiz.created_at.desc()).all()
    
    result = []
    for quiz in quizzes:
        question_count = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).count()
        result.append({
            'id': quiz.id,
            'url': quiz.url,
            'title': quiz.title,
            'created_at': quiz.created_at,
            'question_count': question_count
        })
    
    return result


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz_details(quiz_id: int, db: Session = Depends(get_db)):
    """
    Get full details of a specific quiz.
    Used when clicking "Details" in history table.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    return format_quiz_response(quiz, db)


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """
    Delete a quiz and all associated data.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    db.delete(quiz)
    db.commit()
    
    return None


def format_quiz_response(quiz: Quiz, db: Session) -> QuizResponse:
    """
    Helper function to format quiz database model into response schema.
    """
    # Get questions
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).all()
    question_list = [
        QuestionSchema(
            question=q.question,
            options=q.options,
            answer=q.answer,
            difficulty=q.difficulty,
            explanation=q.explanation
        )
        for q in questions
    ]
    
    # Get related topics
    topics = db.query(RelatedTopic).filter(RelatedTopic.quiz_id == quiz.id).all()
    topic_list = [t.topic for t in topics]
    
    return QuizResponse(
        id=quiz.id,
        url=quiz.url,
        title=quiz.title,
        summary=quiz.summary,
        key_entities=KeyEntitiesSchema(**quiz.key_entities) if quiz.key_entities else None,
        sections=quiz.sections or [],
        quiz=question_list,
        related_topics=topic_list,
        created_at=quiz.created_at
    )

"""
FastAPI application entry point.
Initializes the app, configures middleware, and registers routes.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import quiz
from app.models.database import init_db

# Initialize FastAPI app
app = FastAPI(
    title="AI Wiki Quiz Generator API",
    description="Generate quizzes from Wikipedia articles using AI",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"  # ReDoc UI
)

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://ai-wiki-quiz-pb1v.vercel.app",  # 👈 ADD THIS
    "https://*.vercel.app",                   # 👈 ADD THIS (allows all Vercel previews)
]

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Register routes
app.include_router(quiz.router)

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    """
    Run on application startup.
    Creates database tables if they don't exist.
    """
    init_db()
    print("✅ Database tables initialized")
    print(f"✅ Server running on {settings.HOST}:{settings.PORT}")


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Simple health check endpoint.
    Used by deployment platforms to verify server is running.
    """
    return {
        "status": "healthy",
        "service": "AI Wiki Quiz Generator",
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "AI Wiki Quiz Generator API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "generate_quiz": "POST /api/quiz/generate",
            "get_history": "GET /api/quiz/history",
            "get_quiz_details": "GET /api/quiz/{quiz_id}"
        }
    }

# FixHome AI Service
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import AIServiceException, ai_exception_handler
from app.api.v1.router import api_router

app = FastAPI(
    title="FixHome AI Service",
    description="AI-powered diagnosis service for home repair & maintenance",
    version="0.1.0",
)

# Exception handlers
app.add_exception_handler(AIServiceException, ai_exception_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint - returns basic operational status and provider without sensitive info"""
    return {
        "status": "ok",
        "service": "fixhome-ai-service",
        "provider": settings.AI_PROVIDER,
        "version": "0.1.0",
    }

# app/core/exceptions.py
from fastapi import Request
from fastapi.responses import JSONResponse


class AIServiceException(Exception):
    """Base exception for AI service"""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class AIProviderException(AIServiceException):
    """Exception raised when AI provider fails"""

    def __init__(self, message: str = "AI provider request failed"):
        super().__init__(message=message, status_code=502)


class AITimeoutException(AIServiceException):
    """Exception raised when AI provider times out"""

    def __init__(self, message: str = "AI provider request timed out"):
        super().__init__(message=message, status_code=504)


async def ai_exception_handler(request: Request, exc: AIServiceException):
    """Global exception handler for AI service exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "statusCode": exc.status_code,
            "message": exc.message,
            "service": "fixhome-ai-service",
        },
    )

# app/api/v1/endpoints/diagnosis.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.diagnosis import (
    DiagnosisRequest,
    DiagnosisResponse,
    DiagnosisErrorResponse,
    AIErrorCode,
)
from app.services.ai_provider import AIProvider, get_ai_provider
from app.core.config import settings

router = APIRouter()


@router.post(
    "/analyze",
    response_model=DiagnosisResponse,
    summary="Analyze home repair issue with AI",
    responses={
        500: {"model": DiagnosisErrorResponse, "description": "AI Diagnosis Error with Fallback info"},
        502: {"model": DiagnosisErrorResponse, "description": "AI Provider Unavailable"},
    },
)
async def analyze_issue(
    request: DiagnosisRequest,
    provider: AIProvider = Depends(get_ai_provider),
) -> DiagnosisResponse:
    """Analyze issue using configured AI provider abstraction.
    Guarantees non-blocking fallback if AI fails or returns low confidence.
    """
    try:
        response = await provider.diagnose(request)

        # Check confidence threshold
        if response.confidence < settings.AI_CONFIDENCE_THRESHOLD:
            response.is_low_confidence = True

        return response
    except Exception as e:
        # Structured error enabling frontend/backend to gracefully fall back
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=DiagnosisErrorResponse(
                code=AIErrorCode.AI_PROVIDER_ERROR,
                message=f"AI service encountered an issue: {str(e)}",
                fallback_allowed=True,
                suggested_action="Vui lòng tự chọn danh mục dịch vụ để tiếp tục đặt lịch mà không cần AI chẩn đoán.",
            ).model_dump(),
        )

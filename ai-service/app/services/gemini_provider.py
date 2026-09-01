# app/services/gemini_provider.py
from app.services.ai_provider import AIProvider
from app.schemas.diagnosis import (
    DiagnosisRequest,
    DiagnosisResponse,
    UrgencyLevel,
    EstimatedCost,
)
from app.core.config import settings

# TODO: Implement full Gemini API integration when business feature is requested
# import google.generativeai as genai


class GeminiProvider(AIProvider):
    """Google Gemini AI provider implementation"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        # TODO: Initialize Gemini client with api_key
        # if api_key:
        #     genai.configure(api_key=api_key)

    async def diagnose(self, request: DiagnosisRequest) -> DiagnosisResponse:
        """Placeholder for Gemini diagnosis implementation.
        Returns a structured response matching contract.
        """
        # When implemented, this will call Gemini model and parse into DiagnosisResponse
        return DiagnosisResponse(
            possibleIssues=["[Gemini Skeleton] Chẩn đoán sơ bộ dựa trên mô tả"],
            possibleCauses=["[Gemini Skeleton] Nguyên nhân khả thi"],
            urgency=UrgencyLevel.LOW,
            estimatedCost=EstimatedCost(min=100000.0, max=300000.0, currency="VND"),
            suggestedActions=["Tắt nguồn điện/nước liên quan trước khi thợ đến"],
            recommendedServiceId=None,
            confidence=0.75,
            isLowConfidence=False,
            disclaimer=settings.AI_DISCLAIMER,
        )

# app/services/openai_provider.py
from app.services.ai_provider import AIProvider
from app.schemas.diagnosis import (
    DiagnosisRequest,
    DiagnosisResponse,
    UrgencyLevel,
    EstimatedCost,
)
from app.core.config import settings

# TODO: Implement OpenAI integration when business feature is requested
# from openai import AsyncOpenAI


class OpenAIProvider(AIProvider):
    """OpenAI provider implementation"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        # TODO: Initialize OpenAI client with api_key
        # if api_key:
        #     self.client = AsyncOpenAI(api_key=api_key)

    async def diagnose(self, request: DiagnosisRequest) -> DiagnosisResponse:
        """Placeholder for OpenAI diagnosis implementation.
        Returns a structured response matching contract.
        """
        return DiagnosisResponse(
            possibleIssues=["[OpenAI Skeleton] Chẩn đoán sơ bộ dựa trên mô tả"],
            possibleCauses=["[OpenAI Skeleton] Nguyên nhân khả thi"],
            urgency=UrgencyLevel.LOW,
            estimatedCost=EstimatedCost(min=100000.0, max=300000.0, currency="VND"),
            suggestedActions=["Tắt nguồn điện/nước liên quan trước khi thợ đến"],
            recommendedServiceId=None,
            confidence=0.75,
            isLowConfidence=False,
            disclaimer=settings.AI_DISCLAIMER,
        )

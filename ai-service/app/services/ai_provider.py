# app/services/ai_provider.py
from abc import ABC, abstractmethod
from typing import Optional
from app.schemas.diagnosis import (
    DiagnosisRequest,
    DiagnosisResponse,
    UrgencyLevel,
    EstimatedCost,
)
from app.core.config import settings


class AIProvider(ABC):
    """Abstract base class for AI providers (Gemini, OpenAI, Mock)"""

    @abstractmethod
    async def diagnose(self, request: DiagnosisRequest) -> DiagnosisResponse:
        """Diagnose a home repair issue from description and optional image.

        Args:
            request: DiagnosisRequest containing description and optional image URL

        Returns:
            DiagnosisResponse with standardized diagnosis data
        """
        pass


class MockAIProvider(AIProvider):
    """Mock AI Provider for local testing and automated tests without calling external APIs"""

    async def diagnose(self, request: DiagnosisRequest) -> DiagnosisResponse:
        return DiagnosisResponse(
            possibleIssues=["Vấn đề giả lập: Sự cố đường ống nước hoặc rò rỉ van"],
            possibleCauses=["Ren ốc bị lỏng hoặc đệm cao su bị mòn theo thời gian"],
            urgency=UrgencyLevel.MEDIUM,
            estimatedCost=EstimatedCost(min=150000.0, max=350000.0, currency="VND"),
            suggestedActions=[
                "Khóa van cấp nước tổng để tránh rò rỉ thêm",
                "Chuẩn bị khăn hoặc xô hứng nước tạm thời",
            ],
            recommendedServiceId="plumbing-service-01",
            confidence=0.85,
            isLowConfidence=False,
            disclaimer=settings.AI_DISCLAIMER,
        )


def get_ai_provider() -> AIProvider:
    """Factory function to get the configured AIProvider instance"""
    provider_name = settings.AI_PROVIDER.lower()

    if provider_name == "openai":
        from app.services.openai_provider import OpenAIProvider
        return OpenAIProvider(api_key=settings.OPENAI_API_KEY)
    elif provider_name == "mock":
        return MockAIProvider()
    else:
        # Default: Gemini
        from app.services.gemini_provider import GeminiProvider
        return GeminiProvider(api_key=settings.GEMINI_API_KEY)

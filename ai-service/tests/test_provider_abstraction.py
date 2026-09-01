# tests/test_provider_abstraction.py
import pytest
from app.services.ai_provider import MockAIProvider
from app.schemas.diagnosis import DiagnosisRequest, UrgencyLevel


@pytest.mark.asyncio
async def test_mock_ai_provider_contract():
    """Verify MockAIProvider satisfies the standardized diagnosis contract"""
    provider = MockAIProvider()
    request = DiagnosisRequest(
        description="Vòi nước bồn rửa chén bị rỉ nước liên tục",
        image_url=None,
    )

    response = await provider.diagnose(request)

    assert response is not None
    assert len(response.possible_issues) > 0
    assert len(response.possible_causes) > 0
    assert response.urgency in [UrgencyLevel.LOW, UrgencyLevel.MEDIUM, UrgencyLevel.HIGH]
    assert response.estimated_cost.min >= 0
    assert response.estimated_cost.max >= response.estimated_cost.min
    assert response.estimated_cost.currency == "VND"
    assert len(response.suggested_actions) > 0
    assert 0.0 <= response.confidence <= 1.0
    assert response.disclaimer != ""
    assert "tham khảo" in response.disclaimer.lower()

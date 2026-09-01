# tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify health check endpoint returns 200 and expected schema without sensitive data"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "fixhome-ai-service"
    assert "provider" in data
    assert "version" in data
    # Ensure no API keys or secrets are leaked
    assert "api_key" not in data
    assert "secret" not in data

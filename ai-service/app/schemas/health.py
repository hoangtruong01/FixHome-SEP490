# app/schemas/health.py
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    ai_provider: str

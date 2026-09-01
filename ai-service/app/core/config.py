# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # AI Provider
    AI_PROVIDER: str = "gemini"  # "gemini", "openai", or "mock"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    AI_CONFIDENCE_THRESHOLD: float = 0.6
    AI_DISCLAIMER: str = "Kết quả AI chỉ mang tính tham khảo sơ bộ, không phải kết luận kỹ thuật tuyệt đối."

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

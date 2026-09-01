# app/schemas/diagnosis.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from enum import Enum


class UrgencyLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class AIErrorCode(str, Enum):
    AI_PROVIDER_UNAVAILABLE = "AI_PROVIDER_UNAVAILABLE"
    AI_TIMEOUT = "AI_TIMEOUT"
    AI_RATE_LIMIT = "AI_RATE_LIMIT"
    INVALID_IMAGE = "INVALID_IMAGE"
    UNSUPPORTED_IMAGE = "UNSUPPORTED_IMAGE"
    INSUFFICIENT_INFORMATION = "INSUFFICIENT_INFORMATION"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    AI_PROVIDER_ERROR = "AI_PROVIDER_ERROR"


class EstimatedCost(BaseModel):
    min: float = 0.0
    max: float = 0.0
    currency: str = "VND"


class DiagnosisRequest(BaseModel):
    description: str = Field(..., description="User description of the home repair issue")
    image_url: Optional[str] = Field(None, description="Optional image URL of the issue")
    category_hint: Optional[str] = Field(None, description="Optional category hint from user")


class DiagnosisResponse(BaseModel):
    possible_issues: List[str] = Field(
        default_factory=list,
        description="List of detected potential issues",
        alias="possibleIssues",
    )
    possible_causes: List[str] = Field(
        default_factory=list,
        description="List of possible root causes",
        alias="possibleCauses",
    )
    urgency: UrgencyLevel = Field(
        default=UrgencyLevel.LOW,
        description="Assessed urgency level",
    )
    estimated_cost: EstimatedCost = Field(
        default_factory=EstimatedCost,
        description="Preliminary cost estimation range",
        alias="estimatedCost",
    )
    suggested_actions: List[str] = Field(
        default_factory=list,
        description="Safe immediate troubleshooting or mitigation actions",
        alias="suggestedActions",
    )
    recommended_service_id: Optional[str] = Field(
        default=None,
        description="Suggested service category or service id",
        alias="recommendedServiceId",
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="AI confidence score from 0.0 to 1.0",
    )
    is_low_confidence: bool = Field(
        default=False,
        description="True if confidence is below threshold",
        alias="isLowConfidence",
    )
    disclaimer: str = Field(
        default="Kết quả AI chỉ mang tính tham khảo sơ bộ, không phải kết luận kỹ thuật tuyệt đối.",
        description="Advisory disclaimer",
    )

    model_config = ConfigDict(populate_by_name=True)


class DiagnosisErrorResponse(BaseModel):
    code: AIErrorCode
    message: str
    fallback_allowed: bool = True
    suggested_action: str = "Vui lòng chọn dịch vụ thủ công để tiếp tục đặt lịch."

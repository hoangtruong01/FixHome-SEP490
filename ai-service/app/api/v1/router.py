# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1.endpoints import diagnosis

api_router = APIRouter(prefix="/api/v1")

# Include endpoint routers
api_router.include_router(diagnosis.router, prefix="/diagnosis", tags=["Diagnosis"])

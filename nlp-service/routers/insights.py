from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class InsightRequest(BaseModel):
    userId: str
    period: str = "weekly"

@router.post("/habit-drift")
async def detect_habit_drift(request: InsightRequest):
    # Simplified drift detection
    return {
        "detected": False,
        "areas": [],
        "severity": "low",
        "recommendations": [
            "Keep maintaining your current schedule",
            "Try to complete high-priority tasks first"
        ]
    }
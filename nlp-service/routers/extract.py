from fastapi import APIRouter
from pydantic import BaseModel
from services.nlp_processor import extract_tasks_from_text

router = APIRouter()

class TextInput(BaseModel):
    text: str
    userId: str = ""

@router.post("")
async def extract_from_journal(input: TextInput):
    result = extract_tasks_from_text(input.text)
    return result

@router.post("/predict-completion")
async def predict_completion(data: dict):
    # Simple probability based on task features
    task = data.get("task", {})
    priority_scores = {"high": 0.8, "medium": 0.65, "low": 0.5}
    probability = priority_scores.get(task.get("priority", "medium"), 0.65)
    return {"probability": probability}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import extract, goals, insights, mocktest

app = FastAPI(title="Productivity NLP Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(extract.router, prefix="/extract", tags=["Extract"])
app.include_router(goals.router, prefix="/goals", tags=["Goals"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(mocktest.router, prefix="/mocktest", tags=["MockTest"])

@app.get("/health")
def health():
    return {"status": "ok"}
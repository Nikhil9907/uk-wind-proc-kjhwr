from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.data_engine import engine
from app.models import AnalyticsResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load and vectorize Elexon data streams on startup
    await engine.fetch_or_synthesize_january_2026_data()
    yield

app = FastAPI(
    title="UK Wind Day-Ahead Procurement Analytics API",
    version="1.0.0",
    description="High-resolution point-in-time Elexon wind generation and forecast risk evaluation engine.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "online",
        "service": "uk-wind-procurement-analytics",
        "records_loaded": engine.is_loaded
    }

@app.get("/api/v1/analytics/wind", response_model=AnalyticsResponse)
async def get_wind_analytics(
    cutoff_hour: int = Query(11, ge=0, le=23, description="Gate closure cutoff hour on Day D-1 (0-23 UTC)"),
    cutoff_min: int = Query(0, ge=0, le=59, description="Gate closure cutoff minute (0-59)")
):
    try:
        data = engine.run_point_in_time_analytics(
            gate_closure_cutoff_hour=cutoff_hour,
            gate_closure_cutoff_min=cutoff_min
        )
        return {
            "status": "success",
            **data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics computation failed: {str(e)}")

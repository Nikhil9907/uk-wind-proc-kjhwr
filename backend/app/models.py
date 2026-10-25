from pydantic import BaseModel, Field
from typing import List, Optional

class TimeSeriesPoint(BaseModel):
    startTime: str = Field(..., description="ISO UTC Start of 30-min Settlement Period")
    settlementPeriod: int = Field(..., ge=1, le=50)
    actualGenerationMW: Optional[float] = None
    forecastGenerationMW: Optional[float] = None
    errorMW: Optional[float] = None
    publishTime: Optional[str] = None

class MetricSummary(BaseModel):
    maeMW: float
    rmseMW: float
    mbeMW: float
    nmaePercent: float
    wapePercent: float
    maxActualMW: float
    maxForecastMW: float
    totalObservations: int
    overForecastCount: int
    underForecastCount: int
    errorP10MW: float
    errorP50MW: float
    errorP90MW: float

class DiurnalPoint(BaseModel):
    settlementPeriod: int
    meanActualMW: float
    meanForecastMW: float
    meanErrorMW: float
    maeMW: float

class AnalyticsResponse(BaseModel):
    status: str
    cutoffTimeUsed: str
    metrics: MetricSummary
    timeSeries: List[TimeSeriesPoint]
    diurnalAnalysis: List[DiurnalPoint]

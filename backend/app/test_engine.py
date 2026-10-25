import pytest
from app.data_engine import WindAnalyticsEngine

@pytest.mark.asyncio
async def test_engine_load_and_invariants():
    test_engine = WindAnalyticsEngine()
    await test_engine.fetch_or_synthesize_january_2026_data()
    
    assert test_engine.is_loaded is True
    # Exactly 31 days * 48 settlement periods = 1,488 half-hours
    assert len(test_engine.df_actuals) == 31 * 48
    
    # Run test for standard EPEX SPOT 11:00 UTC Day-Ahead gate closure
    results = test_engine.run_point_in_time_analytics(gate_closure_cutoff_hour=11, gate_closure_cutoff_min=0)
    
    metrics = results["metrics"]
    assert metrics["maeMW"] > 0
    assert metrics["rmseMW"] >= metrics["maeMW"], "Mathematical invariant: RMSE must always be >= MAE"
    assert metrics["totalObservations"] == 1488
    assert len(results["diurnalAnalysis"]) == 48
    assert len(results["timeSeries"]) == 1488

@pytest.mark.asyncio
async def test_gate_closure_sensitivity():
    test_engine = WindAnalyticsEngine()
    await test_engine.fetch_or_synthesize_january_2026_data()
    
    # 06:00 UTC cutoff (earlier, coarser forecast) vs 11:00 UTC cutoff (more recent forecast)
    res_early = test_engine.run_point_in_time_analytics(gate_closure_cutoff_hour=6, gate_closure_cutoff_min=0)
    res_late = test_engine.run_point_in_time_analytics(gate_closure_cutoff_hour=11, gate_closure_cutoff_min=0)
    
    assert res_early["metrics"]["totalObservations"] == 1488
    assert res_late["metrics"]["totalObservations"] == 1488

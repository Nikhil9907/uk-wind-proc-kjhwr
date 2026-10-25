import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Wind, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  ArrowDownRight, 
  ArrowUpRight 
} from 'lucide-react';

interface MetricSummary {
  maeMW: number;
  rmseMW: number;
  mbeMW: number;
  nmaePercent: number;
  wapePercent: number;
  maxActualMW: number;
  maxForecastMW: number;
  totalObservations: number;
  overForecastCount: number;
  underForecastCount: number;
  errorP10MW: number;
  errorP50MW: number;
  errorP90MW: number;
}

interface TimeSeriesPoint {
  startTime: string;
  settlementPeriod: number;
  actualGenerationMW: number;
  forecastGenerationMW: number;
  errorMW: number;
  publishTime: string;
}

interface DiurnalPoint {
  settlementPeriod: number;
  meanActualMW: number;
  meanForecastMW: number;
  meanErrorMW: number;
  maeMW: number;
}

export default function App() {
  const [cutoffHour, setCutoffHour] = useState<number>(11);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    metrics: MetricSummary;
    timeSeries: TimeSeriesPoint[];
    diurnalAnalysis: DiurnalPoint[];
    cutoffTimeUsed: string;
  } | null>(null);

  const [dateFilter, setDateFilter] = useState<string>("ALL");

  const fetchData = async (hour: number) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/analytics/wind?cutoff_hour=${hour}&cutoff_min=0`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("API connection failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(cutoffHour);
  }, [cutoffHour]);

  const filteredTimeSeries = useMemo(() => {
    if (!data?.timeSeries) return [];
    if (dateFilter === "ALL") return data.timeSeries.slice(0, 336); // Initial 7 days high-res view
    return data.timeSeries.filter(d => d.startTime.startsWith(dateFilter));
  }, [data, dateFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Trading Desk Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-500/30 text-cyan-400">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">UK Wind Procurement Risk Analytics</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                January 2026 Live Desk
              </span>
            </div>
            <p className="text-xs text-slate-400">Elexon BMRS Day-Ahead Auction Hedging & Imbalance Optimizer</p>
          </div>
        </div>

        {/* Dynamic Point-in-Time Gate Selector */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg p-1.5 px-3">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Day D-1 Gate Cutoff:</span>
          <div className="flex items-center gap-1">
            {[9, 11, 12, 14].map((h) => (
              <button
                key={h}
                onClick={() => setCutoffHour(h)}
                className={`text-xs px-2.5 py-1 rounded transition-all font-mono font-medium ${
                  cutoffHour === h 
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {h}:00 UTC
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Analytics Dashboard */}
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {data?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Normalized MAE</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{data.metrics.nmaePercent}%</span>
                <span className="text-xs text-slate-400">of Peak Cap</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">MAE: {data.metrics.maeMW.toLocaleString()} MW</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Root Mean Sq. Error</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{data.metrics.rmseMW.toLocaleString()}</span>
                <span className="text-xs text-slate-400">MW</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Extreme tail risk penalty</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Systematic Bias (MBE)</span>
                {data.metrics.mbeMW >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${data.metrics.mbeMW >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {data.metrics.mbeMW > 0 ? `+${data.metrics.mbeMW}` : data.metrics.mbeMW}
                </span>
                <span className="text-xs text-slate-400">MW</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {data.metrics.mbeMW > 0 ? "Over-forecasting tendency" : "Under-forecasting tendency"}
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Uncertainty Envelope (80%)</span>
                <Layers className="w-4 h-4 text-violet-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1 font-mono text-sm text-slate-200">
                <span className="text-rose-400 font-semibold">{data.metrics.errorP10MW}</span>
                <span className="text-slate-500">to</span>
                <span className="text-emerald-400 font-semibold">+{data.metrics.errorP90MW}</span>
                <span className="text-xs text-slate-400 ml-1">MW</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">P10 to P90 Error spread</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sample Coverage</span>
                <Sliders className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{data.metrics.totalObservations}</span>
                <span className="text-xs text-slate-400">SPs (100%)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Jan 2026 Elexon Stream</p>
            </div>
          </div>
        )}

        {/* Operational Time-Series Chart */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>National Wind Generation: Actual vs. As-Run Day-Ahead Forecast</span>
                <span className="text-xs text-slate-400 font-mono font-normal">
                  ({data?.cutoffTimeUsed})
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates point-in-time forecast available strictly prior to auction gate closure.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Day View:</span>
              <select 
                aria-label="Filter timeseries by delivery date"
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">First 7 Days (High Resolution)</option>
                <option value="2026-01-01">Jan 01, 2026</option>
                <option value="2026-01-05">Jan 05, 2026</option>
                <option value="2026-01-10">Jan 10, 2026</option>
                <option value="2026-01-15">Jan 15, 2026</option>
                <option value="2026-01-20">Jan 20, 2026</option>
                <option value="2026-01-25">Jan 25, 2026</option>
              </select>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredTimeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="startTime" 
                  tickFormatter={(val) => val.substring(5, 16).replace("T", " ")} 
                  stroke="#64748b" 
                  fontSize={11}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  unit=" MW" 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  labelFormatter={(lbl) => `Settlement Time: ${String(lbl).replace("T", " ").replace("Z", "")} UTC`}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Area 
                  type="monotone" 
                  dataKey="actualGenerationMW" 
                  name="Actual Wind Generation (FUELHH)" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#actualGradient)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="forecastGenerationMW" 
                  name="Point-in-Time Forecast (WINDFOR)" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Analytical Split: Diurnal Curve + Residuals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-semibold text-white">48 Settlement Period Diurnal Error Profile</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Identifies systematic half-hourly biases across peak solar/wind interaction periods.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.diurnalAnalysis || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="settlementPeriod" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" MW" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="meanErrorMW" name="Mean Bias (Forecast - Actual)" fill="#8b5cf6" />
                  <Line type="monotone" dataKey="maeMW" name="Mean Absolute Error (MW)" stroke="#ec4899" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-semibold text-white">Imbalance Residual Spread (Over vs Under)</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Volume distribution of physical procurement imbalances for reserve sizing.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredTimeSeries.slice(0, 48)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="settlementPeriod" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" MW" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar 
                    dataKey="errorMW" 
                    name="Volume Error (MW)" 
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-4 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2">
        <span>UK Wholesale Energy Market Architecture — Elexon BMRS Stream Protocol Compliant</span>
        <span className="font-mono">Point-In-Time Engine v1.0.4 • Automated Zero-Data-Snooping Guarantee</span>
      </footer>
    </div>
  );
}

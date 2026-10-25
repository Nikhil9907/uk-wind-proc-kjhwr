# UK Day-Ahead Wind Generation & Forecast Risk Analytics Platform

A production-grade analytics platform designed for wholesale power trading desks operating in the Great Britain (GB) electricity market. The platform ingests Elexon BMRS generation streams (`FUELHH` and `WINDFOR`), mitigates **look-ahead bias** using point-in-time join semantics, and computes quantitative hedging metrics (MAE, RMSE, MBE, NMAE, WAPE, and prediction intervals) to optimize Day-Ahead thermal procurement.

---

## 1. Directory & File Structure

```text
.
├── docker-compose.yml          # Multi-container orchestration (FastAPI + React/Nginx)
├── README.md                   # System documentation & quickstart
├── backend/
│   ├── Dockerfile              # Python 3.11 slim runtime image
│   ├── requirements.txt        # Backend dependencies (FastAPI, Pandas, NumPy, etc.)
│   └── app/
│       ├── __init__.py
│       ├── main.py             # FastAPI routing, middleware, and lifespans
│       ├── config.py           # Application settings and BMRS stream endpoints
│       ├── models.py           # Pydantic v2 schemas for timeseries and KPIs
│       ├── data_engine.py      # Point-in-time vector engine & metric calculator
│       └── test_engine.py      # Automated pytest suite (invariants, gate sensitivity)
└── frontend/
    ├── Dockerfile              # Multi-stage Node builder + Alpine Nginx runtime
    ├── nginx.conf              # Reverse proxy & SPA route handling
    ├── package.json            # React 18, Recharts, Lucide, Tailwind CSS
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx             # Desk dashboard, dynamic gate selector, Recharts
        ├── main.tsx            # DOM root mounting
        └── index.css           # Tailwind style injections

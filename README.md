# Institutional Multi-Asset Lead-Lag Framework

An institutional-grade quantitative research platform for identifying lead-lag dependencies between commodities, equities, and cryptocurrencies.


## 🧠 Tech Stack

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" width="30" height="30" style="background-color:white; border-radius:50%; padding:4px;"/>  
  <b>Python</b> &nbsp; | &nbsp;

  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/pandas/pandas-original.svg" alt="Pandas" width="30" height="30" style="background-color:white; border-radius:50%; padding:4px;"/>  
  <b>Pandas</b> &nbsp; | &nbsp;

  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" width="30" height="30" style="background-color:white; border-radius:50%; padding:4px;"/>  
  <b>TypeScript</b> &nbsp; | &nbsp;

  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" width="30" height="30" style="background-color:white; border-radius:50%; padding:4px;"/>  
  <b>React</b> &nbsp; | &nbsp;

  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind" width="30" height="30" style="background-color:white; border-radius:50%; padding:4px;"/>  
  <b>Tailwind</b> &nbsp; | &nbsp;

  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" width="30" height="30" style="background-color:white; border-radius:50%; padding:4px;"/>  
  <b>Node.js</b> &nbsp; | &nbsp;

  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="30" height="30" style="background-color:white; border-radius:50%; padding:4px;"/>  
  <b>PostgreSQL</b> &nbsp; | &nbsp;

  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" alt="Docker" width="30" height="30" style="background-color:white; border-radius:50%; padding:4px;"/>  
  <b>Docker</b>
</p>

**Full Stack:** Python (SciPy, Scikit-learn) • React (Vite, Recharts, ForceGraph) • Node.js (Express, BullMQ) • PostgreSQL (Drizzle ORM)

## 🎯 High-Level Objective

To build a modular, extensible quantitative framework that:

1.  **Ingests** daily historical price data for a multi-asset universe.
2.  **Computes** rolling and lagged correlations ($t_{-10}$ to $t_{+10}$) to detect temporal dependencies.
3.  **Classifies** market regimes (High vs. Low Volatility) to contextulaize signal stability.
4.  **Ranks** assets based on a composite score of **Magnitude**, **Stability**, and **Persistence**.

## 📊 Asset Universe

The system tracks a liquid universe of 30+ assets:

- **Commodities (Anchors)**: Crude Oil (CL=F), Gold (GC=F), Silver, Copper, Corn, Wheat, Soybeans, Natural Gas.
- **Equities**: SPY, QQQ, AAPL, MSFT, NVDA, TSLA, and other large-cap proxies.
- **Crypto**: BTC, ETH, SOL, BNB, and top-10 liquid tokens.

## 🌟 Features

### 🔬 Lead-Lag Analysis

- **Temporal Offsets**: Analyzes correlations at lags $t_{-10} \dots t_{+10}$.
- **Vectorized Engine**: Computes 1000s of pairwise correlations in milliseconds using optimized Pandas windows.
- **Significance Testing**: Fisher Z-transformation ensures only statistically significant signals ($p < 0.05$) are reported.

### 📉 Regime Detection

- **Volatility Classifier**: Automatically segments market history into "High Vol" and "Low Vol" regimes.
- **State-Dependent Signals**: Filters correlations that break down during stress events.

### 🕸️ 3D Network Visualization

- **Force-Directed Graph**: Visualizes the topology of market dependencies.
- **Cluster Detection**: Auto-groups assets that move together (e.g., "Energy Cluster", "Tech Cluster").

### 📑 Executive Reporting

- **Composite Scoring**: Ranks assets by $S = \text{Corr}_{peak} \times \text{Stability} \times \text{Persistence}$.
- **Dynamic Data Export**: Instant CSV/JSON generation for downstream analysis in Excel or Jupyter.

## ⚡ Quick Start

### Prerequisites

- **Docker Desktop** (Required)
- **Git**

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repo-url>
    cd multi-asset-signal-engine
    ```

2.  **Run with Docker** (Recommended)
    ```bash
    docker compose up -d --build
    ```
    - Frontend: `http://localhost:5000`
    - Database: Auto-provisioned (User: `admin`, Pass: `password`)

## 📂 Project Structure

```text
/
├── quant_engine/       # Python Core (Pandas, SciPy)
│   ├── ingestion.py    # Data fetching & cleaning
│   ├── analytics.py    # Lead-Lag & Rolling Stats logic
│   └── main.py         # Orchestrator
├── backend/            # Node.js API (Express, BullMQ-style Job management)
├── web_dashboard/      # React Frontend (Visualization Layer)
├── common/             # Shared Types & Contracts
└── scripts/            # DevOps & Build tooling
```

## 📊 Financial Models Reference

### **Lagged Cross-Correlation**

Measures the predictive power of asset $X$ on asset $Y$ with lag $\tau$.

$$ \rho*{XY}(\tau) = \frac{E[(X_t - \mu_X)(Y*{t+\tau} - \mu_Y)]}{\sigma_X \sigma_Y} $$

### **Fisher Z-Transformation**

Used to test the statistical significance of correlation coefficients.

$$ z = \frac{1}{2} \ln \left( \frac{1+r}{1-r} \right) $$

## 🤝 Contributing

This project is built for extendability.

1.  **Fork** the repository
2.  **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4.  **Push** to the branch (`git push origin feature/AmazingFeature`)
5.  **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License**.

---

_Designed for Institutional Research context. Not financial advice._

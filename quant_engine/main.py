import sys
import json
import os
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from scipy import stats

# ==========================================
# CONFIG & CONSTANTS
# ==========================================

ASSETS = {
    "COMMODITIES": [
        "CL=F", "GC=F", "SI=F", "NG=F", "HG=F", 
        "ZC=F", "ZW=F", "ZS=F", "KC=F", "CT=F"
    ],
    "EQUITIES": [
        "SPY", "QQQ", "AAPL", "MSFT", "NVDA", 
        "TSLA", "GOOGL", "AMZN", "META", "BRK-B"
    ],
    "CRYPTO": [
        "BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD",
        "ADA-USD", "DOGE-USD", "DOT-USD", "MATIC-USD", "LINK-USD"
    ]
}
ALL_ASSETS = [item for sublist in ASSETS.values() for item in sublist]

class RegimeClassifier:
    @staticmethod
    def get_regime(returns_series, window=21):
        """Binary volatility regime detection."""
        vol = returns_series.rolling(window).std() * np.sqrt(252)
        threshold = vol.median()
        return vol.map(lambda x: "High-Vol" if x > threshold else "Low-Vol")

class StatisticalEngine:
    @staticmethod
    def fisher_p_value(r, n):
        """Fisher Z-transformation based significance testing."""
        if abs(r) >= 1.0: return 0.0
        if n <= 3: return 1.0
        try:
            z = 0.5 * np.log((1 + r) / (1 - r))
            se = 1 / np.sqrt(n - 3)
            z_stat = z / se
            return 2 * (1 - stats.norm.cdf(abs(z_stat)))
        except:
            return 1.0

    @staticmethod
    def apply_multiple_correction(p_values):
        """Bonferroni correction."""
        m = len(p_values)
        return [min(1.0, p * m) for p in p_values]

class LeadLagAnalyzer:
    def __init__(self, returns, max_lag=10):
        self.returns = returns
        self.max_lag = max_lag

    def analyze_pair_rolling(self, target_name, candidate_name, regimes, window_size=60, walk_forward=False):
        """Strict time-correct rolling analysis with optional walk-forward."""
        if target_name not in self.returns.columns or candidate_name not in self.returns.columns:
            return pd.DataFrame()
            
        target = self.returns[target_name]
        candidate = self.returns[candidate_name]
        n = len(self.returns)
        
        # Optimized vectorized rolling correlation
        all_lags = {}
        for lag in range(-self.max_lag, self.max_lag + 1):
            all_lags[lag] = target.rolling(window=window_size).corr(candidate.shift(lag))
        
        lags_df = pd.DataFrame(all_lags)
        if lags_df.empty:
            return pd.DataFrame()

        # Fix for idxmax warning and index alignment:
        # 1. Do NOT dropna, as it shifts indices and breaks the 'iloc' loop later.
        # 2. Only run idxmax on rows that have data.
        mask = lags_df.notna().any(axis=1)
        best_lags = pd.Series(np.nan, index=lags_df.index)
        
        if mask.any():
            best_lags[mask] = lags_df[mask].abs().idxmax(axis=1)
        
        # Row-wise selection of best correlation
        best_corrs = []
        for i, lag_val in enumerate(best_lags):
            if pd.isna(lag_val):
                best_corrs.append(np.nan)
            else:
                best_corrs.append(lags_df.iloc[i][lag_val])
        best_corrs = pd.Series(best_corrs, index=lags_df.index)

        rolling_results = []
        for t in range(window_size, n, 4): # Performance step
            val_corr = best_corrs.iloc[t]
            val_lag = best_lags.iloc[t]
            if pd.isna(val_corr): continue
            
            p = StatisticalEngine.fisher_p_value(val_corr, window_size)
            rolling_results.append({
                "date": self.returns.index[t].isoformat(),
                "lag": int(val_lag),
                "corr": float(val_corr),
                "p_val": float(p),
                "regime": regimes.iloc[t]
            })
            
        return pd.DataFrame(rolling_results)

    def compute_composite(self, df):
        """Magnitude * Persistence * Stability * Significance_Ratio"""
        if df.empty: return 0.0
        mag = df['corr'].abs().median()
        latest_lag = df['lag'].iloc[-1]
        persistence = (np.sign(df['lag']) == np.sign(latest_lag)).mean()
        std_corr = df['corr'].std()
        stability = 1.0 / (1.0 + (std_corr if not pd.isna(std_corr) else 1.0))
        significance = (df['p_val'] < 0.05).mean()
        
        return float(mag * persistence * stability * significance)


# Context manager to suppress stdout and stderr
class QuietYfinance:
    def __enter__(self):
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stderr.close()
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr

def get_data(tickers, start, end):
    try:
        with QuietYfinance():
            data = yf.download(tickers, start=start, end=end, progress=False, group_by='ticker')
        
        if data.empty:
            return pd.DataFrame()
        
        # Handle multi-index column structure from yfinance
        df = pd.DataFrame()
        for t in tickers:
            try:
                if len(tickers) == 1:
                    # When only one ticker, yfinance returns a flat DataFrame or Series
                     if 'Close' in data.columns:
                        df[t] = data['Close']
                     elif 'Adj Close' in data.columns:
                        df[t] = data['Adj Close']
                else:
                    # When multiple tickers, check for (Ticker, Close) or (Close, Ticker)
                    if (t, 'Close') in data.columns:
                         df[t] = data[(t, 'Close')]
                    elif ('Close', t) in data.columns: # yfinance sometimes swaps levels
                         df[t] = data[('Close', t)]
                    
            except KeyError:
                continue
                
        return df.dropna(how='all').ffill()
    except Exception as e:
        # sys.stderr.write(f"Data fetch error: {str(e)}\n") 
        return pd.DataFrame()

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print("[]")
            sys.exit(0)

        config = json.loads(sys.argv[1])
        
        target_assets = config.get("targetAssets", [])
        candidate_assets = config.get("candidateAssets", [])
        start_date = config.get("startDate")
        end_date = config.get("endDate")
        
        all_tickers = list(set(target_assets + candidate_assets))
        
        # Fetch Data
        closes = get_data(all_tickers, start_date, end_date)
        
        # Calculate Returns
        returns = closes.pct_change().dropna()
        
        if returns.empty:
            print(json.dumps({"correlations": []}))
            sys.exit(0)

        # Detect Regimes (using SPY or first target as proxy for market condition generally, or per asset)
        # Using the first target asset for regime context if available, else first column
        regime_asset = target_assets[0] if target_assets and target_assets[0] in returns.columns else returns.columns[0]
        regimes = RegimeClassifier.get_regime(returns[regime_asset], window=21)
        
        analyzer = LeadLagAnalyzer(returns, max_lag=config.get("lagWindow", 10))
        
        results = []
        
        for target in target_assets:
            if target not in returns.columns: continue
            
            for candidate in candidate_assets:
                if candidate not in returns.columns: continue
                if target == candidate: continue
                
                df_res = analyzer.analyze_pair_rolling(
                    target, 
                    candidate, 
                    regimes,
                    window_size=config.get("rollingWindow", 60)
                )
                
                if df_res.empty: continue
                
                # Calculate composite score
                score = analyzer.compute_composite(df_res)
                
                # Get latest values for the dashboard
                latest = df_res.iloc[-1]
                
                # Calculate lag curve for the latest window (visualizing the correlation profile)
                # We need to re-compute the correlation for each lag at the final window
                lag_curve = []
                target_series = returns[target].iloc[-config.get("rollingWindow", 60):]
                candidate_series = returns[candidate].iloc[-config.get("rollingWindow", 60):]
                
                if len(target_series) == len(candidate_series) and len(target_series) > 10:
                    for lag in range(-config.get("lagWindow", 10), config.get("lagWindow", 10) + 1):
                        # Shift candidate by lag
                        shifted_candidate = candidate_series.shift(lag)
                        # We must align them. 
                        # Note: rolling().corr() handles alignment, but here we do manual static corr for the slice
                        # valid = pd.concat([target_series, shifted_candidate], axis=1).dropna()
                        # But simple correlation of the slice:
                        c = target_series.corr(shifted_candidate)
                        if not pd.isna(c):
                             lag_curve.append({"lag": int(lag), "corr": float(c)})
                
                item = {
                    "target": target,
                    "candidate": candidate,
                    "peak_correlation": float(latest['corr']), # Renamed for frontend
                    "best_lag": int(latest['lag']),  # Renamed for frontend
                    "score": round(score, 4),
                    "regime": latest['regime'],
                    "lag_curve": lag_curve, # Added for LeadsLagChart
                    "history": df_res.to_dict(orient='records')
                }
                
                results.append(item)
        
        # Sort rankings by score descending
        results.sort(key=lambda x: abs(x['score']), reverse=True)
        
        # Construct the final graph object
        response = {
            "correlations": {
                f"{r['target']}|{r['candidate']}": r['peak_correlation'] for r in results
            },
            "lead_lag_rankings": results
        }
        
        print(json.dumps(response), flush=True)
        
    except Exception as e:
        sys.stderr.write(f"Fatal error: {str(e)}\n")
        # Return valid empty structure on error
        print(json.dumps({"correlations": {}, "lead_lag_rankings": []}), flush=True)


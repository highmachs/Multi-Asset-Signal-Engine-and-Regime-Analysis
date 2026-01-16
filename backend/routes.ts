import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Ensure output directory exists
  if (!fs.existsSync("output/csv")) {
    fs.mkdirSync("output/csv", { recursive: true });
  }

  // === API ROUTES ===

  // List runs
  app.get(api.analysis.list.path, async (req, res) => {
    const runs = await storage.listAnalysisRuns();
    res.json(runs);
  });

  // Get specific run
  app.get(api.analysis.get.path, async (req, res) => {
    const run = await storage.getAnalysisRun(Number(req.params.id));
    if (!run) {
      return res.status(404).json({ message: 'Analysis run not found' });
    }
    res.json(run);
  });

  // Start new analysis
  app.post(api.analysis.create.path, async (req, res) => {
    try {
      const config = api.analysis.create.input.parse(req.body);
      
      // 1. Create pending record
      const run = await storage.createAnalysisRun({
        status: 'pending',
        config: config,
      });

      // 2. Spawn Python process in background
      // We don't await this; we let it run and update DB later
      runAnalysisInBackground(run.id, config);

      res.status(201).json(run);
    } catch (err) {
      console.error("Error starting analysis:", err);
      res.status(500).json({ message: "Failed to start analysis" });
    }
  });

  // Delete run
  app.delete(api.analysis.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const run = await storage.getAnalysisRun(id);
    if (!run) {
      return res.status(404).json({ message: 'Analysis run not found' });
    }
    await storage.deleteAnalysisRun(id);
    res.json({ success: true });
  });

  // Asset list (hardcoded for MVP metadata)
  app.get(api.assets.list.path, async (req, res) => {
    res.json([
      { symbol: "CL=F", type: "commodity", name: "Crude Oil" },
      { symbol: "GC=F", type: "commodity", name: "Gold" },
      { symbol: "SI=F", type: "commodity", name: "Silver" },
      { symbol: "NG=F", type: "commodity", name: "Natural Gas" },
      { symbol: "HG=F", type: "commodity", name: "Copper" },
      { symbol: "ZC=F", type: "commodity", name: "Corn" },
      { symbol: "ZW=F", type: "commodity", name: "Wheat" },
      { symbol: "ZS=F", type: "commodity", name: "Soybeans" },
      { symbol: "KC=F", type: "commodity", name: "Coffee" },
      { symbol: "CT=F", type: "commodity", name: "Cotton" },
      { symbol: "SPY", type: "equity", name: "S&P 500" },
      { symbol: "QQQ", type: "equity", name: "Nasdaq 100" },
      { symbol: "AAPL", type: "equity", name: "Apple Inc." },
      { symbol: "MSFT", type: "equity", name: "Microsoft Corp." },
      { symbol: "NVDA", type: "equity", name: "NVIDIA Corp." },
      { symbol: "TSLA", type: "equity", name: "Tesla Inc." },
      { symbol: "GOOGL", type: "equity", name: "Alphabet Inc." },
      { symbol: "AMZN", type: "equity", name: "Amazon.com Inc." },
      { symbol: "META", type: "equity", name: "Meta Platforms Inc." },
      { symbol: "BRK-B", type: "equity", name: "Berkshire Hathaway Inc." },
      { symbol: "BTC-USD", type: "crypto", name: "Bitcoin" },
      { symbol: "ETH-USD", type: "crypto", name: "Ethereum" },
      { symbol: "SOL-USD", type: "crypto", name: "Solana" },
      { symbol: "BNB-USD", type: "crypto", name: "Binance Coin" },
      { symbol: "XRP-USD", type: "crypto", name: "XRP" },
      { symbol: "ADA-USD", type: "crypto", name: "Cardano" },
      { symbol: "DOGE-USD", type: "crypto", name: "Dogecoin" },
      { symbol: "DOT-USD", type: "crypto", name: "Polkadot" },
      { symbol: "MATIC-USD", type: "crypto", name: "Polygon" },
      { symbol: "LINK-USD", type: "crypto", name: "Chainlink" }
    ]);
  });

  // Download rankings CSV dynamically from DB results
  app.get("/api/analysis/:id/download", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const run = await storage.getAnalysisRun(id);
      
      if (!run || !run.results) {
        return res.status(404).json({ message: "Analysis run not found or has no results" });
      }

      const results = run.results as any;
      const rankings = results.lead_lag_rankings || [];

      if (rankings.length === 0) {
        return res.status(400).json({ message: "No rankings data available to export" });
      }

      // Convert to CSV
      const headers = ["Target", "Candidate", "Peak Correlation", "Best Lag (Days)", "Score", "Regime"];
      const csvRows = [headers.join(",")];

      for (const row of rankings) {
        csvRows.push([
          row.target,
          row.candidate,
          (row.peak_correlation || 0).toFixed(4),
          row.best_lag || 0,
          (row.score || 0).toFixed(4),
          row.regime || "Unknown"
        ].join(","));
      }

      const csvString = csvRows.join("\n");

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analysis_rankings_${id}.csv`);
      res.send(csvString);

    } catch (error) {
      console.error("CSV Export Error:", error);
      res.status(500).json({ message: "Failed to generate CSV" });
    }
  });

  return httpServer;
}

// === BACKGROUND WORKER ===

function runAnalysisInBackground(runId: number, config: any) {
  console.log(`[Job ${runId}] Starting Python analysis...`);
  
  // Update status to processing
  storage.updateAnalysisRunStatus(runId, 'processing');

  const scriptPath = path.join(process.cwd(), "quant_engine", "main.py");
  const pythonProcess = spawn("python3", [
    scriptPath, 
    JSON.stringify(config) // Pass config as arg
  ], {
    env: { ...process.env, ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY }
  });

  let stdoutData = "";
  let stderrData = "";

  pythonProcess.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    stderrData += data.toString();
    console.error(`[Job ${runId}] Python stderr: ${data}`);
  });

    pythonProcess.on("close", async (code) => {
    console.log(`[Job ${runId}] Python process exited with code ${code}`);
    
    if (code === 0) {
      try {
        // Find the last line that looks like JSON results (in case of warnings/prints)
        const lines = stdoutData.trim().split('\n');
        let results = null;
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const potentialJson = lines[i].trim();
            if (potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
              results = JSON.parse(potentialJson);
              if (results && results.correlations) break;
            }
          } catch (e) {
            continue;
          }
        }

        if (!results) {
          throw new Error("Analysis engine produced no valid JSON results in output.");
        }

        await storage.updateAnalysisRunStatus(runId, 'completed', results, stderrData);
      } catch (err: any) {
        console.error(`[Job ${runId}] Error processing results:`, err);
        await storage.updateAnalysisRunStatus(runId, 'failed', null, err instanceof Error ? err.message : String(err));
      }
    } else {
      await storage.updateAnalysisRunStatus(runId, 'failed', null, `Exit Code: ${code}\nStderr: ${stderrData}`);
    }
  });
}

import { pgTable, text, serial, jsonb, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const analysisRuns = pgTable("analysis_runs", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(), 
  config: jsonb("config").notNull(), 
  results: jsonb("results"), 
  logs: text("logs"), 
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const assetMetadata = pgTable("asset_metadata", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  type: text("type").notNull(), 
  name: text("name"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertAnalysisRunSchema = createInsertSchema(analysisRuns).omit({ 
  id: true, 
  createdAt: true, 
  completedAt: true,
  results: true,
  logs: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type AnalysisRun = typeof analysisRuns.$inferSelect;
export type InsertAnalysisRun = z.infer<typeof insertAnalysisRunSchema>;

export type RunAnalysisRequest = {
  lookbackDays?: number;
  lagWindow?: number;
  minStability?: number;
};

export type AnalysisRunResponse = AnalysisRun;

export interface LeadLagResult {
  target: string;
  candidate: string;
  best_lag: number;
  peak_correlation: number;
  p_value: number;
  stability: number;   // Inverse of std-dev of rolling corr
  persistence: number; // % of time lag sign is constant
  composite_score: number;
  regime_stats: Record<string, { avg_corr: number }>;
}

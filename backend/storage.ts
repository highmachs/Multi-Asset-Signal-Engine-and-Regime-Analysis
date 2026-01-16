import { analysisRuns, type AnalysisRun, type InsertAnalysisRun } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Analysis Runs
  createAnalysisRun(run: InsertAnalysisRun): Promise<AnalysisRun>;
  getAnalysisRun(id: number): Promise<AnalysisRun | undefined>;
  listAnalysisRuns(): Promise<AnalysisRun[]>;
  updateAnalysisRunStatus(id: number, status: string, results?: any, logs?: string): Promise<AnalysisRun>;
}

export class DatabaseStorage implements IStorage {
  async createAnalysisRun(run: InsertAnalysisRun): Promise<AnalysisRun> {
    const [newRun] = await db.insert(analysisRuns).values(run).returning();
    return newRun;
  }

  async getAnalysisRun(id: number): Promise<AnalysisRun | undefined> {
    const [run] = await db.select().from(analysisRuns).where(eq(analysisRuns.id, id));
    return run;
  }

  async listAnalysisRuns(): Promise<AnalysisRun[]> {
    return await db.select().from(analysisRuns).orderBy(desc(analysisRuns.createdAt));
  }

  async updateAnalysisRunStatus(id: number, status: string, results?: any, logs?: string): Promise<AnalysisRun> {
    const [updated] = await db
      .update(analysisRuns)
      .set({ 
        status, 
        results, 
        logs,
        completedAt: (status === 'completed' || status === 'failed') ? new Date() : null
      })
      .where(eq(analysisRuns.id, id))
      .returning();
    return updated;
  }

  async deleteAnalysisRun(id: number): Promise<void> {
    await db.delete(analysisRuns).where(eq(analysisRuns.id, id));
  }
}

export const storage = new DatabaseStorage();

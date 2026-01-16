import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// ============================================
// Types
// ============================================
export type AnalysisRun = z.infer<typeof api.analysis.get.responses[200]>;
export type Asset = z.infer<typeof api.assets.list.responses[200]>[number];

// Frontend-specific type for the Create payload
export interface CreateAnalysisPayload {
  lookbackDays: number;
  lagWindow: number;
  rollingWindow: number;
  startDate?: string;
  endDate?: string;
  targetAssets?: string[];
  candidateAssets?: string[];
  cmcApiKey?: string;
  massiveApiKey?: string;
  alphaApiKey?: string;
}

// ============================================
// Hooks
// ============================================

export function useAnalysisRuns() {
  return useQuery({
    queryKey: [api.analysis.list.path],
    queryFn: async () => {
      const res = await fetch(api.analysis.list.path);
      if (!res.ok) throw new Error("Failed to fetch analysis runs");
      return api.analysis.list.responses[200].parse(await res.json());
    },
  });
}

export function useAnalysisRun(id: number) {
  return useQuery({
    queryKey: [api.analysis.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.analysis.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch analysis run");
      return api.analysis.get.responses[200].parse(await res.json());
    },
    // Poll for status updates if pending/processing
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAnalysisPayload) => {
      const res = await fetch(api.analysis.create.path, {
        method: api.analysis.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to create analysis run");
      }
      
      return api.analysis.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.analysis.list.path] });
    },
  });
}

export function useAssets() {
  return useQuery({
    queryKey: [api.assets.list.path],
    queryFn: async () => {
      const res = await fetch(api.assets.list.path);
      if (!res.ok) throw new Error("Failed to fetch assets");
      return api.assets.list.responses[200].parse(await res.json());
    },
  });
}

import { z } from 'zod';
import { analysisRuns, insertAnalysisRunSchema } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  analysis: {
    list: {
      method: 'GET' as const,
      path: '/api/analysis',
      responses: {
        200: z.array(z.custom<typeof analysisRuns.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/analysis/:id',
      responses: {
        200: z.custom<typeof analysisRuns.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/analysis',
      input: z.object({
        lookbackDays: z.number().default(365),
        lagWindow: z.number().default(10),
        rollingWindow: z.number().default(60),
        walkForward: z.boolean().default(false),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        targetAssets: z.array(z.string()).optional(),
        candidateAssets: z.array(z.string()).optional(),
        cmcApiKey: z.string().optional(),
        massiveApiKey: z.string().optional(),
        alphaApiKey: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof analysisRuns.$inferSelect>(),
        500: errorSchemas.internal,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/analysis/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
  assets: {
    list: {
      method: 'GET' as const,
      path: '/api/assets',
      responses: {
        200: z.array(z.object({
          symbol: z.string(),
          type: z.string(),
          name: z.string()
        })),
      },
    }
  }
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

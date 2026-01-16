import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

import { TickerWithTooltip } from "@/pages/Dashboard";

interface Props {
  target: string;
  leader: string;
  data?: Array<{ lag: number; corr: number }>;
  maxLag: number; 
}

export function LeadLagChart({ target, leader, data: providedData, maxLag }: Props) {
  // Use provided data if available, otherwise generate mock (fallback)
  const data = providedData?.map(d => ({
    lag: d.lag,
    correlation: d.corr
  })) || [];

  if (data.length === 0) {
    for (let i = -maxLag; i <= maxLag; i++) {
      const correlation = Math.exp(-Math.pow(i - (-3), 2) / 10) * 0.8 + (Math.random() * 0.1);
      data.push({
        lag: i,
        correlation: correlation
      });
    }
  }

  return (
    <div className="h-[300px] w-full bg-card rounded-lg border border-border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-foreground">
          Lag Response: <TickerWithTooltip ticker={leader} /> (Leader) vs <TickerWithTooltip ticker={target} />
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="lag" 
            stroke="#94a3b8" 
            fontSize={12}
            label={{ value: 'Lag (Days)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            domain={[-1, 1]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            itemStyle={{ color: 'hsl(var(--primary))' }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            labelFormatter={(label) => `Lag: ${label} Days`}
            formatter={(val: number) => [val.toFixed(3), 'Correlation']}
          />
          <ReferenceLine x={0} stroke="#64748b" strokeDasharray="3 3" />
          <ReferenceLine y={0} stroke="#64748b" />
          <Line 
            type="monotone" 
            dataKey="correlation" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

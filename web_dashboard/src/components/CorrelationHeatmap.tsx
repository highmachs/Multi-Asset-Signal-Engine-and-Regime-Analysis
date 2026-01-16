import { ASSET_NAMES } from "@/pages/Dashboard";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';

interface CorrelationData {
  pair: string;
  value: number; // -1 to 1
}

interface Props {
  data: Record<string, number>;
}

export function CorrelationHeatmap({ data }: Props) {
  // Transform data for Recharts Scatter plot to simulate a heatmap
  // This is a simplified visualization. Real heatmap requires more complex mapping.
  
  // Extract unique assets from pairs like "AAPL-GOOG"
  const assets = new Set<string>();
  Object.keys(data).forEach(pair => {
    // Handle multiple separators: "-", "/", " ", "_", and "|"
    // Handle multiple separators: prioritize pipe "|" as it's unambiguous for tickers with dashes
    const separators = ['|', '/', ' ', '_', '-'];
    let a, b;
    for (const sep of separators) {
      if (pair.includes(sep)) {
        const parts = pair.split(sep).filter(Boolean);
        if (parts.length >= 2) {
          [a, b] = parts;
          break;
        }
      }
    }
    // Fallback: if no separator but string is long, it might be a concatenated key
    // but usually keys from python main.py use '-' or '/'
    if (a) assets.add(a.trim());
    if (b) assets.add(b.trim());
  });
  
  const assetList = Array.from(assets).sort();
  
  if (assetList.length === 0) {
    return (
      <div className="w-full h-[400px] bg-card rounded-lg border border-border p-4 flex flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-sm font-mono text-center">
          No correlation data available for the current asset selection.<br/>
          (Received {Object.keys(data).length} raw keys)
        </p>
      </div>
    );
  }
  
  const plotData = assetList.flatMap((yAsset, yIndex) => 
    assetList.map((xAsset, xIndex) => {
      // Use string keys for categorical axes
      const baseObj = { x: xAsset, y: yAsset, size: 1 }; // Size 1 for uniform ZAxis
      
      if (xAsset === yAsset) return { ...baseObj, value: 1, pair: `${xAsset}-${yAsset}` };
      
      // Check every possible permutation of the key
      const key1 = `${xAsset}-${yAsset}`;
      const key2 = `${yAsset}-${xAsset}`;
      const key3 = `${xAsset}/${yAsset}`;
      const key4 = `${yAsset}/${xAsset}`;
      const key5 = `${xAsset} ${yAsset}`;
      const key6 = `${yAsset} ${xAsset}`;
      const key7 = `${xAsset}|${yAsset}`;
      const key8 = `${yAsset}|${xAsset}`;
      
      let value = data[key1] ?? data[key2] ?? data[key3] ?? data[key4] ?? data[key5] ?? data[key6] ?? data[key7] ?? data[key8];
      
      // If still 0, try exact match from the original data keys
      if (value === undefined) {
        const foundKey = Object.keys(data).find(k => 
          (k.includes(xAsset) && k.includes(yAsset))
        );
        if (foundKey) value = data[foundKey];
      }
      
      return { ...baseObj, value: value ?? 0, pair: key1 };
    })
  );

  return (
    <div className="w-full h-[500px] bg-card rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium mb-4 text-muted-foreground">Cross-Asset Correlation Matrix</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
          <XAxis 
            type="category" 
            dataKey="x" 
            allowDuplicatedCategory={false}
            interval={0}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            tick={{fontSize: 11, fill: '#94a3b8'}}
          />
          <YAxis 
            type="category" 
            dataKey="y" 
            allowDuplicatedCategory={false}
            interval={0}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            tick={{fontSize: 11, fill: '#94a3b8'}}
          />
          <ZAxis type="number" dataKey="size" range={[800, 800]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border border-border p-2 rounded shadow-xl text-xs">
                    <p className="font-bold mb-1 text-foreground">{data.x} vs {data.y}</p>
                    <p className="text-muted-foreground">Correlation: <span className={data.value > 0 ? "text-primary" : "text-destructive"}>{data.value.toFixed(3)}</span></p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter data={plotData} shape="square">
            {plotData.map((entry, index) => {
              // Color scale: Red (-1) -> Grey (0) -> Green (1)
              let color = '#64748b'; // grey default
              if (entry.value > 0.05) {
                // Green intensity
                const opacity = Math.min(1, 0.3 + Math.abs(entry.value));
                color = `rgba(34, 197, 94, ${opacity})`; 
              } else if (entry.value < -0.05) {
                // Red intensity
                const opacity = Math.min(1, 0.3 + Math.abs(entry.value));
                color = `rgba(239, 68, 68, ${opacity})`;
              }
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

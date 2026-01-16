import { ASSET_NAMES } from "@/pages/Dashboard";
import { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NetworkGraphProps {
  rankings: any[];
}

export function AssetNetworkGraph({ rankings }: NetworkGraphProps) {
  const fgRef = useRef<any>();

  const graphData = {
    nodes: Array.from(new Set(rankings.flatMap(r => [r.target, r.candidate]))).map(id => ({ id })),
    links: rankings.map(r => ({
      source: r.candidate,
      target: r.target,
      value: Math.abs(r.composite_score) * 10,
      label: `Lead: ${r.best_lag}d`
    }))
  };

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-1000);
      fgRef.current.d3Force('link').distance(200);
      fgRef.current.d3Force('center').strength(0.05);
    }
  }, [graphData]);

  return (
    <Card className="col-span-1 lg:col-span-2 bg-card border-border overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Cross-Asset Lead-Lag Network</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full bg-black/20">
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel={(node: any) => `${ASSET_NAMES[node.id] || node.id}`}
            nodeAutoColorBy="id"
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.25}
            linkLabel="label"
            linkColor={() => 'rgba(255, 255, 255, 0.2)'}
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.3}
            cooldownTicks={100}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.id;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0] as number, bckgDimensions[1] as number);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color;
              ctx.fillText(label, node.x, node.y);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

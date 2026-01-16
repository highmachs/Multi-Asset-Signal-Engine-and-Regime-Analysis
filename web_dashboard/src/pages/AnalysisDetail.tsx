import { Layout } from "@/components/Layout";
import { useAnalysisRun } from "@/hooks/use-analysis";
import { useRoute } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { CorrelationHeatmap } from "@/components/CorrelationHeatmap";
import { LeadLagChart } from "@/components/LeadLagChart";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, TerminalSquare, FileSpreadsheet } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetNetworkGraph } from "@/components/AssetNetworkGraph";
import { AnalysisReport } from "@/components/AnalysisReport";
import { format } from "date-fns";

export default function AnalysisDetail() {
  const [match, params] = useRoute("/analysis/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: run, isLoading, error } = useAnalysisRun(id);

  if (isLoading) return (
    <Layout>
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </Layout>
  );

  if (error || !run) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
        <TerminalSquare size={48} className="mb-4 text-destructive" />
        <h2 className="text-xl font-bold">Analysis Not Found</h2>
        <p className="mb-6">The requested run ID #{id} does not exist or failed to load.</p>
        <Link href="/">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    </Layout>
  );

  const results = run.results as any;
  const correlations = results?.correlations || {};
  const rankings = results?.lead_lag_rankings || [];

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} className="mr-1" /> Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold">Analysis Run #{id}</h1>
                <StatusBadge status={run.status} className="text-sm px-3 py-1" />
              </div>
              <p className="text-muted-foreground font-mono text-sm">
                Config: {(run.config as any).lookbackDays}d lookback • {(run.config as any).lagWindow}d lag window
              </p>
            </div>
            
            {run.status === 'completed' && (
              <div className="flex gap-2">
                <Button 
                   variant="outline"
                   className="gap-2 border-primary/20 hover:bg-primary/10 text-primary"
                   onClick={async () => {
                     try {
                        const res = await fetch('/api/analysis', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(run.config)
                        });
                        const newRun = await res.json();
                        window.location.href = `/analysis/${newRun.id}`;
                     } catch (e) {
                        alert("Failed to restart analysis");
                     }
                   }}
                >
                   <TerminalSquare size={16} /> Re-Run Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 border-primary/20 hover:bg-primary/10 text-primary"
                  onClick={() => window.open(`/api/analysis/${id}/download`, '_blank')}
                >
                  <FileSpreadsheet size={16} /> Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 border-primary/20 hover:bg-primary/10 text-primary"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(run.results, null, 2));
                    const downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute("href", dataStr);
                    downloadAnchorNode.setAttribute("download", `analysis_results_${id}.json`);
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                  }}
                >
                  <Download size={16} /> Export JSON
                </Button>
              </div>
            )}
          </div>
        </div>

        {run.status === 'pending' || run.status === 'processing' ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border border-dashed">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-primary font-bold">
                {run.status === 'processing' ? 'RUN' : 'Q'}
              </div>
            </div>
            <h3 className="mt-6 text-xl font-medium">Analysis in Progress</h3>
            <p className="text-muted-foreground max-w-md text-center mt-2">
              The quantitative engine is crunching the numbers. This page will automatically update when results are ready.
            </p>
          </div>
        ) : run.status === 'failed' ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <h3 className="text-lg font-bold text-destructive mb-2">Analysis Failed</h3>
            <p className="text-muted-foreground mb-4">An error occurred during execution.</p>
            <pre className="bg-black/30 p-4 rounded text-left text-xs font-mono overflow-auto max-h-64 text-red-200">
              {run.logs || "No error logs available."}
            </pre>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalysisReport rankings={rankings} config={run.config} runId={run.id} />
            
            <AssetNetworkGraph rankings={rankings} />

            <div className="col-span-1 lg:col-span-2">
              <CorrelationHeatmap data={correlations} />
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Top Lead-Lag Relationships</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">Pair</th>
                        <th className="px-4 py-3 text-left">Leader</th>
                        <th className="px-4 py-3 text-right">Lag (Days)</th>
                        <th className="px-4 py-3 text-right">Strength</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {rankings.slice(0, 8).map((rank: any, i: number) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-mono text-xs">{rank.target} / {rank.candidate}</td>
                          <td className="px-4 py-3 text-primary font-medium">{rank.candidate}</td>
                          <td className="px-4 py-3 text-right font-mono">{rank.best_lag}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2">
                                <div className="inline-block w-16 h-1.5 bg-secondary rounded-full overflow-hidden align-middle">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${Math.abs(rank.peak_correlation || 0) * 100}%` }} 
                                  />
                                </div>
                                <span className="text-xs font-mono">{(rank.peak_correlation || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="col-span-1">
              {rankings.length > 0 && (
                <LeadLagChart 
                  target={rankings[0].target} 
                  leader={rankings[0].candidate} 
                  data={rankings[0].lag_curve}
                  maxLag={(run.config as any).lagWindow || 10} 
                />
              )}
            </div>

            <div className="col-span-1 lg:col-span-2">
              <div className="bg-black/40 border border-border rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto">
                <div className="text-muted-foreground mb-2 sticky top-0 bg-black/40 backdrop-blur pb-2 border-b border-white/5">
                  Execution Logs
                </div>
                <pre className="text-green-400/80 whitespace-pre-wrap">
                  {run.logs || "> Analysis completed successfully.\n> No warnings."}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

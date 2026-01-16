import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Layout } from "@/components/Layout";
import { CreateAnalysisDialog } from "@/components/CreateAnalysisDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useAnalysisRuns } from "@/hooks/use-analysis";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Clock, Database, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export const ASSET_NAMES: Record<string, string> = {
  "CL=F": "Crude Oil Futures",
  "GC=F": "Gold Futures",
  "SI=F": "Silver Futures",
  "NG=F": "Natural Gas Futures",
  "HG=F": "Copper Futures",
  "ZC=F": "Corn Futures",
  "ZW=F": "Wheat Futures",
  "ZS=F": "Soybean Futures",
  "KC=F": "Coffee Futures",
  "CT=F": "Cotton Futures",
  "SPY": "S&P 500 ETF Trust",
  "QQQ": "Invesco QQQ Trust (Nasdaq 100)",
  "AAPL": "Apple Inc.",
  "MSFT": "Microsoft Corporation",
  "NVDA": "NVIDIA Corporation",
  "TSLA": "Tesla, Inc.",
  "GOOGL": "Alphabet Inc. (Google)",
  "AMZN": "Amazon.com, Inc.",
  "META": "Meta Platforms, Inc.",
  "BRK-B": "Berkshire Hathaway Inc.",
  "BTC-USD": "Bitcoin",
  "ETH-USD": "Ethereum",
  "SOL-USD": "Solana",
  "BNB-USD": "Binance Coin",
  "XRP-USD": "Ripple",
  "ADA-USD": "Cardano",
  "DOGE-USD": "Dogecoin",
  "DOT-USD": "Polkadot",
  "MATIC-USD": "Polygon",
  "LINK-USD": "Chainlink"
};

export const TickerWithTooltip = ({ ticker }: { ticker: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-muted-foreground/50 transition-colors hover:text-primary">
            {ticker}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover text-popover-foreground shadow-lg border-border animate-in fade-in zoom-in-95 duration-200">
          <p className="text-sm font-medium">{ASSET_NAMES[ticker] || ticker}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function Dashboard() {
  const { data: runs, isLoading } = useAnalysisRuns();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/analysis/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analysis"] });
      toast({ title: "Analysis deleted" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stats = [
    { label: "Total Runs", value: runs?.length || 0, icon: Database, color: "text-blue-400" },
    { label: "Active Jobs", value: runs?.filter(r => r.status === 'processing' || r.status === 'pending').length || 0, icon: Clock, color: "text-yellow-400" },
    { label: "Stability Target", value: ">0.70", icon: BarChart3, color: "text-primary" },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Multi-Asset Correlater + Regime Engine</h1>
            <p className="text-muted-foreground mt-1">Institutional lead-lag analysis and market regime detection.</p>
          </div>
          <CreateAnalysisDialog />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-mono font-bold mt-2 text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Runs Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Recent Analysis Runs</h2>
            <Link href="/analysis" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Run ID</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Config</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : runs?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No analysis runs found. Start a new one.
                    </td>
                  </tr>
                ) : (
                  runs?.slice(0, 10).map((run, index) => (
                    <tr key={run.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-muted-foreground">#{((runs?.length || 0) - (runs?.indexOf(run) ?? 0)).toString().padStart(4, '0')}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-mono">Lookback: {(run.config as any).lookbackDays}d</span>
                          <span className="font-mono">Lag: {(run.config as any).lagWindow}d</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {run.createdAt && formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                          <Link href={`/analysis/${run.id}`}>
                            <Button variant="ghost" size="sm" disabled={run.status === 'pending' || run.status === 'processing'}>
                              View Results
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMutation.mutate(run.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-analysis-${run.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

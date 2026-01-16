import { TickerWithTooltip } from "@/pages/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ShieldCheck, TrendingUp, AlertTriangle, FileText, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnalysisReportProps {
  rankings: any[];
  config: any;
  runId: number;
}

export function AnalysisReport({ rankings, config, runId }: AnalysisReportProps) {
  if (!rankings || rankings.length === 0) return null;

  const topPair = rankings[0];
  const avgCorrelationRaw = (rankings.reduce((acc, r) => acc + Math.abs(r.peak_correlation), 0) / rankings.length);
  const leadingAssets = Array.from(new Set(rankings.filter(r => r.best_lag > 0).map(r => r.candidate)));
  
  const reportText = (
    <>
      Analysis ID: {runId} - Based on the latest analysis over a {config.lookbackDays}-day lookback period, wc have identified a significant lead-lag relationship between <TickerWithTooltip ticker={topPair.candidate} /> and <TickerWithTooltip ticker={topPair.target} />. <TickerWithTooltip ticker={topPair.candidate} /> currently acts as a leading indicator with a {topPair.best_lag}-day temporal offset and a peak correlation of {(topPair.peak_correlation * 100).toFixed(1)}%. Overall, the market universe shows an average predictive strength of {(avgCorrelationRaw * 100).toFixed(1)}%. We recommend monitoring {leadingAssets.slice(0, 3).map((ticker, i) => (
        <span key={ticker}>
          <TickerWithTooltip ticker={ticker} />
          {i < leadingAssets.slice(0, 3).length - 1 ? ', ' : ''}
        </span>
      ))} as primary predictors for the selected target commodities.
    </>
  );

  return (
    <Card className="col-span-1 lg:col-span-2 bg-primary/5 border-primary/20 shadow-inner">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl font-display font-bold">Executive Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-base leading-relaxed text-foreground/90 font-medium italic border-l-2 border-primary/20 pl-4 py-1">
          "{reportText}"
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-primary/10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">Top Predictor <HelpCircle size={8} /></p>
                    <p className="text-lg font-mono font-bold"><TickerWithTooltip ticker={topPair.candidate} /></p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">The asset that shows the strongest historical predictive correlation to the targets.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">Avg. Strength <HelpCircle size={8} /></p>
                    <p className="text-lg font-mono font-bold">{(avgCorrelationRaw * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">The mean peak correlation across all analyzed asset pairs in this run.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">Universe Size <HelpCircle size={8} /></p>
                    <p className="text-lg font-mono font-bold">{rankings.length} Pairs</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Total number of unique lead-lag relationships processed by the engine.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-500/90 italic">
            <strong>Analyst Note:</strong> Statistical stability for <TickerWithTooltip ticker={topPair.candidate} /> remains high, however, volatility regimes have shifted recently. Ensure cross-asset diversification.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

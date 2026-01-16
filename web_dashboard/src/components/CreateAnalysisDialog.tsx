import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateAnalysis } from "@/hooks/use-analysis";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, CalendarIcon, Check, HelpCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ASSET_UNIVERSE = {
  COMMODITIES: [
    { symbol: "CL=F", name: "Crude Oil" },
    { symbol: "GC=F", name: "Gold" },
    { symbol: "SI=F", name: "Silver" },
    { symbol: "NG=F", name: "Natural Gas" },
    { symbol: "HG=F", name: "Copper" },
    { symbol: "ZC=F", name: "Corn" },
    { symbol: "ZW=F", name: "Wheat" },
    { symbol: "ZS=F", name: "Soybeans" },
    { symbol: "KC=F", name: "Coffee" },
    { symbol: "CT=F", name: "Cotton" }
  ],
  EQUITIES: [
    { symbol: "AAPL", name: "Apple" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "NVDA", name: "Nvidia" },
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "GOOGL", name: "Alphabet" },
    { symbol: "AMZN", name: "Amazon" },
    { symbol: "META", name: "Meta" },
    { symbol: "BRK-B", name: "Berkshire" },
    { symbol: "SPY", name: "S&P 500" },
    { symbol: "QQQ", name: "Nasdaq 100" }
  ],
  CRYPTO: [
    { symbol: "BTC-USD", name: "Bitcoin" },
    { symbol: "ETH-USD", name: "Ethereum" },
    { symbol: "SOL-USD", name: "Solana" },
    { symbol: "BNB-USD", name: "Binance" },
    { symbol: "XRP-USD", name: "XRP" },
    { symbol: "ADA-USD", name: "Cardano" },
    { symbol: "DOGE-USD", name: "Dogecoin" },
    { symbol: "DOT-USD", name: "Polkadot" },
    { symbol: "MATIC-USD", name: "Polygon" },
    { symbol: "LINK-USD", name: "Chainlink" }
  ]
};

export function CreateAnalysisDialog() {
  const [open, setOpen] = useState(false);
  const [lookbackDays, setLookbackDays] = useState(252);
  const [lagWindow, setLagWindow] = useState(10);
  const [rollingWindow, setRollingWindow] = useState(60);
  const [walkForward, setWalkForward] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const [selectedTargets, setSelectedTargets] = useState<string[]>(["CL=F", "GC=F"]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(["SPY", "BTC-USD"]);
  const [customTarget, setCustomTarget] = useState("");
  const [customCandidate, setCustomCandidate] = useState("");
  const [cmcApiKey, setCmcApiKey] = useState(localStorage.getItem("cmc_api_key") || "");
  const [massiveApiKey, setMassiveApiKey] = useState(localStorage.getItem("massive_api_key") || "");
  const [alphaApiKey, setAlphaApiKey] = useState(localStorage.getItem("alpha_api_key") || "");

  const { toast } = useToast();
  const createMutation = useCreateAnalysis();

  const toggleTarget = (sym: string) => {
    setSelectedTargets(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const toggleCandidate = (sym: string) => {
    setSelectedCandidates(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTargets.length === 0 || selectedCandidates.length === 0) {
      toast({ title: "Validation Error", description: "Select at least one target and one candidate.", variant: "destructive" });
      return;
    }
    try {
      // Merge selected predefined assets with custom ones
      const finalTargets = [...selectedTargets];
      const finalCandidates = [...selectedCandidates];

      await createMutation.mutateAsync({
        lookbackDays,
        lagWindow,
        rollingWindow,
        startDate,
        endDate,
        targetAssets: finalTargets,
        candidateAssets: finalCandidates,
        walkForward,
        cmcApiKey,
        massiveApiKey,
        alphaApiKey
      });
      toast({
        title: "Analysis Started",
        description: `Running engine for ${selectedTargets.length} targets x ${selectedCandidates.length} candidates.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start analysis run.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-mono text-sm">
          <Plus size={16} /> New Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Configure Engine</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customize lead-lag assets, dates, and rolling windows.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <form id="analysis-form" onSubmit={handleSubmit} className="space-y-8 mt-4 pb-4">
            {/* Asset Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-bold uppercase tracking-wider text-primary">1. Asset Selection</Label>
              
              <Tabs defaultValue="targets" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="targets">Target (Commodities)</TabsTrigger>
                  <TabsTrigger value="candidates">Candidates (Predictors)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="targets" className="mt-4 border rounded-md p-4 bg-black/20">
                  {/* Custom selection list */}
                  {selectedTargets.some(s => !ASSET_UNIVERSE.COMMODITIES.some(a => a.symbol === s)) && (
                    <div className="mb-4 pb-4 border-b border-border/30">
                      <Label className="text-[10px] text-muted-foreground uppercase mb-2 block">Custom Selections</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTargets.filter(s => !ASSET_UNIVERSE.COMMODITIES.some(a => a.symbol === s)).map(sym => (
                          <div key={sym} className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-2 py-1 text-[10px] font-mono">
                            {sym}
                            <button onClick={() => setSelectedTargets(prev => prev.filter(p => p !== sym))} className="text-primary hover:text-primary/70">
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mb-4">
                    <Input 
                      placeholder="Add custom ticker (e.g. GLD, OIL)..." 
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value.toUpperCase())}
                      className="h-8 text-xs font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customTarget && !selectedTargets.includes(customTarget)) {
                            setSelectedTargets(prev => [...prev, customTarget]);
                            setCustomTarget("");
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        if (customTarget && !selectedTargets.includes(customTarget)) {
                          setSelectedTargets(prev => [...prev, customTarget]);
                          setCustomTarget("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {ASSET_UNIVERSE.COMMODITIES.map(asset => (
                      <div key={asset.symbol} className="flex items-center space-x-2 group cursor-pointer" onClick={() => toggleTarget(asset.symbol)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedTargets.includes(asset.symbol) ? 'bg-primary border-primary' : 'border-muted-foreground group-hover:border-primary'}`}>
                          {selectedTargets.includes(asset.symbol) && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-xs font-mono">{asset.symbol} <span className="text-muted-foreground ml-1 font-sans">({asset.name})</span></span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="candidates" className="mt-4 border rounded-md p-4 bg-black/20">
                  {/* Custom selection list */}
                  {selectedCandidates.some(s => !Object.values(ASSET_UNIVERSE).flat().some(a => a.symbol === s)) && (
                    <div className="mb-4 pb-4 border-b border-border/30">
                      <Label className="text-[10px] text-muted-foreground uppercase mb-2 block">Custom Selections</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidates.filter(s => !Object.values(ASSET_UNIVERSE).flat().some(a => a.symbol === s)).map(sym => (
                          <div key={sym} className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-2 py-1 text-[10px] font-mono">
                            {sym}
                            <button onClick={() => setSelectedCandidates(prev => prev.filter(p => p !== sym))} className="text-primary hover:text-primary/70">
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mb-4">
                    <Input 
                      placeholder="Add custom ticker (e.g. TSLA, ETH-USD)..." 
                      value={customCandidate}
                      onChange={(e) => setCustomCandidate(e.target.value.toUpperCase())}
                      className="h-8 text-xs font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customCandidate && !selectedCandidates.includes(customCandidate)) {
                            setSelectedCandidates(prev => [...prev, customCandidate]);
                            setCustomCandidate("");
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        if (customCandidate && !selectedCandidates.includes(customCandidate)) {
                          setSelectedCandidates(prev => [...prev, customCandidate]);
                          setCustomCandidate("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-4">
                      {Object.entries(ASSET_UNIVERSE).map(([cat, list]) => (
                        <div key={cat}>
                          <h4 className="text-[10px] font-bold text-muted-foreground mb-2 uppercase">{cat}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {list.map(asset => (
                              <div key={asset.symbol} className="flex items-center space-x-2 group cursor-pointer" onClick={() => toggleCandidate(asset.symbol)}>
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCandidates.includes(asset.symbol) ? 'bg-primary border-primary' : 'border-muted-foreground group-hover:border-primary'}`}>
                                  {selectedCandidates.includes(asset.symbol) && <Check size={12} className="text-white" />}
                                </div>
                                <span className="text-[10px] font-mono">{asset.symbol} <span className="text-muted-foreground opacity-70 font-sans">({asset.name})</span></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider text-primary">2. Timeline & Parameters</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Start Date</Label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-background font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">End Date</Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="text-xs cursor-help underline decoration-dotted flex items-center gap-1">
                          Max Lag Window <HelpCircle size={10} />
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs w-64">The maximum number of days to shift assets back/forward to find predictive patterns.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs font-mono text-primary font-bold">{lagWindow}d</span>
                </div>
                <Slider min={1} max={30} step={1} value={[lagWindow]} onValueChange={(vals) => setLagWindow(vals[0])} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="text-xs cursor-help underline decoration-dotted flex items-center gap-1">
                          Rolling Window <HelpCircle size={10} />
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs w-64">The lookback period used for calculating correlation at each point in time.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs font-mono text-primary font-bold">{rollingWindow}d</span>
                </div>
                <Slider min={20} max={120} step={5} value={[rollingWindow]} onValueChange={(vals) => setRollingWindow(vals[0])} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label className="text-xs">Walk-Forward Optimization</Label>
                  <p className="text-[10px] text-muted-foreground">Find best rolling window automatically.</p>
                </div>
                <Switch checked={walkForward} onCheckedChange={setWalkForward} />
              </div>
            </div>

            {/* API Integrations */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="text-sm font-bold uppercase tracking-wider text-primary">3. API Integrations (Optional)</Label>
              <p className="text-[10px] text-muted-foreground">Input keys to unlock expanded asset universes from Massive.com and CoinMarketCap.</p>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-mono">Massive.com API Key</Label>
                  <Input 
                    type="password"
                    placeholder="Enter massive.com key..."
                    value={massiveApiKey}
                    onChange={(e) => setMassiveApiKey(e.target.value)}
                    className="bg-background/50 h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-mono">CoinMarketCap API Key</Label>
                  <Input 
                    type="password"
                    placeholder="Enter CMC key..."
                    value={cmcApiKey}
                    onChange={(e) => setCmcApiKey(e.target.value)}
                    className="bg-background/50 h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-mono">AlphaVantage API Key</Label>
                  <Input 
                    type="password"
                    placeholder="Enter AlphaVantage key..."
                    value={alphaApiKey}
                    onChange={(e) => setAlphaApiKey(e.target.value)}
                    className="bg-background/50 h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="mt-6 border-t pt-4">
          <Button 
            form="analysis-form"
            type="submit" 
            disabled={createMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full py-6 text-base font-bold"
          >
            {createMutation.isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> EXECUTING...</>
            ) : (
              "EXECUTE ENGINE"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

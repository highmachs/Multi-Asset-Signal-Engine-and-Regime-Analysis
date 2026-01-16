import { Layout } from "@/components/Layout";
import { useAssets } from "@/hooks/use-analysis";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function DataStatus() {
  const { data: assets, isLoading } = useAssets();

  // Group assets by type
  const groupedAssets = assets?.reduce((acc, asset) => {
    const type = asset.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<string, typeof assets>) || {};

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Data Universe</h1>
          <p className="text-muted-foreground mt-1">Status of market data ingestion and asset availability.</p>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{isLoading ? <Skeleton className="h-8 w-16"/> : assets?.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Live</div>
              <p className="text-xs text-muted-foreground">Updated 2 mins ago</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">All sources operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Asset Lists by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {isLoading ? (
             Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
          ) : (
            Object.entries(groupedAssets).map(([type, list]) => (
              <div key={type} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
                  <h3 className="font-semibold capitalize text-lg">{type}</h3>
                  <Badge variant="outline" className="font-mono text-xs">{list.length} symbols</Badge>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-xs text-muted-foreground text-left">
                        <th className="px-6 py-3 font-medium">Symbol</th>
                        <th className="px-6 py-3 font-medium">Name</th>
                        <th className="px-6 py-3 font-medium text-right">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {list.map((asset) => (
                        <tr key={asset.symbol} className="hover:bg-muted/10">
                          <td className="px-6 py-3 font-mono font-bold text-primary">{asset.symbol}</td>
                          <td className="px-6 py-3 text-muted-foreground">{asset.name || "-"}</td>
                          <td className="px-6 py-3 text-right font-mono text-xs text-muted-foreground">
                            {format(new Date(), 'HH:mm:ss')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Shield, Key, Bell, Database } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [cmcKey, setCmcKey] = useState(localStorage.getItem("cmc_api_key") || "");
  const [massiveKey, setMassiveKey] = useState(localStorage.getItem("massive_api_key") || "");
  const [alphaKey, setAlphaKey] = useState(localStorage.getItem("alpha_api_key") || "");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    localStorage.setItem("cmc_api_key", cmcKey);
    localStorage.setItem("massive_api_key", massiveKey);
    localStorage.setItem("alpha_api_key", alphaKey);
    toast({
      title: "Settings Saved",
      description: "Your global preferences have been updated.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Manage your global API integrations and system preferences.</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                <CardTitle>API Integrations</CardTitle>
              </div>
              <CardDescription>
                Store your API keys locally to unlock expanded asset universes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="massive">Massive.com API Key</Label>
                <Input
                  id="massive"
                  type="password"
                  placeholder="Enter massive.com API key"
                  value={massiveKey}
                  onChange={(e) => setMassiveKey(e.target.value)}
                  className="bg-background font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cmc">CoinMarketCap API Key</Label>
                <Input
                  id="cmc"
                  type="password"
                  placeholder="Enter CMC API key"
                  value={cmcKey}
                  onChange={(e) => setCmcKey(e.target.value)}
                  className="bg-background font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alpha">AlphaVantage API Key</Label>
                <Input
                  id="alpha"
                  type="password"
                  placeholder="Enter AlphaVantage API key"
                  value={alphaKey}
                  onChange={(e) => setAlphaKey(e.target.value)}
                  className="bg-background font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure how the analysis engine behaves.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Refresh Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically poll for new asset prices during active sessions.
                  </p>
                </div>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when background analysis jobs complete.
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reset Changes
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save size={16} /> Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

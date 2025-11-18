"use client";

import { useEffect, useState } from "react";
import { User, Battery, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { InstallPWAHint } from "@/components/InstallPWAHint";
import { useAppStore } from "@/lib/store";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/LogoutButton";

const supabase = createBrowserSupabaseClient();

export default function SettingsPage() {
  const chargeThreshold = useAppStore((state) => state.chargeThreshold);
  const setChargeThreshold = useAppStore((state) => state.setChargeThreshold);
  const preferCharger = useAppStore((state) => state.preferCharger);
  const setPreferCharger = useAppStore((state) => state.setPreferCharger);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then((response: any) => {
      if (!active) return;
      setUserEmail(response.data.user?.email ?? "");
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageShell title="Settings" subtitle="Manage your preferences">
      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input value={userEmail} disabled />
            </div>
            <LogoutButton variant="destructive" className="w-full justify-center" showIcon>
              Sign Out
            </LogoutButton>
          </CardContent>
        </Card>

        {/* EV Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Battery className="h-5 w-5" />
              EV Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Low Battery Threshold: {chargeThreshold}%
              </label>
              <Input
                type="range"
                min="10"
                max="50"
                value={chargeThreshold}
                onChange={(e) => setChargeThreshold(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Show charger recommendations below this level
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Prefer Charger Zones</p>
                <p className="text-xs text-muted-foreground">
                  Prioritize zones near charging stations
                </p>
              </div>
              <Button
                variant={preferCharger ? "default" : "outline"}
                size="sm"
                onClick={() => setPreferCharger(!preferCharger)}
              >
                {preferCharger ? "ON" : "OFF"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All your ride data is protected by Row-Level Security (RLS). Only you can access your events and location history.
            </p>
          </CardContent>
        </Card>

        {/* <InstallPWAHint /> */}
      </div>
    </PageShell>
  );
}

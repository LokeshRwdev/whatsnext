"use client";

import { Map as MapIcon, Layers, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/PageShell";

export default function MapPage() {
  return (
    <PageShell title="Map" subtitle="Your ride locations">
      <div className="relative h-full">
        {/* Placeholder for MapLibre */}
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center space-y-3">
            <MapIcon className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium">Map View</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Install maplibre-gl to view your ride locations on an interactive map
            </p>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="shadow-lg">
            <Navigation className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="secondary" className="shadow-lg">
            <Layers className="h-5 w-5" />
          </Button>
        </div>

        {/* Privacy Notice */}
        <Card className="absolute bottom-20 left-4 right-4 md:left-4 md:right-auto md:w-80 p-3 shadow-lg">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Privacy:</span> All points are your own data, protected by RLS.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}

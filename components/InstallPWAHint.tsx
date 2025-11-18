"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function InstallPWAHint() {
  const [showHint, setShowHint] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = localStorage.getItem("pwa-hint-dismissed");

    if (!isStandalone && !dismissed) {
      setShowHint(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowHint(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowHint(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowHint(false);
    localStorage.setItem("pwa-hint-dismissed", "true");
  };

  if (!showHint) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 z-50 shadow-lg">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Install App</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Add to your home screen for quick access while driving
          </p>
          <Button size="sm" onClick={handleInstall} className="w-full">
            Install Now
          </Button>
        </div>
      </div>
    </Card>
  );
}

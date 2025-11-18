"use client";

import { useState, useEffect } from "react";
import { History as HistoryIcon, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { BatteryChip } from "@/components/BatteryChip";
import { GeoBadge } from "@/components/GeoBadge";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { format } from "date-fns";

const supabase = createBrowserSupabaseClient();

interface RideEvent {
  id: string;
  event_type: string;
  occurred_at: string;
  zone_id: number | null;
  battery_pct: number | null;
}

export default function HistoryPage() {
  const [events, setEvents] = useState<RideEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const { data } = await supabase
        .from("ride_events")
        .select("id,event_type,occurred_at,zone_id,battery_pct")
        .order("occurred_at", { ascending: false })
        .limit(50);
      
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((e) =>
    e.event_type.toLowerCase().includes(search.toLowerCase())
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case "booking_received": return "🚗";
      case "ride_started": return "▶️";
      case "ride_completed": return "✅";
      case "booking_cancelled": return "❌";
      default: return "📍";
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "booking_received": return "Booking Received";
      case "ride_started": return "Ride Started";
      case "ride_completed": return "Ride Completed";
      case "booking_cancelled": return "Cancelled";
      default: return type;
    }
  };

  return (
    <PageShell title="Ride History" subtitle="Your recent ride events">
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No events yet"
            description="Your ride events will appear here"
          />
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="p-4 hover:bg-muted/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getEventIcon(event.event_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">
                          {getEventLabel(event.event_type)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.occurred_at), "MMM d, yyyy · h:mm a")}
                        </p>
                      </div>
                      <BatteryChip percentage={event.battery_pct} />
                    </div>
                    {event.zone_id && (
                      <GeoBadge zoneName={`Zone ${event.zone_id}`} className="mt-2" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

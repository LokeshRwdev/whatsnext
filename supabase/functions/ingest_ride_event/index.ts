// @ts-ignore: Deno types
import { serve } from "https://deno.land/std/http/server.ts";
// @ts-ignore: Deno types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// @ts-ignore: Deno global
serve(async (req) => {
  // @ts-ignore: Deno global
  const supabase = createClient(
    // @ts-ignore: Deno global
    Deno.env.get("SUPABASE_URL")!, 
    // @ts-ignore: Deno global
    Deno.env.get("SUPABASE_ANON_KEY")!, 
    { 
      global: { 
        headers: { 
          Authorization: req.headers.get("Authorization")! 
        } 
      } 
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  
  const body = await req.json();
  const { event_type, occurred_at, lat, lon, battery_pct } = body || {};
  
  const { error } = await supabase.rpc("ingest_ride_event", { 
    p_event_type: event_type, 
    p_occurred_at: occurred_at, 
    p_lat: lat, 
    p_lon: lon, 
    p_battery_pct: battery_pct 
  });
  
  if (error) return new Response(error.message, { status: 500 });
  return new Response("ok");
});

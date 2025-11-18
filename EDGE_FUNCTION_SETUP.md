# Edge Function Setup & Troubleshooting

## 🎯 Problem Solved

This project previously had issues with:
- ❌ 404 errors when calling `/functions/v1/ingest_ride_event` directly
- ❌ Next.js trying to handle Edge Function routes
- ❌ Inconsistent behavior between dev and production

**Solution**: All Edge Function calls now use the Supabase SDK via `supabase.functions.invoke()`, ensuring consistent behavior across environments.

## 📋 Setup Checklist

### 1. Environment Variables

Create or verify `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For Local Development** (if using `supabase start`):
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase/.env>
```

### 2. Deploy Edge Function

```bash
# Deploy to your Supabase project
supabase functions deploy ingest_ride_event

# Verify deployment
supabase functions list
```

Expected output:
```
┌───────────────────────┬─────────┬────────────────────┐
│ NAME                  │ VERSION │ CREATED AT         │
├───────────────────────┼─────────┼────────────────────┤
│ ingest_ride_event     │ 1       │ 2025-11-10 06:30   │
└───────────────────────┴─────────┴────────────────────┘
```

### 3. Test Edge Function (CURL)

Get your access token first:
```javascript
// In browser console after login
const { data: { session } } = await supabase.auth.getSession();
console.log(session.access_token);
```

Test the function:
```bash
curl -i -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/functions/v1/ingest_ride_event" \
  -H "Content-Type: application/json" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "event_type": "booking_received",
    "lat": 25.5853705,
    "lon": 85.057869,
    "battery_pct": 65
  }'
```

✅ **Success**: HTTP 200 with `{"success":true}`
❌ **Failure**: See troubleshooting section below

### 4. Verify Database Schema

Ensure RLS policies are in place:
```sql
-- Check if ingest_ride_event RPC exists
SELECT proname FROM pg_proc WHERE proname = 'ingest_ride_event';

-- Check RLS on ride_events table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'ride_events';
```

## 🔧 How It Works

### Architecture Flow

```
User Action (Button Click)
    ↓
sendRideEvent() in lib/ride-events.ts
    ↓
supabase.functions.invoke("ingest_ride_event", { body })
    ↓
Supabase Edge Function (Deno runtime)
    ↓
ingest_ride_event RPC in PostgreSQL
    ↓
Insert into ride_events table (with RLS check)
    ↓
Success response → Show toast
OR
Error → Save to offline queue
```

### Key Files

**`lib/ride-events.ts`** - Centralized function caller
```typescript
export async function sendRideEvent(payload: RideEventPayload) {
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "UNAUTHORIZED" };

  // Call Edge Function via SDK
  const { data, error } = await supabase.functions.invoke(
    "ingest_ride_event",
    { body: payload }
  );

  if (error) {
    console.error("[sendRideEvent] Error:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, data };
}
```

**`components/RideConfirmBar.tsx`** - UI integration
```typescript
import { sendRideEvent } from "@/lib/ride-events";

async function post(type: RideEventType) {
  const result = await sendRideEvent(payload);
  
  if (!result.ok) {
    if (result.error === "UNAUTHORIZED") {
      router.push("/login");
      return;
    }
    // Save offline
    await enqueue(payload);
  } else {
    toast.success("Saved!");
  }
}
```

## 🚨 Troubleshooting

### Issue: 404 Not Found

**Symptoms**: 
- Browser console shows 404 for function call
- "Failed to record event" toast appears

**Causes & Fixes**:

1. **Function not deployed**
   ```bash
   supabase functions deploy ingest_ride_event
   ```

2. **Wrong SUPABASE_URL**
   - Check `.env.local` has correct project URL
   - Should be `https://xxxxx.supabase.co` (no trailing slash)
   - Restart dev server after changing env vars

3. **Calling via Next.js route** (old code)
   - ❌ `fetch("/functions/v1/...")`
   - ✅ `supabase.functions.invoke(...)`

### Issue: 401 Unauthorized

**Symptoms**:
- "Please log in to record ride events" toast
- Redirected to `/login`

**Causes & Fixes**:

1. **No active session**
   - User needs to log in via magic link
   - Check session: `supabase.auth.getSession()`

2. **Expired token**
   - Tokens expire after 1 hour by default
   - Re-login to get fresh token

3. **RLS policy rejection**
   - Check `profiles` table has row for user
   - Verify RLS policies allow insert

### Issue: Function Error

**Symptoms**:
- HTTP 500 from Edge Function
- "FUNCTION_ERROR" in response

**Causes & Fixes**:

1. **Check function logs**
   ```bash
   supabase functions logs ingest_ride_event
   ```

2. **Database RPC missing**
   - Apply schema: `psql $DATABASE_URL -f supabase/schema.sql`
   - Verify RPC exists: `SELECT proname FROM pg_proc WHERE proname = 'ingest_ride_event';`

3. **PostGIS extension missing**
   - Check: `SELECT * FROM pg_extension WHERE extname = 'postgis';`
   - Install: `CREATE EXTENSION IF NOT EXISTS postgis;`

### Issue: Offline Queue Not Draining

**Symptoms**:
- Events stuck in IndexedDB
- "Saved offline" but never syncs

**Causes & Fixes**:

1. **Service Worker not registered**
   - Check: `navigator.serviceWorker.ready`
   - Re-register: Reload page

2. **Background sync not triggered**
   - Manual drain: Call `drain()` in console
   - Check SW event listeners

3. **Auth expired during drain**
   - Re-login to get fresh session
   - Queue will retry with new token

## 🧪 Testing Guide

### Manual Test Flow

1. **Start fresh**
   ```bash
   npm run dev
   ```

2. **Login** at http://localhost:3000/login
   - Enter email
   - Click magic link from inbox
   - Should redirect to home page

3. **Test ride event**
   - Enter battery percentage (optional)
   - Click "Got a Ride"
   - Should see "Saved" toast (not "Saved offline")
   - Check browser console: No 404 errors

4. **Verify in database**
   ```sql
   SELECT * FROM ride_events ORDER BY created_at DESC LIMIT 5;
   ```

5. **Test offline mode**
   - Open DevTools → Network → Set to "Offline"
   - Click "Got a Ride"
   - Should see "Saved offline. Will sync when online."
   - Go back online
   - Events should auto-sync within 30 seconds

### Automated Test

```bash
# Use the test script
node scripts/test-function.curl.txt
```

Or use the REST API endpoint:
```bash
# After dev server is running
curl http://localhost:3000/api/ride-events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"booking_received","lat":25.59,"lon":85.14}'
```

## 📚 Additional Resources

- **Supabase Functions Docs**: https://supabase.com/docs/guides/functions
- **Edge Function Logs**: `supabase functions logs ingest_ride_event --follow`
- **Database Migrations**: Place in `supabase/migrations/` folder
- **Local Development**: `supabase start` + update env vars

## ✅ Success Indicators

When everything is working correctly:
- ✅ No 404 errors in browser console
- ✅ "Saved" toast appears immediately
- ✅ Events visible in database within 1 second
- ✅ Offline events sync automatically when online
- ✅ CURL test returns HTTP 200
- ✅ Function logs show successful execution

## 🔄 Migration from Old Code

If you're updating from the previous implementation:

**Old (❌ Don't use)**:
```typescript
const response = await fetch("/functions/v1/ingest_ride_event", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});
```

**New (✅ Use this)**:
```typescript
import { sendRideEvent } from "@/lib/ride-events";

const result = await sendRideEvent(payload);
if (!result.ok) {
  // Handle error
}
```

This ensures:
- Consistent behavior across dev/prod
- Automatic auth header injection
- Better error handling
- Offline queue compatibility

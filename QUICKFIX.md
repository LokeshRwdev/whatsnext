# 🚀 Quick Fix - Edge Function 404s

## Problem
❌ Getting 404 errors when clicking "Got a Ride" button
❌ Events not saving to database
❌ Next.js intercepting `/functions/v1/` requests

## Solution Applied ✅
All Edge Function calls now use Supabase SDK instead of direct fetch().

## Files Changed
1. ✅ **lib/ride-events.ts** - NEW centralized helper
2. ✅ **components/RideConfirmBar.tsx** - Uses sendRideEvent()
3. ✅ **app/(driver)/page.tsx** - Uses sendRideEvent()

## Before You Test

### 1. Deploy Edge Function (ONE TIME)
```bash
supabase functions deploy ingest_ride_event
```

### 2. Verify Environment Variables
Check `.env.local` exists with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Test It Works

1. Open http://localhost:3000
2. Login with magic link
3. Click "Got a Ride"
4. ✅ Should see "Saved" toast
5. ✅ No 404 errors in console

## If Still Getting 404

### Check 1: Function Deployed?
```bash
supabase functions list
# Should show: ingest_ride_event
```

### Check 2: Env Vars Set?
```bash
# PowerShell
$env:NEXT_PUBLIC_SUPABASE_URL
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Check 3: Logged In?
Open browser console:
```javascript
const { data } = await supabase.auth.getSession();
console.log(data.session); // Should not be null
```

### Check 4: Manual CURL Test
```bash
# See scripts/test-function.curl.txt for full command
curl -i "$SUPABASE_URL/functions/v1/ingest_ride_event" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"event_type":"booking_received"}'
```

## Quick Reference

### Old Code (DON'T USE)
```typescript
await fetch("/functions/v1/ingest_ride_event", {...})
```

### New Code (USE THIS)
```typescript
import { sendRideEvent } from "@/lib/ride-events";
const result = await sendRideEvent(payload);
```

## Documentation
- Full guide: `EDGE_FUNCTION_SETUP.md`
- Changes list: `EDGE_FUNCTION_CHANGES.md`
- CURL tests: `scripts/test-function.curl.txt`

## Success Criteria ✅
- [ ] Function deployed
- [ ] Env vars set
- [ ] Dev server restarted
- [ ] Login works
- [ ] "Got a Ride" button saves event
- [ ] No 404 errors in console
- [ ] Event appears in database

Need help? Check `EDGE_FUNCTION_SETUP.md` for full troubleshooting guide.

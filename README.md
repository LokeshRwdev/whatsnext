# Patna EV Co-Pilot

A production-ready Next.js 16 Progressive Web App (PWA) for Ola EV drivers in Patna, Bihar. This app provides intelligent ride assistance with offline-first capabilities, real-time event tracking, and zone-based insights.

## 🚀 Tech Stack

- **Next.js 16** (App Router, TypeScript, Partial Prerendering)
- **Supabase** (PostgreSQL + PostGIS, Edge Functions, Auth)
- **Tailwind CSS** + **shadcn/ui** (Modern component library)
- **IndexedDB** (Offline queue via `idb`)
- **Service Worker** (Background sync, PWA capabilities)
- **Zustand** (State management)
- **Lucide React** (Icons)
- **Sonner** (Toast notifications)

## 📦 Features

- ✅ Magic link authentication (passwordless)
- ✅ One-tap ride event tracking (booking, start, complete, cancel)
- ✅ Offline-first architecture with background sync
- ✅ GPS-based zone detection (11 zones in Patna)
- ✅ Battery percentage tracking with smart alerts
- ✅ Ride history viewer with search and filters
- ✅ Interactive map view (MapLibre ready)
- ✅ PWA installable on mobile devices
- ✅ Row-Level Security (RLS) for data isolation
- ✅ Dark/light theme with system preference detection
- ✅ Mobile-first responsive design
- ✅ Real-time geolocation with high accuracy

## 🗂️ Project Structure

```
patna-ev-copilot/
├── app/
│   ├── (auth)/login/page.tsx          # Magic link login
│   ├── (driver)/
│   │   ├── layout.tsx                  # Driver layout with nav
│   │   ├── page.tsx                    # Home (one-tap ride flow)
│   │   ├── history/page.tsx            # Ride event history
│   │   ├── map/page.tsx                # Map view
│   │   └── settings/page.tsx           # Settings & profile
│   ├── api/sw/route.ts                 # Service worker endpoint
│   ├── layout.tsx                      # Root layout with providers
│   ├── providers.tsx                   # Global providers (Toaster, etc.)
│   ├── globals.css                     # Global styles
│   └── theme.css                       # Design tokens (CSS variables)
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── NavBar.tsx                      # Top navigation
│   ├── BottomNav.tsx                   # Mobile bottom nav
│   ├── ThemeToggle.tsx                 # Dark/light toggle
│   ├── BatteryChip.tsx                 # Battery indicator
│   ├── GeoBadge.tsx                    # Zone/location badge
│   ├── EmptyState.tsx                  # Empty state component
│   ├── PageShell.tsx                   # Page wrapper
│   ├── SectionHeader.tsx               # Section headers
│   ├── ReasonTag.tsx                   # Recommendation tags
│   └── InstallPWAHint.tsx              # PWA install prompt
├── lib/
│   ├── supabase-browser.ts             # Browser Supabase client
│   ├── supabase-server.ts              # Server Supabase client
│   ├── offline-queue.ts                # IndexedDB queue
│   ├── store.ts                        # Zustand store
│   └── utils.ts                        # Utility functions
├── supabase/
│   ├── functions/
│   │   └── ingest_ride_event/index.ts  # Edge Function
│   ├── schema.sql                      # Database schema
│   └── seeds/zones.patna.sql           # Patna zone data
├── scripts/
│   ├── dev:db:reset.sh                 # Reset and seed DB
│   └── deploy:functions.sh             # Deploy Edge Functions
├── public/icons/                        # PWA icons
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🏁 Quickstart

### 1. Clone and Install Dependencies

```bash
cd patna-ev-copilot
npm install
```

### 2. Install UI Dependencies

```bash
# Core UI libraries
npm install lucide-react sonner date-fns
npm install zustand
npm install clsx tailwindcss-merge
npm install class-variance-authority
npm install @radix-ui/react-slot

# Dev dependencies
npm install -D @types/node

# Optional: MapLibre for map view
npm install maplibre-gl
npm install -D @types/maplibre-gl
```

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

### 4. Set Up Database

**Option A: Via Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste contents of `supabase/schema.sql`
3. Execute the SQL
4. Copy and paste contents of `supabase/seeds/zones.patna.sql`
5. Execute the SQL

**Option B: Via CLI (requires `psql`)**

```bash
npm run db:apply
```

Or manually:

```bash
psql $DATABASE_URL -f supabase/schema.sql
psql $DATABASE_URL -f supabase/seeds/zones.patna.sql
```

### 5. Deploy Edge Function

```bash
npm run functions:deploy
```

Or manually:

```bash
supabase functions deploy ingest_ride_event
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication

1. Navigate to `/login`
2. Enter your email address
3. Click "Send Magic Link"
4. Check your inbox for the login link
5. Click the link to authenticate

## 📱 Using the App

### Driver Workflow

1. **Login** at `/login` with magic link
2. **Main screen** (`/`) shows the one-tap ride interface
   - Enter optional battery percentage
   - Tap "Got a Ride" when you receive a booking
   - App captures GPS location and battery level
   - Detects nearest zone automatically
   - Saves to Supabase (or offline queue if no connection)
3. **Tap "Start Trip"** when passenger boards
4. **Tap "End Trip"** when ride completes
5. **Tap "Cancel"** if booking is cancelled
6. **View history** at `/history` to see all your ride events with filters
7. **Map view** at `/map` shows your ride locations
8. **Settings** at `/settings` for profile and EV preferences

### Offline Support

- All events are queued in IndexedDB when offline
- When connection returns, Service Worker triggers background sync
- Events are automatically flushed to Supabase
- User sees "Saved offline" toast notification

### Theme Support

- Toggle between light and dark modes via the sun/moon icon
- Theme preference persists in localStorage
- Defaults to system preference on first load

## 🗺️ Zones

The app tracks 11 major zones in Patna:

1. Airport
2. P&M Mall
3. Dak Bungalow
4. Patna Junction
5. Gandhi Maidan
6. Exhibition Road
7. Boring Road
8. Saguna More
9. Danapur
10. Kankarbagh
11. Rajendra Nagar

Each ride event is automatically associated with the nearest zone based on GPS coordinates.

## 🛠️ Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:apply` - Apply schema and seed zones
- `npm run functions:deploy` - Deploy Edge Functions

### Database Schema Highlights

- **`profiles`** - Extended user profiles
- **`zones`** - Geographic zones with PostGIS
- **`ride_events`** - Core event log (booking, start, complete, cancel)
- **`zone_visits`** - Aggregated daily zone statistics
- **`pings`** - High-frequency GPS tracking
- **`driver_state`** - 🆕 Live tracking state with cached recommendations
- **`charges`** - Battery charging sessions
- **`context_feeds`** - Manual driver feedback
- **`training_examples`** - ML training data
- **`zone_context_30m`** - 30-minute zone aggregations

### Live Tracking System 🆕

The app now includes a complete server-side live tracking system:

**Features:**
- Real-time GPS ping processing with zone snapping
- Smart zone recommendations (Top-3 with ETA & distance)
- Deterministic heuristic scoring (success rate + proximity + context + priority)
- Driver state management with RLS
- Rate limiting (1 req/sec per user, 60 req/min per IP)
- Optional Realtime broadcasting via Supabase

**Key Files:**
- `lib/server/geo-utils.ts` - Haversine distance, ETA estimation
- `lib/server/recommend.ts` - Scoring engine (400+ lines)
- `app/api/pings/route.ts` - GPS ping endpoint
- `app/api/driver-state/route.ts` - State retrieval
- `app/api/recommendations/next-spot/route.ts` - Recommendations

**Documentation:**
See **[LIVE_TRACKING.md](./LIVE_TRACKING.md)** for complete API reference, scoring details, and testing guide.

### UI Components

All UI components follow shadcn/ui conventions:
- **Button**: Primary actions with variants (default, outline, ghost, destructive)
- **Card**: Content containers with header, content, footer
- **Input**: Form inputs with focus states
- **Theme**: CSS variables for consistent design tokens
- **Icons**: Lucide React for consistent iconography

## 🔒 Security

- **Row-Level Security (RLS)** enforced on all tables
- Drivers can only access their own data
- Edge Function validates JWT tokens
- Server-side Supabase client for sensitive operations
- Secure cookie-based session management

## 📦 PWA Installation

1. Open app in Chrome/Safari on mobile
2. Tap "Add to Home Screen" or use the in-app install prompt
3. App installs with native-like experience
4. Works offline with background sync
5. Receives push notifications (if enabled)

## 🌐 Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Environment Variables on Vercel

Set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase Edge Functions

Deploy via Supabase CLI:

```bash
supabase functions deploy ingest_ride_event
```

## ✅ QA Checklist

### Mobile Home
- [ ] Big "Got a Ride" CTA is visible and thumb-friendly (56px min height)
- [ ] Toasts fire on success/error
- [ ] API calls succeed with valid auth token
- [ ] Battery input persists in Zustand store
- [ ] Recommended zones display with reason tags

### Battery & Charging
- [ ] Battery chip appears in nav bar with correct color
  - Green: > 60%
  - Amber: 30-60%
  - Red: < 30%
- [ ] FAB appears when battery < threshold
- [ ] Charger dialog opens with nearest charger
- [ ] "Open in Google Maps" link works

### History
- [ ] Filter bar works (search by event type)
- [ ] Events grouped by date
- [ ] Event icons display correctly
- [ ] Battery chips show on each event
- [ ] Zone badges appear when zone_id present
- [ ] Empty state shows when no events
- [ ] Pagination works (limit 50)

### Map
- [ ] Map loads (or shows placeholder)
- [ ] Points cluster correctly
- [ ] Locate-me button centers map on user
- [ ] Layer toggle switches between heat/points
- [ ] Privacy notice displays
- [ ] RLS enforced (only shows own data)

### Settings
- [ ] Profile email displays
- [ ] Sign out button works and redirects to /login
- [ ] Battery threshold slider updates (10-50%)
- [ ] "Prefer Charger" toggle works
- [ ] Settings persist in Zustand store (localStorage)
- [ ] PWA install hint shows (if not installed)

### Theme
- [ ] Dark/light toggle works
- [ ] Theme persists across page reloads (localStorage)
- [ ] System preference detected on first visit
- [ ] All components respect theme variables
- [ ] Focus rings visible in both themes

### Offline & PWA
- [ ] Service worker registers successfully
- [ ] Events queue in IndexedDB when offline
- [ ] Background sync triggers when online
- [ ] Install prompt shows on supported browsers
- [ ] App works in standalone mode
- [ ] Manifest serves correctly

### Admin (if applicable)
- [ ] Admin routes protected (is_admin check)
- [ ] Non-admin sees 403 screen
- [ ] Zone CRUD works (create, edit)
- [ ] Event CRUD works (create, edit)

### Accessibility
- [ ] All buttons have min 44px hit targets
- [ ] Focus rings visible on keyboard navigation
- [ ] Screen reader announcements work
- [ ] Color contrast meets WCAG AA
- [ ] Forms have proper labels

## 🐛 Troubleshooting

**Issue: "Cannot find module"**
- Run `npm install` to install dependencies
- Restart TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"

**Issue: "Unauthorized" when submitting events**
- Ensure you're logged in via magic link
- Check that Edge Function is deployed
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check browser console for auth errors

**Issue: GPS not working**
- Grant location permissions in browser
- Use HTTPS (required for geolocation API)
- Check browser console for geolocation errors
- Test on mobile device (more accurate)

**Issue: Service Worker not registering**
- Check browser DevTools > Application > Service Workers
- Ensure `/api/sw` route is accessible
- PWA requires HTTPS in production
- Clear browser cache and try again

**Issue: Theme not persisting**
- Check localStorage for "theme" key
- Ensure JavaScript is enabled
- Try hard refresh (Ctrl+Shift+R)

**Issue: TypeScript errors**
- Install missing dependencies
- Restart VS Code
- Run `npm run build` to check for build errors

## Auth Testing Checklist

1. **Sign up** – Register a new driver with email/password. If confirmation is required, ensure the UI prompts you to check email; otherwise verify you land on `/`.
2. **Sign in** – Try a wrong password to see the inline error, then log in successfully and confirm `/api/pings` returns driver data.
3. **Data isolation** – While signed in as Driver A, confirm only their trips/ops data render. After signing out and logging in as Driver B, Driver A’s data must stay hidden.
4. **API protection** – Call protected endpoints such as `/api/pings` or `/api/driver-state` without cookies/session headers and expect a `401 UNAUTHENTICATED` response.

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For questions or support, open an issue on GitHub.

---

Built with ❤️ for Patna EV drivers

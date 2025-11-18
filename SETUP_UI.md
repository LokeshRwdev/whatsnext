# UI Setup Guide - Patna EV Co-Pilot

This guide covers the complete UI setup for the Patna EV Co-Pilot app using shadcn/ui and Tailwind CSS.

## Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn
- VS Code (recommended)

## Step 1: Install Core Dependencies

```bash
# Core UI libraries
npm install lucide-react sonner date-fns zustand

# Utility libraries
npm install clsx tailwindcss-merge class-variance-authority

# Radix UI primitives (required by shadcn/ui)
npm install @radix-ui/react-slot
npm install @radix-ui/react-dialog
npm install @radix-ui/react-select
npm install @radix-ui/react-popover
npm install @radix-ui/react-tabs
npm install @radix-ui/react-dropdown-menu

# Dev dependencies
npm install -D @types/node
```

## Step 2: Optional Dependencies

```bash
# For map functionality (optional)
npm install maplibre-gl
npm install -D @types/maplibre-gl

# For form validation (optional)
npm install react-hook-form @hookform/resolvers zod
```

## Step 3: Verify Installation

After installing, restart your TypeScript server in VS Code:

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

## Step 4: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Component Structure

The UI is built with these key components:

### Base Components (components/ui/)
- `button.tsx` - Button with variants (default, outline, ghost, destructive)
- `card.tsx` - Card container with header, content, footer
- `input.tsx` - Form input with focus states

### Layout Components
- `NavBar.tsx` - Top navigation bar with brand and battery chip
- `BottomNav.tsx` - Mobile bottom navigation (Home, History, Map, Settings)
- `ThemeToggle.tsx` - Dark/light mode toggle

### Utility Components
- `BatteryChip.tsx` - Battery indicator with color coding
- `GeoBadge.tsx` - Zone/location badge
- `EmptyState.tsx` - Empty state with icon, title, description
- `PageShell.tsx` - Page wrapper with title and subtitle
- `SectionHeader.tsx` - Section headers with action slots
- `ReasonTag.tsx` - Pill-shaped tags for recommendations
- `InstallPWAHint.tsx` - PWA installation prompt

## Theme System

The app uses CSS variables for theming:

- Light mode: Default colors with high contrast
- Dark mode: OLED-friendly with emerald accents
- CSS variables defined in `app/theme.css`
- Tailwind configured to use these variables

### Theme Colors

- **Primary**: Emerald green (#16a34a)
- **Background**: White (light) / Dark blue-gray (dark)
- **Card**: White (light) / Dark (dark)
- **Muted**: Light gray (light) / Dark gray (dark)
- **Border**: Light gray (light) / Dark gray (dark)

## State Management

The app uses Zustand for global state:

```typescript
// lib/store.ts
const useAppStore = create((set) => ({
  battery: null,
  setBattery: (battery) => set({ battery }),
  chargeThreshold: 30,
  setChargeThreshold: (threshold) => set({ chargeThreshold: threshold }),
  preferCharger: false,
  setPreferCharger: (prefer) => set({ preferCharger: prefer }),
}));
```

Usage in components:

```typescript
import { useAppStore } from "@/lib/store";

const battery = useAppStore((state) => state.battery);
const setBattery = useAppStore((state) => state.setBattery);
```

## Routing Structure

```
/                   # Driver home (one-tap ride flow)
/history            # Ride event history with filters
/map                # Map view with location points
/settings           # Settings and profile
/login              # Magic link authentication
```

## Mobile-First Design

All components are designed mobile-first:

- Bottom navigation on mobile (< 768px)
- Sticky top bar on all devices
- Touch-friendly buttons (min 44px height)
- Responsive layouts with Tailwind breakpoints
- Swipe-friendly cards with proper spacing

## Dark Mode

Dark mode is implemented with:

1. CSS class `dark` on `<html>` element
2. CSS variables that change based on theme
3. localStorage persistence
4. System preference detection on first load
5. Toggle button in navigation bar

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels
- Keyboard navigation support
- Focus rings visible
- Sufficient color contrast
- Touch targets >= 44px
- Screen reader announcements via toasts

## Testing Checklist

After setup, verify:

- [ ] App loads without errors
- [ ] Theme toggle works (light/dark)
- [ ] Bottom navigation visible on mobile
- [ ] Battery chip appears in nav bar
- [ ] Toast notifications work
- [ ] Forms validate correctly
- [ ] Maps placeholder shows
- [ ] PWA install hint appears

## Common Issues

### "Cannot find module" errors
**Solution**: Run `npm install` and restart TS server

### Tailwind classes not applying
**Solution**: Check `tailwind.config.ts` includes all content paths

### Theme not switching
**Solution**: Clear localStorage and hard refresh (Ctrl+Shift+R)

### Buttons missing variants
**Solution**: Ensure `class-variance-authority` is installed

## Next Steps

1. Configure Supabase environment variables
2. Set up database with schema SQL
3. Deploy Edge Functions
4. Test magic link authentication
5. Test ride event submission
6. Install as PWA on mobile device

## Support

For issues or questions:
- Check the main README.md
- Review TypeScript errors in VS Code
- Check browser console for runtime errors
- Open a GitHub issue

---

Happy coding! 🚀

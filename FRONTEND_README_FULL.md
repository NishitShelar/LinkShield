# LinkShield Frontend: Full Technical Documentation

## Overview
The LinkShield frontend is a modern, responsive web app built with Next.js, React, and Tailwind CSS. It provides user and admin dashboards, Google authentication, anonymous link creation with device fingerprinting, analytics, and a Flappy Bird mini-game.

---

## Architecture
- **Next.js** app (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Component-driven**: UI in `components/`, pages in `app/`
- **API integration** via `lib/api.ts` and `lib/auth.tsx`
- **Device fingerprinting** with `@fingerprintjs/fingerprintjs`
- **State**: React state/hooks, localStorage for anonymous link limits

### Main Folders
- `app/` — All pages (dashboard, login, register, admin, etc.)
- `components/` — UI components (buttons, forms, Flappy Bird, etc.)
- `lib/` — API, auth, utils, fingerprint logic
- `hooks/` — Custom React hooks
- `styles/` — Global styles

---

## Main Pages & Flows
- `/` — Landing page
- `/login` — User login (Google or email/password)
- `/register` — User registration
- `/dashboard` — User dashboard (recent links, Flappy Bird game)
- `/admin` — Admin dashboard (users, links, analytics)
- `/r/[shortCode]` — Link redirection
- `/forgot-password`, `/reset-password/[token]` — Password reset
- `/verify-email/[token]` — Email verification

### Admin Pages
- `/admin` — Dashboard
- `/admin/users` — User management
- `/admin/links` — Link management
- `/admin/feedback` — Feedback review

---

## Components
- **UI:** Buttons, forms, dialogs, tables, charts, map (Leaflet), etc.
- **Flappy Bird:** `components/flappy-bird.tsx` — Mini-game themed for LinkShield
- **Google Sign-In:** `components/google-signin.tsx` — Official GSI button
- **Navbar/Footer:** Layout components

---

## API Integration
- All API calls via `lib/api.ts`
- Auth handled in `lib/auth.tsx`
- Device fingerprint sent with anonymous link creation
- JWT stored in HTTP-only cookie (handled by backend)

---

## Device Fingerprinting & Anonymous Links
- Uses `@fingerprintjs/fingerprintjs` to get `visitorId`
- Anonymous link creation limited per device (tracked in localStorage and backend)
- Remaining free links shown in dashboard (frontend-only logic)

---

## Authentication
- Google Sign-In (official GSI button)
- Email/password login
- JWT-based session (cookie)
- Email verification required

---

## Flappy Bird Mini-Game
- Responsive, accessible, and themed for LinkShield
- Auto-play by default, user can take over
- Game state managed in React

---

## Developer Notes
- **Run locally:** `npm run dev`
- **Build:** `npm run build`
- **Docker:** See project README
- **Env vars:** `.env.local` (see example)
- **API URL:** Set `NEXT_PUBLIC_API_URL`
- **Styling:** Tailwind utility classes
- **Testing:** Manual, with some component-level tests

---

## Further Reading
- See `README_ADMIN.md` for admin panel notes
- See `lib/` for API/auth logic
- See `components/` for UI and game
- See `app/` for page structure

---

For more, see the main project doc and backend doc. 
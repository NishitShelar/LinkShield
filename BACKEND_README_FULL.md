# LinkShield Backend: Full Technical Documentation

## Overview
LinkShield backend is a Node.js/Express REST API for secure URL shortening, analytics, and admin management. It uses MongoDB, JWT authentication, device fingerprinting, and integrates with external services for email, geolocation, and safe browsing.

---

## Architecture
- **Express.js** app with modular routing
- **MongoDB** via Mongoose ODM
- **JWT** for authentication (cookie-based)
- **Role-based access** (user/admin)
- **Device fingerprinting** for anonymous link limits
- **External services:**
  - SendGrid (email)
  - Google Safe Browsing (link safety)
  - IP-API (geolocation)

### Main Folders
- `controllers/` — Route logic (auth, links, analytics, admin)
- `models/` — Mongoose schemas (User, Link, Click, Feedback)
- `middleware/` — Auth, error, link safety, etc.
- `services/` — Email, geolocation, safe browsing, tracking
- `routes/` — API route definitions
- `config/` — DB connection
- `utils/` — Async handler, helpers

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` — Register user (email verification required)
- `POST /login` — Login (with OTP for inactive accounts)
- `POST /google` — Google OAuth login (idToken)
- `GET /logout` — Logout (clears cookie)
- `GET /verify-email/:token` — Email verification
- `GET /manual-verify/:userId` — Manual email verify (admin)
- `POST /forgot-password` — Request password reset
- `PUT /reset-password/:resetToken` — Reset password
- `POST /resend-otp` — Resend OTP for login
- `GET /me` — Get current user (protected)
- `PUT /update-profile` — Update profile (protected)
- `PUT /notification-settings` — Update notification settings (protected)

#### Auth Flow
- JWT issued on login/Google auth, set as HTTP-only cookie
- Email verification required before login
- OTP sent for inactive accounts

### Links (`/api/links`)
- `POST /` — Create link (protected)
- `POST /anonymous` — Create anonymous link (device/IP limited)
- `GET /` — List user links (protected)
- `GET /:id` — Get link details (protected)
- `DELETE /:id` — Delete link (protected)
- `GET /:shortCode` (via `/r/`) — Redirect to original URL (public)

#### Link Creation
- Checks link safety (Google Safe Browsing)
- Custom short codes supported
- Anonymous creation limited by device fingerprint/IP

### Analytics (`/api/analytics`)
- `GET /platform` — Platform stats (admin)
- `GET /user` — User stats (protected)
- `GET /link/:id` — Link stats (protected)

### Admin (`/api/admin`)
- All routes require admin role
- `GET /dashboard` — Platform stats
- `GET /users` — List users
- `GET /users/:id` — User details
- `DELETE /users/:id` — Delete user
- `GET /links` — List all links
- `GET /links/:id` — Link details
- `DELETE /links/:id` — Delete link
- `GET /links/:id/clicks` — Link click details
- `GET /feedback` — All feedback

### Feedback (`/api/feedback`)
- `POST /` — Submit feedback (protected)

---

## Models
- **User:** name, email, password (hashed), role, verification, OTP, notification settings
- **Link:** originalUrl, shortCode, user, isAnonymous, visitorId, ipAddress, status, analytics
- **Click:** link, timestamp, location, device info
- **Feedback:** user, message, createdAt

---

## Middleware
- **protect:** JWT auth, attaches user to req
- **authorize:** Role check (admin)
- **checkAnonymousLimit:** Limits anonymous link creation by device/IP
- **verifySafeLink:** Checks link safety before creation
- **errorHandler:** Central error handling

---

## Services
- **emailService:** SendGrid for verification, OTP, notifications
- **geolocationService:** IP-API for click location
- **safeBrowsingService:** Google Safe Browsing for link safety
- **tracker:** Click tracking, analytics

---

## Security
- All sensitive routes protected by JWT
- Admin routes require `admin` role
- Rate limiting and helmet for security headers
- Device fingerprinting for anonymous abuse prevention
- All passwords hashed (bcryptjs)
- Email verification required for all users

---

## Example: Register
```
POST /api/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}
```
Response:
```
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": { ... }
}
```

---

## Example: Create Link
```
POST /api/links
Headers: { Authorization: Bearer <JWT> }
{
  "originalUrl": "https://example.com"
}
```
Response:
```
{
  "success": true,
  "data": { ...link object... }
}
```

---

## Running & Building
- `npm run dev` — Start in dev mode
- `npm start` — Start in production
- Docker: see project README
- Env vars: see `.env.example`

---

## Further Reading
- See code in `controllers/` for endpoint logic
- See `models/` for schema details
- See `middleware/` for request flow
- See `services/` for integrations

---

For more, see the main project doc and frontend doc. 
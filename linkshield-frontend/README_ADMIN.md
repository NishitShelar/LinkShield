# LinkShield Admin Panel

[![CI/CD](https://github.com/yourusername/linkshield-pro/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/linkshield-pro/actions/workflows/ci-cd.yml)

A comprehensive admin panel for managing users, links, and analytics in the LinkShield URL shortening service, with production-grade DevOps and monitoring.

## Features

### 🔐 Authentication
- Secure admin login with role-based access
- JWT token authentication
- Session management

### 📊 Dashboard
- Real-time statistics overview
- User, link, and click analytics
- Interactive charts and visualizations
- Recent activity feed

### 👥 User Management
- View all registered users
- User details and statistics
- Account verification status
- Subscription plan management
- User deletion capabilities

### 🔗 Link Management
- Comprehensive link listing
- Link details and analytics
- Safety status monitoring
- Click tracking and statistics
- Link deletion capabilities

### 📈 Analytics
- Geographic distribution with interactive map
- Device and browser analytics
- Click patterns and trends
- Time-based analytics
- **Interactive World Map** with precise location pinpointing

### 🗺️ Interactive Map Features
- **Precise Location Pinpointing**: Uses actual latitude/longitude coordinates
- **Click-to-Map Navigation**: Click any IP/location in link details to view on map
- **Auto-Zoom**: Automatically zooms to exact location
- **Visual Indicators**: Shows precise vs country-level coordinates
- **Smooth Navigation**: Auto-scrolls to map section

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Chart.js, Leaflet, Sentry
- **DevOps:** Docker, Docker Compose, GitHub Actions, Sentry

## Quick Start

### Prerequisites
- Node.js 18+
- LinkShield backend API (see backend README)
- Docker & Docker Compose (for local/prod deployment)

### Local Development
```bash
# Frontend
cd linkshield-frontend
npm install
cp .env.example .env.local # Fill in your API URL and Sentry DSN
npm run dev
```

### Docker Compose (Recommended)
```bash
docker-compose up --build
```
- This runs MongoDB, backend, and frontend together.
- Configure environment variables in `.env` files for each service.

## CI/CD & Production
- **CI/CD:** Automated with GitHub Actions ([see workflow](../.github/workflows/ci-cd.yml))
- **Docker:** Multi-stage builds for optimized images
- **Deployment:** Deploy to Vercel, Render, Railway, or your own VM
- **HTTPS:** Enforced via managed SSL or Nginx/Let's Encrypt

## Monitoring & Error Tracking
- **Sentry:**
  - Add your SENTRY_DSN to `.env.local`
  - Errors and performance are tracked automatically
- **Health checks:** Provided by Next.js and backend API

## Environment Variables
See `.env.example` for required variables:
- `NEXT_PUBLIC_API_URL`, `SENTRY_DSN`, etc.
- Never commit secrets to git!

## API Integration

The admin panel integrates with the LinkShield backend API:

- **Authentication**: `/api/auth/login`
- **Dashboard**: `/api/admin/dashboard`
- **Users**: `/api/admin/users`
- **Links**: `/api/admin/links`
- **Analytics**: `/api/admin/analytics`

## Map Integration

The interactive map uses:
- **Leaflet.js** for map rendering
- **OpenStreetMap** tiles
- **IP-API** for geolocation services
- **Precise coordinates** from click tracking

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing
- Fork the repo, create a feature branch, open a PR
- Run lint and tests before pushing

## Support
- Email: support@linkshield.pro
- Or open an issue on GitHub

## License

MIT License - see LICENSE file for details. 
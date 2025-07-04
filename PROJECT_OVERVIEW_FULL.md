# LinkShield: Complete Project Overview & Deployment Guide

## What is LinkShield?
LinkShield is a secure, modern URL shortener with analytics, admin panel, device fingerprinting, Google authentication, and a playful Flappy Bird mini-game. It is production-ready, Dockerized, and designed for cloud deployment (AWS, Vercel, etc.).

---

## Architecture Diagram

```
flowchart TD
  subgraph Frontend
    A[Next.js App] --API--> B(Backend API)
    A --/r/[shortCode]--> B
    A --Google Sign-In--> GSI[Google Identity]
  end
  subgraph Backend
    B[Express.js API] --MongoDB--> M[(MongoDB)]
    B --SendGrid--> S(SendGrid)
    B --Safe Browsing--> SB(Google Safe Browsing)
    B --IP-API--> IP(IP-API.com)
  end
  subgraph DevOps
    D(Docker Compose)
    D --Runs--> A
    D --Runs--> B
    D --Runs--> M
  end
```

---

## Key Features
- Secure URL shortening (with safety checks)
- Google & email/password authentication
- Device fingerprinting for anonymous link limits
- User & admin dashboards
- Analytics (clicks, geo, device)
- Feedback system
- Flappy Bird mini-game
- Dockerized for easy deployment

---

## Backend (Express.js)
- REST API (see BACKEND_README_FULL.md)
- MongoDB via Mongoose
- JWT auth (cookie-based)
- Role-based access (user/admin)
- Device fingerprinting for anonymous link limits
- Integrations: SendGrid, Google Safe Browsing, IP-API
- See `linkshield-backend/` for code

## Frontend (Next.js)
- Modern React app (see FRONTEND_README_FULL.md)
- Tailwind CSS, TypeScript
- Google Sign-In (official GSI)
- Device fingerprinting with `@fingerprintjs/fingerprintjs`
- Flappy Bird mini-game
- See `linkshield-frontend/` for code

---

## Docker & Local Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (if not using Docker)
- API keys: SendGrid, Google Safe Browsing, Google OAuth

### Local Dev
```bash
# Clone repo
cd LinkShield

# Backend
cd linkshield-backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd ../linkshield-frontend
npm install
cp .env.example .env.local
npm run dev
```

### Docker Compose
```bash
docker-compose up --build
```
- Runs MongoDB, backend, frontend
- Configure env vars in `.env` for each service

---

## Deployment (AWS, Vercel, Domains)

### AWS EC2 (VM)
- Provision Ubuntu VM
- Install Docker & Docker Compose
- Clone repo, set up env vars
- Run `docker-compose up --build`
- Set up domain (Route53 or other DNS)
- Use Nginx for SSL termination

### Vercel (Frontend)
- Connect `linkshield-frontend` to Vercel
- Set env vars in Vercel dashboard
- Point domain to Vercel

### Render/Railway (Backend)
- Deploy `linkshield-backend` via Docker or Node
- Set env vars in dashboard
- Point `/api` domain/subdomain to backend

### MongoDB Atlas (Cloud DB)
- Create cluster
- Whitelist backend IP
- Set `MONGO_URI` in backend env

### Domain Integration
- Use Route53, Cloudflare, or registrar DNS
- Point root domain to frontend (Vercel or server IP)
- Point `/api` or subdomain to backend
- Set up SSL (Vercel auto, or Nginx/Let's Encrypt)

---

## Environment Variables
- See `.env.example` in each service
- Never commit secrets to git
- Key vars: `MONGO_URI`, `JWT_SECRET`, `SENDGRID_API_KEY`, `GOOGLE_CLIENT_ID`, `SENTRY_DSN`, etc.

---

## Best Practices
- Use HTTPS everywhere
- Change default admin password
- Monitor with Sentry
- Back up MongoDB regularly
- Use strong secrets in `.env`
- Review logs and analytics

---

## Further Reading
- See `BACKEND_README_FULL.md` for backend details
- See `FRONTEND_README_FULL.md` for frontend details
- See code in `linkshield-backend/` and `linkshield-frontend/`

---

For support, email support@linkshield.pro or open a GitHub issue. 
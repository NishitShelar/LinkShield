# LinkShield

A modern, secure, and feature-rich URL shortener platform with analytics, admin panel, device fingerprinting, Google authentication, and a playful Flappy Bird mini-game. Production-ready, Dockerized, and designed for cloud deployment (AWS, Vercel, etc.).

---

## 🌐 Live Demo & Repository
- **Production:** [https://www.linkshld.xyz/](https://www.linkshld.xyz/)
- **GitHub Repo:** [https://github.com/NishitShelar/LinkShield](https://github.com/NishitShelar/LinkShield)

---

## 🚀 Features
- **Secure URL shortening** with Google Safe Browsing checks
- **Google & email/password authentication**
- **Device fingerprinting** for anonymous link limits
- **User & admin dashboards**
- **Analytics** (clicks, geo, device)
- **Feedback system**
- **Flappy Bird mini-game**
- **Dockerized** for easy deployment

---

## 🏗️ Architecture

```
Frontend (Next.js) <-> Backend (Express.js API) <-> MongoDB
        |                |-- SendGrid (Email)
        |                |-- Google Safe Browsing
        |                |-- IP-API (Geolocation)
        |                |-- Device Fingerprinting
        |-- Google Identity (OAuth)
Docker Compose orchestrates all services.
```

---

## 📦 Monorepo Structure

- `linkshield-backend/` — Express.js REST API, MongoDB, JWT, role-based access, integrations
- `linkshield-frontend/` — Next.js app, React, Tailwind CSS, TypeScript, Google Sign-In, Flappy Bird

---

## 🛠️ Getting Started (0 to Hero)

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (if not using Docker)
- API keys: SendGrid, Google Safe Browsing, Google OAuth

### 1. Clone the Repository
```bash
git clone https://github.com/NishitShelar/LinkShield.git
cd LinkShield
```

### 2. Environment Variables
- Copy `.env.example` in each service to `.env` (backend) and `.env.local` (frontend)
- Fill in required secrets: `MONGO_URI`, `JWT_SECRET`, `SENDGRID_API_KEY`, `GOOGLE_CLIENT_ID`, etc.

### 3. Local Development
#### Backend
```bash
cd linkshield-backend
npm install
cp .env.example .env
npm run dev
```
#### Frontend
```bash
cd ../linkshield-frontend
npm install
cp .env.example .env.local
npm run dev
```

### 4. Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Runs MongoDB, backend, and frontend together
- Configure env vars in `.env` for each service

---

## 🌍 Deployment Guide

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

## ⚙️ Environment Variables
- See `.env.example` in each service
- **Never commit secrets to git**
- Key vars: `MONGO_URI`, `JWT_SECRET`, `SENDGRID_API_KEY`, `GOOGLE_CLIENT_ID`, `SENTRY_DSN`, etc.

---

## 🔒 Security Best Practices
- Use HTTPS everywhere
- Change default admin password
- Monitor with Sentry
- Back up MongoDB regularly
- Use strong secrets in `.env`
- Review logs and analytics

---

## 📚 Documentation
- [Backend: Full API & Technical Docs](./linkshield-backend/BACKEND_README_FULL.md)
- [Frontend: Full Technical Docs](./linkshield-frontend/FRONTEND_README_FULL.md)
- [Project Overview & Deployment](./PROJECT_OVERVIEW_FULL.md)

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 🆘 Support
For support, email [noreply.linkshield@gmail.com](mailto:noreply.linkshield@gmail.com) or open a GitHub issue.

---

## 📝 License
[MIT]([LICENSE](https://github.com/NishitShelar/LinkShield/blob/main/LICENSE)) (add your license file if needed) 

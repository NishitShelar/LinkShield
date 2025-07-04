# LinkShield Pro

[![CI/CD](https://github.com/yourusername/linkshield-pro/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/linkshield-pro/actions/workflows/ci-cd.yml)

A professional URL shortening and safety scanning platform with advanced analytics, admin features, and production-grade DevOps.

## Features

- **URL Management**
  - Short URL generation
  - Custom aliases
  - Link expiration
  - QR code generation
  - Link safety scanning
  - Click tracking and analytics

- **User Features**
  - User registration and authentication
  - Email verification
  - Password reset
  - Profile management
  - Link management dashboard
  - Analytics dashboard
  - Notification settings

- **Admin Panel**
  - User management
  - Link moderation
  - Platform analytics
  - Activity monitoring
  - System settings

- **Security**
  - Safe browsing integration
  - Rate limiting
  - IP geolocation
  - Device tracking
  - Security alerts

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- SendGrid Email Service
- Google Safe Browsing API
- IP-API.com Geolocation

### Frontend
- React
- Tailwind CSS
- Chart.js
- React Query
- React Router
- Axios

### DevOps
- Docker
- Docker Compose
- GitHub Actions
- Sentry
- mongodump

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Docker & Docker Compose (for local/prod deployment)
- SendGrid, Google Safe Browsing API keys

### Local Development
```bash
# Clone the repo
 git clone https://github.com/yourusername/linkshield-pro.git
 cd linkshield-pro

# Backend
 cd linkshield-backend
 npm install
 cp .env.example .env # Fill in your secrets
 npm run dev

# Frontend (see linkshield-frontend/README_ADMIN.md for details)
 cd ../linkshield-frontend
 npm install
 npm run dev
```

### Docker Compose (Recommended)
```bash
docker-compose up --build
```
- This runs MongoDB, backend, and frontend together.
- Configure environment variables in `.env` files for each service.

## CI/CD & Production
- **CI/CD:** Automated with GitHub Actions ([see workflow](.github/workflows/ci-cd.yml))
- **Docker:** Multi-stage builds for optimized images
- **Deployment:** Deploy to Render, Railway, DigitalOcean, or your own VM
- **HTTPS:** Enforced via Nginx/Let's Encrypt or managed SSL

## Monitoring & Error Tracking
- **Sentry:**
  - Add your SENTRY_DSN to `.env` for both backend and frontend
  - Errors and performance are tracked automatically
- **Logging:** Winston/Morgan for backend, browser logs for frontend
- **Health checks:** `/api/health` endpoint (add if not present)

## Backups
- **MongoDB Backup:**
  - Use the provided script:
    ```bash
    cd linkshield-backend/scripts
    bash backup_mongo.sh
    ```
  - Backups are saved in `backups/` with timestamps
  - Requires `mongodump` in your PATH

## Environment Variables
See `.env.example` in each service for required variables:
- `MONGO_URI`, `JWT_SECRET`, `SENDGRID_API_KEY`, `SENTRY_DSN`, etc.
- Never commit secrets to git!

## API Documentation

The API documentation is available at `/api-docs` when running the server.

### Key Endpoints

- Authentication: `/api/auth/*`
- Links: `/api/links/*`
- Analytics: `/api/analytics/*`
- Admin: `/api/admin/*`

## Admin Access

Default admin credentials:
- Email: admin@linkshield.pro
- Password: (set in .env file)

**Important**: Change the default admin password after first login.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@linkshield.pro or open an issue in the GitHub repository.

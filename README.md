# Backend (Express)

This backend replaces Strapi with a simple Node.js + Express API.

## Run

```bash
npm install
npm run dev
```

Server runs at `http://localhost:4000` by default.
Uses MongoDB for persistence.
Includes security headers (`helmet`), compression, request logging, and centralized error handling.

## Environment

Create `backend/.env`:

```env
PORT=4000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/portfolio_db?retryWrites=true&w=majority
# MONGODB_DB_NAME=portfolio_db
# CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

On first run, required indexes are created automatically.

## Endpoints

- `GET /health`
- `GET /api/content`
- `PUT /api/content`
- `GET /api/inquiries`
- `POST /api/inquiries`
- `PATCH /api/inquiries/:id`
- `DELETE /api/inquiries/:id`

## Professional defaults included

- Structured request logging (`morgan`)
- Security headers (`helmet`)
- Gzip compression (`compression`)
- Basic payload validation/sanitization for inquiry endpoints
- Shared async error handling middleware

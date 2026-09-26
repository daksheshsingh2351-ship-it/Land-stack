# LandStack Backend

Node.js + Express + PostgreSQL + Prisma backend for the LandStack web application.

## Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL 15+ (local or remote)

### Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret | — |

**DATABASE_URL format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### PostgreSQL Setup

1. Install PostgreSQL locally or use a cloud provider.
2. Create a database:
   ```sql
   CREATE DATABASE landstack;
   ```
3. Update `DATABASE_URL` in your `.env` file.
4. Run Prisma migrations (when schema models are added):
   ```bash
   npm run prisma:migrate
   ```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with file watching (auto-restart) |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |

### Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/              # Environment & app config
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Express middleware
│   ├── models/              # Data models
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   ├── utils/               # Helper utilities
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
├── .env                     # Local environment (git-ignored)
├── .env.example             # Environment template
└── package.json
```

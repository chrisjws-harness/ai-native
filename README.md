# The Kino Casino — Blackjack Strategy Trainer

A blackjack basic strategy trainer with casino-felt UI, adaptive drilling, and response time tracking.

## Prerequisites

- Docker & Docker Compose
- A `.env` file in the project root (see below)

## Environment Setup

Create a `.env` file:

```
DB_PASSWORD=changeme
JWT_SECRET_KEY=some-random-secret
```

## Build & Run

```bash
docker compose up --build -d
```

This starts three containers:
- **db** — PostgreSQL 16 on port 5432
- **backend** — Flask API on port 5001 (runs migrations + seed automatically)
- **frontend** — React app via nginx on port 3000

Open http://localhost:3000 in your browser.

## Rebuild After Code Changes

```bash
# Rebuild and recreate changed containers
docker compose up --build --force-recreate -d backend frontend
```

To rebuild everything including the database (destructive):

```bash
docker compose down -v
docker compose up --build -d
```

## Generate Invite Keys

Registration requires an invite key. Generate one from the backend container:

```bash
docker compose exec backend flask generate-key
```

To generate multiple:

```bash
docker compose exec backend flask generate-key -n 5
```

## Run Frontend Locally (without Docker)

```bash
cd frontend
npm ci
npm run dev
```

This starts Vite dev server at http://localhost:5173. The API proxy expects the backend on port 5000.

## Check Logs

```bash
# All services
docker compose logs -f

# Just backend
docker compose logs -f backend
```

## Keyboard Shortcuts (Training)

| Action    | Numpad | Home Row | Letter |
|-----------|--------|----------|--------|
| Hit       | 4      | A        | H      |
| Stand     | 5      | S        | S      |
| Double    | 6      | D        | D      |
| Split     | 0      | F        | P      |
| Surrender | —      | G        | R      |

Advance to next hand: **Enter** or press the **same key** again.

## Project Structure

```
backend/          Flask API
  app/
    models/       SQLAlchemy models
    routes/       API blueprints (auth, training, stats, rulesets)
    services/     Business logic
    seed/         Strategy chart data
  migrations/     Alembic migrations
frontend/         React + TypeScript (Vite)
  src/
    components/   UI components
    hooks/        useTraining hook
    pages/        TrainingPage, StatsPage
    utils/        Card generation, weighted random
docker-compose.yml
```

# The Kino Casino — Blackjack Strategy Trainer

A blackjack basic strategy trainer with casino-felt UI, adaptive drilling, and response time tracking. Master the odds, beat the house every time.

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

## CI/CD (Harness)

### Pipeline Steps

A Harness CI pipeline for this project should have these stages:

**Important:** The lint and build steps require **Node 20+**. In Harness, set the step's container image to `node:20-alpine` (or any Node 20+ image). The default Harness runner uses Node 16 which is too old for ESLint 9, Vite 8, and TypeScript-ESLint.

#### 1. Lint Frontend

Container image: `node:20-alpine`

```bash
cd frontend
npm ci
npm run lint
```

Runs ESLint across all TypeScript/React source files. Fails the build on lint errors.

#### 2. Build Frontend

Container image: `node:20-alpine`

```bash
cd frontend
npm ci
npm run build
```

Runs TypeScript type-checking (`tsc -b`) then Vite production build. Output goes to `frontend/dist/`. This catches type errors and import issues.

#### 3. Build Backend Docker Image

```bash
docker build -t <registry>/ai-native-backend:${HARNESS_BUILD_ID:-latest} ./backend
```

Builds the Flask API image from `backend/Dockerfile` (Python 3.12-slim base).

#### 4. Build Frontend Docker Image

```bash
docker build -t <registry>/ai-native-frontend:${HARNESS_BUILD_ID:-latest} ./frontend
```

Multi-stage build: compiles the React app with Node 20, copies output into an nginx:alpine image.

#### 5. Push Images

```bash
docker push <registry>/ai-native-backend:${HARNESS_BUILD_ID:-latest}
docker push <registry>/ai-native-frontend:${HARNESS_BUILD_ID:-latest}
```

Push both images to your container registry (Docker Hub, ECR, GCR, Harness Artifact Registry, etc.).

### Required Secrets / Variables

| Name              | Description                          |
|-------------------|--------------------------------------|
| `REGISTRY`        | Container registry URL               |
| `DB_PASSWORD`     | PostgreSQL password                  |
| `JWT_SECRET_KEY`  | JWT signing secret                   |

### Notes

- There are no automated tests yet (no pytest or jest). When tests are added, insert test stages after the lint/build steps.
- The backend runs migrations automatically on startup (`flask db upgrade && flask seed-db`), so no separate migration step is needed in the pipeline.
- For deploy, use the same `docker-compose.yml` or a Kubernetes manifest pointing at the pushed image tags.

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

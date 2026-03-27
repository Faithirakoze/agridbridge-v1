# AgriBridge

AgriBridge is a full-stack farm operations app for smallholder farming workflows. It helps a farmer register farms, add crops, track crop stages, log farm activities, review market prices, and view alerts from a single dashboard.

## What The App Does

- OTP-based sign in and registration flow for farmers
- Farm registration with area and district details
- Crop registration with plot, area, planting date, and stage
- Farm activity logging for planting, irrigation, weeding, harvest, and more
- Crop, farm, and activity management from their designated pages
- Dashboard summaries for farms, planted area, crop mix, and season flow
- Market price browsing
- Alerts endpoint integration

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Uvicorn

## Project Structure

```text
agridbridge-v1/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |-- core/
|   |   |-- db/
|   |   |-- services/
|   |   `-- main.py
|   |-- requirements.txt
|   `-- Dockerfile
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- api/
|   |   `-- store/
|   |-- package.json
|   `-- vite.config.js
|-- docker-compose.yml
`-- README.md
```

## Main Pages

- `/login` and `/register`: OTP authentication flow
- `/`: Dashboard
- `/farms`: register, edit, and delete farms
- `/crops`: register, edit, and delete crops
- `/record`: log, edit, and delete activities
- `/market`: market price browsing

## API Overview

The frontend talks to the backend through the `/api/v1` prefix.

Main route groups:

- `/api/v1/auth`
- `/api/v1/farms`
- `/api/v1/crops`
- `/api/v1/activities`
- `/api/v1/market`
- `/api/v1/alerts`

Health check:

- `GET /health`

Swagger docs:

- `http://localhost:8000/docs`

## Authentication Notes

This project currently uses a development OTP flow.

- `POST /api/v1/auth/request-otp` returns the configured development OTP in the response
- `POST /api/v1/auth/verify-otp` verifies the OTP and returns a bearer token
- The frontend stores the token in `localStorage`

The backend default development OTP is configured through `DEV_OTP`.

## Environment Variables

### Backend

Create `backend/.env` with values like:

```env
DATABASE_URL=postgresql://agri_user:agri_pass@localhost:5432/agribridge
JWT_SECRET=dev_secret_change_in_production
JWT_ALGO=HS256
JWT_EXPIRE_MINUTES=10080
APP_ENV=development
DEV_OTP=123456
WEATHER_API_PROVIDER=open-meteo
WEATHER_API_TIMEOUT_SECONDS=10
WEATHER_ALERT_COUNTRY_CODE=RW
```

### Docker Compose

The root `.env` should provide the PostgreSQL variables used by `docker-compose.yml`:

```env
POSTGRES_DB=agribridge
POSTGRES_USER=agri_user
POSTGRES_PASSWORD=agri_pass
```

## Run With Docker

This is the quickest way to start the API and database together.

1. Create the root `.env` file for Docker Compose.
2. Create `backend/.env`.
3. Start the services:

```bash
docker compose up --build
```

Services:

- API: `http://localhost:8000`
- Postgres: `localhost:5432`

Note: the current `docker-compose.yml` starts the backend and database. The frontend is run separately with Vite.

## Run Locally

### 1. Start PostgreSQL

You can use your own local PostgreSQL instance or the Docker database service.

### 2. Run the backend

From `backend`:

```bash
python -m venv .venv
```

Activate the environment, then install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Run the frontend

From `frontend`:

```bash
npm install
npm run dev
```

The frontend runs at:

- `http://localhost:3000`

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

## Development Notes

- The backend currently creates tables automatically on startup with `Base.metadata.create_all(...)`
- Alembic is included in dependencies, but migration scripts are not committed yet
- API requests use a shared Axios client in `frontend/src/api/client.js`
- Unauthorized frontend requests automatically clear the stored token and redirect to `/login`

## Suggested First Run Flow

1. Open the frontend
2. Request an OTP with a phone number
3. Use the development OTP from the API response
4. Complete registration if the user is new
5. Add a farm
6. Add a crop
7. Log an activity
8. Review the dashboard and market pages

## Current Backend Entry Point

The FastAPI app is defined in:

- `backend/app/main.py`

## Frontend Commands

From `frontend`:

```bash
npm run dev
npm run build
npm run preview
```

## Backend Commands

From `backend`:

```bash
uvicorn app.main:app --reload
```

## Troubleshooting

### The frontend cannot reach the API

Check that:

- the backend is running on port `8000`
- the frontend is running on port `3000`
- the request path starts with `/api/v1`

### Database connection errors

Check that:

- PostgreSQL is running
- `DATABASE_URL` is correct for your environment
- Docker users do not set the backend database host to `localhost` inside the API container

### OTP login is failing

Check that:

- the OTP entered matches `DEV_OTP`
- you requested the OTP before verifying it

## Status

This README reflects the current development setup in the repository as it exists now.

# Frontend of the FSD Final Project

This repository contains the frontend application built with React and Vite.

## Connect Frontend With Backend

The frontend now supports two reliable ways to connect to the backend during development:

1. Vite dev proxy (default)
2. Explicit API URL via environment variable

## Profile Management

The app now includes a shared profile page for both normal users and admins.

- Route: `/profile`
- Access: authenticated users only
- Features:
	- View profile details
	- Update first name, last name, phone, city, state, and bio
	- Read-only email and role visibility

## Renovation Intelligence Features

The app now includes three new renovation intelligence capabilities:

1. Renovation Project Tracker
	- Route: `/renovation-tracker`
	- Track project tasks, planned budget vs spent budget, completion percentage, and expected value uplift timeline.
	- Admin route: `/admin/renovation-trackers`
	- Admin tools: filter trackers, sort by key metrics, page through large tracker lists, CSV export, and uplift vs spend over time charts.

## Property Details

- Route: `/properties/:id`
- Access: authenticated users (user/admin) with backend owner/admin authorization checks.
- Features:
	- View full property details, valuation metrics, and location/specs
	- Review property-specific recommendations
	- Manage enhancement checklist directly in the property view
	- Delete property (authorized owner/admin)
2. Smart Recommendation Ranking
	- Available on the Recommendations page.
	- Personalize recommendation ranking by city, budget, property age, and user goals.
3. Cost Estimator by Location
	- Available on the Recommendations page.
	- Get dynamic renovation cost ranges using location and category multipliers.

## Portfolio Workspace

- Route: `/portfolio-workspace`
- Access: authenticated users
- Includes:
	- Property portfolio create/edit/archive and portfolio ROI/risk summary
	- Saved scenario modeling with side-by-side compare
	- Automated budget/timeline/best-next-action alerts
	- Document/media linking for invoices, permits, and before/after assets
	- Collaboration tools for invites, task assignment, comments, and activity logs
	- Admin-only risk flags and anomaly review queue
	- Exportable CSV/PDF workspace summaries and offline/PWA readiness indicators

### Development connection behavior

- Frontend runs on `http://localhost:3000`
- Backend is expected on `http://localhost:5000` by default
- Requests to `/api/*` and `/uploads/*` are proxied to the backend
- If you set `VITE_API_URL`, the frontend can call the backend directly

### Optional environment variables

- `VITE_BACKEND_ORIGIN` (example: `http://localhost:5000`)
- `VITE_API_URL` (example: `http://localhost:5000/api`)
- `VITE_API_PORT` (example: `5000`, used for local fallback discovery)
- `VITE_BASE_PATH` (for subpath deployments)

### Run locally (frontend + backend)

1. Start backend:
	- Open `backend-repo`
	- Install dependencies with `npm install`
	- Ensure backend `.env` is configured (JWT + DB settings)
	- Run `npm run dev`
2. Start frontend:
	- Open `frontend-repo`
	- Install dependencies with `npm install`
	- Run `npm run dev`
3. Open `http://localhost:3000`

## GitHub Pages Deployment

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### How deployment works

1. Push changes to the `main` branch.
2. The workflow in `.github/workflows/deploy-pages.yml` builds the app.
3. The built `dist` folder is published to GitHub Pages.

### One-time GitHub Pages setting

In your GitHub repository settings:

1. Go to **Settings** > **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

After that, every push to `main` triggers a new deployment.

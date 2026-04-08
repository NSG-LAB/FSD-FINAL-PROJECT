# Frontend of the FSD Final Project

This repository contains the frontend application built with React and Vite.

## Connect Frontend With Backend

The frontend now supports two reliable ways to connect to the backend during development:

1. Vite dev proxy (default)
2. Explicit API URL via environment variable

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

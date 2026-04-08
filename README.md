# Frontend of the FSD Final Project

This repository contains the frontend application built with React and Vite.

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

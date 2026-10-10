# MEIL ESG & BRSR Reporting Platform

> **Live deployment:** https://bput-hackhathon.vercel.app/

A role-based ESG data collection and review portal prototype for tracking environmental data across projects, business units, subsidiaries, and MEIL-level reporting. It supports Scope 1, Scope 2, Scope 3, and other Section C data workflows, including evidence review, consolidation, and BRSR report generation.

## Overview

The application is a single-page web app built with React, TypeScript, and Vite. Its demo workflows use seeded sample data and browser `localStorage`; there is no connected API or database in this repository. Authentication and role checks are implemented in the client and are for demonstration only.

## Features

- **Role-based workspaces** for project data users, project supervisors, business-unit supervisors, subsidiary supervisors, and MEIL administrators.
- **ESG data entry** for Scope 1, Scope 2, Scope 3, and other environmental/Section C parameters.
- **Emissions calculations** using activity data and emission factors, with results expressed as CO₂e.
- **Evidence and submissions** with evidence upload and review, submission status tracking, correction requests, and verification history.
- **Multi-level review and consolidation** from project to business unit, subsidiary, and MEIL group.
- **Dashboards and analytics** for ESG status, emissions scopes, and consolidated data.
- **BRSR reporting** with report preview and PDF generation from the included MEIL BRSR draft template.
- **Supporting workflows** for account registration and recovery screens, profiles, notifications, audit history, organization hierarchy, and parameter administration.
- **Public information pages** for the landing page, features, how it works, about, and contact.

## Demo access

The demo accounts below use sample credentials embedded in the application. Select the appropriate role by signing in with its account:

| Workspace | Demo email |
| --- | --- |
| Project data user | `anita@demo.com` |
| Project supervisor | `projectsup@demo.com` |
| Business-unit supervisor | `busupervisor@demo.com` |
| Subsidiary supervisor | `subsupervisor@demo.com` |
| MEIL administrator | `admin@meil-demo.com` |

**Password for these seeded accounts:** `demo123`

These accounts and credentials are for local demonstration only. Do not use them for a public or production deployment.

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+
- npm

### Install and run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal, usually `http://localhost:5173`.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project with TypeScript and create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. Run `npm run build` first. |

## Typical demo workflow

1. Sign in as a project data user and enter environmental activity data for the reporting scopes.
2. Attach supporting evidence and submit the data for review.
3. Sign in to the relevant supervisor workspaces to review submissions, verify evidence, and request corrections where needed.
4. Consolidate verified data through the project, business-unit, subsidiary, and MEIL review levels.
5. From the MEIL administrator workspace, review analytics and generate or preview a BRSR report. The report workflow requires the relevant group consolidation to be sealed.

## Project structure

```text
src/
  components/     Shared layout, dashboard, chart, status, and evidence components
  context/        Authentication context and role-based workspace helpers
  data/           Seeded demo users, organization data, parameters, and records
  pages/          Public, authentication, project-user, supervisor, subsidiary, and admin screens
  services/       Demo data access, browser storage, calculations, verification, and BRSR PDF services
  types/          Shared TypeScript domain and application types
  utils/          Calculations, date handling, submission status, and validation utilities
public/
  documents/      BRSR draft PDF used by the report generator
  images/         Public page imagery
```

The application entry point is `src/main.tsx`; routing and protected workspaces are configured in `src/App.tsx`. Styling is defined in `src/index.css` and `src/style.css`, with Tailwind CSS integrated through Vite.

## Technology stack

- React 19 and TypeScript
- Vite 8
- React Router
- Tailwind CSS 4
- Recharts for charts
- React Hook Form and Zod for form handling and validation
- Lucide React for icons
- `pdf-lib` for BRSR PDF generation

## Demo data and persistence

Initial organization and account records are defined in `src/data/mockData.ts`. The services in `src/services/` use browser storage for demo state, so changes are local to the browser profile and are not shared between users or devices. Clearing browser storage removes locally saved demo changes.

The authentication, registration, and data persistence flows are not production security boundaries. The service comments identify a future FastAPI/PostgreSQL integration direction, but a backend is not included here.

## Deployment

Build the static site with:

```bash
npm run build
```

The generated files are in `dist/` and can be hosted on a static web host. Because this app uses client-side routing, configure the host to serve `index.html` for application routes. After deployment, replace the **Live deployment** placeholder at the top of this README with the public URL.

Before exposing the demo publicly, replace the seeded authentication and browser-only storage with a secured backend, and review the sample data and included reporting template for your intended use.

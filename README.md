# ITC Content Builder UI

A production-ready React + Vite frontend for the ITC Content Builder platform — a comprehensive media content management and scheduling system.

## Tech Stack

- **Framework:** React 18 + Vite 6
- **Routing:** React Router DOM v7
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query v5)
- **Forms:** React Hook Form + Yup validation
- **UI Components:** Radix UI primitives + shadcn/ui
- **Styling:** Tailwind CSS v3
- **HTTP Client:** Axios
- **Animations:** Framer Motion

## Features

- Dashboard with real-time stats and channel monitoring
- Playlist upload and job tracking
- Content management and scheduling
- AirFile integration (playlist, XML, PTK formats)
- Bulk conversion workflows
- Missing report tracking and retry mechanisms
- Dark / light theme support
- Command palette (⌘K)

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template and fill in values
cp .env.example .env

# Start development server
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_USE_AUTH` | Enable/disable authentication (`true` / `false`) |
| `VITE_LTS_API_URL` | Base URL for the LTS Content Builder API |
| `VITE_AIRFILE_API_URL` | Base URL for the AirFile API |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Project Structure

```
src/
├── api/            # Axios instances and API modules
├── components/
│   ├── layout/     # AppShell, Header, Sidebar, CommandPalette
│   ├── shared/     # Reusable presentational components
│   └── ui/         # shadcn/ui primitives
├── features/       # Page-level feature modules
│   ├── airfile/
│   ├── content/
│   ├── dashboard/
│   ├── playlist/
│   ├── reports/
│   └── retry/
├── hooks/          # Custom React hooks
├── services/       # Business-logic service layer
├── stores/         # Zustand global stores
└── utils/          # Formatters, constants, helpers
```

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `staging` | Pre-production integration |
| `development` | Active development |

## License

Private — © Skandha MS. All rights reserved.

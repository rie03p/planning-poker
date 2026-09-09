# Planning Poker

[![codecov](https://codecov.io/github/rie03p/planning-poker/graph/badge.svg?token=I2HAH1HEK9)](https://codecov.io/github/rie03p/planning-poker)

![Planning Poker Demo](./docs/demo.gif)

A real-time Planning Poker web application for agile teams.  
Estimate story points collaboratively with live synchronization.

## Features

- **Real-time collaboration** via WebSockets
- **Multiple estimation scales**
  - Fibonacci
  - Modified Fibonacci
  - T-Shirt sizes
  - Powers of 2
- **Issue Management**
  - Add, edit, and remove issues
  - Vote on individual issues
- **Reveal / Reset** voting rounds
- **Sharable game links**
- **Persistent state** using Cloudflare Durable Objects

## Tech Stack

- **Frontend**: React, Vite, Chakra UI
- **Backend**: Cloudflare Workers, Durable Objects, WebSockets
- **Shared**: TypeScript, Zod
- **Testing**: Vitest, Playwright
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- (Optional) Docker
- Wrangler CLI

### Install

1. Clone the repository:

```bash
git clone https://github.com/rie03p/planning-poker.git
cd planning-poker
```

2. Install dependencies:

```bash
pnpm install
```

### Development

#### Option 1: Using Docker Compose

Start the frontend development server:

```bash
docker compose up
```

The frontend will be available at `http://localhost:5173`

In a separate terminal, start the backend:

```bash
cd wrangler
pnpm dev
```

The backend will be available at `http://localhost:8787`

#### Option 2: Direct Local Development

1. Start the backend server:

```bash
cd wrangler
pnpm dev
```

2. In a separate terminal, start the frontend:

```bash
cd frontend
pnpm dev
```

### Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:8787
```

For production, update this to your deployed Cloudflare Workers URL.

## Deployment

### Frontend

Build the frontend:

```bash
cd frontend
pnpm build
```

Deploy the `dist` folder to your preferred hosting service (Cloudflare Pages, Vercel, Netlify, etc.)

### Backend

Deploy to Cloudflare Workers:

```bash
cd wrangler
pnpm deploy
```

Make sure you have configured your Cloudflare account with Wrangler:

```bash
wrangler login
```

## Testing

Run tests with coverage:

```bash
pnpm test:coverage
```

### E2E (Playwright)

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright starts local Vite and Wrangler servers on ports 5173 and 8787. Stop any
existing servers on those ports first. Tests use the real Workers/Durable Objects
backend and separate browser sessions, with no Cloudflare account or secrets.

Desktop and mobile Chromium cover creating a game, joining via its link, managing
issues, voting together, revealing results, advancing and resetting rounds, and all
four voting systems. Every pull request runs the `E2E` check.
Configure that check as required in the repository's branch protection to block
merges on failure. Fork pull requests may require a maintainer to approve the workflow.

The CI artifact includes the HTML report, failure screenshots and traces (kept for
7 days). To inspect a local run:

```bash
pnpm exec playwright show-report
```

The server lifecycle and CI setup follow the [Playwright documentation](https://playwright.dev/docs/test-webserver)
and [CI guide](https://playwright.dev/docs/ci).

## License

MIT

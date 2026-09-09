# Planning Poker

[![codecov](https://codecov.io/github/rie03p/planning-poker/graph/badge.svg?token=I2HAH1HEK9)](https://codecov.io/github/rie03p/planning-poker)

![Planning Poker Demo](./docs/demo.gif)

A real-time Planning Poker app for estimating story points together.

## Features

- Share a game link and vote together in real time.
- Choose Fibonacci, Modified Fibonacci, T-Shirt sizes, or Powers of 2.
- Add, edit, reorder, and remove issues; advance to the next unfinished round.
- Reveal results, reset votes, or revisit completed issues.
- Change your display name or join as a spectator.
- Keep game state in Cloudflare Durable Objects.

## Tech Stack

React, Vite, and Chakra UI on the frontend; Cloudflare Workers and Durable Objects
on the backend. A pnpm workspace shares TypeScript types and Zod schemas between them.

## Development

Requires Node.js 24 and pnpm 10 (see [mise.toml](./mise.toml)). Run all commands from
the repository root.

Install dependencies and start the backend:

```bash
pnpm install
pnpm --filter wrangler dev
```

In another terminal, start the frontend:

```bash
pnpm --filter frontend dev
```

Open <http://localhost:5173>. The backend runs on port 8787. Keep both ports free
before starting. No Docker, global Wrangler install, or Cloudflare login is needed.

Local defaults work without an `.env` file. To use a different backend, set
`VITE_BACKEND_URL` in `frontend/.env.local` and allow the frontend origin in
[wrangler/wrangler.toml](./wrangler/wrangler.toml).

## Testing

```bash
pnpm test
pnpm test:coverage
pnpm lint
pnpm format:check
```

For desktop and mobile E2E tests, stop your development servers first. Playwright
starts its own local frontend and backend on ports 5173 and 8787.

```bash
pnpm exec playwright install chromium
pnpm test:e2e
pnpm exec playwright show-report
```

## Deployment

Build the frontend with the deployed Worker's URL as `VITE_BACKEND_URL`:

```bash
pnpm --filter frontend build
```

Deploy `frontend/dist` to your static host. The Worker's `ALLOWED_ORIGINS` must
include the frontend's URL.

The [deploy workflow](./.github/workflows/deploy.yaml) deploys the backend to staging
on pushes to `master` and production on pushes to `production`. It requires the
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.

## License

MIT

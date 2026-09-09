import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', {open: 'never'}]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'mobile-chromium', use: {...devices['Pixel 7']}},
  ],
  webServer: [
    {
      command:
        'pnpm --filter wrangler exec wrangler dev --local --ip 127.0.0.1 --port 8787 --inspector-port 0',
      url: 'http://127.0.0.1:8787',
      env: {WRANGLER_SEND_METRICS: 'false'},
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter frontend dev --host localhost --port 5173 --strictPort',
      url: 'http://localhost:5173',
      env: {VITE_BACKEND_URL: 'http://127.0.0.1:8787'},
      timeout: 120_000,
    },
  ],
});

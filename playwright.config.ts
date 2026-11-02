import { defineConfig, devices } from '@playwright/test';

// E2E_BASE_URL lets the suite run against an already-served build
// (e.g. the Firebase hosting emulator: E2E_BASE_URL=http://localhost:5050).
const external = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  use: {
    baseURL: external ?? 'http://localhost:4173',
    ...devices['iPhone 15'],
    serviceWorkers: 'allow'
  },
  projects: [{ name: 'webkit-iphone', use: { browserName: 'webkit' } }],
  webServer: external
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: true,
        timeout: 120_000
      }
});

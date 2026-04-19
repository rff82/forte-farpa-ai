// forte · playwright.config.ts · 2026-04-19 · E12 matrix 6 browsers
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'https://forte.farpa.ai',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium',       use: { ...devices['Desktop Chrome']  } },
    { name: 'firefox',        use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',         use: { ...devices['Desktop Safari']  } },
    { name: 'edge',           use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'mobile-safari',  use: { ...devices['iPhone 13']       } },
    { name: 'chrome-android', use: { ...devices['Pixel 5']         } },
  ],
});

import { defineConfig, type BrowserName } from '@playwright/test';

const browserName = (process.env['PLAYWRIGHT_BROWSER'] || 'chromium') as BrowserName;

export default defineConfig({
  testDir: './projects/docs/e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4300',
    browserName,
    channel: browserName === 'chromium' ? process.env['PLAYWRIGHT_CHANNEL'] : undefined,
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/serve-static-spa.mjs dist/docs/browser 4300',
    url: 'http://127.0.0.1:4300',
    reuseExistingServer: true,
    timeout: 15_000,
  },
});

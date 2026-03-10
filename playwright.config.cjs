const { devices } = require('@playwright/test')

const PORT = 5174

module.exports = {
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    viewport: { width: 800, height: 600 },
  },
  projects: [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }],
  webServer: {
    command: 'npx vite --config vite.test-app.config.js',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
}

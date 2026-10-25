// End-to-end smoke tests for the static site. Run with: npm test
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 60000,
  reporter: process.env.CI ? 'github' : 'list',
  // Set BASE_URL to test an already-running server instead of starting one.
  use: { baseURL: process.env.BASE_URL || 'http://localhost:4173' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /layout\.spec\.js/ }
  ],
  webServer: process.env.BASE_URL ? undefined : {
    command: 'python3 -m http.server 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'ignore'
  }
});

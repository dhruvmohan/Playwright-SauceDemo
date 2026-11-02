// playwright.config.js
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',        // folder where the tests (spec files) are located
  fullyParallel: true,
  timeout: 30 * 1000,        // currently set to 30 seconds per test
  retries: 1,                // retry once on failure
  reporter: [
    ['list'],                // prints results in console
    ['html', { open: process.env.CI ? 'never' : 'always' }],  // generate HTML report
    ['json', { outputFile: 'test-results.json' }], // generate JSON report
    ['allure-playwright']    // generate Allure results in allure-results/
  ],
  use: {
    browserName: 'chromium', // run on chromium browser
    baseURL: 'https://www.saucedemo.com',
    headless: !!process.env.CI, // run headless in CI, headed locally
    screenshot: 'only-on-failure', // take screenshot only on failure
    video: 'retain-on-failure',     // record video only on failure
    trace: 'retain-on-failure',     // capture trace on failure
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

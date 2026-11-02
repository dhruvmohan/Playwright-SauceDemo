import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { auto } from 'auto-playwright/dist/index.js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';

const file = fs.readFileSync('./data.csv');
const records = parse(file, { columns: true, skip_empty_lines: true });

const options = {
  debug: true,
  model: 'gemini-3.1-flash-lite',
  openaiApiKey: process.env.GEMINI_API_KEY,
  openaiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
};

// Scenario Name
test.describe('Smoke test to check if the User is able to login and access About link using Auto Playwright AI', () => {
  test.describe.configure({ mode: 'serial' });

  // Test-Case Name
  records.forEach(data => {
    test(`${data.username} can log in and view About Sauce Labs with Auto Playwright @smoke`, async ({ page }) => {
      test.setTimeout(120000);
      const inventoryPage = new InventoryPage(page);
      const loginPage = new LoginPage(page);

      // 1. Navigate to saucedemo.com website
      await loginPage.goto();

      // 2. AI Action: Login using plain-text prompt
      await auto(
        `Fill "${data.username}" in the Username input, fill "${data.password}" in the Password input, and click the Login button`,
        { page, test },
        options
      );

      // 3. AI Query: Query the page header text after login
      const headerText = await auto('Get the text of the Products title header', { page, test }, options);
      expect(headerText).toContain('Products');

      // 4. AI Assert: Assert that the Sauce Labs Backpack product is visible on the page
      const isBackpackVisible = await auto(
        'Is the "Sauce Labs Backpack" product visible on the page?',
        { page, test },
        options
      );
      expect(isBackpackVisible).toBe(true);

      // 5. Select About link from side menu, go back, and logout
      await inventoryPage.selectAboutFromMenu();
      await page.goBack();
      await inventoryPage.expectLoaded();

      await inventoryPage.logout();
      await loginPage.expectLoginButtonVisible();
    });
  });

});


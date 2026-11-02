import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

const file = fs.readFileSync('./data.csv');
const records = parse(file, { columns: true, skip_empty_lines: true });

// Scenario Name
test.describe('Smoke test to check if the User is able to login and access About link', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.afterEach(async ({ page }) => {
    if (page.isClosed()) return;
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    if (await inventoryPage.burgerMenuButton.isVisible()) {
      await inventoryPage.logout();
      await loginPage.expectLoginButtonVisible();
    }
  });

  // Test-Case Name
  records.forEach(data => {
    test(`${data.username} can log in and view About Sauce Labs @smoke`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      // Login to saucedemo.com website
      await loginPage.login(data.username, data.password);

      // Check if the inventory page is loaded successfully and inventories are displayed on page
      await inventoryPage.expectLoaded();

      // Check the count of inventories on inventory page is greater than 1
      const count = await inventoryPage.getInventoryCount();
      expect(count).toBeGreaterThan(0);

      // Select About link from side menu
      await inventoryPage.selectAboutFromMenu();

      // Go back to the inventory page
      await page.goBack();
      await inventoryPage.expectLoaded();
    });
  });

});


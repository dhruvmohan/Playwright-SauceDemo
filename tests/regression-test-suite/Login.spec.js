import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

const validLoginFile = fs.readFileSync('./data.csv');
const validLoginRecords = parse(validLoginFile, {
  columns: true,
  skip_empty_lines: true,
});

const invalidLoginFile = fs.readFileSync('./invalidLoginData.csv');
const invalidLoginScenarios = parse(invalidLoginFile, {
  columns: true,
  skip_empty_lines: true,
});

// Scenario Name
test.describe('Login Functionality Regression', () => {

  validLoginRecords.forEach(data => {
    // Test-Case Name
    test(`${data.username} can log in successfully and log out @regression`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      await loginPage.goto();
      await loginPage.login(data.username, data.password);

      await inventoryPage.expectLoaded();
      const count = await inventoryPage.getInventoryCount();
      expect(count).toBeGreaterThan(0);

      await inventoryPage.logout();
      await loginPage.expectLoginButtonVisible();
    });
  });

  invalidLoginScenarios.forEach(scenario => {
    // Test-Case Name
    test(`Login fails with ${scenario.name} and displays expected error @regression`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login(scenario.username, scenario.password);

      await loginPage.expectErrorMessage(scenario.expectedError);
      await loginPage.dismissErrorMessage();
    });
  });

  // Test-Case Name
  test('Direct access to protected inventory page without authentication is blocked @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/inventory.html');
    await loginPage.expectLoginButtonVisible();
    await loginPage.expectErrorMessage("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });

});

import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

const userFile = fs.readFileSync('./data.csv');
const users = parse(userFile, { columns: true, skip_empty_lines: true });
const defaultUser = users[0];

// Scenario Name
test.describe('Product Sorting Regression', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(defaultUser.username, defaultUser.password);
    await inventoryPage.expectLoaded();
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

  test.afterAll(async () => {
    console.log('Completed Product Sorting Regression suite.');
  });

  // Test-Case Name
  test('Sort products by Name (A to Z) and verify alphabetical order @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy('az');
    const displayedNames = await inventoryPage.getProductNames();
    const expectedOrder = [...displayedNames].sort((a, b) => a.localeCompare(b));

    expect(displayedNames).toEqual(expectedOrder);
  });

  // Test-Case Name
  test('Sort products by Name (Z to A) and verify reverse alphabetical order @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy('za');
    const displayedNames = await inventoryPage.getProductNames();
    const expectedOrder = [...displayedNames].sort((a, b) => b.localeCompare(a));

    expect(displayedNames).toEqual(expectedOrder);
  });

  // Test-Case Name
  test('Sort products by Price (low to high) and verify ascending price order @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy('lohi');
    const displayedPrices = await inventoryPage.getProductPrices();
    const expectedOrder = [...displayedPrices].sort((a, b) => a - b);

    expect(displayedPrices).toEqual(expectedOrder);
  });

  // Test-Case Name
  test('Sort products by Price (high to low) and verify descending price order @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy('hilo');
    const displayedPrices = await inventoryPage.getProductPrices();
    const expectedOrder = [...displayedPrices].sort((a, b) => b - a);

    expect(displayedPrices).toEqual(expectedOrder);
  });

});

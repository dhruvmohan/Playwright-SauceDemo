import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';

const userFile = fs.readFileSync('./data.csv');
const users = parse(userFile, { columns: true, skip_empty_lines: true });
const defaultUser = users[0];

const catalogFile = fs.readFileSync('./inventoryCatalogData.csv');
const expectedCatalog = parse(catalogFile, { columns: true, skip_empty_lines: true });

// Scenario Name
test.describe('Inventory and Product Listing Regression', () => {

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
    console.log('Completed Inventory and Product Listing Regression suite.');
  });

  // Test-Case Name
  test('Inventory displays all expected products with names, descriptions, prices, and images @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    const count = await inventoryPage.getInventoryCount();
    expect(count).toBe(expectedCatalog.length);

    const names = await inventoryPage.getProductNames();
    const prices = await inventoryPage.getProductPrices();
    const descriptions = await inventoryPage.getProductDescriptions();
    const imageSources = await inventoryPage.getProductImageSources();

    expect(names).toEqual(expectedCatalog.map(item => item.name));
    expect(prices).toEqual(expectedCatalog.map(item => parseFloat(item.price)));

    descriptions.forEach(desc => {
      expect(desc.trim().length).toBeGreaterThan(10);
    });

    imageSources.forEach(src => {
      expect(src).toBeTruthy();
      expect(src).toMatch(/\.jpg$/);
    });
    expect(new Set(imageSources).size).toBe(expectedCatalog.length);
  });

  // Test-Case Name
  test('Navigate from inventory to product detail page and back to inventory @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const firstProduct = expectedCatalog[0];

    await inventoryPage.openProductDetails(firstProduct.name);
    await productDetailsPage.expectLoaded(firstProduct.name);
    await expect(productDetailsPage.productPrice).toHaveText(`$${firstProduct.price}`);

    await productDetailsPage.backToProducts();
    await inventoryPage.expectLoaded();
  });

});

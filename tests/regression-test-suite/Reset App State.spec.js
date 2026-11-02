import { test } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { MenuPage } from '../../pages/MenuPage';

const userFile = fs.readFileSync('./data.csv');
const users = parse(userFile, { columns: true, skip_empty_lines: true });
const defaultUser = users[0];

const catalogFile = fs.readFileSync('./inventoryCatalogData.csv');
const catalog = parse(catalogFile, { columns: true, skip_empty_lines: true });

// Scenario Name
test.describe('Reset App State Regression', () => {

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
    console.log('Completed Reset App State Regression suite.');
  });

  // Test-Case Name
  test('Reset App State clears cart badge and empties all items from the shopping cart @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const menuPage = new MenuPage(page);

    await inventoryPage.addProductByName(catalog[0].name);
    await inventoryPage.addProductByName(catalog[1].name);
    await inventoryPage.addProductByName(catalog[4].name);
    await inventoryPage.expectCartBadgeCount(3);

    await menuPage.resetAppState();
    await inventoryPage.expectCartBadgeCount(0);

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemCount(0);
  });

  // Test-Case Name
  test('Reset App State from Shopping Cart page clears cart contents and allows fresh product selection @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const menuPage = new MenuPage(page);

    await inventoryPage.addProductByName(catalog[3].name);
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemCount(1);

    await menuPage.resetAppState();
    await inventoryPage.expectCartBadgeCount(0);

    await cartPage.continueShopping();
    await inventoryPage.expectLoaded();
    await inventoryPage.addProductByName(catalog[0].name);
    await inventoryPage.expectCartBadgeCount(1);
  });

});

import { test } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';
import { CartPage } from '../../pages/CartPage';
import { MenuPage } from '../../pages/MenuPage';

const userFile = fs.readFileSync('./data.csv');
const users = parse(userFile, { columns: true, skip_empty_lines: true });
const defaultUser = users[0];

const catalogFile = fs.readFileSync('./inventoryCatalogData.csv');
const catalog = parse(catalogFile, { columns: true, skip_empty_lines: true });

// Scenario Name
test.describe('Navigation Menu Regression', () => {

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
    console.log('Completed Navigation Menu Regression suite.');
  });

  // Test-Case Name
  test('Open and close the side navigation menu @regression', async ({ page }) => {
    const menuPage = new MenuPage(page);

    await menuPage.expectMenuClosed();
    await menuPage.openMenu();
    await menuPage.expectMenuOpen();
    await menuPage.closeMenu();
    await menuPage.expectMenuClosed();
  });

  // Test-Case Name
  test('Verify All Items navigation from Product Details and Shopping Cart back to Inventory @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const menuPage = new MenuPage(page);

    await inventoryPage.openProductDetails(catalog[0].name);
    await productDetailsPage.expectLoaded(catalog[0].name);
    await menuPage.clickAllItems();
    await inventoryPage.expectLoaded();

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await menuPage.clickAllItems();
    await inventoryPage.expectLoaded();
  });

});

import { test } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

const userFile = fs.readFileSync('./data.csv');
const users = parse(userFile, { columns: true, skip_empty_lines: true });
const defaultUser = users[0];

const catalogFile = fs.readFileSync('./inventoryCatalogData.csv');
const catalog = parse(catalogFile, { columns: true, skip_empty_lines: true });

// Scenario Name
test.describe('Shopping Cart Regression', () => {

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
    console.log('Completed Shopping Cart Regression suite.');
  });

  // Test-Case Name
  test('Add single and multiple products, verify cart badge, names, quantities, and prices @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.expectCartBadgeCount(0);

    await inventoryPage.addProductByName(catalog[0].name);
    await inventoryPage.expectCartBadgeCount(1);

    await inventoryPage.addProductByName(catalog[1].name);
    await inventoryPage.expectCartBadgeCount(2);

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemCount(2);
    await cartPage.expectProductInCart(catalog[0].name, `$${catalog[0].price}`, '1');
    await cartPage.expectProductInCart(catalog[1].name, `$${catalog[1].price}`, '1');
  });

  // Test-Case Name
  test('Remove products from inventory page and from shopping cart page @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductByName(catalog[0].name);
    await inventoryPage.addProductByName(catalog[4].name);
    await inventoryPage.expectCartBadgeCount(2);

    // Remove one product directly on the inventory page
    await inventoryPage.removeProductByName(catalog[0].name);
    await inventoryPage.expectCartBadgeCount(1);

    // Open cart and remove the remaining product
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemCount(1);
    await cartPage.removeProductByName(catalog[4].name);
    await cartPage.expectItemCount(0);
    await inventoryPage.expectCartBadgeCount(0);
  });

  // Test-Case Name
  test('Verify cart persistence across navigation, Continue Shopping, and Checkout navigation @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductByName(catalog[3].name);
    await inventoryPage.openProductDetails(catalog[2].name);
    await productDetailsPage.expectLoaded(catalog[2].name);
    await productDetailsPage.addToCart();
    await inventoryPage.expectCartBadgeCount(2);

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemCount(2);

    await cartPage.continueShopping();
    await inventoryPage.expectLoaded();
    await inventoryPage.expectCartBadgeCount(2);

    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.expectStepOneLoaded();
  });

});

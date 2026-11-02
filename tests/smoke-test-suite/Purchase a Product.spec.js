import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

const file = fs.readFileSync('./data.csv');
const records = parse(file, { columns: true, skip_empty_lines: true });

// Scenario Name
test.describe('Purchase a Product', () => {

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
    test(`${data.username} can login, add a product to cart, complete checkout, and logout @smoke`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      // Login to saucedemo.com website
      await loginPage.login(data.username, data.password);

      // Check if the inventory page is loaded successfully and inventories are displayed on page
      await inventoryPage.expectLoaded();

      // Check the count of inventories on inventory page is greater than 1
      const count = await inventoryPage.getInventoryCount();
      expect(count).toBeGreaterThan(0);

      // Add the first available product to cart
      await inventoryPage.addFirstProductToCart();

      // Check whether remove button is available now
      await expect(inventoryPage.removeButtons).toHaveCount(1);

      // Open cart
      await inventoryPage.openCart();
      await cartPage.expectLoaded();

      // Proceed to checkout
      await cartPage.proceedToCheckout();
      await checkoutPage.expectStepOneLoaded();

      // Fill the personal information and continue
      await checkoutPage.fillInformationAndContinue('Dhruv', 'Mohan', '60486');
      await checkoutPage.expectStepTwoLoaded();

      // Finish checkout
      await checkoutPage.finishCheckout();
      await checkoutPage.expectCheckoutComplete();
    });
  });

});


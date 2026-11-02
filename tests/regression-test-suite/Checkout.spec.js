import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

const userFile = fs.readFileSync('./data.csv');
const users = parse(userFile, { columns: true, skip_empty_lines: true });
const defaultUser = users[0];

const validationFile = fs.readFileSync('./checkoutValidationData.csv');
const requiredFieldScenarios = parse(validationFile, {
  columns: true,
  skip_empty_lines: true,
});

// Scenario Name
test.describe('Checkout Regression', () => {

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
    console.log('Completed Checkout Regression suite.');
  });

  // Test-Case Name
  test('Verify multi-item prices, subtotal, tax, and total calculation on Checkout Overview @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.addProductByName('Sauce Labs Bike Light');

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.proceedToCheckout();

    await checkoutPage.expectStepOneLoaded();
    await checkoutPage.fillInformationAndContinue('Dhruv', 'Mohan', '60486');
    await checkoutPage.expectStepTwoLoaded();

    const { itemPrices, subtotal, tax, total } = await checkoutPage.getPricingSummary();
    const expectedSubtotal = Number(itemPrices.reduce((sum, p) => sum + p, 0).toFixed(2));
    const expectedTax = Number((expectedSubtotal * 0.08).toFixed(2));
    const expectedTotal = Number((expectedSubtotal + expectedTax).toFixed(2));

    expect(itemPrices).toEqual([29.99, 9.99]);
    expect(subtotal).toBe(expectedSubtotal);
    expect(tax).toBe(expectedTax);
    expect(total).toBe(expectedTotal);
  });

  requiredFieldScenarios.forEach(scenario => {
    // Test-Case Name
    test(`Checkout Step One validates ${scenario.name} @regression`, async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      await inventoryPage.addFirstProductToCart();
      await inventoryPage.openCart();
      await cartPage.proceedToCheckout();
      await checkoutPage.expectStepOneLoaded();

      await checkoutPage.fillInformationAndContinue(
        scenario.firstName,
        scenario.lastName,
        scenario.postalCode
      );
      await checkoutPage.expectErrorMessage(scenario.expectedError);
    });
  });

  // Test-Case Name
  test('Verify Checkout Cancel navigation from Step One to Cart and from Step Two to Inventory @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.expectStepOneLoaded();

    // Cancel on Step One returns to Cart
    await checkoutPage.cancel();
    await cartPage.expectLoaded();

    // Proceed to Step Two and Cancel returns to Inventory
    await cartPage.proceedToCheckout();
    await checkoutPage.fillInformationAndContinue('Dhruv', 'Mohan', '60486');
    await checkoutPage.expectStepTwoLoaded();
    await checkoutPage.cancel();
    await inventoryPage.expectLoaded();
  });

  // Test-Case Name
  test('Verify supported empty-cart checkout behavior calculates zero subtotal and total @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemCount(0);

    await cartPage.proceedToCheckout();
    await checkoutPage.expectStepOneLoaded();
    await checkoutPage.fillInformationAndContinue('Dhruv', 'Mohan', '60486');
    await checkoutPage.expectStepTwoLoaded();

    const { itemPrices, subtotal, tax, total } = await checkoutPage.getPricingSummary();
    expect(itemPrices).toEqual([]);
    expect(subtotal).toBe(0);
    expect(tax).toBe(0);
    expect(total).toBe(0);
  });

});

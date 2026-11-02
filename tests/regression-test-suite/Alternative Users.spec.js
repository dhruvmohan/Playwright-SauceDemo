import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

const altUsersFile = fs.readFileSync('./alternativeUsersData.csv');
const altUsers = parse(altUsersFile, { columns: true, skip_empty_lines: true });
const userMap = Object.fromEntries(altUsers.map(u => [u.username, u]));

// Scenario Name
test.describe('Alternative SauceDemo Users Regression', () => {

  // Test-Case Name
  test('problem_user exhibits documented duplicate 404 product images and Checkout Last Name defect @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const user = userMap['problem_user'];

    await loginPage.goto();
    await loginPage.login(user.username, user.password);
    await inventoryPage.expectLoaded();

    // Known intentional behavior for problem_user: all 6 product images point to the same 404 dog image
    const imageSources = await inventoryPage.getProductImageSources();
    expect(imageSources.length).toBe(6);
    expect(new Set(imageSources).size).toBe(1);
    expect(imageSources[0]).toContain('sl-404');

    // Known intentional defect for problem_user: typing Last Name overwrites First Name and leaves Last Name blank
    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.expectStepOneLoaded();

    await checkoutPage.fillInformationAndContinue('Dhruv', 'Mohan', '60486');
    await checkoutPage.expectErrorMessage('Error: Last Name is required');
  });

  // Test-Case Name
  test('performance_glitch_user logs in after intentional latency and loads inventory normally @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const user = userMap['performance_glitch_user'];

    await loginPage.goto();

    // Measure login duration to verify the intentional ~5-second performance glitch delay
    const startTime = Date.now();
    await loginPage.login(user.username, user.password);
    await inventoryPage.expectLoaded();
    const loginDurationMs = Date.now() - startTime;

    expect(loginDurationMs).toBeGreaterThanOrEqual(4000);

    const count = await inventoryPage.getInventoryCount();
    expect(count).toBe(6);

    const imageSources = await inventoryPage.getProductImageSources();
    expect(new Set(imageSources).size).toBe(6);
  });

  // Test-Case Name
  test('error_user exhibits documented inability to remove Backpack from inventory and fill Checkout Last Name @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const user = userMap['error_user'];

    await loginPage.goto();
    await loginPage.login(user.username, user.password);
    await inventoryPage.expectLoaded();

    // Known intentional defect for error_user: clicking Remove on inventory page fails to remove item from cart
    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.expectCartBadgeCount(1);
    await inventoryPage.removeProductByName('Sauce Labs Backpack');
    await inventoryPage.expectCartBadgeCount(1);

    // Known intentional defect for error_user: Last Name input on Checkout Step One ignores typed input
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.expectStepOneLoaded();
    await checkoutPage.lastNameInput.fill('Mohan');
    await expect(checkoutPage.lastNameInput).toHaveValue('');
  });

  // Test-Case Name
  test('visual_user logs in and exhibits documented dog image on first item and visual_failure cart class @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const user = userMap['visual_user'];

    await loginPage.goto();
    await loginPage.login(user.username, user.password);
    await inventoryPage.expectLoaded();

    // Known intentional anomaly for visual_user: first product displays the sl-404 dog image while remaining products have normal images
    const imageSources = await inventoryPage.getProductImageSources();
    expect(imageSources[0]).toContain('sl-404');
    expect(new Set(imageSources).size).toBe(6);

    const shoppingCartContainer = page.locator('#shopping_cart_container');
    await expect(shoppingCartContainer).toHaveClass(/visual_failure/);
  });

});

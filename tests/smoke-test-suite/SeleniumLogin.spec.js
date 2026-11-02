import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { Builder, By, until, Browser } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const file = fs.readFileSync('./data.csv');
const records = parse(file, { columns: true, skip_empty_lines: true });

// Scenario Name
test.describe('Selenium inside Playwright Script', () => {
  let driver;

  test.beforeEach(async () => {
    const options = new chrome.Options();
    if (process.env.CI) {
      options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
    }
    options.setUserPreferences({
      'credentials_enable_service': false,
      'profile.password_manager_enabled': false,
      'profile.password_manager_leak_detection': false,
    });

    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();

    await driver.manage().window().maximize();
    await driver.get('https://www.saucedemo.com/');
  });

  test.afterEach(async () => {
    if (!driver) return;
    try {
      const menuButtons = await driver.findElements(By.id('react-burger-menu-btn'));
      if (menuButtons.length > 0 && (await menuButtons[0].isDisplayed())) {
        await menuButtons[0].click();
        const logoutLink = await driver.wait(
          until.elementLocated(By.id('logout_sidebar_link')),
          5000
        );
        await driver.wait(until.elementIsVisible(logoutLink), 5000);
        await logoutLink.click();

        const loginBtn = await driver.wait(
          until.elementLocated(By.id('login-button')),
          5000
        );
        expect(await loginBtn.isDisplayed()).toBe(true);
      }
    } finally {
      await driver.quit();
      driver = null;
    }
  });

  // Test-Case Name
  records.forEach(data => {
    test(`${data.username} can login to SauceDemo using Selenium WebDriver @smoke`, async () => {
      // Enter username using Selenium
      const usernameInput = await driver.wait(
        until.elementLocated(By.id('user-name')),
        10000
      );
      await usernameInput.sendKeys(data.username);

      // Enter password
      await driver.findElement(By.id('password')).sendKeys(data.password);

      // Click Login
      await driver.findElement(By.id('login-button')).click();

      // Wait for inventory page
      const inventoryTitle = await driver.wait(
        until.elementLocated(By.css('.title')),
        10000
      );

      // Validate page using Playwright assertions
      const titleText = await inventoryTitle.getText();
      expect(titleText).toBe('Products');

      // Wait for and click Add product to cart
      const addToCartBtn = await driver.wait(
        until.elementLocated(By.id('add-to-cart-sauce-labs-backpack')),
        10000
      );
      await driver.wait(until.elementIsVisible(addToCartBtn), 10000);
      await addToCartBtn.click();

      // Wait for cart badge to render and verify cart count
      const cartBadge = await driver.wait(
        until.elementLocated(By.css('.shopping_cart_badge')),
        10000
      );
      expect(await cartBadge.getText()).toBe('1');
    });
  });

});


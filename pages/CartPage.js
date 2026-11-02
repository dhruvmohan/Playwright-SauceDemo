import { expect } from '@playwright/test';

export class CartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.cartItemNames = page.locator('.inventory_item_name');
    this.cartItemPrices = page.locator('.inventory_item_price');
    this.cartItemQuantities = page.locator('[data-test="item-quantity"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('button:has-text("Checkout")');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/.*cart.html/);
  }

  async expectItemCount(count) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectProductInCart(productName, expectedPrice = null, expectedQuantity = '1') {
    const item = this.cartItems.filter({ hasText: productName });
    await expect(item).toBeVisible();
    await expect(item.locator('[data-test="item-quantity"]')).toHaveText(String(expectedQuantity));
    if (expectedPrice !== null) {
      await expect(item.locator('.inventory_item_price')).toHaveText(expectedPrice);
    }
  }

  async removeProductByName(productName) {
    const item = this.cartItems.filter({ hasText: productName });
    await item.locator('button:has-text("Remove")').click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}

import { expect } from '@playwright/test';

export class InventoryPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemDescriptions = page.locator('.inventory_item_desc');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemImages = page.locator('img.inventory_item_img');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.firstAddToCartButton = page.locator('button:has-text("Add to cart")').first();
    this.removeButtons = page.locator('button:has-text("Remove")');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.menuWrap = page.locator('.bm-menu-wrap');
    this.aboutSidebarLink = page.locator('[data-test="about-sidebar-link"]');
    this.logoutSidebarLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/.*inventory.html$/);
    await expect(this.inventoryList).toBeVisible();
  }

  async getInventoryCount() {
    return await this.inventoryItems.count();
  }

  async getProductNames() {
    return await this.itemNames.allInnerTexts();
  }

  async getProductDescriptions() {
    return await this.itemDescriptions.allInnerTexts();
  }

  async getProductPrices() {
    const texts = await this.itemPrices.allInnerTexts();
    return texts.map(text => parseFloat(text.replace('$', '')));
  }

  async getProductImageSources() {
    const count = await this.itemImages.count();
    const sources = [];
    for (let i = 0; i < count; i++) {
      sources.push(await this.itemImages.nth(i).getAttribute('src'));
    }
    return sources;
  }

  async sortBy(optionValue) {
    await this.sortDropdown.selectOption(optionValue);
  }

  async addFirstProductToCart() {
    await this.firstAddToCartButton.click();
  }

  async addProductByName(productName) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.locator('button:has-text("Add to cart")').click();
  }

  async removeProductByName(productName) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.locator('button:has-text("Remove")').click();
  }

  async openProductDetails(productName) {
    await this.itemNames.filter({ hasText: productName }).click();
  }

  async expectCartBadgeCount(count) {
    if (count === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toBeVisible();
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async openCart() {
    await this.cartLink.click();
  }

  async selectAboutFromMenu() {
    if ((await this.menuWrap.getAttribute('aria-hidden')) !== 'false') {
      await this.burgerMenuButton.click();
    }
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'false');
    await expect(this.aboutSidebarLink).toBeVisible();
    await this.aboutSidebarLink.click();
  }

  async logout() {
    if (this.page.isClosed()) {
      return;
    }
    if ((await this.menuWrap.getAttribute('aria-hidden')) !== 'false') {
      await this.burgerMenuButton.click();
    }
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'false');
    await expect(this.logoutSidebarLink).toBeVisible();
    await this.logoutSidebarLink.click();
  }
}

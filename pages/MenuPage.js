import { expect } from '@playwright/test';

export class MenuPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.openMenuButton = page.locator('.bm-burger-button');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
    this.menuWrap = page.locator('.bm-menu-wrap');
    this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
    this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
  }

  async openMenu() {
    await this.openMenuButton.click();
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'false');
  }

  async closeMenu() {
    await this.closeMenuButton.click();
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'true');
  }

  async expectMenuOpen() {
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'false');
    await expect(this.allItemsLink).toBeVisible();
    await expect(this.aboutLink).toBeVisible();
    await expect(this.logoutLink).toBeVisible();
    await expect(this.resetAppStateLink).toBeVisible();
  }

  async expectMenuClosed() {
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'true');
  }

  async clickAllItems() {
    await this.openMenu();
    await this.allItemsLink.click();
  }

  async clickAbout() {
    await this.openMenu();
    await this.aboutLink.click();
  }

  async clickLogout() {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.openMenu();
    await this.resetAppStateLink.click();
    await this.closeMenu();
  }
}


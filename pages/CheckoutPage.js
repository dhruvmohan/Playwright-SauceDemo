import { expect } from '@playwright/test';

export class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.yourInfoHeader = page.getByText('Checkout: Your Information');
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('input[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.overviewHeader = page.getByText('Checkout: Overview');
    this.paymentInfoLabel = page.getByText('Payment Information:');
    this.shippingInfoLabel = page.getByText('Shipping Information:');
    this.summaryItemPrices = page.locator('.inventory_item_price');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('button:has-text("Finish")');
    this.completeHeader = page.getByText('Thank you for your order!');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async expectStepOneLoaded() {
    await expect(this.yourInfoHeader).toBeVisible();
    await expect(this.page).toHaveURL(/.*checkout-step-one.html/);
  }

  async fillInformationAndContinue(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async expectErrorMessage(expectedText) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expectStepTwoLoaded() {
    await expect(this.overviewHeader).toBeVisible();
    await expect(this.paymentInfoLabel).toBeVisible();
    await expect(this.shippingInfoLabel).toBeVisible();
    await expect(this.page).toHaveURL(/.*checkout-step-two.html/);
  }

  async getPricingSummary() {
    const priceTexts = await this.summaryItemPrices.allInnerTexts();
    const itemPrices = priceTexts.map(text => parseFloat(text.replace('$', '')));

    const subtotalText = await this.subtotalLabel.innerText();
    const taxText = await this.taxLabel.innerText();
    const totalText = await this.totalLabel.innerText();

    const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
    const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''));
    const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));

    return { itemPrices, subtotal, tax, total };
  }

  async finishCheckout() {
    await this.finishButton.click();
  }

  async expectCheckoutComplete() {
    await expect(this.completeHeader).toBeVisible();
    await expect(this.page).toHaveURL(/.*checkout-complete.html/);
  }

  async backHome() {
    await this.backHomeButton.click();
  }
}

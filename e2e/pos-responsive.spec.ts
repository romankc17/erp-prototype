import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/#/login');
  await page.waitForSelector('text=Sign in to your account');
  // Use demo account auto-fill
  await page.click('text=Admin');
  await page.click('button:has-text("Sign In")');
  // Handle workspace picker if shown
  try {
    await page.waitForSelector('text=Select Your Workspace', { timeout: 3000 });
    await page.click('.border-blue-500'); // select first workspace
    await page.click('button:has-text("Enter Workspace")');
  } catch {
    // no workspace picker
  }
}

async function openPosSession(page: Page) {
  await page.goto('/#/pos');
  // If no session open, open one
  const noSession = await page.locator('text=No Open POS Session').isVisible().catch(() => false);
  if (noSession) {
    // Fill some denominations
    await page.locator('input[type="number"]').first().fill('1');
    await page.click('button:has-text("Open Session")');
    await page.waitForSelector('text=Sell', { timeout: 5000 });
  }
}

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

for (const vp of viewports) {
  test.describe(`POS @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`sell tab renders correctly on ${vp.name}`, async ({ page }) => {
      await login(page);
      await openPosSession(page);
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`pos-sell-${vp.name}.png`, { fullPage: false });
    });

    test(`history tab renders correctly on ${vp.name}`, async ({ page }) => {
      await login(page);
      await openPosSession(page);
      await page.click('button:has-text("History")');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`pos-history-${vp.name}.png`, { fullPage: false });
    });

    test(`returns tab renders correctly on ${vp.name}`, async ({ page }) => {
      await login(page);
      await openPosSession(page);
      await page.click('button:has-text("Returns")');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`pos-returns-${vp.name}.png`, { fullPage: false });
    });

    test(`analytics tab renders correctly on ${vp.name}`, async ({ page }) => {
      await login(page);
      await openPosSession(page);
      await page.click('button:has-text("Analytics")');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`pos-analytics-${vp.name}.png`, { fullPage: false });
    });
  });
}

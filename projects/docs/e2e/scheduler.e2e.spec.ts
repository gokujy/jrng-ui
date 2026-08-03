import { expect, test } from '@playwright/test';

test.describe('Scheduler documentation workflows', () => {
  test.describe.configure({ timeout: 120_000 });

  test('navigates and switches views with named keyboard controls', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-basic');
    await preview.scrollIntoViewIfNeeded();
    const scheduler = preview.locator('j-scheduler');
    await expect(scheduler.locator('.j-scheduler')).toBeVisible();
    await expect(scheduler.locator('.j-scheduler')).toHaveAttribute('data-view', 'month');
    await scheduler.getByRole('button', { name: 'Next range' }).evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
    await expect(scheduler.locator('.j-scheduler-toolbar__title')).toContainText('August 2026');
    await scheduler.getByRole('button', { name: 'Week', exact: true }).evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
    await expect(scheduler.locator('.j-scheduler')).toHaveAttribute('data-view', 'week');
    await scheduler.getByRole('button', { name: 'Today' }).evaluate((button) => {
      (button as HTMLButtonElement).focus();
    });
    await expect(scheduler.getByRole('button', { name: 'Today' })).toBeFocused();
  });

  test('owns horizontal timeline scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-virtualized');
    await preview.scrollIntoViewIfNeeded();
    const viewport = preview.locator('.j-scheduler-timeline__viewport');
    await expect(preview.locator('.j-scheduler')).toBeVisible();
    const dimensions = await viewport.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      overflowX: getComputedStyle(element).overflowX,
    }));
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
    expect(dimensions.overflowX).toMatch(/auto|scroll/);
  });

  test('uses the adaptive resource selector on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-adaptive-resources');
    await preview.scrollIntoViewIfNeeded();
    await expect(preview.locator('[data-j-slot="adaptive-resource-selector"]')).toBeVisible();
    await expect(preview.getByRole('combobox', { name: 'Resource', exact: true })).toBeVisible();
  });

  test('keeps disabled scheduler controls unreachable', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-disabled');
    await preview.scrollIntoViewIfNeeded();
    const scheduler = preview.locator('.j-scheduler');
    await expect(scheduler).toHaveAttribute('aria-disabled', 'true');
    const enabledButtons = scheduler.locator('button:not([disabled])');
    await expect(enabledButtons).toHaveCount(0);
  });
});

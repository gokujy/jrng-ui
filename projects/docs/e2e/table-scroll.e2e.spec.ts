import { expect, test } from '@playwright/test';

const horizontalPreview = '#component-live-preview-scrolling-horizontal';

test.describe('Table documentation scrolling', () => {
  test.describe.configure({ timeout: 120_000 });

  for (const width of [320, 375, 768, 1024]) {
    test(`contains horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/docs/components#table');
      const preview = page.locator(horizontalPreview);
      await preview.scrollIntoViewIfNeeded();
      const viewport = preview.locator('.j-table__scroll');
      await expect(viewport).toBeVisible();

      const dimensions = await viewport.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowX: getComputedStyle(element).overflowX,
      }));
      expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
      expect(dimensions.overflowX).toMatch(/auto|scroll/);

      await viewport.evaluate((element) => {
        element.scrollLeft = 160;
      });
      expect(await viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      const overflowSources =
        pageOverflow > 1
          ? await page.evaluate(() =>
              Array.from(document.querySelectorAll<HTMLElement>('*'))
                .map((element) => {
                  const rect = element.getBoundingClientRect();
                  return {
                    selector: `${element.tagName}.${element.className}`,
                    right: Math.round(rect.right),
                    width: Math.round(rect.width),
                  };
                })
                .filter(({ right }) => right > document.documentElement.clientWidth + 1)
                .sort(
                  (first, second) =>
                    Math.abs(first.right - document.documentElement.scrollWidth) -
                    Math.abs(second.right - document.documentElement.scrollWidth),
                )
                .slice(0, 8),
            )
          : [];
      expect(pageOverflow, JSON.stringify(overflowSources)).toBeLessThanOrEqual(1);
    });
  }

  test('keeps frozen columns fixed while the viewport scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto('/docs/components#table');
    const preview = page.locator('#component-live-preview-scrolling-frozen-columns');
    await preview.scrollIntoViewIfNeeded();
    const viewport = preview.locator('.j-table__scroll');
    const frozen = viewport.locator('thead th.j-table__cell--frozen').first();
    await expect(frozen).toBeVisible();
    const before = await frozen.boundingBox();
    await viewport.evaluate((element) => {
      element.scrollLeft = 300;
    });
    const after = await frozen.boundingBox();
    expect(Math.abs((after?.x || 0) - (before?.x || 0))).toBeLessThanOrEqual(1);
  });

  test('keeps logical frozen edges stable in RTL', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto('/docs/components#table');
    const preview = page.locator('#component-live-preview-scrolling-frozen-columns');
    await preview.scrollIntoViewIfNeeded();
    await preview.evaluate((element) => element.setAttribute('dir', 'rtl'));
    const viewport = preview.locator('.j-table__scroll');
    const startFrozen = viewport
      .locator('thead th.j-table__cell--frozen:not(.j-table__cell--frozen-right)')
      .first();
    await expect(startFrozen).toBeVisible();
    const before = await startFrozen.boundingBox();
    await viewport.evaluate((element) => {
      element.scrollLeft = -300;
    });
    const after = await startFrozen.boundingBox();
    expect(Math.abs((after?.x || 0) - (before?.x || 0))).toBeLessThanOrEqual(1);
  });

  test('expands table width after a pointer column resize', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto('/docs/components#table');
    const preview = page.locator('#component-live-preview-columns-column-resizing-in-expand-mode');
    await preview.scrollIntoViewIfNeeded();
    const table = preview.locator('.j-table__element');
    const handle = preview.locator('.j-table__resize-handle').first();
    await expect(handle).toBeVisible();
    const before = await table.evaluate((element) => element.getBoundingClientRect().width);
    const box = await handle.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move((box?.x || 0) + (box?.width || 0) / 2, (box?.y || 0) + 8);
    await page.mouse.down();
    await page.mouse.move((box?.x || 0) + 80, (box?.y || 0) + 8);
    await page.mouse.up();
    const after = await table.evaluate((element) => element.getBoundingClientRect().width);
    expect(after).toBeGreaterThan(before + 40);
  });

  test('reorders columns with native drag and drop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto('/docs/components#table');
    const preview = page.locator('#component-live-preview-columns-column-reordering');
    await preview.scrollIntoViewIfNeeded();
    const headers = preview
      .locator('thead tr')
      .first()
      .locator('th[data-jc-section="header-cell"]');
    const status = headers.filter({ hasText: 'Status' });
    const total = headers.filter({ hasText: 'Total' });
    await expect(status).toHaveAttribute('draggable', 'true');
    await status.dragTo(total);
    await expect(headers.nth(3)).toContainText('Status');
  });
});

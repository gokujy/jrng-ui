import { expect, test } from '@playwright/test';

const horizontalPreview = '#component-live-preview-scrolling-horizontal';

test.describe('Table documentation scrolling', () => {
  test.describe.configure({ timeout: 120_000 });

  test('renders the reference-style enterprise table controls and configuration', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/docs/components#table');
    const preview = page.locator('#component-live-preview-advanced-customer-management-table');
    await preview.scrollIntoViewIfNeeded();

    const table = preview.locator('.j-table--enterprise');
    await expect(table).toBeVisible();
    await expect(table.getByRole('button', { name: 'Apply Leave' })).toHaveCount(0);
    await expect(table.getByRole('button', { name: 'Leave Trackers' })).toHaveCount(0);
    await expect(table.getByRole('button', { name: 'Table config' })).toBeVisible();
    await expect(table.getByRole('button', { name: 'Maximize table' })).toBeVisible();
    await expect(table.getByRole('button', { name: 'Toggle filters' })).toBeVisible();
    await expect(table.getByRole('button', { name: 'Refresh table' })).toBeVisible();
    await expect(table.getByRole('button', { name: 'Export table' })).toBeVisible();

    await expect(table.locator('.j-table__filter-row j-column-filter')).toHaveCount(6);
    await expect(table.locator('th[data-jc-section="header-cell"]')).toContainText([
      'Index',
      'Requester',
      'Request Type',
      'Request Period',
      'Units',
      'Date of Requested',
      'Reviewers',
      'Review comment',
      'Status',
      'Actions',
    ]);

    const scroll = table.locator('.j-table__scroll');
    await expect(scroll).toHaveCSS('overflow-x', 'auto');
    const frozenCells = table.locator('tbody tr').first().locator('.j-table__cell--frozen');
    await expect(frozenCells.first()).toHaveCSS('position', 'sticky');
    await expect(frozenCells.last()).toHaveCSS('position', 'sticky');

    await table.getByRole('button', { name: 'Open request actions' }).first().click();
    await expect(page.locator('body > .j-action-menu__items--popup')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'View request' })).toBeVisible();
    await page.keyboard.press('Escape');

    await table.getByRole('button', { name: 'Maximize table' }).click();
    const maximized = page.locator('body > .j-table.is-maximized');
    await expect(maximized).toBeVisible();
    await expect(maximized.getByRole('button', { name: 'Minimize table' })).toBeVisible();
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const maximizedBounds = await maximized.boundingBox();
    expect(Math.abs((maximizedBounds?.height ?? 0) - viewportHeight)).toBeLessThanOrEqual(2);
    await maximized.getByRole('button', { name: 'Minimize table' }).click();
    await expect(preview.locator('.j-table--enterprise')).not.toHaveClass(/is-maximized/);
    await expect(table.locator('j-paginator')).toBeVisible();
  });

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

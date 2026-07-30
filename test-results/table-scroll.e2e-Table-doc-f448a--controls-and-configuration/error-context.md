# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: table-scroll.e2e.spec.ts >> Table documentation scrolling >> renders the reference-style enterprise table controls and configuration
- Location: projects\docs\e2e\table-scroll.e2e.spec.ts:8:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('#component-live-preview-advanced-customer-management-table').locator('.j-table--enterprise').locator('tbody .j-table__cell--frozen-right').first()
Expected: "sticky"
Received: ""

Call log:
  - Expect "toHaveCSS" with timeout 10000ms
  - waiting for locator('#component-live-preview-advanced-customer-management-table').locator('.j-table--enterprise').locator('tbody .j-table__cell--frozen-right').first()
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | 
  3   | const horizontalPreview = '#component-live-preview-scrolling-horizontal';
  4   | 
  5   | test.describe('Table documentation scrolling', () => {
  6   |   test.describe.configure({ timeout: 120_000 });
  7   | 
  8   |   test('renders the reference-style enterprise table controls and configuration', async ({
  9   |     page,
  10  |   }) => {
  11  |     await page.setViewportSize({ width: 1440, height: 1000 });
  12  |     await page.goto('/docs/components#table');
  13  |     const preview = page.locator('#component-live-preview-advanced-customer-management-table');
  14  |     await preview.scrollIntoViewIfNeeded();
  15  | 
  16  |     const table = preview.locator('.j-table--enterprise');
  17  |     await expect(table).toBeVisible();
  18  |     await expect(table.getByRole('button', { name: 'Apply Leave' })).toHaveCount(0);
  19  |     await expect(table.getByRole('button', { name: 'Leave Trackers' })).toHaveCount(0);
  20  |     await expect(table.getByRole('button', { name: 'Table config' })).toBeVisible();
  21  |     await expect(table.getByRole('button', { name: 'Maximize table' })).toBeVisible();
  22  |     await expect(table.getByRole('button', { name: 'Toggle filters' })).toBeVisible();
  23  |     await expect(table.getByRole('button', { name: 'Refresh table' })).toBeVisible();
  24  |     await expect(table.getByRole('button', { name: 'Export table' })).toBeVisible();
  25  | 
  26  |     await expect(table.locator('.j-table__filter-row j-column-filter')).toHaveCount(6);
  27  |     await expect(table.locator('th[data-jc-section="header-cell"]')).toContainText([
  28  |       'Index',
  29  |       'Requester',
  30  |       'Request Type',
  31  |       'Request Period',
  32  |       'Units',
  33  |       'Date of Requested',
  34  |       'Reviewers',
  35  |       'Review comment',
  36  |       'Status',
  37  |       'Actions',
  38  |     ]);
  39  | 
  40  |     const scroll = table.locator('.j-table__scroll');
  41  |     await expect(scroll).toHaveCSS('overflow-x', 'auto');
  42  |     await expect(table.locator('tbody .j-table__cell--frozen').first()).toHaveCSS(
  43  |       'position',
  44  |       'sticky',
  45  |     );
> 46  |     await expect(table.locator('tbody .j-table__cell--frozen-right').first()).toHaveCSS(
      |                                                                               ^ Error: expect(locator).toHaveCSS(expected) failed
  47  |       'position',
  48  |       'sticky',
  49  |     );
  50  | 
  51  |     await table.getByRole('button', { name: 'Open request actions' }).first().click();
  52  |     await expect(page.locator('body > .j-action-menu__items--popup')).toBeVisible();
  53  |     await expect(page.getByRole('menuitem', { name: 'View request' })).toBeVisible();
  54  |     await page.keyboard.press('Escape');
  55  | 
  56  |     await table.getByRole('button', { name: 'Maximize table' }).click();
  57  |     const maximized = page.locator('body > .j-table.is-maximized');
  58  |     await expect(maximized).toBeVisible();
  59  |     await expect(maximized.getByRole('button', { name: 'Minimize table' })).toBeVisible();
  60  |     const viewportHeight = await page.evaluate(() => window.innerHeight);
  61  |     const maximizedBounds = await maximized.boundingBox();
  62  |     expect(Math.abs((maximizedBounds?.height ?? 0) - viewportHeight)).toBeLessThanOrEqual(2);
  63  |     await maximized.getByRole('button', { name: 'Minimize table' }).click();
  64  |     await expect(preview.locator('.j-table--enterprise')).not.toHaveClass(/is-maximized/);
  65  |     await expect(table.locator('j-paginator')).toBeVisible();
  66  |   });
  67  | 
  68  |   for (const width of [320, 375, 768, 1024]) {
  69  |     test(`contains horizontal overflow at ${width}px`, async ({ page }) => {
  70  |       await page.setViewportSize({ width, height: 900 });
  71  |       await page.goto('/docs/components#table');
  72  |       const preview = page.locator(horizontalPreview);
  73  |       await preview.scrollIntoViewIfNeeded();
  74  |       const viewport = preview.locator('.j-table__scroll');
  75  |       await expect(viewport).toBeVisible();
  76  | 
  77  |       const dimensions = await viewport.evaluate((element) => ({
  78  |         clientWidth: element.clientWidth,
  79  |         scrollWidth: element.scrollWidth,
  80  |         overflowX: getComputedStyle(element).overflowX,
  81  |       }));
  82  |       expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  83  |       expect(dimensions.overflowX).toMatch(/auto|scroll/);
  84  | 
  85  |       await viewport.evaluate((element) => {
  86  |         element.scrollLeft = 160;
  87  |       });
  88  |       expect(await viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  89  | 
  90  |       const pageOverflow = await page.evaluate(
  91  |         () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  92  |       );
  93  |       const overflowSources =
  94  |         pageOverflow > 1
  95  |           ? await page.evaluate(() =>
  96  |               Array.from(document.querySelectorAll<HTMLElement>('*'))
  97  |                 .map((element) => {
  98  |                   const rect = element.getBoundingClientRect();
  99  |                   return {
  100 |                     selector: `${element.tagName}.${element.className}`,
  101 |                     right: Math.round(rect.right),
  102 |                     width: Math.round(rect.width),
  103 |                   };
  104 |                 })
  105 |                 .filter(({ right }) => right > document.documentElement.clientWidth + 1)
  106 |                 .sort(
  107 |                   (first, second) =>
  108 |                     Math.abs(first.right - document.documentElement.scrollWidth) -
  109 |                     Math.abs(second.right - document.documentElement.scrollWidth),
  110 |                 )
  111 |                 .slice(0, 8),
  112 |             )
  113 |           : [];
  114 |       expect(pageOverflow, JSON.stringify(overflowSources)).toBeLessThanOrEqual(1);
  115 |     });
  116 |   }
  117 | 
  118 |   test('keeps frozen columns fixed while the viewport scrolls', async ({ page }) => {
  119 |     await page.setViewportSize({ width: 1024, height: 900 });
  120 |     await page.goto('/docs/components#table');
  121 |     const preview = page.locator('#component-live-preview-scrolling-frozen-columns');
  122 |     await preview.scrollIntoViewIfNeeded();
  123 |     const viewport = preview.locator('.j-table__scroll');
  124 |     const frozen = viewport.locator('thead th.j-table__cell--frozen').first();
  125 |     await expect(frozen).toBeVisible();
  126 |     const before = await frozen.boundingBox();
  127 |     await viewport.evaluate((element) => {
  128 |       element.scrollLeft = 300;
  129 |     });
  130 |     const after = await frozen.boundingBox();
  131 |     expect(Math.abs((after?.x || 0) - (before?.x || 0))).toBeLessThanOrEqual(1);
  132 |   });
  133 | 
  134 |   test('keeps logical frozen edges stable in RTL', async ({ page }) => {
  135 |     await page.setViewportSize({ width: 1024, height: 900 });
  136 |     await page.goto('/docs/components#table');
  137 |     const preview = page.locator('#component-live-preview-scrolling-frozen-columns');
  138 |     await preview.scrollIntoViewIfNeeded();
  139 |     await preview.evaluate((element) => element.setAttribute('dir', 'rtl'));
  140 |     const viewport = preview.locator('.j-table__scroll');
  141 |     const startFrozen = viewport
  142 |       .locator('thead th.j-table__cell--frozen:not(.j-table__cell--frozen-right)')
  143 |       .first();
  144 |     await expect(startFrozen).toBeVisible();
  145 |     const before = await startFrozen.boundingBox();
  146 |     await viewport.evaluate((element) => {
```
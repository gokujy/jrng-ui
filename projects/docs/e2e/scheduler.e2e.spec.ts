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

  test('enforces granular editing permissions in the live preview', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-granular-editing');
    await preview.scrollIntoViewIfNeeded();
    const planning = preview.locator('[data-event-id="planning"]').first();
    await expect(planning).toBeVisible();
    const before = await planning.evaluate((element) => (element as HTMLElement).style.top);
    await planning.focus();
    await planning.press('Alt+ArrowDown');
    await expect
      .poll(() => planning.evaluate((element) => (element as HTMLElement).style.top))
      .toBe(before);
    await expect(preview.locator('.j-scheduler-time-event__resize')).toHaveCount(0);

    await preview.getByRole('button', { name: 'Add permitted event' }).click();
    await expect(preview.getByText('Permitted new appointment', { exact: true })).toBeVisible();
    await preview.getByRole('button', { name: 'Try blocked delete' }).click();
    await expect(planning).toBeVisible();
    await expect(preview.getByRole('status')).toContainText('Delete request blocked');
  });

  test('renders the important work-week and extensible custom views', async ({ page }) => {
    await page.goto('/docs/components#scheduler');

    const workWeek = page.locator('#component-live-preview-work-week');
    await workWeek.scrollIntoViewIfNeeded();
    await expect(workWeek.locator('.j-scheduler')).toHaveAttribute('data-view', 'workWeek');
    await expect(workWeek.locator('.j-scheduler-time-grid__header button')).toHaveCount(5);

    const custom = page.locator('#component-live-preview-custom-three-day');
    await custom.scrollIntoViewIfNeeded();
    await expect(custom.locator('.j-scheduler')).toHaveAttribute('data-view', 'custom');
    await expect(custom.locator('.j-scheduler-time-grid__header button')).toHaveCount(3);

    const customTimeline = page.locator('#component-live-preview-custom-resource-timeline');
    await customTimeline.scrollIntoViewIfNeeded();
    await expect(customTimeline.locator('.j-scheduler')).toHaveAttribute('data-view', 'custom');
    await expect(customTimeline.locator('j-scheduler-timeline-renderer')).toBeAttached();
    await expect(
      customTimeline.locator('[data-resource-id="room-a"] [data-event-id="custom-window-booking"]'),
    ).toBeVisible();
  });

  test('opens the dense-month preview from the actual more trigger', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-more');
    await preview.scrollIntoViewIfNeeded();
    const trigger = preview.locator('.j-scheduler-month__more').first();
    await expect(trigger).toContainText(/\+\d+ more/);
    await trigger.evaluate((button) => {
      (button as HTMLButtonElement).focus();
      (button as HTMLButtonElement).click();
    });
    const popover = page.getByRole('dialog', { name: 'More events' });
    await expect(popover).toBeVisible();
    await expect(popover).toContainText(/events/);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('supports dialog, drawer, and inline Month overflow modes', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-overflow-modes');
    await preview.scrollIntoViewIfNeeded();

    await preview.getByRole('button', { name: 'dialog', exact: true }).click();
    await preview.locator('.j-scheduler-month__more').first().click();
    await expect(page.getByRole('dialog', { name: 'More events' })).toBeVisible();
    await page.keyboard.press('Escape');

    await preview.getByRole('button', { name: 'drawer', exact: true }).click();
    await preview.locator('.j-scheduler-month__more').first().click();
    await expect(page.getByRole('dialog', { name: 'More events' })).toBeVisible();
    await page.keyboard.press('Escape');

    await preview.getByRole('button', { name: 'expand', exact: true }).click();
    const trigger = preview.locator('.j-scheduler-month__more').first();
    const triggerLabel = await trigger.getAttribute('aria-label');
    expect(triggerLabel).not.toBeNull();
    await trigger.click();
    await expect(preview.getByRole('button', { name: triggerLabel!, exact: true })).toBeHidden();
  });

  test('accepts a controlled external-item drop in the live preview', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-external-drop');
    await preview.scrollIntoViewIfNeeded();
    await preview
      .getByRole('button', { name: 'Drop fictional work item at July 16, 10:00' })
      .click();
    await expect(preview.getByRole('status')).toContainText('1 external event proposed');
    await expect(preview.getByText('External work item', { exact: true })).toBeVisible();
  });

  test('generates native XLSX and PDF bytes from the live export preview', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-excel-pdf');
    await preview.scrollIntoViewIfNeeded();
    await preview.getByRole('button', { name: 'Generate XLSX' }).click();
    await expect(preview.getByRole('status')).toContainText(
      /XLSX workbook generated \(\d+ bytes\)/,
    );
    await preview.getByRole('button', { name: 'Generate PDF' }).click();
    await expect(preview.getByRole('status')).toContainText(/PDF generated \(\d+ bytes\)/);
  });

  test('transfers an event between Scheduler instances with a touch pointer', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-cross-scheduler');
    await preview.scrollIntoViewIfNeeded();
    const source = preview.locator('.j-scheduler[aria-label="Operations schedule"]');
    const destination = preview.locator(
      '.j-scheduler[aria-label="Destination operations schedule"]',
    );
    const sourceEvent = source.locator('[data-event-id="review"] .j-scheduler-time-event__content');
    const targetSlot = destination.locator('[data-j-time="10:00"]').first();
    await targetSlot.scrollIntoViewIfNeeded();
    await expect(targetSlot).toBeVisible();
    const sourceBox = await sourceEvent.boundingBox();
    const targetBox = await targetSlot.boundingBox();
    expect(sourceBox).not.toBeNull();
    expect(targetBox).not.toBeNull();
    const destinationPoint = {
      clientX: targetBox!.x + targetBox!.width / 2,
      clientY: targetBox!.y + targetBox!.height / 2,
    };
    await expect
      .poll(() =>
        page.evaluate(({ clientX, clientY }) => {
          const hit = document.elementFromPoint(clientX, clientY);
          return {
            scheduler: hit?.closest('.j-scheduler')?.getAttribute('aria-label') ?? null,
            tag: hit?.tagName ?? null,
            className: hit instanceof HTMLElement ? hit.className : null,
          };
        }, destinationPoint),
      )
      .toEqual({
        scheduler: 'Destination operations schedule',
        tag: 'BUTTON',
        className: 'j-scheduler-time-grid__slot j-scheduler-time-grid__slot--hour',
      });
    await sourceEvent.evaluate(
      async (event, points) => {
        const base: PointerEventInit = {
          bubbles: true,
          button: 0,
          buttons: 1,
          isPrimary: true,
          pointerId: 41,
          pointerType: 'touch',
        };
        event.dispatchEvent(new PointerEvent('pointerdown', { ...base, ...points.start }));
        await new Promise((resolve) => setTimeout(resolve, 400));
        event.dispatchEvent(new PointerEvent('pointermove', { ...base, ...points.end }));
        event.dispatchEvent(new PointerEvent('pointerup', { ...base, ...points.end, buttons: 0 }));
      },
      {
        start: {
          clientX: sourceBox!.x + sourceBox!.width / 2,
          clientY: sourceBox!.y + sourceBox!.height / 2,
        },
        end: destinationPoint,
      },
    );

    await expect(source.locator('.j-scheduler__live')).toContainText('transfer requested');
    await expect(destination.locator('[data-event-id="review"]')).toBeVisible();
    await expect(source.locator('[data-event-id="review"]')).toBeAttached();
  });

  test('creates an event with the optional built-in reactive editor', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-dialog-edit');
    await preview.scrollIntoViewIfNeeded();
    await preview.getByRole('button', { name: 'Create event' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add event' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Title').fill('Fictional onboarding session');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(preview.getByText('Fictional onboarding session', { exact: true })).toBeVisible();
  });

  test('renders simultaneous resource lanes and parent timeline aggregates', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const week = page.locator('#component-live-preview-resource-week');
    await week.scrollIntoViewIfNeeded();
    await expect(week.locator('.j-scheduler-time-grid__day[data-resource-id]')).toHaveCount(14);

    const hierarchy = page.locator('#component-live-preview-hierarchical-resources');
    await hierarchy.scrollIntoViewIfNeeded();
    await expect(hierarchy.locator('[data-aggregate="true"]')).toHaveCount(1);
  });

  test('publishes all documented Scheduler scenarios as independent preview containers', async ({
    page,
  }) => {
    await page.goto('/docs/components#scheduler');
    const previews = page.locator('.j-feature-example');
    await expect(previews).toHaveCount(87);
    await expect(page.locator('#component-preview-month-agenda')).toBeAttached();
    await expect(page.locator('#component-preview-multi-month-stack')).toBeAttached();
    await expect(page.locator('#component-preview-recurrence-exceptions')).toBeAttached();
    await expect(page.locator('#component-preview-multiple-resources')).toBeAttached();
    await expect(page.locator('#component-preview-dark')).toBeAttached();
    await expect(page.locator('#component-preview-resource-template')).toBeAttached();
    await expect(page.locator('#component-preview-resource-dimensions')).toBeAttached();
    await expect(page.locator('#component-preview-resource-reorder')).toBeAttached();
    await expect(page.locator('#component-preview-resource-aggregate-columns')).toBeAttached();
    await expect(page.locator('#component-preview-resource-timeline-interactions')).toBeAttached();
    await expect(page.locator('#component-preview-custom-resource-timeline')).toBeAttached();
    await expect(page.locator('#component-preview-move-dialog')).toBeAttached();
    await expect(page.locator('#component-preview-timeline-interactions')).toBeAttached();
    await expect(page.locator('#component-preview-async-validation')).toBeAttached();
  });

  test('moves timeline events through the keyboard proposal path', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-timeline-interactions');
    await preview.scrollIntoViewIfNeeded();
    const event = preview.locator('[data-event-id="review"]').first();
    await expect(event).toBeVisible();
    const before = await event.evaluate((element) =>
      Number.parseFloat((element as HTMLElement).style.insetInlineStart),
    );
    await event.focus();
    await event.press('Alt+ArrowRight');
    await expect
      .poll(() =>
        event.evaluate((element) =>
          Number.parseFloat((element as HTMLElement).style.insetInlineStart),
        ),
      )
      .toBeGreaterThan(before);
  });

  test('moves events between resource timeline lanes with the keyboard', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-resource-timeline-interactions');
    await preview.scrollIntoViewIfNeeded();
    const event = preview
      .locator('[data-resource-id="room-a"] [data-event-id="lane-booking"]')
      .first();
    await expect(event).toBeVisible();
    await event.focus();
    await event.press('Alt+ArrowDown');
    await expect(preview.getByRole('status')).toHaveText('Moved to field-team');
    await expect
      .poll(() =>
        preview
          .locator('[data-event-id="lane-booking"]')
          .evaluateAll((events) => events.map((event) => event.getAttribute('data-resource-id'))),
      )
      .toEqual(['field-team']);
  });

  test('offers an accessible non-drag move workflow', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-move-dialog');
    await preview.scrollIntoViewIfNeeded();
    await preview
      .locator('[data-event-id="planning"]')
      .first()
      .evaluate((button) => (button as HTMLButtonElement).click());
    const quickInfo = page.getByRole('dialog', { name: 'Event quick information' });
    await quickInfo.getByRole('button', { name: 'Move', exact: true }).click();
    const moveDialog = page.getByRole('dialog', { name: 'Move events' });
    await expect(moveDialog).toBeVisible();
    await expect(moveDialog.getByLabel('Target date')).toBeVisible();
    await expect(moveDialog.getByLabel('Target time')).toBeVisible();
    await moveDialog.getByRole('button', { name: 'Move events', exact: true }).click();
    await expect(moveDialog).toBeHidden();
  });

  test('renders opt-in parent aggregate columns beside resource leaves', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-resource-aggregate-columns');
    await preview.scrollIntoViewIfNeeded();
    await expect(preview.locator('.j-scheduler-time-grid__day')).toHaveCount(21);
    await expect(preview.locator('.j-scheduler-time-grid__day[data-aggregate="true"]')).toHaveCount(
      7,
    );
  });

  test('requests resource reordering with a keyboard alternative', async ({ page }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-resource-reorder');
    await preview.scrollIntoViewIfNeeded();
    const fieldTeam = preview.getByRole('button', { name: 'Field team', exact: true });
    await fieldTeam.focus();
    await fieldTeam.press('Alt+ArrowUp');
    await expect(preview.getByRole('status')).toContainText('Move Field team before');
  });

  test('renders independent resource-dimension combinations without duplicating events', async ({
    page,
  }) => {
    await page.goto('/docs/components#scheduler');
    const preview = page.locator('#component-live-preview-resource-dimensions');
    await preview.scrollIntoViewIfNeeded();
    await expect(preview.locator('.j-scheduler-time-grid__day')).toHaveCount(28);
    await expect(preview.locator('[data-event-id="dimension-booking"]')).toHaveCount(1);
    await expect(preview.locator('[data-event-id="dimension-briefing"]')).toHaveCount(1);
  });

  test('keeps custom event and resource templates inside Scheduler-owned controls', async ({
    page,
  }) => {
    await page.goto('/docs/components#scheduler');
    const eventPreview = page.locator('#component-live-preview-event-template');
    await eventPreview.scrollIntoViewIfNeeded();
    const eventContent = eventPreview.locator('.j-scheduler-doc-event-template').first();
    await expect(eventContent).toBeVisible();
    await expect(eventContent.locator('xpath=ancestor::button[1]')).toHaveClass(
      /j-scheduler-month-event/,
    );

    const resourcePreview = page.locator('#component-live-preview-resource-template');
    await resourcePreview.scrollIntoViewIfNeeded();
    const resourceContent = resourcePreview.locator('.j-scheduler-doc-resource-template').first();
    await expect(resourceContent).toBeVisible();
    await expect(resourceContent.locator('xpath=ancestor::button[1]')).toHaveClass(
      /j-scheduler-timeline__resource-name/,
    );
  });

  test('runs controlled selection, adapter, toolbar, availability, and appointment previews', async ({
    page,
  }) => {
    await page.goto('/docs/components#scheduler');

    const range = page.locator('#component-live-preview-range-selection');
    await range.scrollIntoViewIfNeeded();
    await range
      .locator('[data-date="2026-07-14"] .j-scheduler-month__date')
      .evaluate((button) => (button as HTMLButtonElement).click());
    await range
      .locator('[data-date="2026-07-17"] .j-scheduler-month__date')
      .evaluate((button) =>
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true })),
      );
    await expect(range.locator('.j-scheduler-month__cell[data-selected="true"]')).toHaveCount(4);

    const adapter = page.locator('#component-live-preview-event-adapter');
    await adapter.scrollIntoViewIfNeeded();
    await expect(adapter.getByText('Backend model briefing', { exact: true })).toBeVisible();

    const toolbar = page.locator('#component-live-preview-toolbar');
    await toolbar.scrollIntoViewIfNeeded();
    await expect(toolbar.locator('[data-j-slot="footer-toolbar"]')).toBeVisible();
    await toolbar
      .getByRole('button', { name: 'Create shift' })
      .evaluate((button) => (button as HTMLButtonElement).click());
    await expect(toolbar.getByRole('status').first()).toContainText('Custom Create shift');

    const appointments = page.locator('#component-live-preview-appointments');
    await appointments.scrollIntoViewIfNeeded();
    await appointments
      .getByRole('button', { name: 'lane', exact: true })
      .evaluate((button) => (button as HTMLButtonElement).click());
    await expect(appointments.locator('[data-j-slot="appointment-lane"]')).toBeVisible();

    const businessHours = page.locator('#component-live-preview-business-hours');
    await businessHours.scrollIntoViewIfNeeded();
    await expect(businessHours.locator('[data-j-slot="business-hours"]').first()).toBeVisible();
    await expect(businessHours.locator('[data-j-slot="availability"]').first()).toBeVisible();
  });
});

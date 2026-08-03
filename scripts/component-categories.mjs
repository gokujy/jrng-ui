export const COMPONENT_CATEGORIES = [
  {
    name: 'Form',
    selectors: [
      'j-autocomplete',
      'j-checkbox',
      'j-cascader',
      'j-chips',
      'j-color-picker',
      'j-cron-expression',
      'j-date-picker',
      'j-editor',
      'j-form-field',
      'j-icon-field',
      'j-input',
      'j-input-group',
      'j-input-mask',
      'j-input-number',
      'j-input-otp',
      'j-knob',
      'j-label',
      'j-listbox',
      'j-multiselect',
      'j-password',
      'j-query-builder',
      'j-radio',
      'j-radio-group',
      'j-rating',
      'j-select',
      'j-select-button',
      'j-signature',
      'j-slider',
      'j-switch',
      'j-textarea',
      'j-time-picker',
      'j-toggle-button',
      'j-tree-select',
    ],
  },
  {
    name: 'Button',
    selectors: [
      'j-button',
      'j-copy-button',
      'j-speed-dial',
      'j-speech-to-text-button',
      'j-split-button',
    ],
  },
  {
    name: 'Data',
    selectors: [
      'j-calendar-scheduler',
      'j-scheduler',
      'j-column-filter',
      'j-data-display',
      'j-data-view',
      'j-filter-bar',
      'j-gantt',
      'j-kanban',
      'j-order-list',
      'j-org-chart',
      'j-paginator',
      'j-table',
      'j-timeline',
      'j-transfer-list',
      'j-tree',
      'j-tree-table',
      'j-virtual-scroller',
    ],
  },
  {
    name: 'Panel',
    selectors: [
      'j-accordion',
      'j-accordion-content',
      'j-accordion-header',
      'j-accordion-panel',
      'j-card',
      'j-divider',
      'j-fieldset',
      'j-inplace',
      'j-panel',
      'j-splitter',
      'j-splitter-panel',
      'j-stepper',
      'j-tab',
      'j-tabs',
      'j-text-expand',
      'j-toolbar',
    ],
  },
  {
    name: 'Overlay',
    selectors: [
      'j-bottom-sheet',
      'j-confirm-dialog',
      'j-confirm-popup',
      'j-dialog',
      'j-drawer',
      'j-dynamic-dialog',
      'j-notification-center',
      'j-popover',
      'j-popout',
    ],
  },
  {
    name: 'Menu',
    selectors: [
      'j-action-menu',
      'j-anchor',
      'j-breadcrumb',
      'j-command-palette',
      'j-context-menu',
      'j-mega-menu',
      'j-menu',
      'j-menubar',
      'j-sidebar-nav',
      'j-tiered-menu',
    ],
  },
  { name: 'Messages', selectors: ['j-toast', 'j-validation-message'] },
  {
    name: 'Media',
    selectors: [
      'j-barcode',
      'j-carousel',
      'j-gallery',
      'j-html-preview',
      'j-image',
      'j-video-player',
    ],
  },
  {
    name: 'File',
    selectors: ['j-file-browser', 'j-file-preview', 'j-file-upload'],
  },
  { name: 'Chart', selectors: ['j-chart', 'j-sparkline'] },
  {
    name: 'Layout',
    selectors: [
      'j-app-shell',
      'j-container',
      'j-grid',
      'j-col',
      'j-grid-layout',
      'j-row',
      'j-section-footer',
      'j-section-header',
    ],
  },
  {
    name: 'Misc',
    selectors: [
      'j-avatar',
      'j-badge',
      'j-chip',
      'j-empty',
      'j-icon',
      'j-loader',
      'j-meter-group',
      'j-progress-bar',
      'j-progress-spinner',
      'j-pull-to-refresh',
      'j-skeleton',
      'j-swipe-actions',
      'j-tag',
      'j-watermark',
    ],
  },
  {
    name: 'Utilities',
    selectors: ['j-diff-viewer', 'j-highlight', 'j-tour-guide'],
  },
  { name: 'Pages', selectors: ['j-error-page', 'j-maintenance-page'] },
];

/**
 * Stability is an explicit release decision, never an inference from generated
 * documentation or test metadata. Add selectors only after the full stability
 * review has been completed and recorded.
 */
export const STABLE_COMPONENT_SELECTORS = new Set(['j-copy-button', 'j-skeleton', 'j-tour-guide']);

export const COMPONENT_CATEGORY_ORDER = Object.freeze([
  'Form',
  'Button',
  'Data',
  'Panel',
  'Overlay',
  'Menu',
  'Messages',
  'Media',
  'File',
  'Chart',
  'Layout',
  'Misc',
  'Utilities',
  'Pages',
]);
export const COMPONENT_CATEGORY_COUNTS = Object.freeze({
  Form: 33,
  Button: 5,
  Data: 17,
  Panel: 16,
  Overlay: 9,
  Menu: 10,
  Messages: 2,
  Media: 6,
  File: 3,
  Chart: 2,
  Layout: 8,
  Misc: 14,
  Utilities: 3,
  Pages: 2,
});
export const ACTIVE_COMPONENT_TOTAL = 130;
export const COMPONENT_CATEGORY_TOTAL = 14;
export const REMOVED_COMPONENT_SELECTORS = new Set([
  'j-activity-feed',
  'j-approval-flow',
  'j-audit-log',
  'j-navigation-progress',
  'j-data-grid',
  'j-calendar',
  'j-avatar-group',
  'j-page-header',
  'j-responsive-sidebar',
  'j-status-chip',
  'j-topbar',
]);

export const COMPONENT_CATEGORY_BY_SELECTOR = new Map(
  COMPONENT_CATEGORIES.flatMap(({ name, selectors }) =>
    selectors.map((selector) => [selector, name]),
  ),
);
export const COMPONENT_ORDER_BY_SELECTOR = new Map(
  COMPONENT_CATEGORIES.flatMap(({ selectors }) => selectors).map((selector, index) => [
    selector,
    index,
  ]),
);

export function validateComponentCategories(components) {
  const failures = [];
  const definitionSelectors = new Set();
  const definitionOrder = COMPONENT_CATEGORIES.map(({ name }) => name);

  if (definitionOrder.join('|') !== COMPONENT_CATEGORY_ORDER.join('|')) {
    failures.push(
      `Category definition order must be ${COMPONENT_CATEGORY_ORDER.join(', ')}; found ${definitionOrder.join(', ')}.`,
    );
  }

  for (const { name, selectors } of COMPONENT_CATEGORIES) {
    for (const selector of selectors) {
      if (definitionSelectors.has(selector)) {
        failures.push(`${selector} appears more than once in the category definition.`);
      }
      definitionSelectors.add(selector);
      if (REMOVED_COMPONENT_SELECTORS.has(selector)) {
        failures.push(`${selector} is removed and must not appear in a category.`);
      }
    }
    const expected = COMPONENT_CATEGORY_COUNTS[name];
    if (selectors.length !== expected) {
      failures.push(`${name} must contain ${expected} components, found ${selectors.length}.`);
    }
  }

  if (COMPONENT_CATEGORIES.length !== COMPONENT_CATEGORY_TOTAL) {
    failures.push(
      `Category definition must contain ${COMPONENT_CATEGORY_TOTAL} categories, found ${COMPONENT_CATEGORIES.length}.`,
    );
  }
  if (definitionSelectors.size !== ACTIVE_COMPONENT_TOTAL) {
    failures.push(
      `Category definition must contain ${ACTIVE_COMPONENT_TOTAL} components, found ${definitionSelectors.size}.`,
    );
  }

  const seen = new Set();
  for (const component of components) {
    const selector = component?.selector;
    if (!selector) {
      failures.push('An active component is missing its selector.');
      continue;
    }
    if (seen.has(selector)) {
      failures.push(`${selector} appears more than once in the active component inventory.`);
    }
    seen.add(selector);
    if (REMOVED_COMPONENT_SELECTORS.has(selector)) {
      failures.push(
        `${selector} is removed and must not appear in the active component inventory.`,
      );
    }
    const expectedCategory = COMPONENT_CATEGORY_BY_SELECTOR.get(selector);
    if (!expectedCategory) {
      failures.push(`${selector} has no category.`);
    } else if (component.category && component.category !== expectedCategory) {
      failures.push(
        `${selector} uses category ${component.category}; expected ${expectedCategory}.`,
      );
    }
  }

  if (components.length !== ACTIVE_COMPONENT_TOTAL) {
    failures.push(
      `Active component inventory must contain ${ACTIVE_COMPONENT_TOTAL} components, found ${components.length}.`,
    );
  }
  for (const selector of definitionSelectors) {
    if (!seen.has(selector)) {
      failures.push(`Active component inventory is missing ${selector}.`);
    }
  }

  return failures;
}

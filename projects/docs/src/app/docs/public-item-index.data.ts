import { componentDocs } from './component-docs.data';

export const documentationStatuses = [
  'Complete',
  'Basic',
  'Planned',
  'Experimental',
  'Deprecated',
] as const;

export type DocumentationStatus = (typeof documentationStatuses)[number];

export const publicItemCategories = [
  'Form',
  'Buttons and Actions',
  'Data',
  'Overlay',
  'Navigation and Menu',
  'Layout',
  'Panels and Containers',
  'Feedback and Messages',
  'Media and File',
  'Charts and Visualization',
  'Business and Admin',
  'Utilities and Directives',
  'Core and Theming',
] as const;

export type PublicItemCategory = (typeof publicItemCategories)[number];

export interface PublicItemIndexRecord {
  readonly name: string;
  readonly identifier: string;
  readonly description: string;
  readonly category: PublicItemCategory;
  readonly importPath: string;
  readonly documentationRoute: string;
  readonly documentationStatus: DocumentationStatus;
  readonly kind: 'Component' | 'Directive' | 'Pipe' | 'Service';
  readonly useCases: readonly string[];
}

const completeComponentSlugs = new Set([
  'button',
  'input',
  'select',
  'multiselect',
  'date-picker',
  'dialog',
  'confirm-dialog',
  'table',
  'data-grid',
  'file-upload',
  'chart',
  'menu',
  'responsive-sidebar',
  'tabs',
  'toast',
  'tooltip',
  'filter-bar',
  'status-chip',
  'metric-card',
  'page-header',
  'tour-guide',
]);

const categoryMap: Readonly<Record<string, PublicItemCategory>> = {
  'Buttons & Actions': 'Buttons and Actions',
  'Data & Tables': 'Data',
  'Data Display': 'Panels and Containers',
  'Forms & Inputs': 'Form',
  Layout: 'Layout',
  'Media & Visualization': 'Media and File',
  'Navigation & Menus': 'Navigation and Menu',
  'Overlays & Feedback': 'Overlay',
  'Scheduling & Productivity': 'Business and Admin',
  'Status Pages': 'Feedback and Messages',
};

const componentRecords: readonly PublicItemIndexRecord[] = componentDocs.map((doc) => ({
  name: doc.name,
  identifier: doc.selector,
  description: doc.description,
  category: categoryMap[doc.category] ?? 'Business and Admin',
  importPath: doc.importPath,
  documentationRoute: `/docs/components#${doc.slug}`,
  documentationStatus: completeComponentSlugs.has(doc.slug) ? 'Complete' : 'Basic',
  kind: 'Component',
  useCases: [doc.whenToUse, ...doc.usage],
}));

const utilityRecords: readonly PublicItemIndexRecord[] = [
  directive(
    'Auto Focus',
    'JAutoFocusDirective',
    'jrng-ui/core',
    'Moves focus to a rendered target.',
  ),
  directive(
    'Click Outside',
    'JClickOutsideDirective',
    'jrng-ui/core',
    'Detects pointer interaction outside a host.',
  ),
  directive(
    'Copy to Clipboard',
    'JCopyToClipboardDirective',
    'jrng-ui/core',
    'Copies configured text from an interaction.',
  ),
  directive(
    'Focus Trap',
    'JFocusTrapDirective',
    'jrng-ui/core',
    'Contains keyboard focus inside an overlay.',
  ),
  directive(
    'Hotkey',
    'JHotkeyDirective',
    'jrng-ui/core',
    'Runs an action for a documented keyboard shortcut.',
  ),
  directive(
    'Intersection Observer',
    'JIntersectionObserverDirective',
    'jrng-ui/core',
    'Reports element intersection without direct browser setup.',
  ),
  directive(
    'Resize Observer',
    'JResizeObserverDirective',
    'jrng-ui/core',
    'Reports element size changes.',
  ),
  directive('Ripple', 'JRippleDirective', 'jrng-ui', 'Adds reduced-motion-aware pointer feedback.'),
  directive(
    'Key Filter',
    'JKeyFilterDirective',
    'jrng-ui/key-filter',
    'Filters text input by a configured key pattern.',
  ),
  directive(
    'Table Cell Template',
    'JTableCellTemplateDirective',
    'jrng-ui/table',
    'Provides a custom data-table cell template.',
  ),
  directive(
    'Table Header Template',
    'JTableHeaderTemplateDirective',
    'jrng-ui/table',
    'Provides a custom data-table header template.',
  ),
  directive(
    'Tooltip',
    'JTooltipDirective',
    'jrng-ui/tooltip',
    'Adds accessible contextual help on hover and focus.',
    'Complete',
  ),
  directive(
    'Tour Step',
    'JTourStepDirective',
    'jrng-ui/tour',
    'Registers a stable target for a guided tour.',
    'Complete',
  ),
  pipe('Date Format', 'JDateFormatPipe', 'Formats a value using locale-aware date options.'),
  pipe('Time Format', 'JTimeFormatPipe', 'Formats a value using locale-aware time options.'),
  pipe('Date Time Format', 'JDateTimeFormatPipe', 'Formats combined date and time values.'),
  pipe('Currency Format', 'JCurrencyFormatPipe', 'Formats numeric currency values.'),
  pipe('Number Format', 'JNumberFormatPipe', 'Formats locale-aware numbers.'),
  pipe('Percent Format', 'JPercentFormatPipe', 'Formats numeric percentages.'),
  pipe('File Size Format', 'JFileSizeFormatPipe', 'Formats byte counts as readable file sizes.'),
  pipe('Text Truncate', 'JTextTruncatePipe', 'Truncates text with a configurable limit.'),
  service(
    'Body Scroll Lock',
    'JBodyScrollLockService',
    'jrng-ui/core',
    'Coordinates nested overlay scroll locking.',
  ),
  service(
    'Clipboard',
    'JClipboardService',
    'jrng-ui/core',
    'Provides SSR-safe clipboard operations.',
  ),
  service(
    'Keyboard Shortcuts',
    'JKeyboardShortcutsService',
    'jrng-ui/core',
    'Registers and removes application keyboard shortcuts.',
  ),
  service(
    'Live Announcer',
    'JLiveAnnouncerService',
    'jrng-ui/core',
    'Announces asynchronous updates to assistive technology.',
  ),
  service(
    'Media Query',
    'JMediaQueryService',
    'jrng-ui/core',
    'Observes responsive media queries safely.',
  ),
  service(
    'Overlay',
    'JOverlayService',
    'jrng-ui/core',
    'Coordinates connected overlay positioning and lifecycle.',
  ),
  service(
    'Storage',
    'JStorageService',
    'jrng-ui/core',
    'Provides guarded and version-aware browser storage.',
  ),
  service(
    'Z-index Manager',
    'JZIndexManagerService',
    'jrng-ui/core',
    'Allocates predictable overlay stacking values.',
  ),
  service(
    'Confirmation',
    'JConfirmationService',
    'jrng-ui/confirm-dialog',
    'Opens accessible application confirmations.',
    'Complete',
  ),
  service(
    'Dialog',
    'JrDialogService',
    'jrng-ui/dialog',
    'Opens dynamic dialogs through a typed service.',
    'Complete',
  ),
  service(
    'Theme',
    'JThemeService',
    'jrng-ui/theming',
    'Controls light, dark, and system theme modes.',
    'Complete',
  ),
  service(
    'Icon Registry',
    'JIconRegistry',
    'jrng-ui/icon',
    'Registers application icons and resolves icon path data.',
    'Complete',
  ),
  service(
    'Toast',
    'JrToastService',
    'jrng-ui/toast',
    'Publishes accessible toast messages.',
    'Complete',
  ),
  service(
    'Tour',
    'JTourService',
    'jrng-ui/tour',
    'Runs accessible guided product tours.',
    'Complete',
  ),
];

export const publicItemIndex: readonly PublicItemIndexRecord[] = [
  ...componentRecords,
  ...utilityRecords,
].sort((left, right) => left.name.localeCompare(right.name));

function directive(
  name: string,
  identifier: string,
  importPath: string,
  description: string,
  status: DocumentationStatus = 'Basic',
): PublicItemIndexRecord {
  return item(
    name,
    identifier,
    importPath,
    description,
    'Utilities and Directives',
    'Directive',
    status,
  );
}

function pipe(name: string, identifier: string, description: string): PublicItemIndexRecord {
  return item(
    name,
    identifier,
    'jrng-ui/formatting',
    description,
    'Utilities and Directives',
    'Pipe',
    'Basic',
  );
}

function service(
  name: string,
  identifier: string,
  importPath: string,
  description: string,
  status: DocumentationStatus = 'Basic',
): PublicItemIndexRecord {
  return item(name, identifier, importPath, description, 'Core and Theming', 'Service', status);
}

function item(
  name: string,
  identifier: string,
  importPath: string,
  description: string,
  category: PublicItemCategory,
  kind: PublicItemIndexRecord['kind'],
  documentationStatus: DocumentationStatus,
): PublicItemIndexRecord {
  return {
    name,
    identifier,
    description,
    category,
    importPath,
    documentationRoute: '/docs/components',
    documentationStatus,
    kind,
    useCases: [description],
  };
}

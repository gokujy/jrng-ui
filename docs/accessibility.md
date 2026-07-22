# Accessibility and Responsive Behavior

JRNG UI components are built as standalone Angular components using native HTML controls where practical. The library uses `j-*` selectors and `.j-*` classes.

## Accessibility Baseline

Current component conventions:

- Interactive controls use native `button`, `input`, `select`, `textarea`, or ARIA roles where native elements are not enough.
- Focus states use `--j-focus-ring` and `:focus-visible` / `:focus-within`.
- Disabled controls block interaction and expose native disabled state where possible.
- Form controls expose invalid/error state through `aria-invalid` and `aria-describedby`.
- Overlay components support Escape close where practical.
- Components use `OnPush` and avoid hidden keyboard traps except intentional modal focus traps.

## Keyboard Support

Critical keyboard flows covered by automated tests:

- `j-button` does not emit while disabled or loading.
- `j-select` opens with keyboard, filters options, selects with Enter, closes with Escape, and restores trigger focus.
- `j-dialog` closes with Escape, labels its title with `aria-labelledby`, moves focus into the dialog, and restores prior focus after close.
- `j-table` exposes sortable header state and paginates through keyboard-accessible buttons.
- `j-input` works with Reactive Forms and associates error text through `aria-describedby`.

Component-specific keyboard behavior:

- `j-tabs`: ArrowLeft, ArrowRight, Home, and End move between enabled tabs.
- `j-select`: ArrowUp/ArrowDown move active option, Enter selects, Escape closes, Tab closes.
- `j-dialog`: Escape closes when `closeOnEscape` is enabled; modal content uses focus trap.
- `j-drawer`: Escape closes when `closeOnEscape` is enabled.
- `j-image` preview: Escape closes the internal viewer.
- `j-menu`: ArrowUp/ArrowDown navigate and Enter/Space activate items.
- `j-rating`, `j-radio-group`, and `j-slider`: keyboard interaction is implemented for common form use.

## Forms

Form components that own values implement ControlValueAccessor and support Reactive Forms:

- `j-input`
- `j-textarea`
- `j-password`
- `j-input-number`
- `j-input-mask`
- `j-select`
- `j-multiselect`
- `j-autocomplete`
- `j-listbox`
- `j-chips`
- `j-checkbox`
- `j-radio-group`
- `j-switch`
- `j-rating`
- `j-slider`
- `j-date-picker`
- `j-time-picker`
- `j-date-picker` range mode
- `j-color-picker`
- `j-editor` labelled multiline rich-text textbox and keyboard-focusable toolbar

Use labels, hints, and errors whenever possible:

```html
<j-input
  label="Email"
  hint="Use your work address"
  error="Provide a contact email"
  [formControl]="email"
/>
```

## Overlays

Dialog behavior:

- `j-dialog` uses `role="dialog"`.
- Header text is connected with `aria-labelledby`.
- Modal dialogs set `aria-modal="true"`.
- Focus moves into the dialog when opened.
- Focus returns to the previously focused element when closed.
- Escape close is controlled by `closeOnEscape`.
- Body scroll is locked for modal dialogs.

Drawer, image preview, select, menu, autocomplete, and multiselect support Escape close for their main overlay behavior.

## Responsive Behavior

Current responsive coverage:

- `j-table` has a responsive stacked layout for small screens.
- `j-dialog` constrains height on mobile and supports full-screen mode with `size="full"`.
- `j-select` and dropdown panels constrain height and scroll content.
- `j-toast` supports corner and center positions.
- Layout components such as toolbar, paginator, stepper, and breadcrumbs wrap where practical.

Use full-screen dialog mode for complex mobile workflows:

```html
<j-dialog size="full" [(visible)]="open" header="Edit record"> ... </j-dialog>
```

## RTL Support

JRNG UI now prefers logical CSS properties in core interactive surfaces where practical:

- `padding-inline-*`
- `margin-inline-*`
- `inset-inline-*`
- `text-align: start/end`

This improves support for right-to-left layouts without duplicating CSS. Some explicitly physical features remain intentionally physical, such as toast position names (`top-right`, `top-left`) and drawer position names (`left`, `right`).

## Screen Reader Guidance

Use explicit labels when visible text is not enough:

```html
<j-button icon="+" ariaLabel="Create record" />
<j-copy-button text="REC-2026-001" ariaLabel="Copy record number" />
<j-avatar-group [items]="users" ariaLabel="Team members" />
```

For images:

```html
<j-image src="/document.png" alt="Uploaded document preview" preview />
```

Decorative icons and spinners are marked with `aria-hidden` where used internally.

## Known Follow-Up Items

- Add deeper automated keyboard coverage for `j-multiselect`, `j-autocomplete`, `j-menu`, `j-tabs`, and date picker panels.
- Add axe-style automated accessibility checks once an accessibility test dependency is approved.
- Add richer RTL visual verification in the docs/showcase app.
- Add full focus restoration to every non-modal overlay that opens from a trigger.
- Add advanced table accessibility for virtual scroll, row grouping, and column reordering when those features are implemented.

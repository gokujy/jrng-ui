# Accessibility Utilities

jrng-ui is a generic, premium Angular UI component library. Its accessibility foundation is intentionally framework-independent and uses original JRNG-owned component structure, attributes, and styling.

## Internal Part And State Attributes

Major components expose stable internal attributes for styling, testing, and pass-through targeting:

- `data-jc-name`: component name, such as `button`, `input`, `select`, `dialog`, `toast`, `table`, `menu`, or `tabs`.
- `data-jc-section`: internal part name, such as `root`, `trigger`, `panel`, `option`, `header`, `body`, `row`, or `cell`.
- `data-jc-extend`: extension points available in the component.
- `data-j-selected`: selected item or tab state.
- `data-j-focused`: focused or roving-focus state.
- `data-j-disabled`: disabled state.
- `data-j-active`: active item, row, tab, or control state.
- `data-j-invalid`: invalid form-control state.
- `data-j-loading`: loading state.
- `data-j-open`: open overlay, popup, dialog, or panel state.

State attributes are emitted when the state is active. Consumers should prefer these attributes or `.j-*` classes over generic selectors.

## Hidden Accessibility Utilities

Use `.j-hidden-accessible` for screen-reader-only content that should remain hidden visually.

Use `.j-hidden-focusable` for visually hidden content that should become visible when it receives focus, such as skip links.

```html
<a class="j-hidden-focusable" href="#content">Skip to content</a>
```

## Keyboard Constants

`J_KEY` provides named constants for keyboard interactions:

- `Enter`
- `Space`
- `Escape`
- `ArrowUp`
- `ArrowDown`
- `ArrowLeft`
- `ArrowRight`
- `Home`
- `End`
- `PageUp`
- `PageDown`
- `Tab`

Lowercase aliases are kept for compatibility with existing code.

## Focus Helpers

The focus utilities are exported from `jrng-ui`:

- `jFocusableElements(root)`: returns enabled focusable elements inside a root.
- `jFocusFirst(root)`: focuses the first enabled focusable element.
- `jFocusInitial(root)`: focuses `[autofocus]`, `[data-j-initial-focus]`, `[jAutoFocus]`, or the first focusable element.
- `jRememberFocus(documentRef)` / `jRestoreFocus(documentRef)`: captures the active element and returns a restore callback.
- `jTrapFocus(event, root, documentRef)`: keeps Tab focus inside a root element.
- `jApplyRovingTabIndex(items, activeIndex)`: applies roving `tabindex` values.
- `jMoveRovingTabIndex(currentIndex, itemCount, key, options)`: calculates the next roving index for arrow, Home, and End keys.
- `jCreateTypeahead(timeoutMs)`: creates a buffered typeahead controller for list, menu, and select patterns.

## Overlay Helpers

Overlay utilities are SSR-safe and require an injected `Document` reference:

- `JZIndexManagerService`: allocates increasing z-index values.
- `JBodyScrollLockService`: reference-counted body scroll locking.
- `jListenOutsideClick(documentRef, root, handler)`: listens for pointer events outside a root and returns a cleanup callback.
- `jListenOverlayEscape(documentRef, handler)`: listens for Escape and returns a cleanup callback.
- `jListenEscapeKey(documentRef, handler)`: Escape-specific document listener.
- `jIsBrowserDocument(documentRef)`, `jGetDefaultView(documentRef)`, and `jIsNode(value, documentRef)`: SSR-safe DOM guards.

Always register cleanup with `DestroyRef.onDestroy()` when attaching listeners from a component or directive.

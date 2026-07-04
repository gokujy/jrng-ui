# JRNG UI Angular Modernization Rules

JRNG UI uses modern Angular APIs where they improve consistency, SSR safety, and long-term maintainability without breaking stable public component APIs.

## Control Flow

Library templates must use Angular built-in control flow:

- Use `@if`, `@else`, `@for`, `@empty`, `@switch`, `@case`, and `@default`.
- Do not add `*ngIf`, `*ngFor`, `ngSwitch`, `ngSwitchCase`, or `ngSwitchDefault`.
- Every `@for` loop must include a track expression. Prefer stable identities such as `item.id`, `item.value`, or `item.key`; use `track item` for primitive lists; use `track $index` only when no stable identity exists.

## Signal APIs

New components should prefer:

- `input()` for simple inputs.
- `output()` for outputs instead of `EventEmitter`.
- `model()` for intentionally two-way state such as `visible` or `value`.
- `signal()` for mutable internal UI state.
- `computed()` for derived classes, labels, filtered options, and similar values.
- `inject()` instead of constructor injection where practical.

Existing components can be updated gradually when the change is low risk and does not break public APIs.

## Forms

Form controls must keep `ControlValueAccessor` compatibility for Reactive Forms. Modern Angular state APIs can be used internally, but `writeValue`, `registerOnChange`, `registerOnTouched`, and `setDisabledState` must remain correct.

## SSR Safety

Components and directives must not directly access browser globals such as `window`, `document`, `navigator`, `localStorage`, or `sessionStorage`.

Use safe Angular patterns:

- Inject `DOCUMENT` when document access is required.
- Use `isPlatformBrowser()` before browser-only DOM work.
- Use `ElementRef` only where direct host measurement or focus management is necessary.
- Use `Renderer2` for global listeners or DOM listener registration.
- Avoid default parameters or helper functions that reference global browser objects.

## Zoneless-Friendly Cleanup

Library code must not rely on Zone.js for cleanup or change detection side effects.

- Use `DestroyRef.onDestroy()` for timers and global listeners.
- Clear `setTimeout` timers when directives, components, or services are destroyed.
- Remove document/window listeners explicitly.
- Keep overlay, tooltip, toast, drawer, and dialog code browser-safe.
- Do not configure `provideZonelessChangeDetection()` inside the library.

## Component API Consistency

Components should keep predictable public APIs:

- Selectors use the `j-` prefix.
- CSS classes use the `.j-*` prefix.
- State classes such as `.is-active`, `.is-disabled`, and `.is-loading` are allowed.
- Common event names should be reused: `valueChange`, `selectionChange`, `opened`, `closed`, `clear`, `remove`, `pageChange`, `sortChange`, `filterChange`, `lazyLoad`, and `rowClick`.
- Keep `styleClass` where useful for consumer customization.

## Change Detection

All JRNG UI components should use `ChangeDetectionStrategy.OnPush`. Heavy derivation should move out of templates and into component getters, signals, or `computed()` values.

## CommonModule Imports

Do not keep `CommonModule` only for old structural directives. Keep it, or specific CommonModule exports, only when a template still uses Angular directives or pipes such as `NgTemplateOutlet`, `NgClass`, `NgStyle`, `AsyncPipe`, `DatePipe`, `CurrencyPipe`, or `DecimalPipe`.

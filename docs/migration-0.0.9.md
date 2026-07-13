# Migrating to 0.0.9

Version 0.0.9 preserves existing selectors, modular entrypoints, CSS classes, form outputs, and primary event names. No new mandatory runtime dependency is introduced; Chart.js and Driver.js remain optional peers.

## Editor values

No consumer change is normally required. Initial and programmatic HTML values are now preserved and sanitized even when written before the editable view exists. Unsupported or unsafe stored markup may render with those nodes or attributes removed. `writeValue` no longer produces public change emissions.

## Number formatting

`j-input-number` now treats `locale`, `minFractionDigits`, and `maxFractionDigits` as functional formatting inputs. The form model remains `number | null`; do not expect a formatted string in form state. Bounds clamp on blur or keyboard stepping rather than during partial typing.

## Upload modes

With `customUpload`, selection and upload events expose validated files while queue status remains consumer-managed through `setProgress`, `setComplete`, `setError`, cancel, retry, and remove APIs. With `customUpload="false"`, starting upload transitions queue items to `uploading`. File count and total-size limits are available through `maxFileCount` and `maxTotalSize`.

## Overlays

`appendTo` accepts `'self'`, `'body'`, an element, or a selector. Invalid selectors fall back locally. Component values override `provideJrngUI({ appendTo })`.

## Deprecated compatibility inputs

- `JTimePickerComponent.timeOnly` is deprecated. The component has always been inherently time-only, so `false` cannot select a meaningful alternate mode. Use Date Picker or Date Range Picker when a date is required.
- `JrngConfig.unstyled` is retained as a root styling hook, but is deprecated as a promise to remove every component style; accessibility-critical layout and focus styling remains.

## Tooling

Contributors should use Node 22.12 (the `.nvmrc` default), Node 20.19+, or Node 24+. Release validation now includes clean-package consumer and SSR prerender builds.

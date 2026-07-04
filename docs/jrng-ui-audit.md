# jrng-ui Audit

Date: 2026-07-04

Scope: current `jrng-ui` workspace state after the generic-library cleanup pass.

## Package Status

- Workspace package: `jrng-ui-workspace`.
- Published library package: `jrng-ui` in `projects/jrng-ui/package.json`.
- Angular target: `^21.2.0`.
- Library root: `projects/jrng-ui`.
- Library source root: `projects/jrng-ui/src`.
- Distribution output: `dist/jrng-ui`.
- Runtime library dependency: `tslib`.
- Peer dependencies: `@angular/common`, `@angular/core`, and `@angular/forms`.
- No direct dependency on an external UI component framework is declared by the workspace or library package.

## Current Standards

- Component selectors use the `j-*` prefix.
- Component CSS classes use the `.j-*` prefix.
- Global theme tokens use `--j-*`.
- Components are standalone Angular components and use `ChangeDetectionStrategy.OnPush`.
- Form controls that own values implement `ControlValueAccessor`.
- Library templates use modern Angular control-flow syntax.
- Shared docs and examples should stay generic and avoid app, company, client, or internal project names.

## Theme

The theme entrypoint is exported as `jrng-ui/theme` and copies source assets from
`projects/jrng-ui/src/styles` into the package output.

Theme classes:

- `.j-theme`
- `.j-theme-dark`
- `.j-app`
- `.j-surface`
- `.j-focus-ring`
- `.j-disabled`
- `.j-sr-only`
- `.j-ripple`

## Component Surface

Current public components include:

- Basic: button, card, badge, tag, avatar, avatar group, divider, loader, progress, skeleton, empty state, icon.
- Forms: input, textarea, password, input number, input mask, select, multiselect, autocomplete, listbox, chips, checkbox, radio, radio group, switch, rating, slider, date picker, time picker, date range picker, color picker, editor.
- Data: table, paginator.
- Layout/navigation: tabs, accordion, panel, fieldset, toolbar, stepper, breadcrumb, splitter, menu.
- Overlays/feedback: dialog, drawer, toast, confirm dialog, tooltip, popover, overlay panel.
- Media/misc: image, image preview, copy button, icon field, status chip, file upload.

## Verification

Most recent baseline command before this audit update:

```bash
npm run build:lib
```

Result: passed.

## Follow-Up Items

- Continue migrating older `@Input`/`@Output` members to modern `input()` and `output()` APIs as components are edited.
- Add deeper keyboard and accessibility tests for multiselect, autocomplete, menu, tabs, and date-picker panels.
- Expand docs coverage for every public secondary entrypoint.
- Consider a dedicated visual regression pass for the docs app once the full component set stabilizes.

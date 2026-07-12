# AI usage guide for JRNG UI

JRNG UI publishes a machine-readable registry at `jrng-ui/registry` and documentation at https://jrngui.dev/. Give an assistant the Angular version, desired workflow, accessibility requirements, and instruction to use only public `jrng-ui/*` imports.

The prompts below work with Codex, ChatGPT, Claude, or Gemini. Review generated code against the current registry and documentation before merging.

## Angular admin dashboard

```text
Create a standalone Angular 21.2 admin dashboard using jrng-ui. Import components from modular jrng-ui/* entrypoints. Use j-app-shell, j-page-header, j-metric-card, j-chart and j-table. Add responsive navigation, loading and empty states, accessible labels, light/dark themes, typed mock data and zoneless-friendly signals. Load jrng-ui/styles once. Do not recreate controls that JRNG UI provides.
```

## User-management page

```text
Build a standalone Angular 21.2 user-management page with jrng-ui. Use j-page-header, j-filter-bar, j-table, j-dialog, j-input, j-select, j-button, JConfirmationService and JrToastService. Use (onClick) for button activation. Include create/edit flows, typed users, keyboard-accessible row actions, loading, empty, error and confirmation states.
```

## Reactive Form

```text
Create an Angular Reactive Form using ReactiveFormsModule and JRNG UI ControlValueAccessor components. Use j-input, j-select, j-multiselect, j-date-picker and j-button with public jrng-ui/* imports. Show errors after touch or submit, associate error text, disable submission while invalid or saving, and use (onClick) only for non-submit button actions.
```

## Server-side data table

```text
Create a server-side Angular data table using j-data-grid from jrng-ui/data-grid. Use typed columns and request state for page, sort and filters. Add j-filter-bar, loading skeletons, an empty state, retryable errors, accessible action labels and responsive column behavior. Keep API calls in an injectable service and cancel stale requests.
```

## Settings page

```text
Create a responsive Angular settings page using JRNG UI page header, panels, inputs, selects, switches, checkboxes, tabs, buttons and toast service. Use Reactive Forms, typed settings, dirty-state confirmation, save loading state, accessible section headings and modular jrng-ui/* imports.
```

## Light and dark themes

```text
Add light, dark and system themes to an Angular 21.2 application using provideJrngUI, provideJrngTheme and JThemeService from JRNG UI. Load jrng-ui/styles once, expose an accessible theme control, persist only the theme preference, avoid direct browser access during SSR and customize semantic --j-* tokens instead of component internals.
```

## Accessible confirmation workflow

```text
Create an accessible delete workflow using JConfirmationService and j-confirm-dialog from jrng-ui/confirm-dialog, j-button from jrng-ui/button and JrToastService from jrng-ui/toast. Use explicit Delete and Cancel labels, restore focus, support Escape, prevent duplicate requests, announce success or failure and keep (onClick) as the button output.
```

## Model-specific starter lines

- Codex: “Implement the following in the existing Angular workspace and run focused tests.”
- ChatGPT: “Return complete standalone Angular files and explain the public JRNG UI imports.”
- Claude: “Use the registry fields as the API source of truth and flag any missing API rather than inventing it.”
- Gemini: “Generate Angular 21.2 code using only verified JRNG UI APIs and include accessibility checks.”

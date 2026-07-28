# Cron Expression Editor

`j-cron-expression` is an accessible Angular form control for authoring, parsing, normalising, explaining, and validating Linux five-field cron expressions. It does not execute jobs or connect to a scheduler.

```ts
import { JCronExpressionComponent } from 'jrng-ui/cron-expression';
```

## Basic cron expression

```html
<j-cron-expression
  label="Content refresh"
  value="0 * * * *"
  [previewFrom]="previewFrom"
  (valueChange)="schedule = $event"
/>
```

Each documentation example owns its own value and, when it displays next runs, its own explicit preview reference.

## Common schedules

### Every N minutes

```html
<j-cron-expression label="Health check" value="*/15 * * * *" />
```

### Nightly backup

```html
<j-cron-expression label="Nightly backup" value="0 2 * * *" />
```

### Weekday report

```html
<j-cron-expression label="Weekday report" value="0 7 * * 1-5" />
```

### Monthly schedule

```html
<j-cron-expression label="Monthly close" value="0 9 1 * *" />
```

## Structured editor and raw expression mode

The raw input and the five structured inputs describe the same value in this fixed order:

```text
minute hour day-of-month month day-of-week
```

Editing a structured field formats the complete expression. Editing raw text preserves the exact invalid input until it can be corrected; only valid, whitespace-normalised values are emitted.

```html
<j-cron-expression ariaLabel="Deployment schedule" value="30 22 * * 1,3,5" />
```

The Hourly, Daily, Weekly, and Monthly buttons expand to ordinary five-field expressions.

## Invalid expression recovery

```html
<j-cron-expression value="61 25 * * *" />
```

Errors are associated with the raw input and individual fields. Invalid raw input remains visible and is not silently replaced or emitted.

## Angular Forms

`j-cron-expression` implements `ControlValueAccessor` and `Validator`.

```ts
import { FormControl, ReactiveFormsModule } from '@angular/forms';

schedule = new FormControl('0 2 * * *', { nonNullable: true });
```

```html
<j-cron-expression [formControl]="schedule" />
```

Template-driven forms can use `[(ngModel)]` when `FormsModule` is imported. Touched, disabled, and validation state follow Angular Forms. Invalid controls expose a `cronExpression` validation error containing the parser issues.

## Disabled and read-only

```html
<j-cron-expression value="0 2 * * *" disabled /> <j-cron-expression value="0 2 * * *" readonly />
```

Disabled blocks editing, shortcuts, and copying. Read-only blocks mutation while preserving readable and copyable content.

## Responsive layout

The five structured fields use five columns on wide surfaces, two below 820px, and one below 480px. The component uses logical properties and does not require a browser API to render.

## RTL

```html
<div dir="rtl">
  <j-cron-expression dir="rtl" value="0 7 * * 1-5" />
</div>
```

Labels and surrounding actions follow RTL. Cron tokens and structured fields remain in standard left-to-right order so the expression is not reinterpreted.

## Accessibility and keyboard support

- The editor, raw expression, fieldset, every unit, shortcut, copy action, and invalid state have accessible names.
- Validation uses associated descriptions and an alert; valid descriptions and next runs use a polite live region.
- Tab and Shift+Tab follow the visual reading order.
- Enter and Space activate JRNG shortcut and copy buttons.
- Native text editing remains available with no custom keyboard trap.
- Visible focus uses `--j-cron-focus`.

## Supported grammar

This release supports Linux-style five-field numeric grammar:

- `*` wildcard
- a single numeric value, such as `5`
- an inclusive range, such as `1-5`
- a comma-separated list, such as `1,3,5`
- a positive step on a wildcard or range, such as `*/10` or `10-50/5`
- `@hourly`, `@daily`, `@weekly`, and `@monthly` as input shortcuts

Bounds are minute 0–59, hour 0–23, day-of-month 1–31, month 1–12, and day-of-week 0–7, with both 0 and 7 denoting Sunday. When day-of-month and day-of-week are both restricted, a date matches when either field matches, following common Linux cron semantics.

## Unsupported grammar

Six-field seconds mode is deliberately excluded. Quartz/Spring tokens such as `?`, `L`, `W`, and `#`, named months or days, macros beyond the four documented shortcuts, year fields, and scheduler-specific timezone directives are rejected rather than reinterpreted.

Next-run preview evaluates the documented grammar in UTC. It is shown only when `previewFrom` is provided and is bounded by `maximumPreviewIterations` to prevent impossible schedules from searching forever. The destination scheduler remains authoritative for execution and timezone behavior.

## Theming

| Token                     | Default            | Purpose                   |
| ------------------------- | ------------------ | ------------------------- |
| `--j-cron-bg`             | `--j-color-card`   | Editor surface            |
| `--j-cron-border`         | `--j-color-border` | Editor boundary           |
| `--j-cron-control-bg`     | `--j-color-card`   | Input surface             |
| `--j-cron-control-border` | `--j-color-border` | Input boundary            |
| `--j-cron-preview-bg`     | `--j-color-muted`  | Preview and error surface |
| `--j-cron-error`          | `--j-color-danger` | Invalid state             |
| `--j-cron-focus`          | `--j-focus-ring`   | Keyboard focus            |

All public classes use the `.j-cron-expression*` namespace.

## API

Important inputs are `value`, `label`, `description`, `ariaLabel`, `disabled`, `readonly`, `dir`, `previewFrom`, `previewCount`, and `maximumPreviewIterations`.

`valueChange` emits a normalised valid string. `validationChange` emits `readonly JCronIssue[]`. Public grammar utilities include `jParseCronExpression`, `jFormatCronExpression`, `jDescribeCronExpression`, and bounded `jNextCronRuns`.

## Testing

Automated tests cover valid and invalid grammar, bounds, wildcards, lists, ranges, steps, whitespace, round trips, five-field policy, Linux day-field behavior, impossible schedules, preview termination, CVA and Reactive Forms, disabled/read-only states, keyboard-native controls, RTL, SSR-safe rendering, and cleanup through Angular destruction.

Applications should additionally test expressions against their chosen scheduler because scheduler timezone and operational policies are outside JRNG.

## FAQ

**Does the component run a job?** No. It authors a string; the application and backend own execution.

**Is it Quartz or Spring compatible?** No. Unsupported syntax is reported explicitly.

**Why is there no seconds field?** Five-field Linux grammar keeps the first release precise and testable.

**Why are next runs not shown automatically?** An explicit reference instant keeps examples, SSR output, and tests deterministic.

## Changelog

- Introduced in Advanced Components Phase 1 with Linux five-field parsing, structured editing, Angular Forms, bounded UTC preview, accessibility, responsive layout, and RTL support.

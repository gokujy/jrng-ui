# Enterprise foundations (Phase 1)

Phase 1 adds shared types and tokens, an enhanced Form Field, validation and submit behavior, Data Display, formatting pipes, and pure utilities. Existing selectors, defaults, and APIs remain supported. Import every API from its modular `jrng-ui/*` entrypoint.

## Shared variant system

`JVisualVariant`, `JComponentSize`, `JSeverity`, `JComponentState`, `JDensity`, `JOrientation`, `JShape`, and `JResponsiveMode` live in `jrng-ui/core`. Components expose only the types relevant to them. `jResolveVariantClasses`, `jResolveCssCustomProperties`, alias resolution, development warnings, browser guards, and reduced-motion detection are also available from core.

### Preview

Filled, outlined, soft, minimal, and elevated surfaces share semantic surface, radius, elevation, focus, state, size, and density tokens in light and dark themes. The existing defaults remain unchanged.

### Code

```ts
import { JComponentSize, JVisualVariant, jResolveVariantClasses } from 'jrng-ui/core';

const classes = jResolveVariantClasses('j-summary', { size: 'lg', variant: 'soft' });
```

## Form Field and validation message

### Preview

`j-form-field` supports visible required or optional labels, hints, success/warning/error messages, multiple and server errors, prefix/suffix projection, character counts, horizontal/vertical layouts, three densities, and disabled/readonly presentation. It adds stable label and description IDs to a projected native or ARIA form control. `j-validation-message` can also be used independently with Reactive Forms, template-driven controls through direct errors/messages, or signal-managed submission state.

### Code — Reactive Forms

```html
<form jFormSubmit [formGroup]="form" [submitting]="saving()">
  <j-form-field
    label="Email"
    hint="Use a monitored address."
    [control]="form.controls.email"
    [required]="true"
    [showCharacterCount]="true"
    [maxLength]="120"
  >
    <span jFormFieldPrefix aria-hidden="true">@</span>
    <input formControlName="email" maxlength="120" />
  </j-form-field>
  <button type="submit">Save</button>
</form>
```

```ts
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { JFormFieldComponent } from 'jrng-ui/form-field';
import { JFormSubmitDirective } from 'jrng-ui/form-submit';
import {
  JValidationMessageComponent,
  provideJValidationMessages,
} from 'jrng-ui/validation-message';

providers: [provideJValidationMessages({ required: 'Please provide this value.' })];
```

### Code — server validation and custom template

```ts
form.controls.email.setErrors({
  ...form.controls.email.errors,
  server: 'That address is already registered.',
});
```

```html
<j-validation-message [control]="form.controls.email" displayMode="touched">
  <ng-template let-item><strong>{{ item.message }}</strong></ng-template>
</j-validation-message>
```

`jFormSubmit` recursively marks groups and arrays touched, focuses and scrolls the first invalid control, announces its associated error, blocks duplicate submissions while `submitting` is true, and can remove only `server` errors after values change. Browser work is skipped during SSR and smooth scrolling is disabled for reduced motion.

## Data Display

### Preview

Data Display renders detail rows consistently in cards, tables, summaries, and audit views. It covers text, numbers, currency, percent, dates/times, relative time, booleans, application-supplied status mappings, pills, avatars, safe links, lists, JSON, file sizes, loading/error/empty states, copy, truncation, custom templates, and responsive layouts.

### Code

```html
<j-data-display label="Invoice amount" type="currency" [value]="invoice.total" currency="INR" />
<j-data-display label="Status" type="status" [value]="invoice.status" [statusMap]="statusMap" />
<j-data-display label="Owner" type="email" [value]="invoice.ownerEmail" [copy]="true" />
```

Applications own status names and map them to generic severities; JRNG UI does not embed business statuses.

## Formatting pipes

### Preview

All enterprise pipes are pure. Search highlighting returns text segments instead of HTML, so it never requires a security bypass.

### Code

```html
{{ updatedAt | jRelativeTime }} {{ elapsedMs | jDuration }} {{ enabled |
jBooleanLabel:'Enabled':'Disabled' }} {{ userName | jInitials }} {{ email | jMaskedEmail }} {{ phone
| jMaskedPhone }} {{ values | jJoinValues:' · ' }} {{ amount | jAccountingCurrency:'INR' }}
```

Other additions are `jDefaultText`, `jPluralize`, `jSearchHighlight`, `jJsonDisplay`, `jFileExtension`, `jCompactNumber`, and `jBytes`.

## Utility functions

### Preview

Pure, immutable helpers cover collections, safe object configuration, strings, dates, and files. They do not read browser globals.

### Code

```ts
import {
  groupBy,
  deepMerge,
  normalizeDate,
  sanitizeFilename,
  validateFile,
} from 'jrng-ui/utilities';

const byTeam = groupBy(users, (user) => user.teamId);
const config = deepMerge(defaultConfig, remoteConfig, userConfig);
const safeName = sanitizeFilename(upload.name);
```

Collections include `groupBy`, `uniqueBy`, `sortBy`, `chunk`, `moveItem`, `flattenTree`, and `buildTree`. Objects include nullish removal, `pick`, `omit`, safe deep merge, deep equality, changed fields, and query parameters. Date and file helpers normalize invalid values rather than throwing.

## Accessibility and responsive behavior

### Preview

Labels and validation messages are programmatically associated, errors use assertive live regions, success/warnings use polite status regions, focus remains visible in forced-colors mode, disabled/readonly states remain semantic, and loading motion is removed for reduced-motion users. Horizontal Form Field and Data Display layouts stack below the small breakpoint by default.

### Code

```html
<j-form-field label="Reference" orientation="horizontal" density="compact">
  <input name="reference" readonly />
</j-form-field>

<j-data-display
  label="Updated"
  type="datetime"
  [value]="record.updatedAt"
  orientation="horizontal"
  responsive="stack"
/>
```

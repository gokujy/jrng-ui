# JRNG UI Form Inputs

JRNG UI form controls are standalone Angular components with `OnPush` change detection. Components that own a value implement `ControlValueAccessor`, so they work with `formControlName` and `[formControl]`.

## Imports

```ts
import { ReactiveFormsModule } from '@angular/forms';
import { JFormFieldComponent } from 'jrng-ui/form-field';
import { JInputComponent } from 'jrng-ui/input';
import { JTextareaComponent } from 'jrng-ui/textarea';
import { JPasswordComponent } from 'jrng-ui/password';
import { JInputNumberComponent } from 'jrng-ui/input-number';
import { JInputMaskComponent } from 'jrng-ui/input-mask';
import { JIconFieldComponent } from 'jrng-ui/icon-field';
```

Root imports are also supported:

```ts
import {
  JFormFieldComponent,
  JInputComponent,
  JTextareaComponent,
  JPasswordComponent,
  JInputNumberComponent,
  JInputMaskComponent,
  JIconFieldComponent,
} from 'jrng-ui';
```

## Shared API

Most controls support `id`, `name`, `label`, `placeholder`, `hint`, `error`, `required`, `readonly`, `disabled`, `invalid`, `size`, `variant`, `fluid`, `fullWidth`, `styleClass`, and `ariaDescribedby`.

`size` is `sm | md | lg`.
`variant` is `outlined | filled`.

## j-form-field

Use `j-form-field` as a lightweight wrapper when a native or custom projected control needs shared label, hint, error, and required indicator rendering.

```html
<j-form-field label="Reference" forId="reference" hint="Shown on internal reports">
  <input id="reference" class="j-input" />
</j-form-field>
```

## j-input

`j-input` supports text-like input types and emits `valueChange` plus `clear`.

```html
<j-input
  label="Email"
  type="email"
  placeholder="name@company.com"
  [formControl]="email"
  required
  clearable
/>
```

```html
<j-input
  label="Search"
  type="search"
  prefixIcon="/"
  placeholder="Search records"
  [(value)]="search"
/>
```

## j-textarea

`j-textarea` supports `rows`, `autoResize`, `maxLength`, and `showCount`.

```html
<j-textarea
  label="Notes"
  [rows]="4"
  [maxLength]="240"
  showCount
  autoResize
  [formControl]="notes"
/>
```

## j-password

`j-password` supports `toggleMask` and optional `feedback`.

```html
<j-password
  label="Password"
  [formControl]="password"
  toggleMask
  feedback
  error="Password is required"
/>
```

## j-input-number

`j-input-number` emits `number | null`. It supports `min`, `max`, `step`, `mode`, `currency`, `locale`, `minFractionDigits`, and `maxFractionDigits`.

```html
<j-input-number
  label="Record value"
  mode="currency"
  currency="USD"
  [min]="0"
  [step]="100"
  [formControl]="recordValue"
/>
```

## j-input-mask

`j-input-mask` currently provides the stable public API and CVA behavior, but advanced mask parsing is pending. The `mask` value is used as a placeholder fallback until a dependency-free masking engine is added.

```html
<j-input-mask
  label="Reference code"
  mask="AAA-9999"
  [formControl]="referenceCode"
  hint="Mask enforcement is pending"
/>
```

## j-icon-field

Use `j-icon-field` to compose icon-prefixed controls. It does not own a value.

```html
<j-icon-field prefixIcon="search">
  <j-input placeholder="Search records" [formControl]="search" fluid />
</j-icon-field>
```

Projected prefix/suffix slots are also supported:

```html
<j-icon-field>
  <span jIconFieldPrefix>@</span>
  <j-input label="Handle" [formControl]="handle" fluid />
  <span jIconFieldSuffix>.com</span>
</j-icon-field>
```

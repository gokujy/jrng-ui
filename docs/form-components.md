# Form Components

jrng-ui form components are standalone Angular controls designed for reactive forms, template forms, and generic dashboard workflows.

## Reactive Forms

Value-owning controls implement `ControlValueAccessor`, so they work with `formControlName`, `[formControl]`, disabled state from Angular forms, and validation state.

```ts
import { FormControl, FormGroup, Validators } from '@angular/forms';

form = new FormGroup({
  email: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  amount: new FormControl<number | null>(null),
  code: new FormControl('', { nonNullable: true }),
});
```

```html
<j-input
  formControlName="email"
  label="Email"
  placeholder="user@example.com"
  hint="Use a valid email address."
  required
  fullWidth
/>

<j-input-number
  formControlName="amount"
  label="Amount"
  mode="currency"
  currency="$"
  [min]="0"
  [step]="0.01"
  clearable
/>

<j-input-otp formControlName="code" label="Verification code" [length]="6" numericOnly />
```

## Shared Control Inputs

Form controls support common inputs where applicable:

- `label`
- `placeholder`
- `hint`
- `error`
- `required`
- `invalid`
- `disabled`
- `readonly`
- `clearable`
- `size`: `sm`, `md`, `lg`
- `variant`: `outlined`, `filled`
- `fullWidth`
- `styleClass`
- `pt`

## Text Inputs

```html
<j-input label="Customer" placeholder="Customer name" clearable />

<j-textarea
  label="Notes"
  placeholder="Add notes"
  [rows]="4"
  showCount
  [maxLength]="240"
  clearable
/>

<j-input-mask label="Phone" mask="(999) 999-9999" placeholder="(555) 000-0000" />
```

## Password

`j-password` supports show/hide, clearable mode, and an optional strength meter. Feedback text uses jrng-ui locale labels.

```html
<j-password label="Password" placeholder="Enter password" feedback clearable fullWidth />
```

## Number Input

```html
<j-input-number label="Quantity" [min]="1" [max]="99" [step]="1" />
<j-input-number label="Invoice total" mode="currency" currency="$" suffix="USD" />
```

## Input Group

```html
<j-input-group prefixAddon="https://" suffixAddon=".com" compact fullWidth>
  <j-input placeholder="domain" fullWidth />
</j-input-group>

<j-input-group prefixIcon="search" compact>
  <j-input placeholder="Search products" />
  <j-button jInputGroupButton label="Search" />
</j-input-group>
```

## Icon Field

```html
<j-icon-field prefixIcon="search">
  <j-input placeholder="Search customers" />
</j-icon-field>

<j-input-icon icon="calendar" />
```

## OTP

```html
<j-input-otp formControlName="code" label="One-time code" [length]="6" numericOnly mask />
```

OTP supports auto focus next, paste distribution, backspace previous, CVA integration, and per-cell accessibility labels.

## Key Filter

```html
<input jKeyFilter="num" aria-label="Numeric value" />
```

Presets: `int`, `num`, `alpha`, `alphanum`, `hex`, `email`.

## Labels

```html
<j-float-label label="Project name" fullWidth>
  <j-input placeholder=" " fullWidth />
</j-float-label>

<j-ifta-label label="Customer">
  <input class="j-input__field" placeholder="Customer name" />
</j-ifta-label>
```

`j-float-label` and `j-ifta-label` observe projected native controls for focused and filled state and expose `disabled` and `invalid` styling states.

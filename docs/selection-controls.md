# JRNG UI Selection Controls

Selection controls are standalone Angular components. Each value-owning control implements `ControlValueAccessor`, supports Reactive Forms, honors disabled state from Angular forms, and uses `j-*` selectors/classes without PrimeNG dependencies.

## Imports

```ts
import { ReactiveFormsModule } from '@angular/forms';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JRadioComponent } from 'jrng-ui/radio';
import { JRadioGroupComponent } from 'jrng-ui/radio-group';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JRatingComponent } from 'jrng-ui/rating';
import { JSliderComponent } from 'jrng-ui/slider';
```

Root imports are also supported from `jrng-ui`.

## j-checkbox

Boolean mode:

```html
<j-checkbox label="Active" [formControl]="active" />
```

Array selection mode:

```html
<j-checkbox label="Email" value="email" [formControl]="channels" />
<j-checkbox label="SMS" value="sms" [formControl]="channels" />
```

Indeterminate:

```html
<j-checkbox label="Select all" [indeterminate]="partiallySelected" [formControl]="allSelected" />
```

## j-radio

Standalone radio works as a CVA when you need direct composition.

```html
<j-radio name="status" value="active" [formControl]="status">Active</j-radio>
<j-radio name="status" value="inactive" [formControl]="status">Inactive</j-radio>
```

## j-radio-group

Use `j-radio-group` for option-driven radio controls.

```html
<j-radio-group
  label="Status"
  [options]="statuses"
  optionLabel="label"
  optionValue="value"
  [formControl]="status"
/>
```

```ts
statuses = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];
```

Horizontal layout:

```html
<j-radio-group label="Priority" [options]="priorities" direction="horizontal" [formControl]="priority" />
```

## j-switch

Boolean mode:

```html
<j-switch label="Enabled" [formControl]="enabled" />
```

Custom true/false values:

```html
<j-switch
  [trueValue]="'Y'"
  [falseValue]="'N'"
  onLabel="Yes"
  offLabel="No"
  [formControl]="enabledFlag"
/>
```

## j-rating

```html
<j-rating label="Score" [max]="5" cancel [formControl]="score" />
```

Readonly:

```html
<j-rating [max]="10" [formControl]="score" readonly />
```

## j-slider

Single value:

```html
<j-slider label="Discount" [min]="0" [max]="100" [step]="5" [formControl]="discount" />
```

Range value:

```html
<j-slider label="Price range" [min]="0" [max]="100000" [step]="1000" range [formControl]="priceRange" />
```

`j-slider` emits a number in single-value mode and `[number, number]` in range mode.

# Selection Controls

jrng-ui selection controls are standalone Angular components. Value-owning controls support `ControlValueAccessor`, reactive forms, disabled state from Angular forms, and accessible keyboard interaction.

## Checkbox

```html
<j-checkbox label="Active" [formControl]="active" />
<j-checkbox label="Select all" [indeterminate]="partiallySelected" [formControl]="allSelected" />
```

Array mode:

```html
<j-checkbox label="Email" value="email" [formControl]="channels" />
<j-checkbox label="SMS" value="sms" [formControl]="channels" />
```

## Radio Group

```html
<j-radio-group
  label="Status"
  [options]="statuses"
  optionLabel="label"
  optionValue="value"
  direction="horizontal"
  [formControl]="status"
/>
```

`j-radio` is also available for direct composition.

## Switch

```html
<j-switch label="Enabled" [formControl]="enabled" />

<j-switch
  [trueValue]="'Y'"
  [falseValue]="'N'"
  onLabel="Yes"
  offLabel="No"
  [formControl]="enabledFlag"
/>
```

## Toggle Button

```html
<j-toggle-button
  onLabel="Enabled"
  offLabel="Disabled"
  onIcon="check"
  offIcon="close"
  [formControl]="enabled"
/>
```

## Select Button

```html
<j-select-button
  [options]="priorities"
  optionLabel="label"
  optionValue="value"
  [formControl]="priority"
/>

<j-select-button
  [options]="filters"
  optionLabel="label"
  optionValue="value"
  multiple
  [formControl]="activeFilters"
/>
```

## Rating

```html
<j-rating label="Score" [max]="5" cancel [formControl]="score" />
<j-rating [max]="10" [formControl]="score" readonly />
```

## Slider

```html
<j-slider label="Discount" [min]="0" [max]="100" [step]="5" [formControl]="discount" />
<j-slider
  label="Price range"
  [min]="0"
  [max]="100000"
  [step]="1000"
  range
  tooltip
  [formControl]="priceRange"
/>
<j-slider label="Level" vertical [formControl]="level" />
```

## Knob

```html
<j-knob label="Progress" [min]="0" [max]="100" [step]="5" [formControl]="progress" />
```

## Color Picker

```html
<j-color-picker
  label="Accent color"
  [presetColors]="['#111827', '#4f46e5', '#16a34a', '#d97706']"
  clearable
  [formControl]="accentColor"
/>
```

`j-color-picker` includes a swatch trigger, simple popover picker, hex input, presets, and clear support.

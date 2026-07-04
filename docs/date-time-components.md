# JRNG UI Date And Time Components

These components are standalone Angular controls with `ControlValueAccessor` support. They are dependency-free and do not import PrimeNG.

This phase uses native date/time inputs as the stable fallback. The public API is intentionally shaped for a future custom calendar panel, but advanced panel behavior is not complete yet.

## Imports

```ts
import { ReactiveFormsModule } from '@angular/forms';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JTimePickerComponent } from 'jrng-ui/time-picker';
import { JDateRangePickerComponent } from 'jrng-ui/date-range-picker';
```

Root imports are also supported from `jrng-ui`.

## j-date-picker

Single date selection is implemented.

```html
<j-date-picker
  label="Invoice date"
  placeholder="Select date"
  [formControl]="invoiceDate"
  [minDate]="minDate"
  [maxDate]="maxDate"
  showIcon
  showButtonBar
  showClear
/>
```

String value mode:

```html
<j-date-picker dataType="string" [formControl]="shipDate" />
```

Events:

```html
<j-date-picker
  (valueChange)="dateValue = $event"
  (select)="dateSelected($event)"
  (clear)="dateCleared()"
  (opened)="pickerOpened()"
  (closed)="pickerClosed()"
/>
```

Current limitations:

- `selectionMode="single"` is implemented.
- `selectionMode="multiple"` and `selectionMode="range"` are API placeholders on `j-date-picker`; use `j-date-range-picker` for range workflows.
- `view="month"` and `view="year"` are API placeholders until a custom calendar panel is added.
- `dateFormat` is accepted but native inputs still use `yyyy-MM-dd`.
- `appendTo` is accepted for API compatibility but native input fallback does not render a custom overlay.

## j-time-picker

```html
<j-time-picker
  label="Start time"
  [stepMinute]="15"
  hourFormat="24"
  [formControl]="startTime"
/>
```

Notes:

- Values are strings in `HH:mm` format from the native time input.
- `hourFormat="12"` is accepted for API stability, but native rendering depends on browser and locale.
- `timeOnly` is available for compatibility and defaults to true.

## j-date-range-picker

`j-date-range-picker` uses two native date inputs and emits an object value:

```ts
type DateRange = {
  start: string | Date | null;
  end: string | Date | null;
};
```

```html
<j-date-range-picker
  label="Service period"
  [formControl]="servicePeriod"
  [minDate]="minDate"
  [maxDate]="maxDate"
  showClear
/>
```

Date object mode:

```html
<j-date-range-picker dataType="date" [formControl]="period" />
```

The component also accepts array writes from forms, such as `[start, end]`, but emits `{ start, end }`.

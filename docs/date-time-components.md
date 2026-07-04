# JRNG UI Date And Time Components

JRNG UI date and time components are standalone Angular controls with original styling, `ControlValueAccessor` support where values are owned, and generic APIs for reusable application interfaces.

## Imports

```ts
import { ReactiveFormsModule } from '@angular/forms';
import { JCalendarComponent } from 'jrng-ui/calendar';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JDateRangePickerComponent } from 'jrng-ui/date-range-picker';
import { JTimePickerComponent } from 'jrng-ui/time-picker';
```

Root imports are also supported from `jrng-ui`.

## j-date-picker

`j-date-picker` supports single-date selection, form binding, min/max dates, disabled dates, text formatting, clear, today, month navigation, month view, year view, and keyboard selection.

```html
<j-date-picker
  label="Invoice date"
  placeholder="Select date"
  [formControl]="invoiceDate"
  [minDate]="minDate"
  [maxDate]="maxDate"
  [disabledDates]="unavailableDates"
  dateFormat="yyyy-MM-dd"
  showIcon
  showClear
/>
```

String value mode:

```html
<j-date-picker dataType="string" [formControl]="orderDate" />
```

Custom day template:

```html
<j-date-picker [formControl]="projectDate">
  <ng-template #jDateCell let-date let-label="label" let-today="today">
    <span [class.is-active]="today">{{ label }}</span>
  </ng-template>
</j-date-picker>
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

## j-date-range-picker

`j-date-range-picker` supports start/end selection, hover range preview, min/max dates, clearing, presets, and CVA integration. It accepts tuple writes or object writes and emits an object value.

```ts
type DateRange = {
  start: string | Date | null;
  end: string | Date | null;
};
```

```html
<j-date-range-picker
  label="Order period"
  [formControl]="orderPeriod"
  [minDate]="minDate"
  [maxDate]="maxDate"
  showClear
/>
```

Built-in presets:

- Today
- Yesterday
- Last 7 days
- This month
- Last month

Date object mode:

```html
<j-date-range-picker dataType="date" [formControl]="projectWindow" />
```

## j-time-picker

`j-time-picker` emits stable string values in `HH:mm` or `HH:mm:ss` format. It supports 12-hour or 24-hour display, minute steps, optional seconds, clearing, and CVA integration.

```html
<j-time-picker
  label="Start time"
  [minuteStep]="15"
  [hourFormat]="24"
  [formControl]="startTime"
/>
```

12-hour display with seconds:

```html
<j-time-picker
  label="Task reminder"
  [hourFormat]="12"
  showSeconds
  [formControl]="reminderTime"
/>
```

The legacy `stepMinute` input is still accepted as an alias for `minuteStep`.

## j-calendar

`j-calendar` is a generic standalone calendar surface for custom compositions. It supports month navigation, min/max dates, disabled dates, selected date display, and `dateSelect`.

```html
<j-calendar
  [value]="selectedDate"
  [minDate]="minDate"
  [maxDate]="maxDate"
  [disabledDates]="blockedDates"
  (dateSelect)="selectedDate = $event"
/>
```

## j-calendar-scheduler

`j-calendar-scheduler` provides day, week, and month views for generic event scheduling. It supports navigation, date clicks, event clicks, and simple multi-day event layout.

```html
<j-calendar-scheduler
  [events]="events"
  [(view)]="schedulerView"
  [(activeDate)]="activeDate"
  (eventClick)="openEvent($event.event)"
  (dateClick)="createEvent($event.date)"
/>
```

## Accessibility

Date and range panels use semantic dialog and grid roles, visible focus states, `aria-selected`, `aria-current`, disabled state attributes, and keyboard activation. The picker overlays use the library outside-click utility and are SSR-safe.

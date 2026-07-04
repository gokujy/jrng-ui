# JRNG UI Select Components

These components are standalone Angular controls with JRNG-owned styling and behavior. Value-owning controls implement `ControlValueAccessor`, so they work with `formControlName` and `[formControl]`.

## Imports

```ts
import { ReactiveFormsModule } from '@angular/forms';
import { JSelectComponent } from 'jrng-ui/select';
import { JMultiselectComponent } from 'jrng-ui/multiselect';
import { JAutocompleteComponent } from 'jrng-ui/autocomplete';
import { JListboxComponent } from 'jrng-ui/listbox';
import { JChipComponent } from 'jrng-ui/chip';
import { JChipsComponent } from 'jrng-ui/chips';
```

Root imports are also supported:

```ts
import {
  JSelectComponent,
  JMultiselectComponent,
  JAutocompleteComponent,
  JListboxComponent,
  JChipComponent,
  JChipsComponent,
} from 'jrng-ui';
```

## Options

Primitive arrays are supported:

```ts
statuses = ['Active', 'Inactive', 'Pending'];
```

Object arrays are supported:

```ts
statuses = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive', disabled: true },
];
```

Use `optionLabel` and `optionValue` when objects use different field names:

```html
<j-select [options]="users" optionLabel="fullName" optionValue="id" />
```

## j-select

`j-select` replaces common single-value dropdown use cases. It supports filtering, clear, loading state, outside-click close, keyboard navigation, and `ArrowDown`, `ArrowUp`, `Enter`, `Escape`, and `Tab`.

```html
<j-select
  label="Status"
  placeholder="Select status"
  [options]="statuses"
  [formControl]="status"
  searchable
  clearable
  required
/>
```

Events:

```html
<j-select
  [options]="statuses"
  (valueChange)="statusValue = $event"
  (selectionChange)="selectedStatus = $event"
  (filterChange)="loadFilteredStatuses($event)"
  (opened)="trackOpen()"
  (closed)="trackClose()"
  (clear)="resetStatus()"
/>
```

Custom option template:

```html
<j-select [options]="statuses">
  <ng-template #jSelectItem let-label="label" let-selected="selected">
    <strong>{{ label }}</strong>
    <span *ngIf="selected">Selected</span>
  </ng-template>
</j-select>
```

## j-multiselect

`j-multiselect` owns an array value. It supports checkbox-style options, filtering, chips display, select visible, clear visible, clear all, and CVA.

```html
<j-multiselect
  label="Roles"
  [options]="roles"
  [formControl]="selectedRoles"
  displayChips
  searchable
  clearable
/>
```

## j-autocomplete

`j-autocomplete` accepts a `suggestions` input and emits both `searchChange` and `completeMethod` for remote lookup flows.

```html
<j-autocomplete
  label="Record"
  [suggestions]="records"
  optionLabel="name"
  optionValue="id"
  [formControl]="recordId"
  dropdown
  forceSelection
  (completeMethod)="searchRecords($event)"
/>
```

With `forceSelection`, unmatched text is cleared on blur.

## j-listbox

`j-listbox` renders an always-visible list. It supports single or multiple selection, filter, keyboard navigation, and CVA.

```html
<j-listbox label="Warehouse" [options]="warehouses" [formControl]="warehouse" filter />
```

```html
<j-listbox label="Regions" [options]="regions" [formControl]="selectedRegions" multiple filter />
```

## j-chip

`j-chip` is a small display component with optional remove action.

```html
<j-chip label="Active" severity="primary" removable (remove)="removeStatus()" />
```

Projected content is also supported:

```html
<j-chip removable>Verified</j-chip>
```

## j-chips

`j-chips` owns a `string[]` value. Users can add with `Enter`, paste/type separator-delimited values, and remove chips with the remove button or backspace on an empty input.

```html
<j-chips
  label="Tags"
  placeholder="Add tag"
  separator=","
  [formControl]="tags"
  (add)="tagAdded($event)"
  (remove)="tagRemoved($event)"
/>
```

Duplicate entries are ignored by default. Set `allowDuplicate` when repeated values are valid.

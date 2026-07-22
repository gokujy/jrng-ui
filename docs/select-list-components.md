# Select And List Components

jrng-ui selection components support primitive options, object options, disabled options, reactive forms, keyboard navigation, and accessible listbox patterns.

## Select

```html
<j-select
  formControlName="customerId"
  label="Customer"
  [options]="customers"
  optionLabel="name"
  optionValue="id"
  optionDisabled="disabled"
  searchable
  clearable
  (filterChange)="loadCustomers($event)"
/>
```

Grouped options use an object with an item collection:

```html
<j-select
  [options]="groupedProducts"
  groupLabel="category"
  groupOptions="items"
  optionLabel="name"
  optionValue="id"
/>
```

Custom templates:

```html
<j-select [options]="products" optionLabel="name" optionValue="id">
  <ng-template #jSelectItem let-label="label" let-option="option">
    <span>{{ label }}</span>
  </ng-template>

  <ng-template #jSelectSelectedItem let-label="label">
    <strong>{{ label }}</strong>
  </ng-template>
</j-select>
```

## Multiselect

```html
<j-multiselect
  formControlName="teamIds"
  label="Team"
  [options]="users"
  optionLabel="name"
  optionValue="id"
  displayChips
  [maxSelectedLabels]="3"
  searchable
  clearable
/>
```

`j-multiselect` supports checkbox-style options, select all, unselect all, custom item templates, CVA, and filtering.

## Autocomplete And Searchable Select

```html
<j-autocomplete
  formControlName="product"
  label="Product"
  [suggestions]="products"
  optionLabel="name"
  optionValue="id"
  [delay]="300"
  [minLength]="2"
  dropdown
  forceSelection
  (completeMethod)="searchProducts($event)"
/>

<j-select
  formControlName="customer"
  label="Customer"
  [options]="customers"
  optionLabel="name"
  optionValue="id"
  searchable
/>
```

## Listbox

```html
<j-listbox
  formControlName="projectId"
  label="Project"
  [options]="projects"
  optionLabel="name"
  optionValue="id"
  filter
/>

<j-listbox
  formControlName="taskIds"
  [options]="tasks"
  optionLabel="title"
  optionValue="id"
  multiple
/>
```

## Order List

```html
<j-order-list
  [value]="tasks"
  optionLabel="title"
  optionValue="id"
  filter
  (valueChange)="tasks = $event"
  (reorder)="handleReorder($event)"
/>
```

## Pick List And Transfer List

```html
<j-transfer-list
  [source]="availableProducts"
  [target]="selectedProducts"
  optionLabel="name"
  optionValue="id"
  filter
  (sourceChange)="availableProducts = $event"
  (targetChange)="selectedProducts = $event"
/>

<j-transfer-list
  [source]="availableUsers"
  [target]="teamUsers"
  optionLabel="name"
  optionValue="id"
/>
```

## Chips

```html
<j-chip label="Active" removable (remove)="removeStatus()" />

<j-chips formControlName="tags" label="Tags" separator="," [separators]="[',', ';']" [max]="5" />
```

`j-chips` supports add/remove, separator parsing, optional duplicate prevention, max items, disabled state from Angular forms, and CVA.

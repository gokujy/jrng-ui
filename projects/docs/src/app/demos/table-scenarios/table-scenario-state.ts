import {
  JTableActionEvent,
  JTableAction,
  JTableColumn,
  JTableColumnGroupRow,
  JTableConfig,
  JTableEditEvent,
  JTableFilterModel,
  JTableLazyLoadEvent,
  JTablePageChange,
  JTableReorderEvent,
  JTableSelection,
  JTableSort,
  jTableActionsColumn,
  jTableIndexColumn,
} from 'jrng-ui/table';

export interface TableDemoRow extends Record<string, unknown> {
  readonly id: number;
  readonly code: string;
  readonly customer: string;
  readonly department: string;
  readonly status: 'Approved' | 'Pending' | 'Review';
  readonly product: string;
  readonly quantity: number;
  readonly price: number;
  readonly total: number;
  readonly date: string;
  readonly active: boolean;
  readonly email: string;
  readonly role: string;
  readonly locked?: boolean;
  readonly country?: string;
  readonly company?: string;
  readonly representative?: string;
  readonly joinedDate?: string;
  readonly balance?: number;
  readonly activity?: number;
  readonly phone?: string;
  readonly lastUpdated?: string;
  readonly actions?: string;
  readonly industry?: string;
  readonly accountType?: string;
  readonly accountManager?: string;
  readonly requestedOn?: string;
  readonly requesterName?: string;
  readonly requesterCode?: string;
  readonly requesterId?: number;
  readonly requestType?: string;
  readonly requestPeriod?: string;
  readonly units?: number;
  readonly reviewers?: string;
  readonly reviewComment?: string;
}

const TABLE_DEMO_ROWS: readonly TableDemoRow[] = [
  {
    id: 1,
    code: 'ORD-2401',
    customer: 'Northstar Logistics',
    department: 'Operations',
    status: 'Approved',
    product: 'Routing workspace',
    quantity: 4,
    price: 320,
    total: 1280,
    date: '2026-07-18',
    active: true,
    email: 'ops@northstar.example',
    role: 'Manager',
  },
  {
    id: 2,
    code: 'ORD-2402',
    customer: 'Harbor & Pine',
    department: 'Sales',
    status: 'Pending',
    product: 'Retail analytics',
    quantity: 2,
    price: 480,
    total: 960,
    date: '2026-07-19',
    active: true,
    email: 'sales@harborpine.example',
    role: 'Analyst',
    locked: true,
  },
  {
    id: 3,
    code: 'ORD-2403',
    customer: 'Summit Field Services',
    department: 'Operations',
    status: 'Review',
    product: 'Field tablet',
    quantity: 8,
    price: 215,
    total: 1720,
    date: '2026-07-20',
    active: false,
    email: 'field@summit.example',
    role: 'Coordinator',
    locked: true,
  },
  {
    id: 4,
    code: 'ORD-2404',
    customer: 'Blue Cedar Technologies',
    department: 'Engineering',
    status: 'Approved',
    product: 'Developer seats',
    quantity: 12,
    price: 95,
    total: 1140,
    date: '2026-07-20',
    active: true,
    email: 'platform@bluecedar.example',
    role: 'Administrator',
  },
  {
    id: 5,
    code: 'ORD-2405',
    customer: 'Crescent Energy',
    department: 'Finance',
    status: 'Pending',
    product: 'Forecasting module',
    quantity: 3,
    price: 510,
    total: 1530,
    date: '2026-07-21',
    active: true,
    email: 'finance@crescent.example',
    role: 'Controller',
  },
  {
    id: 6,
    code: 'ORD-2406',
    customer: 'Oakline Property',
    department: 'Sales',
    status: 'Review',
    product: 'Growth subscription',
    quantity: 5,
    price: 260,
    total: 1300,
    date: '2026-07-22',
    active: false,
    email: 'accounts@oakline.example',
    role: 'Viewer',
  },
  {
    id: 7,
    code: 'ORD-2407',
    customer: 'Atlas Medical Group',
    department: 'Engineering',
    status: 'Approved',
    product: 'Secure workspace',
    quantity: 6,
    price: 375,
    total: 2250,
    date: '2026-07-22',
    active: true,
    email: 'systems@atlas.example',
    role: 'Administrator',
  },
  {
    id: 8,
    code: 'ORD-2408',
    customer: 'Willow Foods',
    department: 'Finance',
    status: 'Pending',
    product: 'Inventory planning',
    quantity: 4,
    price: 290,
    total: 1160,
    date: '2026-07-23',
    active: true,
    email: 'planning@willow.example',
    role: 'Manager',
  },
  {
    id: 9,
    code: 'ORD-2409',
    customer: 'Meridian Studio',
    department: 'Design',
    status: 'Review',
    product: 'Creative review',
    quantity: 9,
    price: 140,
    total: 1260,
    date: '2026-07-23',
    active: true,
    email: 'studio@meridian.example',
    role: 'Designer',
  },
  {
    id: 10,
    code: 'ORD-2410',
    customer: 'Redwood Education',
    department: 'Design',
    status: 'Approved',
    product: 'Learning portal',
    quantity: 7,
    price: 185,
    total: 1295,
    date: '2026-07-24',
    active: true,
    email: 'learning@redwood.example',
    role: 'Editor',
  },
  {
    id: 11,
    code: 'ORD-2411',
    customer: 'Granite Works',
    department: 'Operations',
    status: 'Pending',
    product: 'Quality tracker',
    quantity: 10,
    price: 125,
    total: 1250,
    date: '2026-07-24',
    active: false,
    email: 'quality@granite.example',
    role: 'Coordinator',
  },
  {
    id: 12,
    code: 'ORD-2412',
    customer: 'Sunline Travel',
    department: 'Sales',
    status: 'Approved',
    product: 'Booking insights',
    quantity: 3,
    price: 430,
    total: 1290,
    date: '2026-07-25',
    active: true,
    email: 'insights@sunline.example',
    role: 'Analyst',
  },
];

export class TableScenarioState {
  rows: readonly TableDemoRow[] = TABLE_DEMO_ROWS.map((row) => ({ ...row }));
  serverRows: readonly TableDemoRow[] = this.rows.slice(0, 5);
  selection: JTableSelection = [];
  first = 0;
  loading = false;
  eventMessage = 'No interaction yet.';
  expandedKeys: readonly string[] = [];
  filterModel: JTableFilterModel = { items: [], logicOperator: 'and' };
  readonly groupedFilterModel: JTableFilterModel = {
    items: [],
    logicOperator: 'and',
    groups: [
      {
        field: 'total',
        operator: 'and',
        constraints: [
          { value: 500, matchMode: 'greaterThanOrEqual' },
          { value: 2000, matchMode: 'lessThanOrEqual' },
        ],
      },
      {
        field: 'status',
        operator: 'or',
        constraints: [
          { value: 'Approved', matchMode: 'equals' },
          { value: 'Review', matchMode: 'equals' },
        ],
      },
    ],
  };

  filterModelForScenario(scenario: string): JTableFilterModel {
    return scenario.includes('multiple-filter-constraints') || scenario.includes('and-or-operators')
      ? this.groupedFilterModel
      : this.filterModel;
  }

  readonly statusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Review', value: 'Review' },
  ];

  readonly columns: readonly JTableColumn<TableDemoRow>[] = [
    {
      field: 'code',
      header: 'Customer ID',
      sortable: true,
      filterable: true,
      frozen: true,
      width: '9rem',
    },
    {
      field: 'customer',
      header: 'Customer',
      sortable: true,
      filterable: true,
      editable: true,
      minWidth: '13rem',
    },
    {
      field: 'status',
      header: 'Status',
      type: 'status',
      sortable: true,
      filterable: true,
      editable: true,
      filter: { type: 'select', operator: 'equals', options: this.statusOptions },
    },
    {
      field: 'total',
      header: 'Total',
      type: 'number',
      sortable: true,
      filterable: true,
      editable: true,
      align: 'end',
      formatter: (value) => `$${Number(value).toLocaleString('en-US')}`,
      validate: (value) => (Number(value) > 0 ? null : 'Total must be greater than zero.'),
    },
    {
      field: 'date',
      header: 'Joined date',
      type: 'date',
      sortable: true,
      filterable: true,
      editable: true,
    },
    {
      field: 'active',
      header: 'Active',
      type: 'boolean',
      sortable: true,
      filterable: true,
      editable: true,
      align: 'center',
    },
  ];

  readonly actionColumns: readonly JTableColumn<TableDemoRow>[] = [
    ...this.columns,
    {
      field: 'id',
      header: 'Actions',
      type: 'actions',
      frozen: true,
      frozenAlign: 'right',
      width: '7rem',
      actions: [
        {
          key: 'view',
          label: 'View details',
          icon: 'eye',
          command: (event) => this.onAction(event),
        },
        {
          key: 'edit',
          label: 'Edit order',
          icon: 'edit',
          command: (event) => this.onAction(event),
        },
        {
          key: 'delete',
          label: 'Delete order',
          severity: 'danger',
          command: (event) => this.onAction(event),
        },
      ],
    },
  ];

  readonly enterpriseRows: readonly TableDemoRow[] = this.rows.map((row, index) => {
    const requesterNames = [
      'Avery Stone',
      'Morgan Reed',
      'Jordan Blake',
      'Taylor Quinn',
      'Casey Brooks',
    ];
    const startDay = 8 + (index % 12);
    const units = (index % 5) + 1;
    const requesterName = requesterNames[index % requesterNames.length]!;
    return {
      ...row,
      requesterName,
      requesterCode: `REQ-${String(3101 + index).padStart(4, '0')}`,
      requesterId: 3101 + index,
      requestType: ['Resource booking', 'Schedule change', 'Access review', 'Service request'][
        index % 4
      ],
      requestPeriod: `${String(startDay).padStart(2, '0')}/07/2026 to ${String(startDay + units - 1).padStart(2, '0')}/07/2026`,
      units,
      requestedOn: `2026-07-${String(Math.max(1, startDay - 2)).padStart(2, '0')}`,
      reviewers: index % 3 === 0 ? 'Robin Lane, Sam Ellis' : 'Robin Lane',
      reviewComment: index % 3 === 2 ? 'Requirements confirmed.' : '',
      status: index % 4 === 3 ? 'Approved' : 'Pending',
      actions: '',
    };
  });

  readonly enterpriseColumns: readonly JTableColumn<TableDemoRow>[] = [
    jTableIndexColumn<TableDemoRow>('id'),
    {
      field: 'requesterName',
      header: 'Requester',
      sortable: true,
      filterable: true,
      width: '13.625rem',
      minWidth: '13.625rem',
      filter: {
        field: 'requesterId',
        type: 'select',
        operator: 'equals',
        hideOperator: true,
        options: [
          { label: 'Avery Stone', value: 3101 },
          { label: 'Morgan Reed', value: 3102 },
          { label: 'Jordan Blake', value: 3103 },
        ],
      },
    },
    {
      field: 'requestType',
      header: 'Request Type',
      sortable: true,
      filterable: true,
      width: '11.875rem',
      minWidth: '11.875rem',
      filter: {
        type: 'select',
        operator: 'equals',
        hideOperator: true,
        options: [
          { label: 'Resource booking', value: 'Resource booking' },
          { label: 'Schedule change', value: 'Schedule change' },
          { label: 'Access review', value: 'Access review' },
          { label: 'Service request', value: 'Service request' },
        ],
      },
    },
    {
      field: 'requestPeriod',
      header: 'Request Period',
      sortable: true,
      filterable: true,
      width: '12.5rem',
      minWidth: '12.5rem',
      filter: { type: 'date', operator: 'between' },
    },
    {
      field: 'units',
      header: 'Units',
      type: 'number',
      sortable: true,
      filterable: true,
      width: '6.375rem',
      minWidth: '6.375rem',
      filter: { type: 'number', operator: 'equals', hideOperator: true, min: 1 },
    },
    {
      field: 'requestedOn',
      header: 'Date of Requested',
      type: 'date',
      sortable: true,
      filterable: true,
      width: '10.625rem',
      minWidth: '10.625rem',
      filter: { type: 'date', operator: 'equals' },
    },
    {
      field: 'reviewers',
      header: 'Reviewers',
      sortable: false,
      width: '10.5rem',
      minWidth: '10.5rem',
    },
    {
      field: 'reviewComment',
      header: 'Review comment',
      sortable: false,
      width: '20rem',
      minWidth: '20rem',
    },
    {
      field: 'status',
      header: 'Status',
      type: 'status',
      sortable: true,
      filterable: true,
      frozen: true,
      frozenPosition: 'end',
      width: '12rem',
      minWidth: '12rem',
      filter: {
        type: 'multi-select',
        operator: 'in',
        hideOperator: true,
        options: [
          { label: 'Pending', value: 'Pending' },
          { label: 'Approved', value: 'Approved' },
        ],
      },
    },
    jTableActionsColumn<TableDemoRow>('actions'),
  ];

  readonly enterpriseTableConfig: JTableConfig = {
    pagination: true,
    filterDisplay: 'row',
    globalSearch: false,
    reorderableColumns: true,
    resizableColumns: true,
    maximizable: false,
    exportable: false,
    columnManager: false,
    density: 'compact',
    pageSize: 10,
    rowsPerPageOptions: [10, 25, 50],
    selectionMode: 'none',
  };

  requestMenuActions(row: TableDemoRow): readonly JTableAction[] {
    const actions: JTableAction[] = [
      { key: 'view', label: 'View request', icon: 'eye' },
      { key: 'review', label: 'Review request', icon: 'settings' },
    ];
    if (row.status !== 'Approved') {
      actions.push({
        key: 'delete',
        label: 'Delete request',
        icon: 'trash',
        severity: 'danger',
      });
    }
    return actions;
  }

  initials(value: string): string {
    return value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] ?? '')
      .join('');
  }

  statusSeverity(value: string): 'success' | 'warning' | 'info' | 'neutral' {
    return value === 'Approved'
      ? 'success'
      : value.toLowerCase().includes('pending')
        ? 'warning'
        : 'info';
  }

  readonly conditionalColumns: readonly JTableColumn<TableDemoRow>[] = this.columns.map((column) =>
    column.field === 'total'
      ? {
          ...column,
          cellClass: (row) => (row.total >= 1500 ? 'j-table-demo__high-value' : ''),
        }
      : column,
  );

  readonly groupedColumns: readonly JTableColumn<TableDemoRow>[] = [
    {
      field: 'department',
      header: 'Department',
      sortable: true,
      rowSpan: (row, index, rows) =>
        index > 0 && rows[index - 1]?.department === row.department
          ? 0
          : rows.filter((candidate) => candidate.department === row.department).length,
    },
    ...this.columns.slice(0, 4),
  ];

  readonly columnGroups: readonly JTableColumnGroupRow[] = [
    [
      { header: 'Account', colspan: 2 },
      { header: 'Customer details', colspan: 3 },
      { header: 'Availability', colspan: 1 },
    ],
  ];

  readonly wideColumns: readonly JTableColumn<TableDemoRow>[] = [
    ...this.columns.map((column, index) => ({
      ...column,
      frozen: index < 2 || column.field === 'active',
      frozenAlign: column.field === 'active' ? ('right' as const) : ('left' as const),
      responsivePriority: Math.min(5, index + 1),
    })),
    { field: 'department', header: 'Department', width: '11rem', responsivePriority: 3 },
    { field: 'product', header: 'Product', minWidth: '14rem', responsivePriority: 2 },
    {
      field: 'quantity',
      header: 'Quantity',
      type: 'number',
      align: 'end',
      width: '8rem',
      responsivePriority: 4,
    },
    {
      field: 'price',
      header: 'Unit price',
      type: 'number',
      align: 'end',
      width: '9rem',
      responsivePriority: 4,
    },
    { field: 'email', header: 'Contact', minWidth: '15rem', responsivePriority: 5 },
    { field: 'role', header: 'Role', width: '10rem', responsivePriority: 5 },
  ];

  readonly horizontalRows: readonly TableDemoRow[] = this.rows.map((row, index) => ({
    ...row,
    country: ['India', 'Canada', 'Germany', 'Japan'][index % 4],
    company: row.customer,
    representative: row.role,
    joinedDate: row.date,
    balance: row.total * 12,
    activity: 28 + ((index * 7) % 71),
    phone: `+1 555 01${String(index + 10).padStart(2, '0')}`,
    lastUpdated: `2026-07-${String(28 - (index % 5)).padStart(2, '0')} 10:${String(
      index * 4,
    ).padStart(2, '0')}`,
    actions: 'View',
  }));

  readonly horizontalColumns: readonly JTableColumn<TableDemoRow>[] = [
    { field: 'id', header: 'ID', width: '6rem', minWidth: '6rem' },
    { field: 'customer', header: 'Name', minWidth: '14rem' },
    { field: 'country', header: 'Country', minWidth: '12rem' },
    { field: 'company', header: 'Company', minWidth: '16rem' },
    { field: 'representative', header: 'Representative', minWidth: '14rem' },
    { field: 'status', header: 'Status', type: 'status', minWidth: '10rem' },
    { field: 'joinedDate', header: 'Joined date', type: 'date', minWidth: '12rem' },
    {
      field: 'balance',
      header: 'Balance',
      type: 'number',
      align: 'end',
      minWidth: '10rem',
      formatter: (value) => `$${Number(value).toLocaleString('en-US')}`,
    },
    { field: 'activity', header: 'Activity', type: 'number', minWidth: '10rem' },
    { field: 'email', header: 'Email', minWidth: '18rem' },
    { field: 'phone', header: 'Phone', minWidth: '12rem' },
    { field: 'lastUpdated', header: 'Last updated', minWidth: '13rem' },
    { field: 'actions', header: 'Actions', minWidth: '9rem' },
  ];

  readonly virtualRows: readonly TableDemoRow[] = Array.from({ length: 2500 }, (_, index) => {
    const source = TABLE_DEMO_ROWS[index % TABLE_DEMO_ROWS.length]!;
    return {
      ...source,
      id: index + 1,
      code: `ORD-${String(index + 1).padStart(5, '0')}`,
      total: source.total + (index % 17) * 25,
    };
  });

  readonly rowSelectable = (row: Readonly<Record<string, unknown>>) => row['locked'] !== true;
  readonly rowReorderable = (row: Readonly<Record<string, unknown>>) => row['locked'] !== true;
  readonly rowClass = (row: Readonly<Record<string, unknown>>) =>
    row['status'] === 'Review' ? 'j-table-demo__needs-review' : '';

  onSelection(selection: JTableSelection): void {
    this.selection = selection;
    const count = Array.isArray(selection) ? selection.length : selection ? 1 : 0;
    this.eventMessage = `${count} row(s) selected.`;
  }

  clearSelection(table: { clearSelection(): void }): void {
    table.clearSelection();
  }

  onPage(event: JTablePageChange): void {
    this.first = event.first;
    this.eventMessage = `Page ${event.page} selected with ${event.rows} rows.`;
  }

  onSort(event: JTableSort): void {
    this.eventMessage = `${event.field || 'Table'} sort direction: ${event.direction}.`;
  }

  onLazyLoad(event: JTableLazyLoadEvent): void {
    this.loading = true;
    this.serverRows = this.rows.slice(event.first, event.first + event.rows);
    this.loading = false;
    this.eventMessage = `Local server simulation loaded rows ${event.first + 1}–${Math.min(
      event.first + event.rows,
      this.rows.length,
    )}.`;
  }

  onRowReorder(event: JTableReorderEvent): void {
    this.rows = event.value as unknown as readonly TableDemoRow[];
    this.eventMessage = `Moved row ${event.dragIndex + 1} to ${event.dropIndex + 1}.`;
  }

  onCellEdit(event: JTableEditEvent): void {
    this.rows = this.rows.map((row) =>
      row.id === event.row['id'] ? { ...row, [String(event.field)]: event.value } : row,
    );
    this.eventMessage = `${event.field} saved for ${String(event.row['code'])}.`;
  }

  onRowEdit(event: JTableEditEvent): void {
    this.rows = this.rows.map((row) =>
      row.id === event.row['id'] ? ({ ...event.row } as unknown as TableDemoRow) : row,
    );
    this.eventMessage = `All editable fields saved for ${String(event.row['code'])}.`;
  }

  onAction(event: JTableActionEvent): void {
    this.eventMessage = `${event.action.label}: ${String(event.row['code'])}.`;
  }

  onExport(event: { preventDefault(): void; rows: readonly unknown[] }): void {
    event.preventDefault();
    this.eventMessage = `${event.rows.length} row(s) prepared for CSV export.`;
  }

  retry(): void {
    this.loading = true;
    this.eventMessage = 'Retry requested using local demo data.';
    this.loading = false;
  }
}

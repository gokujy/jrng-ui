# Productivity Components

jrng-ui includes stable first versions of advanced productivity components for generic application workflows. These components are intentionally API-first and extensible without depending on Angular Material components or a large third-party engine.

## Kanban

`j-kanban` renders columns and cards with native drag and drop between columns.

```ts
import { JKanbanColumn, JKanbanComponent } from 'jrng-ui/kanban';

readonly columns: JKanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      { id: 'task-1', title: 'Plan project', description: 'Prepare the project outline.' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [],
  },
];
```

```html
<j-kanban
  [value]="columns"
  (addCard)="addTask($event.column)"
  (removeCard)="removeTask($event.card)"
  (reorder)="saveBoard($event.columns)"
/>
```

Custom templates:

```html
<ng-template #jKanbanCard let-card>
  <strong>{{ card.title }}</strong>
  <small>{{ card.metadata }}</small>
</ng-template>

<ng-template #jKanbanColumn let-column>
  <strong>{{ column.title }}</strong>
  <span>{{ column.cards.length }}</span>
</ng-template>
```

Features include columns, cards, drag and drop between columns, card and column templates, add and remove events, reorder output, and empty column state.

## Gantt

`j-gantt` renders task timelines with day, week, or month scale.

```ts
import { JGanttComponent, JGanttTask } from 'jrng-ui/gantt';

readonly tasks: JGanttTask[] = [
  {
    id: 'project-plan',
    label: 'Project planning',
    start: '2026-07-01',
    end: '2026-07-08',
    progress: 60,
  },
  {
    id: 'task-build',
    label: 'Build task workflow',
    start: '2026-07-09',
    end: '2026-07-18',
    progress: 25,
    dependencies: ['project-plan'],
  },
];
```

```html
<j-gantt [tasks]="tasks" scale="week" />
```

Use `#jGanttTask` for custom bar content.

```html
<ng-template #jGanttTask let-task> {{ task.label }} - {{ task.progress }}% </ng-template>
```

Features include task labels, start and end dates, progress bars, optional dependency display, day/week/month scale, horizontal scrolling, and task templates.

## Calendar Scheduler

`j-calendar-scheduler` supports day, week, and month views with simple event layout.

```ts
import { JCalendarSchedulerComponent, JCalendarSchedulerEvent } from 'jrng-ui/calendar-scheduler';

readonly events: JCalendarSchedulerEvent[] = [
  {
    id: 'order-review',
    title: 'Order review',
    start: '2026-07-05',
    color: '#2563eb',
  },
  {
    id: 'invoice-check',
    title: 'Invoice check',
    start: '2026-07-08',
    end: '2026-07-09',
  },
];
```

```html
<j-calendar-scheduler
  [events]="events"
  [(view)]="schedulerView"
  [(activeDate)]="activeDate"
  (eventClick)="openEvent($event.event)"
  (dateClick)="createEvent($event.date)"
/>
```

Features include day, week, and month views, event click, date click, today, next, previous, and simple multi-day event placement.

## Design Rules

Use generic examples such as User, Product, Customer, Order, Invoice, Project, Task, and Team. Do not copy source code, CSS, docs, examples, naming, or exact visual design from external productivity tools or UI libraries. Component selectors use the `j-*` prefix and CSS classes use the `.j-*` prefix.

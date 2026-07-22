export interface DocsGuide {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly problem: string;
  readonly implementation: readonly string[];
  readonly code: string;
  readonly explanation: readonly string[];
  readonly accessibility: readonly string[];
  readonly mistakes: readonly string[];
  readonly related: readonly { name: string; slug: string }[];
}

const related = (...items: readonly string[]) =>
  items.map((item) => ({ name: item, slug: item.toLowerCase().replaceAll(' ', '-') }));

export const guides: readonly DocsGuide[] = [
  {
    slug: 'admin-dashboard',
    title: 'Build an Angular admin dashboard with JRNG UI',
    description:
      'Create a responsive Angular dashboard UI with a shell, metrics, charts and operational data.',
    problem:
      'Admin dashboards need clear hierarchy, responsive navigation, loading states and dense data without rebuilding common controls.',
    implementation: [
      'Use JAppShellComponent as the responsive page frame.',
      'Compose metrics with JCardComponent and render trends with JChartComponent.',
      'Keep typed records in a service and present recent data with JTableComponent.',
    ],
    code: `import { Component, inject } from '@angular/core';
import { JAppShellComponent } from 'jrng-ui/app-shell';
import { JCardComponent } from 'jrng-ui/card';
import { JChartComponent } from 'jrng-ui/chart';

@Component({
  selector: 'app-dashboard',
  imports: [JAppShellComponent, JCardComponent, JChartComponent],
  template: \`<j-app-shell>
    <nav jShellSidebar aria-label="Application">...</nav>
    <header jShellHeader><h1>Operations</h1></header>
    <section class="metrics"><j-card header="Active users" subheader="1,284"><span>+8.4%</span></j-card></section>
    <j-chart type="line" [data]="activity" ariaLabel="Weekly completed requests" />
  </j-app-shell>\`,
})
export class DashboardComponent { readonly activity = { labels: ['Mon','Tue','Wed'], datasets: [{ label: 'Completed', data: [32,45,51] }] }; }`,
    explanation: [
      'The shell owns desktop and mobile layout behavior.',
      'Semantic tokens keep cards and charts consistent in light and dark themes.',
      'Lazy-load dashboard routes so unrelated admin areas remain separate chunks.',
    ],
    accessibility: [
      'Give primary navigation an accessible name.',
      'Provide an ariaLabel and equivalent values for each chart.',
      'Do not communicate metric direction with color alone.',
    ],
    mistakes: [
      'Putting all routes in one eagerly loaded component.',
      'Using fixed dashboard widths that overflow on mobile.',
      'Showing charts without a textual purpose or empty state.',
    ],
    related: related('App Shell', 'Metric Card', 'Chart', 'Table'),
  },
  {
    slug: 'server-side-data-table',
    title: 'Create a server-side Angular data table',
    description:
      'Coordinate filtering, sorting and pagination for an Angular data table backed by an API.',
    problem:
      'Large datasets cannot be filtered and paginated reliably in the browser, and stale requests can overwrite newer table state.',
    implementation: [
      'Keep page, sort and filter state typed.',
      'Handle lazy-load output in one service method.',
      'Show loading, empty and retryable error states.',
    ],
    code: `import { Component, signal } from '@angular/core';
import { JDataGridComponent } from 'jrng-ui/data-grid';
import { JTableLazyLoadEvent } from 'jrng-ui/table';

@Component({
  selector: 'app-orders', imports: [JDataGridComponent],
  template: \`<j-data-grid title="Orders" [value]="rows()" [columns]="columns" [loading]="loading()" [totalRecords]="total()" (lazyLoad)="load($event)" />\`,
})
export class OrdersComponent {
  readonly rows = signal<readonly Readonly<Record<string, unknown>>[]>([]); readonly total = signal(0); readonly loading = signal(false);
  readonly columns = [{ field: 'reference', header: 'Reference' }, { field: 'status', header: 'Status' }];
  load(request: JTableLazyLoadEvent): void { /* cancel the previous request, then query the API with request state */ }
}`,
    explanation: [
      'The grid emits one request shape for server operations.',
      'The API remains responsible for total count and current page rows.',
      'Cancel or ignore superseded requests before updating signals.',
    ],
    accessibility: [
      'Name filter controls and row actions.',
      'Announce load failures and result-count changes.',
      'Keep keyboard focus stable after page updates.',
    ],
    mistakes: [
      'Combining client sorting with server pagination.',
      'Using array index as row identity.',
      'Clearing visible rows during every background refresh.',
    ],
    related: related('Data Grid', 'Table', 'Filter Bar', 'Paginator'),
  },
  {
    slug: 'reactive-forms',
    title: 'Build Angular Reactive Forms with JRNG UI',
    description: 'Create typed, validated Angular Reactive Forms using JRNG UI form controls.',
    problem:
      'Business forms need consistent validation timing, accessible error text and safe asynchronous submission.',
    implementation: [
      'Use non-nullable typed controls.',
      'Bind JRNG UI controls with formControlName.',
      'Show errors after touch or submit and disable repeated saves.',
    ],
    code: `import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';

@Component({ selector: 'app-profile', imports: [ReactiveFormsModule, JButtonComponent, JInputComponent], template: \`
<form [formGroup]="form" (ngSubmit)="save()">
  <j-input label="Visible name" formControlName="name" required [invalid]="submitted() && form.controls.name.invalid" error="Visible name is required." />
  <j-button label="Save" type="submit" [loading]="saving()" />
</form>\` })
export class ProfileComponent { readonly submitted = signal(false); readonly saving = signal(false); readonly form = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: Validators.required }) }); save(): void { this.submitted.set(true); if (this.form.invalid) return; } }`,
    explanation: [
      'ControlValueAccessor keeps Angular as the form-state source of truth.',
      'Submit buttons use native form submission; onClick is for non-submit actions.',
      'Map API validation errors back to controls without replacing client validators.',
    ],
    accessibility: [
      'Keep labels visible.',
      'Associate errors with the relevant control.',
      'Move focus to an error summary only when it improves a long form.',
    ],
    mistakes: [
      'Showing errors before the user interacts.',
      'Mixing ngModel with formControlName.',
      'Allowing repeated submission while a request is pending.',
    ],
    related: related('Input', 'Select', 'MultiSelect', 'Date Picker', 'Button'),
  },
  {
    slug: 'dark-mode',
    title: 'Implement dark mode',
    description: 'Add SSR-safe light, dark and system modes with JRNG UI semantic tokens.',
    problem:
      'A theme switch must update components consistently, respect system preference and avoid a server-rendering mismatch.',
    implementation: [
      'Register the JRNG UI theme provider.',
      'Use JThemeService instead of direct class manipulation.',
      'Customize semantic tokens and verify contrast in both modes.',
    ],
    code: `import { ApplicationConfig, Component, inject } from '@angular/core';
import { provideJrngTheme, JThemeService } from 'jrng-ui/theming';

export const appConfig: ApplicationConfig = { providers: [provideJrngTheme()] };

@Component({ selector: 'app-theme-switch', template: \`<button type="button" (click)="toggle()" [attr.aria-label]="'Theme: ' + theme.mode()">Theme</button>\` })
export class ThemeSwitchComponent { readonly theme = inject(JThemeService); toggle(): void { this.theme.setMode(this.theme.mode() === 'dark' ? 'light' : 'dark'); } }`,
    explanation: [
      'The service applies the mode through the documented theme contract.',
      'System mode follows the platform preference.',
      'Semantic tokens prevent per-component dark overrides.',
    ],
    accessibility: [
      'Announce the current mode in the control name.',
      'Verify focus rings and state colors in both themes.',
      'Do not force motion during theme transitions.',
    ],
    mistakes: [
      'Editing component internals instead of tokens.',
      'Reading localStorage directly during SSR.',
      'Using pure black and white without contrast testing.',
    ],
    related: related('Theme', 'Button', 'Switch'),
  },
  {
    slug: 'confirmation-workflows',
    title: 'Create confirmation workflows',
    description:
      'Implement accessible, non-duplicated confirmation dialogs and anchored confirmation popups.',
    problem:
      'Destructive actions need clear consequences, focus containment and protection from duplicate requests.',
    implementation: [
      'Render one shared confirm-dialog container.',
      'Open requests through JConfirmationService.',
      'Use explicit labels and handle the asynchronous action once.',
    ],
    code: `import { Component, inject } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JConfirmationService } from 'jrng-ui/confirm-dialog';

@Component({ selector: 'app-delete', imports: [JButtonComponent], template: \`<j-button label="Delete" severity="danger" (onClick)="confirm()" />\` })
export class DeleteComponent { private readonly confirmation = inject(JConfirmationService); confirm(): void { this.confirmation.confirm({ header: 'Delete record?', message: 'This action cannot be undone.', acceptLabel: 'Delete', rejectLabel: 'Cancel', accept: () => this.remove() }); } private remove(): void {} }`,
    explanation: [
      'The service separates the requesting component from overlay rendering.',
      'Targeted requests belong to confirm-popup; untargeted requests belong to confirm-dialog.',
      'Keep server failures visible and retain a retry path.',
    ],
    accessibility: [
      'Focus is contained while open and restored after close.',
      'Escape rejects when enabled.',
      'Labels name the actual outcome.',
    ],
    mistakes: [
      'Rendering multiple shared containers.',
      'Using generic OK labels.',
      'Closing before reporting a failed destructive request.',
    ],
    related: related('Confirm Dialog', 'Confirm Popup', 'Button', 'Toast'),
  },
  {
    slug: 'responsive-business-layouts',
    title: 'Build responsive business layouts',
    description:
      'Compose application shells, dashboards, forms and data regions that adapt without losing hierarchy.',
    problem:
      'Dense business pages often overflow or hide essential actions when navigation and content do not share responsive rules.',
    implementation: [
      'Use App Shell for primary regions.',
      'Use Grid Layout or normal CSS Grid and Flexbox for local composition.',
      'Move navigation into an accessible mobile overlay at narrow widths.',
    ],
    code: `import { Component } from '@angular/core';
import { JAppShellComponent } from 'jrng-ui/app-shell';
import { JGridLayoutComponent } from 'jrng-ui/grid-layout';

@Component({ selector: 'app-layout', imports: [JAppShellComponent, JGridLayoutComponent], template: \`
<j-app-shell>
  <nav jShellSidebar aria-label="Application">...</nav>
  <header jShellHeader>Workspace</header>
  <j-grid-layout [columns]="3" minItemWidth="16rem"><ng-content /></j-grid-layout>
</j-app-shell>\` })
export class BusinessLayoutComponent {}`,
    explanation: [
      'The shell owns top-level navigation breakpoints.',
      'Minimum item width lets cards stack naturally.',
      'Content order remains meaningful without CSS positioning.',
    ],
    accessibility: [
      'Expose expanded state on mobile navigation.',
      'Return focus to the menu trigger.',
      'Preserve heading hierarchy when regions stack.',
    ],
    mistakes: [
      'Duplicating desktop and mobile navigation DOM.',
      'Fixed pixel columns for variable content.',
      'Removing visible labels to save space.',
    ],
    related: related('App Shell', 'Grid Layout', 'Card', 'Responsive Sidebar'),
  },
  {
    slug: 'ssr',
    title: 'Use JRNG UI with SSR',
    description:
      'Render JRNG UI on the server while safely isolating browser-only application behavior.',
    problem:
      'Direct browser globals and client-only state can break server rendering or cause hydration differences.',
    implementation: [
      'Import JRNG UI components normally.',
      'Guard application browser APIs with platform checks.',
      'Use stable initial values shared by server and client.',
    ],
    code: `import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

@Component({ selector: 'app-safe-action', imports: [JButtonComponent], template: \`<j-button label="Copy link" [disabled]="!browser" (onClick)="copy()" />\` })
export class SafeActionComponent { readonly browser = isPlatformBrowser(inject(PLATFORM_ID)); copy(): void { if (!this.browser) return; void navigator.clipboard.writeText(location.href); } }`,
    explanation: [
      'JRNG UI guards its overlay, storage, chart and theme browser integration.',
      'Application code remains responsible for its own globals.',
      'Optional browser libraries load only when their component is used.',
    ],
    accessibility: [
      'Disabled server-only actions retain a clear label.',
      'Do not shift focus during hydration.',
      'Keep server and client announcements consistent.',
    ],
    mistakes: [
      'Reading window at module scope.',
      'Generating different IDs on server and client.',
      'Rendering a loading state only after hydration without reserving layout.',
    ],
    related: related('Core', 'Clipboard', 'Chart', 'Tour Guide'),
  },
  {
    slug: 'zoneless',
    title: 'Use JRNG UI with zoneless Angular',
    description:
      'Configure zoneless Angular and keep asynchronous JRNG UI workflows explicit and predictable.',
    problem:
      'Zoneless applications require state changes to flow through Angular-aware primitives rather than implicit global patching.',
    implementation: [
      'Enable provideZonelessChangeDetection.',
      'Use signals, model inputs and Reactive Forms.',
      'Update state explicitly after asynchronous work.',
    ],
    code: `import { ApplicationConfig, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

export const appConfig: ApplicationConfig = { providers: [provideZonelessChangeDetection()] };

@Component({ selector: 'app-save', imports: [JButtonComponent], template: \`<j-button label="Save" [loading]="saving()" (onClick)="save()" />\` })
export class SaveComponent { readonly saving = signal(false); async save(): Promise<void> { this.saving.set(true); try { await Promise.resolve(); } finally { this.saving.set(false); } } }`,
    explanation: [
      'Signal writes notify Angular without Zone.js.',
      'JRNG UI model and output APIs use explicit state transitions.',
      'Keep external callbacks at service boundaries and update signals from them.',
    ],
    accessibility: [
      'Loading state remains announced and prevents duplicate actions.',
      'Focus behavior does not depend on delayed global change detection.',
      'Test overlays and keyboard dismissal without Zone.js.',
    ],
    mistakes: [
      'Mutating untracked objects.',
      'Expecting arbitrary callbacks to refresh templates.',
      'Using timers to force change detection.',
    ],
    related: related('Button', 'Core', 'Reactive Forms'),
  },
];

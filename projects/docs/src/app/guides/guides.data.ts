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
import { JTableComponent, JTableLazyLoadEvent } from 'jrng-ui/table';

@Component({
  selector: 'app-orders', imports: [JTableComponent],
  template: \`<j-table title="Orders" dataMode="server" paginator [value]="rows()" [columns]="columns" [loading]="loading()" [totalRecords]="total()" (lazyLoad)="load($event)" />\`,
})
export class OrdersComponent {
  readonly rows = signal<readonly Readonly<Record<string, unknown>>[]>([]); readonly total = signal(0); readonly loading = signal(false);
  readonly columns = [{ field: 'reference', header: 'Reference' }, { field: 'status', header: 'Status' }];
  load(request: JTableLazyLoadEvent): void { /* cancel the previous request, then query the API with request state */ }
}`,
    explanation: [
      'The table emits one request shape for server operations.',
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
    related: related('Table', 'Filter Bar', 'Paginator'),
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
    slug: 'interaction-foundations',
    title: 'Use portals, gestures, middle truncation and drag-drop',
    description:
      'Compose dynamic Angular content and accessible pointer interactions with the JRNG UI foundations.',
    problem:
      'Dynamic content, touch gestures and reordering need consistent lifecycle, cancellation, SSR and keyboard behavior instead of repeated page-level listeners.',
    implementation: [
      'Import each foundation from its modular jrng-ui entrypoint.',
      'Attach templates or components through a portal outlet and destroy the returned reference.',
      'Consume structured gesture events and keep rendering state in the owning component.',
      'Provide keyboard reorder commands and visible action alternatives for every essential pointer interaction.',
    ],
    code: `import { Component } from '@angular/core';
import { JDragDirective, JDropListDirective } from 'jrng-ui/drag-drop';
import { JPanDirective, JSwipeDirective, JZoomDirective } from 'jrng-ui/gesture';
import { JPortalDirective, JPortalOutletDirective } from 'jrng-ui/portal';
import { JTruncateMiddleDirective } from 'jrng-ui/truncate';

@Component({
  selector: 'app-customer-tools',
  imports: [JDragDirective, JDropListDirective, JPanDirective, JSwipeDirective, JZoomDirective, JPortalDirective, JPortalOutletDirective, JTruncateMiddleDirective],
  template: \`
    <ng-template [jPortal]="outlet" #toolbar="jPortal">Customer toolbar</ng-template>
    <div jPortalOutlet #outlet="jPortalOutlet"></div>
    <span [jTruncateMiddle]="'customer-contract-final.pdf'" preserveExtension></span>
    <div jSwipe jPan jZoom aria-label="Customer canvas"></div>
    <div jDropList [(data)]="customers">
      @for (customer of customers; track customer) {
        <div jDrag [data]="customer" [dragLabel]="customer">{{ customer }}</div>
      }
    </div>
  \`,
})
export class CustomerToolsComponent {
  customers = ['Aster Labs', 'Northstar'];
}`,
    explanation: [
      'JTemplatePortal and JComponentPortal preserve Angular injection and lifecycle; JDomPortal restores its original DOM position on detach.',
      'Swipe, pan and zoom emit data without imposing transforms, which keeps application rendering and reduced-motion choices explicit.',
      'Middle truncation can use a character budget or measured width and retains the full accessible value.',
      'Connected drop lists emit previous and current containers and update two-way-bound data while Escape restores the original state.',
      'Portal DOM movement and all observers are browser guarded; template and component portals remain safe during SSR.',
      'Inputs update synchronously for zoneless Angular. Pointer listeners, observers, views and previews are removed on destroy.',
    ],
    accessibility: [
      'Essential swipe, pan and zoom operations need named buttons or keyboard commands that perform the same action.',
      'Drag items support Control plus Arrow keys, announce movement and restore focus after keyboard reorder.',
      'Middle-truncated text retains the full value through aria-label and an optional title.',
      'Disabled drag items and lists expose aria-disabled and do not begin pointer or keyboard movement.',
      'Use semantic theme tokens for previews, placeholders and focus states; high-contrast mode must retain a visible outline.',
    ],
    mistakes: [
      'Attaching one portal instance to multiple outlets at the same time.',
      'Applying both touch and pointer listeners for the same interaction.',
      'Starting a drag from a button, link, form field or text selection.',
      'Using gesture-only controls without a keyboard-accessible alternative.',
    ],
    related: related('Button', 'Menu', 'Tooltip', 'Tree'),
  },
  {
    slug: 'hierarchical-inputs',
    title: 'Build hierarchical inputs, mentions, and split actions',
    description:
      'Compose customer workflows with Split Button, Tree Select, Cascader, Mention, and Table row selection.',
    problem:
      'Hierarchical choices, caret suggestions, and related actions need distinct keyboard models while sharing form, overlay, theme, and accessibility foundations.',
    implementation: [
      'Import each feature from its modular jrng-ui entrypoint.',
      'Bind Tree Select and Cascader through Angular Forms and use stable node or option values.',
      'Configure Mention triggers and a synchronous or promise-based data source.',
      'Pass columns to the existing Select only when structured option comparison is useful.',
    ],
    code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JCascaderComponent } from 'jrng-ui/cascader';
import { JMentionDirective } from 'jrng-ui/mention';
import { JSelectComponent } from 'jrng-ui/select';
import { JSplitButtonComponent } from 'jrng-ui/split-button';
import { JTreeSelectComponent } from 'jrng-ui/tree-select';

@Component({
  selector: 'app-customer-routing',
  imports: [FormsModule, JCascaderComponent, JMentionDirective, JSelectComponent, JSplitButtonComponent, JTreeSelectComponent],
  template: \`
    <j-tree-select label="Customer segment" [nodes]="segments" [(ngModel)]="segment" />
    <j-cascader label="Location" [options]="locations" [(ngModel)]="location" />
    <textarea [jMention]="people" placeholder="Mention an account manager"></textarea>
    <j-select label="Customer" [options]="customers" [columns]="columns" optionLabel="name" optionValue="id" />
    <j-split-button label="Save customer" [model]="saveActions" (primaryAction)="save()" />
  \`,
})
export class CustomerRoutingComponent {}`,
    explanation: [
      'Tree Select reuses JRNG Tree semantics while Cascader provides path-oriented columns.',
      'Mention positions a listbox at the caret and discards stale asynchronous responses.',
      'Multi-column Select is opt-in and preserves the existing flat Select API.',
      'All panels restore focus and detach their overlay resources on close or destroy.',
    ],
    accessibility: [
      'Every pointer interaction has a complete keyboard path and visible focus.',
      'Loading and error states use live-region semantics.',
      'Narrow layouts retain named controls and logical RTL positioning.',
      'Disabled and read-only states block modification through every interaction path.',
    ],
    mistakes: [
      'Using Cascader for multi-branch selection instead of Tree Select.',
      'Making a gesture or caret suggestion the only way to complete an essential task.',
      'Using unstable object identity for tree keys or final cascader values.',
      'Adding another Select component instead of enabling columns on j-select.',
    ],
    related: related('Split Button', 'Tree Select', 'Cascader', 'Select'),
  },
  {
    slug: 'layout-behaviors',
    title: 'Build editable, anchored, affixed, and watermarked surfaces',
    description:
      'Use Inplace, Anchor, Affix, and Watermark for focused customer-detail and document layouts.',
    problem:
      'Long business surfaces need compact editing, section navigation, persistent actions, and document classification without losing keyboard access, layout stability, or SSR safety.',
    implementation: [
      'Use Inplace templates for display, editor, and action modes.',
      'Provide stable section ids to Anchor and configure any fixed-header offset.',
      'Apply jAffix to an existing toolbar and identify its scroll and boundary containers.',
      'Wrap content with Watermark and use a low-opacity text or image tile.',
    ],
    code: `import { Component } from '@angular/core';
import { JAffixDirective } from 'jrng-ui/affix';
import { JAnchorComponent } from 'jrng-ui/anchor';
import { JInplaceComponent } from 'jrng-ui/inplace';
import { JWatermarkComponent } from 'jrng-ui/watermark';

@Component({
  selector: 'app-customer-detail',
  imports: [JAffixDirective, JAnchorComponent, JInplaceComponent, JWatermarkComponent],
  template: \`
    <j-anchor [links]="sections" [offset]="64" />
    <div jAffix [offset]="64">Customer filters</div>
    <j-watermark [text]="['INTERNAL', customer.company]">
      <j-inplace>Customer details</j-inplace>
    </j-watermark>
  \`,
})
export class CustomerDetailComponent {}`,
    explanation: [
      'Inplace lazily creates editor content and restores focus after save or cancel.',
      'Anchor observes sections only in the browser and retains direct fragment navigation as a fallback.',
      'Affix inserts a measured placeholder so fixed positioning does not shift surrounding content.',
      'Watermark is decorative, pointer-transparent, dynamically generated, and printable.',
    ],
    accessibility: [
      'Every editable and navigation action is keyboard accessible with visible focus.',
      'Affix does not reorder the document or add a focus stop.',
      'Watermark is hidden from assistive technology and never blocks projected controls.',
      'Reduced-motion preferences disable smooth Anchor scrolling.',
    ],
    mistakes: [
      'Affixing content without a boundary in a long nested scroll surface.',
      'Using duplicate or unstable section ids.',
      'Using a watermark as an authorization mechanism.',
      'Hiding save errors or allowing duplicate async saves.',
    ],
    related: related('Inplace', 'Anchor', 'Watermark', 'Button'),
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

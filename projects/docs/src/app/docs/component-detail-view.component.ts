import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JBreadcrumbComponent, JBreadcrumbItem } from 'jrng-ui/breadcrumb';
import { JButtonComponent } from 'jrng-ui/button';
import { JCardComponent } from 'jrng-ui/card';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JDialogComponent } from 'jrng-ui/dialog';
import { JEmptyStateComponent } from 'jrng-ui/empty-state';
import { JIconComponent } from 'jrng-ui/icon';
import { JInputComponent } from 'jrng-ui/input';
import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';
import { JMetricCardComponent } from 'jrng-ui/metric-card';
import { JPageHeaderComponent } from 'jrng-ui/page-header';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JProgressBarComponent } from 'jrng-ui/progress-bar';
import { JRadioComponent } from 'jrng-ui/radio';
import { JSelectComponent } from 'jrng-ui/select';
import { JSkeletonComponent } from 'jrng-ui/skeleton';
import { JResponsiveSidebarComponent } from 'jrng-ui/responsive-sidebar';
import { JStatCardComponent } from 'jrng-ui/stat-card';
import { JStatusChipComponent } from 'jrng-ui/status-chip';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JTabComponent, JTabsComponent } from 'jrng-ui/tabs';
import { JTagComponent } from 'jrng-ui/tag';
import { JTableColumn, JTableComponent } from 'jrng-ui/table';
import { JTextareaComponent } from 'jrng-ui/textarea';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JrToastContainerComponent, JrToastService } from 'jrng-ui/toast';
import { ComponentDoc } from './docs-types';
import { CodeBlockComponent } from './code-block.component';

type DetailTab = 'preview' | 'code';

@Component({
  selector: 'app-component-detail-view',
  imports: [
    FormsModule,
    CodeBlockComponent,
    JBadgeComponent,
    JBreadcrumbComponent,
    JButtonComponent,
    JCardComponent,
    JCheckboxComponent,
    JDialogComponent,
    JEmptyStateComponent,
    JIconComponent,
    JInputComponent,
    JMenuComponent,
    JMetricCardComponent,
    JPageHeaderComponent,
    JPopoverComponent,
    JProgressBarComponent,
    JRadioComponent,
    JSelectComponent,
    JSkeletonComponent,
    JResponsiveSidebarComponent,
    JStatCardComponent,
    JStatusChipComponent,
    JSwitchComponent,
    JTabComponent,
    JTabsComponent,
    JTagComponent,
    JTableComponent,
    JTextareaComponent,
    JTooltipDirective,
    JrToastContainerComponent,
  ],
  template: `
    <article class="j-doc-detail">
      <header class="j-doc-detail__header">
        <div class="j-doc-detail__title">
          <span class="j-doc-icon"><j-icon [name]="doc().icon" /></span>
          <div>
            <p class="j-page-eyebrow">{{ doc().category }}</p>
            <h2>{{ doc().name }}</h2>
          </div>
        </div>
        <span class="j-status-badge" [attr.data-status]="doc().status">{{ doc().status }}</span>
      </header>

      <p class="j-doc-lead">{{ doc().description }}</p>

      <dl class="j-doc-meta">
        <div>
          <dt>Selector / usage</dt>
          <dd><code>{{ doc().selector }}</code></dd>
        </div>
        <div>
          <dt>Import</dt>
          <dd><code>{{ doc().importPath }}</code></dd>
        </div>
      </dl>

      <section class="j-callout">
        <j-icon name="lightbulb" />
        <div>
          <strong>When to use</strong>
          <p>{{ doc().whenToUse }}</p>
        </div>
      </section>

      <section class="j-preview-code-tabs" aria-label="Component preview and code">
        <div class="j-doc-tabs" role="tablist" aria-label="Preview and code">
          <button type="button" [class.is-active]="activeTab() === 'preview'" (click)="activeTab.set('preview')">
            <j-icon name="component" />
            Preview
          </button>
          <button type="button" [class.is-active]="activeTab() === 'code'" (click)="activeTab.set('code')">
            <j-icon name="code-xml" />
            Code
          </button>
        </div>

        @if (activeTab() === 'preview') {
          <div class="j-preview-card">
            <div class="j-preview-card__header">
              <div>
                <strong>{{ doc().name }} preview</strong>
                <span>Live examples using the current component API.</span>
              </div>
            </div>
            <div class="j-preview-surface">
              @switch (doc().slug) {
                @case ('input') {
                  <div class="j-preview-grid">
                    <j-input label="Email" placeholder="name@example.com" />
                    <j-input label="Search" type="search" value="orders" clearable />
                    <j-input label="Disabled" value="Read only value" disabled />
                    <j-input label="Email" invalid error="Enter a valid email address" />
                  </div>
                }
                @case ('textarea') {
                  <div class="j-preview-grid">
                    <j-textarea label="Message" placeholder="Write a short message" showCount [maxLength]="120" />
                    <j-textarea label="Disabled note" placeholder="Existing support note" disabled />
                    <j-textarea label="Required bio" invalid error="Bio is required" />
                  </div>
                }
                @case ('select') {
                  <div class="j-preview-grid">
                    <j-select label="Status" [options]="statuses" placeholder="Choose status" clearable />
                    <j-select label="Searchable team" [options]="teams" optionLabel="name" optionValue="id" searchable />
                    <j-select label="Loading" [options]="statuses" loading />
                    <j-select label="Required" [options]="statuses" invalid error="Choose a status" />
                  </div>
                }
                @case ('checkbox') {
                  <div class="j-preview-row">
                    <j-checkbox label="Send receipt" [(ngModel)]="checked" />
                    <j-checkbox label="Partial selection" indeterminate />
                    <j-checkbox label="Disabled" disabled />
                    <j-checkbox label="Invalid" invalid error="Required" />
                  </div>
                }
                @case ('radio') {
                  <div class="j-preview-row">
                    <j-radio name="plan-docs" label="Starter" value="starter" [(ngModel)]="plan" />
                    <j-radio name="plan-docs" label="Pro" value="pro" [(ngModel)]="plan" />
                    <j-radio name="plan-docs" label="Enterprise" value="enterprise" disabled [(ngModel)]="plan" />
                  </div>
                }
                @case ('switch') {
                  <div class="j-preview-row">
                    <j-switch label="Email alerts" [(ngModel)]="enabled" />
                    <j-switch onLabel="Published" offLabel="Draft" [(ngModel)]="published" />
                    <j-switch label="Disabled" disabled />
                    <j-switch label="Large" size="lg" [(ngModel)]="enabled" />
                  </div>
                }
                @case ('button') {
                  <div class="j-preview-stack">
                    <div class="j-preview-row">
                      <j-button label="Primary" />
                      <j-button label="Secondary" severity="secondary" />
                      <j-button label="Danger" severity="danger" />
                      <j-button label="Outline" variant="outline" />
                      <j-button label="Ghost" variant="ghost" />
                    </div>
                    <div class="j-preview-row">
                      <j-button label="Small" size="sm" />
                      <j-button label="Large" size="lg" />
                      <j-button label="Saving" loading />
                      <j-button label="Disabled" disabled />
                    </div>
                  </div>
                }
                @case ('icon-button') {
                  <div class="j-preview-row">
                    <button class="j-doc-icon-button" type="button" aria-label="Search" jTooltip="Search">
                      <j-icon name="search" />
                    </button>
                    <button class="j-doc-icon-button" type="button" aria-label="Settings" jTooltip="Settings">
                      <j-icon name="settings" />
                    </button>
                    <button class="j-doc-icon-button j-doc-icon-button--ghost" type="button" aria-label="Copy" jTooltip="Copy">
                      <j-icon name="copy" />
                    </button>
                    <button class="j-doc-icon-button" type="button" aria-label="Disabled" disabled>
                      <j-icon name="filter" />
                    </button>
                  </div>
                }
                @case ('card') {
                  <div class="j-preview-grid j-preview-grid--cards">
                    <j-card title="Revenue" subtitle="This month" elevated>
                      <strong class="j-metric">$42,800</strong>
                      <p>12% higher than last month.</p>
                    </j-card>
                    <j-card title="Tasks" subtitle="Team workload" bordered>
                      <j-progress-bar [value]="68" label="Task completion" />
                    </j-card>
                    <j-card title="Loading" skeleton />
                  </div>
                }
                @case ('badge') {
                  <div class="j-preview-row">
                    <j-badge value="12" />
                    <j-badge value="Active" severity="success" />
                    <j-badge value="Warning" severity="warning" />
                    <j-badge value="Error" severity="danger" />
                    <j-badge value="Info" severity="info" size="lg" />
                  </div>
                }
                @case ('tag') {
                  <div class="j-preview-row">
                    <j-tag label="Design" />
                    <j-tag label="Published" severity="success" rounded />
                    <j-tag label="Blocked" severity="danger" />
                    <j-tag label="Filter" removable removeLabel="Remove Filter" />
                  </div>
                }
                @case ('table') {
                  <j-table
                    [value]="orders"
                    [columns]="orderColumns"
                    striped
                    hover
                    paginator
                    [rows]="3"
                    showGlobalFilter
                    showColumnManager
                    showExport
                  />
                }
                @case ('metric-card') {
                  <div class="j-preview-grid j-preview-grid--cards">
                    <j-metric-card title="Revenue" value="$42.8k" trend="up" trendLabel="+12%" icon="$" footer="Month to date" />
                    <j-metric-card title="Churn" value="1.8%" trend="down" trendLabel="-0.4%" icon="%" footer="Rolling 30 days" />
                    <j-metric-card title="Loading" loading />
                  </div>
                }
                @case ('stat-card') {
                  <div class="j-preview-grid j-preview-grid--cards">
                    <j-stat-card title="Open orders" value="128" trend="up" trendLabel="+18 today" icon="#" footer="Updated 4 minutes ago" />
                    <j-stat-card title="SLA risk" value="7" trend="neutral" trendLabel="Stable" icon="!" footer="Across active queues" />
                    <j-stat-card title="Loading" loading />
                  </div>
                }
                @case ('status-chip') {
                  <div class="j-preview-row">
                    <j-status-chip label="Ready" severity="success" />
                    <j-status-chip label="Review" severity="warning" />
                    <j-status-chip label="Blocked" severity="danger" />
                    <j-status-chip label="Queued" severity="info" />
                    <j-status-chip label="Neutral" severity="neutral" />
                  </div>
                }
                @case ('page-header') {
                  <j-page-header
                    title="Orders"
                    description="Review fulfillment, exceptions, and exportable operational data."
                    [breadcrumbs]="pageHeaderBreadcrumbs"
                  >
                    <j-button jPageActions label="Export" variant="outline" />
                    <j-button jPageActions label="Create order" />
                  </j-page-header>
                }
                @case ('empty-state') {
                  <j-empty-state title="No orders found" description="Try changing filters or create a new order." icon="0">
                    <j-button jEmptyStateAction label="Create order" />
                  </j-empty-state>
                }
                @case ('toast') {
                  <div class="j-preview-stack">
                    <div class="j-preview-row">
                      <j-button label="Show success" (onClick)="showToast('success')" />
                      <j-button label="Show error" severity="danger" (onClick)="showToast('error')" />
                      <j-button label="Show warning" severity="warning" (onClick)="showToast('warning')" />
                    </div>
                    <j-toast position="bottom-right" />
                  </div>
                }
                @case ('progress') {
                  <div class="j-preview-stack">
                    <j-progress-bar [value]="64" label="Upload progress" />
                    <j-progress-bar [value]="88" severity="success" label="Import progress" />
                    <j-progress-bar indeterminate label="Loading data" />
                  </div>
                }
                @case ('skeleton') {
                  <div class="j-preview-grid">
                    <j-skeleton variant="text" />
                    <j-skeleton variant="avatar" />
                    <j-skeleton variant="card" />
                    <j-skeleton variant="table" [rows]="3" />
                  </div>
                }
                @case ('tabs') {
                  <j-tabs>
                    <j-tab header="Overview">
                      <p>Summary content for the current record.</p>
                    </j-tab>
                    <j-tab header="Activity">
                      <p>Recent updates and audit history.</p>
                    </j-tab>
                    <j-tab header="Settings" disabled>
                      <p>Settings are disabled in this preview.</p>
                    </j-tab>
                  </j-tabs>
                }
                @case ('breadcrumb') {
                  <j-breadcrumb [home]="breadcrumbHome" [model]="breadcrumbItems" />
                }
                @case ('menu') {
                  <j-menu [model]="menuItems" ariaLabel="Project actions" />
                }
                @case ('sidebar') {
                  <div class="j-sidebar-demo">
                    <j-responsive-sidebar title="Workspace" [open]="true">
                      <nav class="j-sidebar-demo__nav" aria-label="Preview sidebar">
                        <a>Dashboard</a>
                        <a class="is-active">Projects</a>
                        <a>Settings</a>
                      </nav>
                    </j-responsive-sidebar>
                  </div>
                }
                @case ('dialog') {
                  <div class="j-preview-row">
                    <j-button label="Open dialog" (onClick)="dialogOpen.set(true)" />
                    <j-dialog
                      header="Edit project"
                      [visible]="dialogOpen()"
                      (visibleChange)="dialogOpen.set($event)"
                    >
                      <div class="j-dialog-demo">
                        <j-input label="Project name" value="JRNG UI Docs" />
                        <div class="j-preview-row">
                          <j-button label="Cancel" variant="ghost" (onClick)="dialogOpen.set(false)" />
                          <j-button label="Save" (onClick)="dialogOpen.set(false)" />
                        </div>
                      </div>
                    </j-dialog>
                  </div>
                }
                @case ('tooltip') {
                  <div class="j-preview-row">
                    <button class="j-doc-preview-button" type="button" jTooltip="Refresh data" tooltipPosition="top">
                      Hover or focus me
                    </button>
                    <button class="j-doc-icon-button" type="button" aria-label="Settings" jTooltip="Settings" tooltipPosition="right">
                      <j-icon name="settings" />
                    </button>
                  </div>
                }
                @case ('popover') {
                  <div class="j-preview-row">
                    <button class="j-doc-preview-button" type="button" (click)="popoverOpen.set(!popoverOpen())">
                      Toggle popover
                    </button>
                    <j-popover [visible]="popoverOpen()" position="bottom" [dismissable]="false">
                      <strong>Project health</strong>
                      <p>Build is passing and docs coverage improved.</p>
                    </j-popover>
                  </div>
                }
              }
            </div>
          </div>
        } @else {
          <div class="j-code-grid">
            <app-code-block label="Import" [code]="doc().code.importCode" />
            <app-code-block label="Basic usage" [code]="doc().code.basic" />
            @if (doc().code.variants) {
              <app-code-block label="Variants" [code]="doc().code.variants ?? ''" />
            }
            @if (doc().code.sizes) {
              <app-code-block label="Sizes" [code]="doc().code.sizes ?? ''" />
            }
            @if (doc().code.states) {
              <app-code-block label="States" [code]="doc().code.states ?? ''" />
            }
            @if (doc().code.angular) {
              <app-code-block label="Angular example" [code]="doc().code.angular ?? ''" />
            }
          </div>
        }
      </section>

      <section class="j-doc-section-block">
        <h3>Usage</h3>
        <ul>
          @for (item of doc().usage; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </section>

      <section class="j-doc-grid-sections">
        <div class="j-doc-section-block">
          <h3>Variants</h3>
          <ul>
            @for (item of doc().variants; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </div>
        <div class="j-doc-section-block">
          <h3>Sizes</h3>
          <ul>
            @for (item of doc().sizes; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </div>
        <div class="j-doc-section-block">
          <h3>States</h3>
          <ul>
            @for (item of doc().states; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </div>
      </section>

      <section class="j-doc-section-block">
        <h3>Props / Inputs</h3>
        <div class="j-table-wrap">
          <table class="j-api-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              @for (row of doc().inputs; track row.name) {
                <tr>
                  <td><code>{{ row.name }}</code></td>
                  <td>{{ row.type }}</td>
                  <td><code>{{ row.defaultValue }}</code></td>
                  <td>{{ row.description }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="j-doc-section-block">
        <h3>Events / Outputs</h3>
        <div class="j-table-wrap">
          <table class="j-api-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Payload</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              @for (row of doc().outputs; track row.event) {
                <tr>
                  <td><code>{{ row.event }}</code></td>
                  <td>{{ row.payload }}</td>
                  <td>{{ row.description }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3">No component-specific outputs.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="j-doc-grid-sections">
        <div class="j-doc-section-block">
          <h3>Accessibility</h3>
          <ul>
            @for (item of doc().accessibility; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </div>
        <div class="j-doc-section-block">
          <h3>Best Practices</h3>
          <ul>
            @for (item of doc().bestPractices; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </div>
      </section>

      @if (doc().commonMistakes?.length) {
        <section class="j-doc-section-block">
          <h3>Common mistakes</h3>
          <ul>
            @for (item of doc().commonMistakes; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </section>
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDetailViewComponent {
  private readonly toast = inject(JrToastService);

  readonly doc = input.required<ComponentDoc>();
  readonly activeTab = signal<DetailTab>('preview');
  readonly dialogOpen = signal(false);
  readonly popoverOpen = signal(false);

  checked = true;
  enabled = true;
  published = false;
  plan = 'pro';

  readonly statuses = ['Draft', 'Published', 'Archived'];
  readonly teams = [
    { id: 'design', name: 'Design' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'support', name: 'Support', disabled: true },
  ] as const;

  readonly orderColumns: readonly JTableColumn[] = [
    { field: 'order', header: 'Order', sortable: true },
    { field: 'customer', header: 'Customer' },
    { field: 'status', header: 'Status' },
    { field: 'total', header: 'Total', align: 'end' },
  ];

  readonly orders = [
    { order: '#1008', customer: 'Acme Inc.', status: 'Ready', total: '$428.00' },
    { order: '#1009', customer: 'Northwind', status: 'Pending', total: '$219.00' },
    { order: '#1010', customer: 'Globex', status: 'Shipped', total: '$814.00' },
    { order: '#1011', customer: 'Initech', status: 'Draft', total: '$132.00' },
  ];

  readonly breadcrumbHome: JBreadcrumbItem = { label: 'Home', routerLink: '/' };
  readonly breadcrumbItems: readonly JBreadcrumbItem[] = [
    { label: 'Docs', routerLink: '/docs' },
    { label: 'Components', routerLink: '/docs/components' },
    { label: 'Breadcrumb' },
  ];

  readonly pageHeaderBreadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Operations', url: '/docs' },
    { label: 'Orders' },
  ] as const;

  readonly menuItems: readonly JMenuItem[] = [
    { label: 'Open', icon: 'Open' },
    { label: 'Duplicate', icon: 'Copy', badge: 'New' },
    { separator: true },
    {
      label: 'More',
      items: [
        { label: 'Archive' },
        { label: 'Delete', disabled: true },
      ],
    },
  ];

  showToast(severity: 'success' | 'error' | 'warning'): void {
    if (severity === 'success') {
      this.toast.success('The project was saved.', 'Saved', { position: 'bottom-right' });
      return;
    }
    if (severity === 'error') {
      this.toast.error('Check the required fields and try again.', 'Could not save', { position: 'bottom-right' });
      return;
    }
    this.toast.warning('Some changes still need review.', 'Review required', { position: 'bottom-right' });
  }
}

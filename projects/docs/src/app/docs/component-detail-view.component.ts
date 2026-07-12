import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JAccordionComponent, JAccordionPanelComponent } from 'jrng-ui/accordion';
import { JAppShellComponent } from 'jrng-ui/app-shell';
import { JAuthLayoutComponent } from 'jrng-ui/auth-layout';
import { JAutocompleteComponent } from 'jrng-ui/autocomplete';
import { JAvatarGroupComponent } from 'jrng-ui/avatar-group';
import { JAvatarComponent } from 'jrng-ui/avatar';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JBottomSheetComponent } from 'jrng-ui/bottom-sheet';
import { JBreadcrumbComponent, JBreadcrumbItem } from 'jrng-ui/breadcrumb';
import { JButtonComponent } from 'jrng-ui/button';
import { JCalendarSchedulerComponent } from 'jrng-ui/calendar-scheduler';
import { JCalendarComponent } from 'jrng-ui/calendar';
import { JCardComponent } from 'jrng-ui/card';
import { JCarouselComponent } from 'jrng-ui/carousel';
import { JChartComponent } from 'jrng-ui/chart';
import { JChipComponent } from 'jrng-ui/chip';
import { JChipsComponent } from 'jrng-ui/chips';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JComboboxComponent } from 'jrng-ui/combobox';
import { JCommandPaletteComponent } from 'jrng-ui/command-palette';
import { JConfirmationService } from 'jrng-ui/confirm-dialog';
import { JConfirmPopupComponent } from 'jrng-ui/confirm-popup';
import { JContainerComponent } from 'jrng-ui/container';
import { JContextMenuComponent } from 'jrng-ui/context-menu';
import { JCopyButtonComponent } from 'jrng-ui/copy-button';
import { JColorPickerComponent } from 'jrng-ui/color-picker';
import { JDataGridComponent } from 'jrng-ui/data-grid';
import { JDataViewComponent } from 'jrng-ui/data-view';
import { JDashboardLayoutComponent } from 'jrng-ui/dashboard-layout';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JDateRangePickerComponent } from 'jrng-ui/date-range-picker';
import { JDividerComponent } from 'jrng-ui/divider';
import { JDialogComponent, JrDialogService } from 'jrng-ui/dialog';
import { JDrawerComponent } from 'jrng-ui/drawer';
import { JDropzoneComponent } from 'jrng-ui/dropzone';
import { JDynamicDialogComponent } from 'jrng-ui/dynamic-dialog';
import { JEditorComponent } from 'jrng-ui/editor';
import { JEmptyStateComponent } from 'jrng-ui/empty-state';
import { JEmptyPageComponent } from 'jrng-ui/empty-page';
import { JErrorPageComponent } from 'jrng-ui/error-page';
import { JFieldsetComponent } from 'jrng-ui/fieldset';
import { JFilterBarComponent } from 'jrng-ui/filter-bar';
import { JFilePreviewComponent } from 'jrng-ui/file-preview';
import { JFileUploadComponent } from 'jrng-ui/file-upload';
import { JFloatLabelComponent } from 'jrng-ui/float-label';
import { JFormFieldComponent } from 'jrng-ui/form-field';
import { JGalleryComponent } from 'jrng-ui/gallery';
import { JGanttComponent } from 'jrng-ui/gantt';
import { JGridLayoutComponent } from 'jrng-ui/grid-layout';
import {
  JCurrencyFormatPipe,
  JDateTimeFormatPipe,
  JFileSizeFormatPipe,
  JPercentFormatPipe,
  JTextTruncatePipe,
} from 'jrng-ui/formatting';
import { JIconComponent } from 'jrng-ui/icon';
import { JIftaLabelComponent } from 'jrng-ui/ifta-label';
import { JImageComponent, JImagePreviewComponent } from 'jrng-ui/image-preview';
import { JIconFieldComponent } from 'jrng-ui/icon-field';
import { JInputGroupComponent } from 'jrng-ui/input-group';
import { JInputIconComponent } from 'jrng-ui/input-icon';
import { JInputMaskComponent } from 'jrng-ui/input-mask';
import { JInputNumberComponent } from 'jrng-ui/input-number';
import { JInputOtpComponent } from 'jrng-ui/input-otp';
import { JInputComponent } from 'jrng-ui/input';
import { JListboxComponent } from 'jrng-ui/listbox';
import { JLoaderComponent } from 'jrng-ui/loader';
import { JMaintenancePageComponent } from 'jrng-ui/maintenance-page';
import { JMegaMenuComponent } from 'jrng-ui/mega-menu';
import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';
import { JMenubarComponent } from 'jrng-ui/menubar';
import { JMeterGroupComponent } from 'jrng-ui/meter-group';
import { JMetricCardComponent } from 'jrng-ui/metric-card';
import { JMultiselectComponent } from 'jrng-ui/multiselect';
import { JNotificationCenterComponent } from 'jrng-ui/notification-center';
import { JOrderListComponent } from 'jrng-ui/order-list';
import { JOrgChartComponent } from 'jrng-ui/org-chart';
import { JOverlayPanelComponent } from 'jrng-ui/overlay-panel';
import { JPaginatorComponent } from 'jrng-ui/paginator';
import { JPasswordComponent } from 'jrng-ui/password';
import { JPickListComponent } from 'jrng-ui/pick-list';
import { JPanelComponent } from 'jrng-ui/panel';
import { JPageHeaderComponent } from 'jrng-ui/page-header';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JProgressBarComponent } from 'jrng-ui/progress-bar';
import { JProgressSpinnerComponent } from 'jrng-ui/progress-spinner';
import { JRadioGroupComponent } from 'jrng-ui/radio-group';
import { JRadioComponent } from 'jrng-ui/radio';
import { JRatingComponent } from 'jrng-ui/rating';
import { JSelectComponent } from 'jrng-ui/select';
import { JSelectButtonComponent } from 'jrng-ui/select-button';
import { JSectionFooterComponent } from 'jrng-ui/section-footer';
import { JSectionHeaderComponent } from 'jrng-ui/section-header';
import { JSidebarLayoutComponent } from 'jrng-ui/sidebar-layout';
import { JSidebarNavComponent } from 'jrng-ui/sidebar-nav';
import { JSkeletonComponent } from 'jrng-ui/skeleton';
import { JSparklineComponent } from 'jrng-ui/sparkline';
import { JSplitterComponent } from 'jrng-ui/splitter';
import { JStackComponent } from 'jrng-ui/stack';
import { JResponsiveSidebarComponent } from 'jrng-ui/responsive-sidebar';
import { JStatCardComponent } from 'jrng-ui/stat-card';
import { JStatusChipComponent } from 'jrng-ui/status-chip';
import { JStepperComponent } from 'jrng-ui/stepper';
import { JSliderComponent } from 'jrng-ui/slider';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JTabComponent, JTabsComponent } from 'jrng-ui/tabs';
import { JTagComponent } from 'jrng-ui/tag';
import { JToggleButtonComponent } from 'jrng-ui/toggle-button';
import { JToolbarComponent } from 'jrng-ui/toolbar';
import {
  JActionMenuComponent,
  JColumnComponent,
  JColumnFilterComponent,
  JSortIconComponent,
  JTableAction,
  JTableColumn,
  JTableComponent,
  JTableConfig,
  JTableEmptyStateComponent,
  JTableExportEvent,
  JTableSkeletonComponent,
} from 'jrng-ui/table';
import { JTextareaComponent } from 'jrng-ui/textarea';
import { JTieredMenuComponent } from 'jrng-ui/tiered-menu';
import { JTimePickerComponent } from 'jrng-ui/time-picker';
import { JTimelineComponent, JTimelineItem } from 'jrng-ui/timeline';
import { JTopbarComponent } from 'jrng-ui/topbar';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JTourService, JTourStepDirective } from 'jrng-ui/tour';
import { JrToastContainerComponent, JrToastService } from 'jrng-ui/toast';
import { JTransferListComponent } from 'jrng-ui/transfer-list';
import { JTreeComponent } from 'jrng-ui/tree';
import { JTreeTableComponent } from 'jrng-ui/tree-table';
import { JVideoPlayerComponent } from 'jrng-ui/video-player';
import { JVirtualScrollerComponent } from 'jrng-ui/virtual-scroller';
import {
  JKanbanCardEvent,
  JKanbanColumn,
  JKanbanColumnEvent,
  JKanbanComponent,
  JKanbanMoveEvent,
} from 'jrng-ui/kanban';
import { JKnobComponent } from 'jrng-ui/knob';
import { JRippleDirective } from 'jrng-ui';
import { ComponentDoc } from './docs-types';
import { CodeBlockComponent } from './code-block.component';
import {
  PriorityComponentGuidance,
  priorityComponentGuidance,
} from './priority-component-guidance';

type DetailTab = 'preview' | 'code';

@Component({
  selector: 'app-component-detail-view',
  imports: [
    FormsModule,
    CodeBlockComponent,
    JAccordionComponent,
    JAccordionPanelComponent,
    JAutocompleteComponent,
    JAvatarGroupComponent,
    JAvatarComponent,
    JBadgeComponent,
    JBreadcrumbComponent,
    JButtonComponent,
    JCardComponent,
    JChipComponent,
    JCheckboxComponent,
    JContainerComponent,
    JCopyButtonComponent,
    JColorPickerComponent,
    JDataGridComponent,
    JDatePickerComponent,
    JDividerComponent,
    JDialogComponent,
    JDrawerComponent,
    JEmptyPageComponent,
    JEmptyStateComponent,
    JErrorPageComponent,
    JFieldsetComponent,
    JFilterBarComponent,
    JFilePreviewComponent,
    JFileUploadComponent,
    JFloatLabelComponent,
    JFormFieldComponent,
    JIconComponent,
    JIconFieldComponent,
    JInputGroupComponent,
    JInputIconComponent,
    JInputMaskComponent,
    JInputNumberComponent,
    JInputOtpComponent,
    JInputComponent,
    JListboxComponent,
    JLoaderComponent,
    JMaintenancePageComponent,
    JMenuComponent,
    JMeterGroupComponent,
    JMetricCardComponent,
    JMultiselectComponent,
    JPaginatorComponent,
    JPasswordComponent,
    JPanelComponent,
    JPageHeaderComponent,
    JPopoverComponent,
    JProgressBarComponent,
    JProgressSpinnerComponent,
    JRadioGroupComponent,
    JRadioComponent,
    JRatingComponent,
    JSelectComponent,
    JSelectButtonComponent,
    JSectionFooterComponent,
    JSectionHeaderComponent,
    JSkeletonComponent,
    JSparklineComponent,
    JStackComponent,
    JResponsiveSidebarComponent,
    JStatCardComponent,
    JStatusChipComponent,
    JSliderComponent,
    JSwitchComponent,
    JTabComponent,
    JTabsComponent,
    JTagComponent,
    JToggleButtonComponent,
    JToolbarComponent,
    JTableComponent,
    JActionMenuComponent,
    JColumnFilterComponent,
    JTextareaComponent,
    JTimelineComponent,
    JTooltipDirective,
    JTourStepDirective,
    JRippleDirective,
    JrToastContainerComponent,
    JAppShellComponent,
    JAuthLayoutComponent,
    JBottomSheetComponent,
    JCalendarSchedulerComponent,
    JCalendarComponent,
    JCarouselComponent,
    JChartComponent,
    JChipsComponent,
    JComboboxComponent,
    JCommandPaletteComponent,
    JConfirmPopupComponent,
    JContextMenuComponent,
    JDashboardLayoutComponent,
    JDataViewComponent,
    JDateRangePickerComponent,
    JDropzoneComponent,
    JDynamicDialogComponent,
    JEditorComponent,
    JGalleryComponent,
    JGanttComponent,
    JGridLayoutComponent,
    JIftaLabelComponent,
    JImageComponent,
    JImagePreviewComponent,
    JKanbanComponent,
    JKnobComponent,
    JMegaMenuComponent,
    JMenubarComponent,
    JNotificationCenterComponent,
    JOrderListComponent,
    JOrgChartComponent,
    JOverlayPanelComponent,
    JPickListComponent,
    JSidebarLayoutComponent,
    JSidebarNavComponent,
    JSortIconComponent,
    JSplitterComponent,
    JStepperComponent,
    JColumnComponent,
    JTableEmptyStateComponent,
    JTableSkeletonComponent,
    JTieredMenuComponent,
    JTimePickerComponent,
    JTopbarComponent,
    JTransferListComponent,
    JTreeComponent,
    JTreeTableComponent,
    JVideoPlayerComponent,
    JVirtualScrollerComponent,
    JCurrencyFormatPipe,
    JDateTimeFormatPipe,
    JFileSizeFormatPipe,
    JPercentFormatPipe,
    JTextTruncatePipe,
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
      </header>

      <p class="j-doc-lead">{{ doc().description }}</p>

      <dl class="j-doc-meta">
        <div>
          <dt>Selector / usage</dt>
          <dd>
            <code>{{ doc().selector }}</code>
          </dd>
        </div>
        <div>
          <dt>Import</dt>
          <dd>
            <code>{{ doc().importPath }}</code>
          </dd>
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
          <button
            type="button"
            [class.is-active]="activeTab() === 'preview'"
            (click)="activeTab.set('preview')"
          >
            <j-icon name="component" />
            Preview
          </button>
          <button
            type="button"
            [class.is-active]="activeTab() === 'code'"
            (click)="activeTab.set('code')"
          >
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
            <div
              class="j-preview-surface"
              [class.j-preview-surface--overlay]="overlayPreviewSlugs.has(doc().slug)"
              [class.j-preview-surface--status]="statusPreviewSlugs.has(doc().slug)"
            >
              @defer (when activeTab() === 'preview') {
                @switch (doc().slug) {
                  @case ('accordion') {
                    <j-accordion [multiple]="true" [activeIndex]="[0]">
                      <j-accordion-panel header="Account details"
                        >Update profile and contact information.</j-accordion-panel
                      >
                      <j-accordion-panel header="Notifications"
                        >Choose which product updates you receive.</j-accordion-panel
                      >
                      <j-accordion-panel header="Disabled section" disabled
                        >Unavailable content.</j-accordion-panel
                      >
                    </j-accordion>
                  }
                  @case ('accordion-panel') {
                    <j-accordion [activeIndex]="0">
                      <j-accordion-panel header="Project summary"
                        >This panel is expanded by default.</j-accordion-panel
                      >
                      <j-accordion-panel header="Team members"
                        >Panel content can contain any Angular template.</j-accordion-panel
                      >
                    </j-accordion>
                  }
                  @case ('autocomplete') {
                    <div class="j-overlay-form-preview">
                      <j-autocomplete
                        label="Customer"
                        [suggestions]="autocompleteSuggestions"
                        placeholder="Type a customer name"
                        (completeMethod)="filterCustomerSuggestions($event)"
                      />
                      <p class="j-preview-note">
                        Type “Acme” or “Northwind” to filter suggestions.
                      </p>
                    </div>
                  }
                  @case ('avatar') {
                    <div class="j-preview-row">
                      <j-avatar initials="AR" ariaLabel="Avery Reed" />
                      <j-avatar
                        initials="MK"
                        ariaLabel="Morgan Kim"
                        size="lg"
                        shape="square"
                        status="online"
                      />
                      <j-avatar label="Project owner" ariaLabel="Project owner" size="sm" />
                    </div>
                  }
                  @case ('chip') {
                    <div class="j-preview-row">
                      <j-chip label="Design" />
                      <j-chip label="Approved" severity="success" />
                      <j-chip label="Removable filter" removable removeAriaLabel="Remove filter" />
                    </div>
                  }
                  @case ('color-picker') {
                    <div class="j-overlay-form-preview j-overlay-form-preview--compact">
                      <j-color-picker
                        label="Brand colour"
                        [(ngModel)]="brandColor"
                        [presetColors]="brandPresets"
                        clearable
                      />
                    </div>
                  }
                  @case ('date-picker') {
                    <div class="j-preview-grid j-overlay-form-preview">
                      <j-date-picker
                        label="Due date"
                        placeholder="Choose a date"
                        [(ngModel)]="dueDate"
                      />
                      <j-date-picker
                        label="Date range"
                        selectionMode="range"
                        placeholder="Choose dates"
                        [(ngModel)]="pickerRange"
                      />
                    </div>
                  }
                  @case ('divider') {
                    <div class="j-preview-stack">
                      <span>Profile details</span>
                      <j-divider />
                      <span>Notification preferences</span>
                    </div>
                  }
                  @case ('icon') {
                    <div class="j-preview-row">
                      <j-icon name="search" ariaLabel="Search" />
                      <j-icon name="settings" ariaLabel="Settings" size="24" />
                      <j-icon name="circle-check" ariaLabel="Complete" size="32" />
                    </div>
                  }
                  @case ('input-mask') {
                    <div class="j-preview-grid">
                      <j-input-mask
                        label="Phone number"
                        mask="(999) 999-9999"
                        placeholder="(555) 123-4567"
                        [(ngModel)]="maskedPhone"
                      />
                      <j-input-mask
                        label="Employee ID"
                        mask="aa-9999"
                        placeholder="AB-2048"
                        [(ngModel)]="employeeId"
                      />
                    </div>
                  }
                  @case ('input-number') {
                    <div class="j-preview-grid">
                      <j-input-number
                        label="Quantity"
                        [min]="1"
                        [max]="100"
                        [(ngModel)]="quantity"
                      />
                      <j-input-number
                        label="Budget"
                        mode="currency"
                        currency="USD"
                        [(ngModel)]="budget"
                      />
                    </div>
                  }
                  @case ('input-otp') {
                    <j-input-otp
                      label="Verification code"
                      [length]="6"
                      numericOnly
                      [(ngModel)]="otp"
                    />
                  }
                  @case ('listbox') {
                    <j-listbox label="Team" [options]="teamOptions" [(ngModel)]="selectedTeam" />
                  }
                  @case ('multiselect') {
                    <j-multiselect
                      label="Skills"
                      [options]="skillOptions"
                      placeholder="Select skills"
                      [(ngModel)]="selectedSkills"
                    />
                  }
                  @case ('paginator') {
                    <j-paginator
                      [first]="20"
                      [rows]="10"
                      [totalRecords]="96"
                      [rowsPerPageOptions]="[10, 20, 50]"
                      showCurrentPageReport
                    />
                  }
                  @case ('password') {
                    <j-password
                      label="Password"
                      placeholder="Enter a secure password"
                      feedback
                      toggleMask
                    />
                  }
                  @case ('progress-spinner') {
                    <div class="j-preview-row">
                      <j-progress-spinner label="Loading orders" />
                      <j-progress-spinner label="Loading report" [size]="48" [strokeWidth]="3" />
                    </div>
                  }
                  @case ('rating') {
                    <j-rating label="Product rating" [(ngModel)]="rating" />
                  }
                  @case ('slider') {
                    <j-slider
                      label="Completion"
                      [min]="0"
                      [max]="100"
                      [step]="5"
                      tooltip
                      [(ngModel)]="completion"
                    />
                  }
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
                      <j-textarea
                        label="Message"
                        placeholder="Write a short message"
                        showCount
                        [maxLength]="120"
                        [rows]="4"
                        fullWidth
                      />
                      <j-textarea
                        label="Disabled note"
                        placeholder="Existing support note"
                        [rows]="4"
                        fullWidth
                        disabled
                      />
                      <j-textarea
                        label="Required bio"
                        [rows]="4"
                        fullWidth
                        invalid
                        error="Bio is required"
                      />
                    </div>
                  }
                  @case ('select') {
                    <div class="j-preview-grid j-overlay-form-preview">
                      <j-select
                        label="Status"
                        [options]="statuses"
                        placeholder="Choose status"
                        clearable
                      />
                      <j-select
                        label="Searchable team"
                        [options]="teams"
                        optionLabel="name"
                        optionValue="id"
                        searchable
                      />
                      <j-select label="Loading" [options]="statuses" loading />
                      <j-select
                        label="Required"
                        [options]="statuses"
                        invalid
                        error="Choose a status"
                      />
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
                      <j-radio
                        name="plan-docs"
                        label="Starter"
                        value="starter"
                        [(ngModel)]="plan"
                      />
                      <j-radio name="plan-docs" label="Pro" value="pro" [(ngModel)]="plan" />
                      <j-radio
                        name="plan-docs"
                        label="Enterprise"
                        value="enterprise"
                        disabled
                        [(ngModel)]="plan"
                      />
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
                      <button
                        class="j-doc-icon-button"
                        type="button"
                        aria-label="Search"
                        jTooltip="Search"
                      >
                        <j-icon name="search" />
                      </button>
                      <button
                        class="j-doc-icon-button"
                        type="button"
                        aria-label="Settings"
                        jTooltip="Settings"
                      >
                        <j-icon name="settings" />
                      </button>
                      <button
                        class="j-doc-icon-button j-doc-icon-button--ghost"
                        type="button"
                        aria-label="Copy"
                        jTooltip="Copy"
                      >
                        <j-icon name="copy" />
                      </button>
                      <button
                        class="j-doc-icon-button"
                        type="button"
                        aria-label="Disabled"
                        disabled
                      >
                        <j-icon name="filter" />
                      </button>
                    </div>
                  }
                  @case ('card') {
                    <div class="j-preview-grid j-preview-grid--cards">
                      <j-card title="Design review" subtitle="Tuesday, 10:30 AM" elevated>
                        <p>Review navigation, spacing, and responsive behavior before release.</p>
                        <j-button label="Open agenda" size="sm" variant="outline" />
                      </j-card>
                      <j-card title="Team members" subtitle="4 collaborators" bordered>
                        <j-avatar-group [items]="avatarGroupItems" [max]="3" />
                      </j-card>
                      <j-card title="Compact card" subtitle="Reduced padding" compact>
                        Reusable content container.
                      </j-card>
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
                      [paginator]="false"
                    />
                  }
                  @case ('data-grid') {
                    <j-data-grid
                      title="Orders"
                      description="Sortable, filterable operational data with pagination."
                      [value]="orders"
                      [columns]="orderColumns"
                      [rows]="3"
                      [totalRecords]="orders.length"
                      [globalFilterFields]="['order', 'customer', 'status']"
                      [config]="tableConfig"
                      selectionMode="checkbox"
                      bulkActions
                      showColumnManager
                      showExport
                      striped
                      hover
                    >
                      <j-button jDataGridActions label="Create order" size="sm" />
                      <j-button
                        jDataGridBulkActions
                        label="Archive selected"
                        size="sm"
                        variant="outline"
                      />
                    </j-data-grid>
                  }
                  @case ('action-menu') {
                    <div class="j-action-menu-preview">
                      <section>
                        <span class="j-preview-label">Inline actions</span>
                        <j-action-menu [actions]="rowActions" [row]="orders[0]" />
                      </section>
                      <section>
                        <span class="j-preview-label">Compact popup</span>
                        <j-action-menu
                          popup
                          triggerIcon="More"
                          triggerLabel="Open order actions"
                          [actions]="rowActions"
                          [row]="orders[0]"
                        />
                      </section>
                    </div>
                  }
                  @case ('column-filter') {
                    <div class="j-preview-grid">
                      <j-column-filter field="status" label="Status" />
                      <j-column-filter field="customer" label="Customer" value="Acme" />
                    </div>
                  }
                  @case ('filter-bar') {
                    <div class="j-filter-bar-preview">
                      <j-filter-bar
                        [statuses]="statuses"
                        showDateRange
                        showExport
                        showAdvancedToggle
                        (apply)="showToast('success')"
                      >
                        <div jFilterBarAdvanced class="j-doc-muted">
                          Advanced filters can host app-specific controls.
                        </div>
                      </j-filter-bar>
                    </div>
                  }
                  @case ('metric-card') {
                    <div class="j-preview-grid j-preview-grid--cards">
                      <j-metric-card
                        title="Revenue"
                        value="$42.8k"
                        trend="up"
                        trendLabel="+12%"
                        icon="$"
                        footer="Month to date"
                      />
                      <j-metric-card
                        title="Churn"
                        value="1.8%"
                        trend="down"
                        trendLabel="-0.4%"
                        icon="%"
                        footer="Rolling 30 days"
                      />
                      <j-metric-card title="Loading" loading />
                    </div>
                  }
                  @case ('stat-card') {
                    <div class="j-preview-grid j-preview-grid--cards">
                      <j-stat-card
                        title="Open orders"
                        value="128"
                        trend="up"
                        trendLabel="+18 today"
                        icon="#"
                        footer="Updated 4 minutes ago"
                      />
                      <j-stat-card
                        title="SLA risk"
                        value="7"
                        trend="neutral"
                        trendLabel="No change"
                        icon="!"
                        footer="Across active queues"
                      />
                      <j-stat-card title="Loading" loading />
                    </div>
                  }
                  @case ('status-chip') {
                    <div class="j-preview-row">
                      <j-status-chip status="active" />
                      <j-status-chip status="pending" />
                      <j-status-chip status="approved" />
                      <j-status-chip status="rejected" />
                      <j-status-chip status="overdue" />
                    </div>
                  }
                  @case ('page-header') {
                    <j-page-header
                      title="Orders"
                      subtitle="Review fulfillment, exceptions, and exportable operational data."
                      showBack
                      [breadcrumbs]="pageHeaderBreadcrumbs"
                      (back)="showToast('success')"
                    >
                      <j-button jPageActions label="Export" variant="outline" />
                      <j-button jPageActions label="Create order" />
                    </j-page-header>
                  }
                  @case ('empty-state') {
                    <j-empty-state
                      title="No orders found"
                      description="Try changing filters or create a new order."
                      icon="0"
                    >
                      <j-button jEmptyStateAction label="Create order" />
                    </j-empty-state>
                  }
                  @case ('toast') {
                    <div class="j-preview-stack">
                      <div class="j-preview-row">
                        <j-button label="Show success" (onClick)="showToast('success')" />
                        <j-button
                          label="Show error"
                          severity="danger"
                          (onClick)="showToast('error')"
                        />
                        <j-button
                          label="Show warning"
                          severity="warning"
                          (onClick)="showToast('warning')"
                        />
                      </div>
                      <j-toast position="bottom-right" />
                    </div>
                  }
                  @case ('progress-bar') {
                    <div class="j-progress-preview-list">
                      <section>
                        <span><strong>Upload</strong><small>64%</small></span>
                        <j-progress-bar [value]="64" label="Upload progress" />
                      </section>
                      <section>
                        <span><strong>Import</strong><small>88%</small></span>
                        <j-progress-bar [value]="88" severity="success" label="Import progress" />
                      </section>
                      <section>
                        <span><strong>Processing</strong><small>In progress</small></span>
                        <j-progress-bar indeterminate label="Loading data" />
                      </section>
                    </div>
                  }
                  @case ('skeleton') {
                    <div class="j-preview-grid">
                      <j-skeleton variant="text" />
                      <j-skeleton variant="avatar" />
                      <j-skeleton variant="button" width="8rem" />
                      <j-skeleton variant="card" />
                      <j-skeleton variant="table" [rows]="3" />
                    </div>
                  }
                  @case ('copy-button') {
                    <div class="j-preview-row">
                      <j-copy-button text="npm install jrng-ui" />
                      <j-copy-button text="INV-2048" label="Copy ID" copiedLabel="Copied ID" />
                      <j-copy-button text="Disabled" disabled />
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
                  @case ('responsive-sidebar') {
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
                            <j-button
                              label="Cancel"
                              variant="ghost"
                              (onClick)="dialogOpen.set(false)"
                            />
                            <j-button label="Save" (onClick)="dialogOpen.set(false)" />
                          </div>
                        </div>
                      </j-dialog>
                    </div>
                  }
                  @case ('confirm-dialog') {
                    <div class="j-preview-row">
                      <j-button label="Confirm save" (onClick)="openConfirm()" />
                      <j-button
                        label="Delete record"
                        severity="danger"
                        (onClick)="openConfirm('danger')"
                      />
                    </div>
                  }
                  @case ('drawer') {
                    <div class="j-preview-row">
                      <j-button label="Open drawer" (onClick)="drawerOpen.set(true)" />
                      <j-drawer
                        header="Filters"
                        styleClass="j-doc-preview-drawer"
                        [modal]="false"
                        contained
                        [visible]="drawerOpen()"
                        (openChange)="drawerOpen.set($event)"
                      >
                        <div class="j-preview-stack">
                          <j-input label="Search" type="search" clearable />
                          <j-select label="Status" [options]="statuses" />
                        </div>
                      </j-drawer>
                    </div>
                  }
                  @case ('tooltip') {
                    <div class="j-preview-row">
                      <button
                        class="j-doc-preview-button"
                        type="button"
                        jTooltip="Refresh data"
                        tooltipPosition="top"
                      >
                        Hover or focus me
                      </button>
                      <button
                        class="j-doc-icon-button"
                        type="button"
                        aria-label="Settings"
                        jTooltip="Settings"
                        tooltipPosition="right"
                      >
                        <j-icon name="settings" />
                      </button>
                    </div>
                  }
                  @case ('popover') {
                    <div class="j-preview-row">
                      <button
                        #popoverTrigger
                        class="j-doc-preview-button"
                        type="button"
                        (click)="previewPopover.toggle(popoverTrigger)"
                      >
                        Toggle popover
                      </button>
                      <j-popover
                        #previewPopover
                        [target]="popoverTrigger"
                        position="bottom"
                        [dismissable]="false"
                      >
                        <strong>Project health</strong>
                        <p>Build is passing and docs coverage improved.</p>
                      </j-popover>
                    </div>
                  }
                  @case ('ripple') {
                    <div class="j-preview-row">
                      <button class="j-doc-preview-button" type="button" jRipple>
                        Ripple button
                      </button>
                      <button class="j-doc-preview-button" type="button" [jRipple]="false">
                        Disabled ripple
                      </button>
                    </div>
                  }
                  @case ('tour-guide') {
                    <div class="j-preview-stack">
                      <div class="j-preview-row">
                        <button
                          id="createBtn"
                          class="j-doc-preview-button"
                          type="button"
                          jTourStep="create-button"
                          tourTitle="Create"
                          tourDescription="Click here to create a new record."
                        >
                          Create
                        </button>
                        <button
                          class="j-doc-preview-button"
                          type="button"
                          jTourStep="filter-button"
                          tourTitle="Filter"
                          tourDescription="Narrow the table to the records that matter."
                        >
                          Filter
                        </button>
                      </div>
                      <j-button label="Start guided tour" (onClick)="startPreviewTour()" />
                    </div>
                  }
                  @case ('timeline') {
                    <j-timeline [value]="timelineItems" />
                  }
                  @case ('file-upload') {
                    <div class="j-preview-stack">
                      <j-file-upload
                        title="Upload documents"
                        description="Drag files here or choose from your device."
                        multiple
                      />
                      <j-file-preview
                        fileName="statement.pdf"
                        [fileSize]="245760"
                        description="Uploaded 2 minutes ago"
                        url="#"
                      />
                    </div>
                  }
                  @case ('file-preview') {
                    <div class="j-preview-row">
                      <j-file-preview
                        fileName="statement.pdf"
                        [fileSize]="245760"
                        description="Uploaded 2 minutes ago"
                        url="#"
                      />
                      <j-file-preview
                        fileName="avatar.png"
                        [fileSize]="56320"
                        description="Image asset"
                        showTypeLabel
                        typeLabel="PNG image"
                      />
                    </div>
                  }
                  @case ('avatar-group') {
                    <j-avatar-group [items]="avatarGroupItems" [max]="3" ariaLabel="Project team" />
                  }
                  @case ('container') {
                    <j-container>
                      <j-card title="Contained content" subtitle="Max-width layout helper" bordered>
                        <p>
                          Container keeps page content aligned with consistent horizontal rhythm.
                        </p>
                      </j-card>
                    </j-container>
                  }
                  @case ('fieldset') {
                    <j-fieldset legend="Billing address" toggleable>
                      <div class="j-preview-grid">
                        <j-input label="Street" placeholder="123 Market St" />
                        <j-input label="City" placeholder="San Francisco" />
                      </div>
                    </j-fieldset>
                  }
                  @case ('float-label') {
                    <j-float-label label="Email address" fullWidth>
                      <j-input type="email" [(ngModel)]="floatEmail" fullWidth />
                    </j-float-label>
                  }
                  @case ('form-field') {
                    <j-form-field
                      label="Workspace name"
                      hint="Use a short, recognizable team name."
                    >
                      <j-input placeholder="Operations" />
                    </j-form-field>
                  }
                  @case ('icon-field') {
                    <j-icon-field prefixIcon="search" suffixIcon="filter" fullWidth>
                      <j-input placeholder="Search projects" fullWidth />
                    </j-icon-field>
                  }
                  @case ('input-group') {
                    <j-input-group prefixAddon="$" suffixAddon=".00">
                      <j-input placeholder="Amount" />
                    </j-input-group>
                  }
                  @case ('input-icon') {
                    <div class="j-preview-row">
                      <j-input-icon icon="search" />
                      <j-input-icon icon="calendar" position="right" />
                    </div>
                  }
                  @case ('panel') {
                    <j-panel header="Project health" toggleable>
                      The latest build passed and documentation coverage is improving.
                    </j-panel>
                  }
                  @case ('radio-group') {
                    <j-radio-group
                      label="Plan"
                      [options]="radioGroupOptions"
                      direction="horizontal"
                      [(ngModel)]="plan"
                    />
                  }
                  @case ('select-button') {
                    <j-select-button
                      label="View mode"
                      [options]="viewModes"
                      [(ngModel)]="viewMode"
                    />
                  }
                  @case ('section-header') {
                    <j-section-header
                      title="Projects"
                      description="Track active work and ownership."
                    >
                      <j-button label="New project" />
                    </j-section-header>
                  }
                  @case ('section-footer') {
                    <j-section-footer>
                      <j-button label="Cancel" variant="ghost" />
                      <j-button label="Save changes" />
                    </j-section-footer>
                  }
                  @case ('stack') {
                    <j-stack direction="horizontal" align="center" gap="var(--j-spacing-3)">
                      <j-badge value="New" />
                      <span>Composable spacing primitive</span>
                      <j-button label="Open" size="sm" />
                    </j-stack>
                  }
                  @case ('toolbar') {
                    <j-toolbar>
                      <j-button label="New" />
                      <j-button label="Export" variant="outline" />
                      <j-button label="Archive" variant="ghost" />
                    </j-toolbar>
                  }
                  @case ('toggle-button') {
                    <j-toggle-button onLabel="Published" offLabel="Draft" [(ngModel)]="published" />
                  }
                  @case ('loader') {
                    <div class="j-loader-preview-grid">
                      <section>
                        <j-loader variant="dots" label="Loading report" /><span>Dots</span>
                      </section>
                      <section>
                        <j-loader variant="bars" label="Syncing data" /><span>Bars</span>
                      </section>
                      <section>
                        <j-loader variant="pulse" label="Preparing view" /><span>Pulse</span>
                      </section>
                    </div>
                  }
                  @case ('empty-page') {
                    <j-empty-page
                      title="No results"
                      description="Try changing the filters."
                      icon="search"
                      ><j-button label="Clear filters"
                    /></j-empty-page>
                  }
                  @case ('error-page') {
                    <j-error-page
                      code="500"
                      title="Something went wrong"
                      description="The page could not be loaded."
                      ><j-button label="Try again"
                    /></j-error-page>
                  }
                  @case ('maintenance-page') {
                    <j-maintenance-page
                      title="Maintenance in progress"
                      description="The application will be back soon."
                      detail="Estimated recovery: 20 minutes"
                      ><j-button label="View system status" variant="outline"
                    /></j-maintenance-page>
                  }
                  @case ('meter-group') {
                    <j-meter-group [value]="meterSegments" />
                  }
                  @case ('sparkline') {
                    <div class="j-preview-row">
                      <j-sparkline [value]="sparklineValues" ariaLabel="Revenue trend" />
                      <j-sparkline [value]="sparklineValues" type="bar" ariaLabel="Volume trend" />
                    </div>
                  }
                  @case ('app-shell') {
                    <div class="j-layout-preview-frame">
                      <j-app-shell styleClass="j-doc-compact-shell">
                        <strong jShellHeader>Workspace</strong>
                        <nav jShellSidebar class="j-preview-mini-nav">
                          <span class="is-active">Overview</span><span>Projects</span
                          ><span>Settings</span>
                        </nav>
                        <j-card title="Dashboard" subtitle="Application shell content" bordered />
                        <small jShellFooter>JRNG UI workspace</small>
                      </j-app-shell>
                    </div>
                  }
                  @case ('auth-layout') {
                    <div class="j-layout-preview-frame">
                      <j-auth-layout variant="centered" styleClass="j-doc-compact-auth">
                        <div class="j-preview-stack">
                          <strong>Welcome back</strong>
                          <j-input label="Email" type="email" placeholder="name@example.com" />
                          <j-button label="Sign in" />
                        </div>
                      </j-auth-layout>
                    </div>
                  }
                  @case ('bottom-sheet') {
                    <div class="j-preview-row">
                      <j-button label="Open bottom sheet" (onClick)="bottomSheetVisible = true" />
                      <j-bottom-sheet
                        header="Project actions"
                        [(visible)]="bottomSheetVisible"
                        [modal]="false"
                      >
                        <div class="j-preview-stack">
                          <j-button label="Duplicate" variant="outline" />
                          <j-button label="Archive" variant="ghost" />
                        </div>
                      </j-bottom-sheet>
                    </div>
                  }
                  @case ('calendar') {
                    <div class="j-calendar-preview">
                      <j-calendar [value]="calendarDate" (dateSelect)="calendarDate = $event" />
                    </div>
                  }
                  @case ('calendar-scheduler') {
                    <j-calendar-scheduler [events]="schedulerEvents" ariaLabel="Team schedule" />
                  }
                  @case ('carousel') {
                    <j-carousel [value]="carouselItems" [visibleItems]="2" autoplay />
                  }
                  @case ('chart') {
                    <div class="j-live-chart-preview-grid">
                      <section>
                        <strong>Monthly signups</strong>
                        <j-chart type="bar" [data]="chartData" ariaLabel="Monthly signups" />
                      </section>
                      <section>
                        <strong>Active users</strong>
                        <j-chart type="line" [data]="lineChartData" ariaLabel="Active users" />
                      </section>
                    </div>
                  }
                  @case ('chips') {
                    <j-chips label="Skills" placeholder="Add a skill" [(ngModel)]="tags" />
                  }
                  @case ('column') {
                    <j-table [value]="orders" [paginator]="false">
                      <j-column field="order" header="Order" [sortable]="true" />
                      <j-column field="customer" header="Customer" />
                      <j-column field="status" header="Status" />
                    </j-table>
                  }
                  @case ('combobox') {
                    <div class="j-overlay-form-preview">
                      <j-combobox
                        label="Searchable customer"
                        [options]="customerSuggestions"
                        placeholder="Choose or type a customer"
                        [(ngModel)]="selectedCustomer"
                      />
                      <p class="j-preview-note">
                        Select an option or enter a permitted custom value.
                      </p>
                    </div>
                  }
                  @case ('command-palette') {
                    <div class="j-preview-row">
                      <j-button
                        label="Open command palette"
                        (onClick)="commandPaletteOpen = true"
                      />
                      <j-command-palette
                        [commands]="commands"
                        [(visible)]="commandPaletteOpen"
                        placeholder="Search commands"
                      />
                    </div>
                  }
                  @case ('confirm-popup') {
                    <div class="j-preview-row">
                      <j-button label="Confirm archive" (onClick)="openConfirmPopup($event)" />
                      <j-confirm-popup />
                    </div>
                  }
                  @case ('context-menu') {
                    <div #contextTarget class="j-context-preview-target" tabindex="0">
                      Right-click this area
                    </div>
                    <j-context-menu [target]="contextTarget" [model]="menubarItems" />
                  }
                  @case ('dashboard-layout') {
                    <div class="j-layout-preview-frame">
                      <j-dashboard-layout styleClass="j-doc-compact-dashboard">
                        <section class="j-dashboard-preview-heading">
                          <span>Operations overview</span><strong>Weekly performance</strong>
                        </section>
                        <div class="j-dashboard-preview-metrics">
                          <j-stat-card label="Revenue" value="$42.8k" />
                          <j-stat-card label="Orders" value="1,284" />
                        </div>
                        <section class="j-dashboard-preview-activity">
                          <strong>Recent activity</strong>
                          <span>12 orders are ready for review</span>
                        </section>
                      </j-dashboard-layout>
                    </div>
                  }
                  @case ('data-view') {
                    <j-data-view
                      [value]="dataViewItems"
                      layout="grid"
                      [rows]="3"
                      [paginator]="false"
                    />
                  }
                  @case ('date-range-picker') {
                    <div class="j-overlay-form-preview">
                      <j-date-range-picker label="Campaign window" [(ngModel)]="dateRange" />
                    </div>
                  }
                  @case ('dropzone') {
                    <j-dropzone accept=".csv,.xlsx" multiple title="Import records" />
                  }
                  @case ('dynamic-dialog') {
                    <div class="j-preview-row">
                      <j-button label="Open dynamic dialog" (onClick)="openDynamicDialog()" />
                      <j-dynamic-dialog />
                    </div>
                  }
                  @case ('editor') {
                    <j-editor
                      label="Description"
                      placeholder="Write a short summary"
                      hint="Select text, then use formatting, alignment, list, link, image, undo, or redo controls."
                      [(ngModel)]="editorValue"
                    />
                  }
                  @case ('gallery') {
                    <div class="j-preview-stack">
                      <div class="j-preview-row">
                        @for (animation of galleryAnimations; track animation) {
                          <button
                            type="button"
                            class="j-doc-preview-button"
                            [class.is-active]="galleryAnimation === animation"
                            (click)="galleryAnimation = animation"
                          >
                            {{ animation }}
                          </button>
                        }
                      </div>
                      <j-gallery [value]="galleryItems" [animation]="galleryAnimation" />
                    </div>
                  }
                  @case ('gantt') {
                    <j-gantt [tasks]="ganttTasks" scale="week" />
                  }
                  @case ('grid-layout') {
                    <j-grid-layout [columns]="3" minItemWidth="10rem">
                      <j-card title="Design" bordered /><j-card title="Build" bordered /><j-card
                        title="Ship"
                        bordered
                      />
                    </j-grid-layout>
                  }
                  @case ('ifta-label') {
                    <j-ifta-label label="Email address" fullWidth>
                      <j-input value="avery@example.com" />
                    </j-ifta-label>
                  }
                  @case ('image') {
                    <j-image
                      [src]="previewImage"
                      alt="Abstract product preview"
                      width="18rem"
                      preview
                    />
                  }
                  @case ('image-preview') {
                    <div class="j-preview-row">
                      <j-button label="Open image preview" (onClick)="imagePreviewOpen = true" />
                      <j-image-preview
                        [src]="previewImage"
                        alt="Abstract product preview"
                        [(visible)]="imagePreviewOpen"
                      />
                    </div>
                  }
                  @case ('kanban') {
                    <j-kanban
                      [value]="kanbanPreviewColumns"
                      (reorder)="handleKanbanReorder($event)"
                      (addCard)="addKanbanCard($event)"
                      (removeCard)="removeKanbanCard($event)"
                    />
                  }
                  @case ('knob') {
                    <j-knob label="Completion" [(ngModel)]="completion" />
                  }
                  @case ('mega-menu') {
                    <j-mega-menu [model]="megaMenuItems" ariaLabel="Product navigation" />
                  }
                  @case ('menubar') {
                    <j-menubar [model]="menubarItems" ariaLabel="Application menu" />
                  }
                  @case ('notification-center') {
                    <div class="j-preview-row">
                      <button
                        #notificationTrigger
                        class="j-doc-preview-button"
                        type="button"
                        (click)="notificationOpen = !notificationOpen"
                      >
                        Notifications
                      </button>
                      <j-notification-center
                        [target]="notificationTrigger"
                        [(visible)]="notificationOpen"
                      />
                    </div>
                  }
                  @case ('order-list') {
                    <j-order-list header="Priorities" [value]="transferSource" filter />
                  }
                  @case ('org-chart') {
                    <j-org-chart [value]="organization" />
                  }
                  @case ('overlay-panel') {
                    <div class="j-preview-row">
                      <button
                        #overlayTrigger
                        class="j-doc-preview-button"
                        type="button"
                        (click)="previewOverlay.toggle(overlayTrigger)"
                      >
                        Toggle details
                      </button>
                      <j-overlay-panel #previewOverlay>
                        <strong>Project details</strong>
                        <p>Owned by the design systems team.</p>
                      </j-overlay-panel>
                    </div>
                  }
                  @case ('pick-list') {
                    <j-pick-list [source]="transferSource" [target]="transferTarget" filter />
                  }
                  @case ('sidebar-layout') {
                    <div class="j-layout-preview-frame">
                      <j-sidebar-layout styleClass="j-doc-compact-sidebar-layout">
                        <nav jSidebar class="j-preview-mini-nav">
                          <span class="is-active">Inbox</span><span>Archive</span>
                        </nav>
                        <j-card title="Inbox" subtitle="12 unread messages" bordered />
                      </j-sidebar-layout>
                    </div>
                  }
                  @case ('sidebar-nav') {
                    <j-sidebar-nav [model]="menuItems" activeKey="Open" />
                  }
                  @case ('sort-icon') {
                    <div class="j-preview-row">
                      <span>Name <j-sort-icon [order]="1" /></span>
                      <span>Created <j-sort-icon [order]="-1" /></span>
                      <span>Status <j-sort-icon [order]="0" /></span>
                    </div>
                  }
                  @case ('splitter') {
                    <j-splitter styleClass="j-doc-splitter">
                      <section>Navigation panel</section>
                      <section>Content panel</section>
                    </j-splitter>
                  }
                  @case ('stepper') {
                    <j-stepper [items]="stepperItems" [activeIndex]="1" />
                  }
                  @case ('tab') {
                    <j-tabs>
                      <j-tab header="Overview">Overview content</j-tab>
                      <j-tab header="Activity">Activity content</j-tab>
                    </j-tabs>
                  }
                  @case ('table-empty-state') {
                    <j-table-empty-state title="No orders" message="Try adjusting your filters." />
                  }
                  @case ('table-skeleton') {
                    <j-table-skeleton [rows]="4" [columns]="4" />
                  }
                  @case ('tiered-menu') {
                    <j-tiered-menu [model]="menuItems" />
                  }
                  @case ('time-picker') {
                    <j-time-picker label="Meeting time" [(ngModel)]="meetingTime" />
                  }
                  @case ('topbar') {
                    <j-topbar [model]="menuItems" activeKey="Open">
                      <strong jTopbarBrand>JRNG UI</strong>
                    </j-topbar>
                  }
                  @case ('transfer-list') {
                    <j-transfer-list
                      [source]="transferSource"
                      [target]="transferTarget"
                      sourceHeader="Available fields"
                      targetHeader="Visible fields"
                      filter
                    />
                  }
                  @case ('tree') {
                    <j-tree [value]="treeNodes" filter ariaLabel="Workspace folders" />
                  }
                  @case ('tree-table') {
                    <j-tree-table
                      [value]="treeNodes"
                      [columns]="treeColumns"
                      ariaLabel="Project hierarchy"
                    />
                  }
                  @case ('video-player') {
                    <j-video-player
                      src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
                      caption="YouTube embed example"
                    />
                  }
                  @case ('virtual-scroller') {
                    <j-virtual-scroller
                      [items]="virtualItems"
                      [itemSize]="40"
                      [viewportItems]="5"
                      height="12rem"
                    />
                  }
                  @case ('formatting') {
                    <div class="j-format-demo">
                      <span
                        >Date/time <strong>{{ sampleDate | jDateTimeFormat }}</strong></span
                      >
                      <span
                        >Currency <strong>{{ 42800 | jCurrencyFormat: 'USD' }}</strong></span
                      >
                      <span
                        >Percent <strong>{{ 0.128 | jPercentFormat }}</strong></span
                      >
                      <span
                        >File size <strong>{{ 2457600 | jFileSizeFormat }}</strong></span
                      >
                      <span
                        >Truncate <strong>{{ longText | jTruncate: 36 }}</strong></span
                      >
                    </div>
                  }
                  @default {
                    <div class="j-generated-component-preview">
                      <header>
                        <span class="j-doc-icon"><j-icon [name]="doc().icon" /></span>
                        <div>
                          <strong>{{ doc().name }} preview</strong>
                          <p>
                            Generated preview built from the public selector and import metadata.
                            Use the code tab for the exact starter snippet.
                          </p>
                        </div>
                      </header>

                      <div
                        class="j-generated-component-preview__sample"
                        [attr.data-category]="doc().category"
                      >
                        <div class="j-generated-preview-card">
                          <div class="j-generated-preview-card__header">
                            <span class="j-generated-preview-card__icon">
                              <j-icon [name]="doc().icon" />
                            </span>
                            <div>
                              <strong>{{ doc().name }}</strong>
                              <span>{{ doc().category }}</span>
                            </div>
                          </div>

                          <div class="j-generated-preview-card__body">
                            @if (doc().category.includes('Forms')) {
                              <div class="j-generated-field">
                                <span>{{ doc().name }}</span>
                                <span class="j-generated-input">Enter value</span>
                              </div>
                              <div class="j-generated-actions">
                                <span></span>
                                <span></span>
                              </div>
                            } @else if (doc().category.includes('Layout')) {
                              <div class="j-generated-layout">
                                <aside></aside>
                                <main>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </main>
                              </div>
                            } @else if (doc().category.includes('Data')) {
                              <div class="j-generated-table">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            } @else if (doc().category.includes('Navigation')) {
                              <nav class="j-generated-menu" aria-label="Generated preview">
                                <span class="is-active">Overview</span>
                                <span>Activity</span>
                                <span>Settings</span>
                              </nav>
                            } @else if (
                              doc().category.includes('Overlay') ||
                              doc().category.includes('Status')
                            ) {
                              <div class="j-generated-overlay">
                                <strong>{{ doc().name }}</strong>
                                <p>{{ doc().description }}</p>
                                <button type="button">Action</button>
                              </div>
                            } @else if (
                              doc().category.includes('Media') ||
                              doc().category.includes('Visualization')
                            ) {
                              <div class="j-generated-visual">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            } @else {
                              <div class="j-generated-surface">
                                <strong>{{ doc().name }}</strong>
                                <p>{{ doc().description }}</p>
                              </div>
                            }
                          </div>

                          <footer>
                            <code>{{ doc().selector }}</code>
                          </footer>
                        </div>
                      </div>

                      <div class="j-generated-component-preview__meta">
                        <span
                          >Selector <code>{{ doc().selector }}</code></span
                        >
                        <span
                          >Import <code>{{ doc().importPath }}</code></span
                        >
                      </div>

                      <div class="j-generated-component-preview__code">
                        <app-code-block
                          label="Import"
                          language="ts"
                          [code]="doc().code.importCode"
                        />
                        <app-code-block
                          label="Basic usage"
                          language="html"
                          [code]="doc().code.basic"
                        />
                      </div>
                    </div>
                  }
                }
              } @placeholder {
                <div class="j-preview-stack" aria-label="Loading component preview">
                  <j-skeleton variant="text" width="12rem" />
                  <j-skeleton variant="card" />
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="j-code-grid">
            <app-code-block label="Import" language="ts" [code]="doc().code.importCode" />
            <app-code-block label="Basic usage" language="html" [code]="doc().code.basic" />
            @if (doc().code.variants) {
              <app-code-block label="Variants" language="html" [code]="doc().code.variants ?? ''" />
            }
            @if (doc().code.sizes) {
              <app-code-block label="Sizes" language="html" [code]="doc().code.sizes ?? ''" />
            }
            @if (doc().code.states) {
              <app-code-block label="States" language="html" [code]="doc().code.states ?? ''" />
            }
            @if (doc().code.angular) {
              <app-code-block
                label="Angular example"
                language="ts"
                [code]="doc().code.angular ?? ''"
              />
            }
          </div>
        }
      </section>

      <section class="j-doc-section-block">
        <h3>Usage</h3>
        @if (doc().usage.length) {
          <ul>
            @for (item of doc().usage; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        } @else {
          <div class="j-doc-empty-detail">
            <j-icon name="info" />
            <p>No additional usage guidance is required for {{ doc().name }}.</p>
          </div>
        }
      </section>

      <section class="j-doc-grid-sections">
        <div class="j-doc-section-block">
          <h3>Variants</h3>
          @if (doc().variants.length) {
            <ul>
              @for (item of doc().variants; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          } @else {
            <div class="j-doc-empty-detail">
              <j-icon name="info" />
              <p>{{ doc().name }} does not provide separate visual variants.</p>
            </div>
          }
        </div>
        <div class="j-doc-section-block">
          <h3>Sizes</h3>
          @if (doc().sizes.length) {
            <ul>
              @for (item of doc().sizes; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          } @else {
            <div class="j-doc-empty-detail">
              <j-icon name="info" />
              <p>{{ doc().name }} uses its natural or container-defined size.</p>
            </div>
          }
        </div>
        <div class="j-doc-section-block">
          <h3>States</h3>
          @if (doc().states.length) {
            <ul>
              @for (item of doc().states; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          } @else {
            <div class="j-doc-empty-detail">
              <j-icon name="info" />
              <p>No additional component-specific states are documented.</p>
            </div>
          }
        </div>
      </section>

      @if (priorityGuidance(); as guide) {
        <section class="j-doc-section-block">
          <h3>Advanced example</h3>
          <app-code-block label="Advanced usage" language="html" [code]="guide.advancedExample" />
        </section>

        <section class="j-doc-grid-sections j-priority-doc-grid">
          <div class="j-doc-section-block">
            <h3>Public methods</h3>
            @if (guide.publicMethods.length) {
              <ul>
                @for (item of guide.publicMethods; track item) {
                  <li>
                    <code>{{ item }}</code>
                  </li>
                }
              </ul>
            } @else {
              <div class="j-doc-empty-detail">
                <j-icon name="info" />
                <p>{{ doc().name }} has no imperative public methods; prefer inputs and outputs.</p>
              </div>
            }
          </div>
          <div class="j-doc-section-block">
            <h3>Templates and slots</h3>
            <ul>
              @for (item of guide.templates; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>
          <div class="j-doc-section-block">
            <h3>Reactive Forms</h3>
            <p>{{ guide.reactiveForms }}</p>
          </div>
          <div class="j-doc-section-block">
            <h3>Validation states</h3>
            <ul>
              @for (item of guide.validationStates; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>
          <div class="j-doc-section-block">
            <h3>Loading and disabled states</h3>
            <ul>
              @for (item of guide.loadingDisabledStates; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>
          <div class="j-doc-section-block">
            <h3>Keyboard behaviour</h3>
            <ul>
              @for (item of guide.keyboardBehaviour; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>
          <div class="j-doc-section-block">
            <h3>Responsive behaviour</h3>
            <p>{{ guide.responsiveBehaviour }}</p>
          </div>
          <div class="j-doc-section-block">
            <h3>Dark-mode preview</h3>
            <div class="j-dark-mode-preview j-dark">
              <span><j-icon [name]="doc().icon" /></span>
              <div>
                <strong>{{ doc().name }}</strong>
                <p>{{ guide.darkMode }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="j-doc-grid-sections">
          <div class="j-doc-section-block">
            <h3>Common real-world example</h3>
            <p>{{ guide.realWorldExample }}</p>
          </div>
          <div class="j-doc-section-block">
            <h3>Troubleshooting</h3>
            <ul>
              @for (item of guide.troubleshooting; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>
        </section>
      }

      <section class="j-doc-section-block">
        <h3>Props / Inputs</h3>
        @if (doc().inputs.length) {
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
                    <td>
                      <code>{{ row.name }}</code>
                    </td>
                    <td>{{ row.type }}</td>
                    <td>
                      <code>{{ row.defaultValue }}</code>
                    </td>
                    <td>{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="j-doc-empty-detail">
            <j-icon name="info" />
            <p>
              {{ doc().name }} does not expose additional component-specific inputs. Use its
              documented selector and projected content.
            </p>
          </div>
        }
      </section>

      <section class="j-doc-section-block">
        <h3>Events / Outputs</h3>
        @if (doc().outputs.length) {
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
                    <td>
                      <code>{{ row.event }}</code>
                    </td>
                    <td>{{ row.payload }}</td>
                    <td>{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="j-doc-empty-detail">
            <j-icon name="info" />
            <p>{{ doc().name }} does not emit component-specific events.</p>
          </div>
        }
      </section>

      <section class="j-doc-section-block">
        <h3>CSS variables</h3>
        @if ((doc().cssVariables?.length ?? 0) > 0) {
          <div class="j-table-wrap">
            <table class="j-api-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Default / fallback</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                @for (row of doc().cssVariables ?? []; track row.variable) {
                  <tr>
                    <td>
                      <code>{{ row.variable }}</code>
                    </td>
                    <td>
                      <code>{{ row.fallback }}</code>
                    </td>
                    <td>{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="j-doc-empty-detail">
            <j-icon name="palette" />
            <p>
              {{ doc().name }} has no component-specific CSS variables. It inherits the shared JRNG
              UI semantic theme tokens.
            </p>
          </div>
        }
      </section>

      <section class="j-doc-grid-sections">
        <div class="j-doc-section-block">
          <h3>Accessibility</h3>
          @if (doc().accessibility.length) {
            <ul>
              @for (item of doc().accessibility; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          } @else {
            <div class="j-doc-empty-detail">
              <j-icon name="accessibility" />
              <p>No additional accessibility requirements beyond the documented usage.</p>
            </div>
          }
        </div>
        <div class="j-doc-section-block">
          <h3>Best Practices</h3>
          @if (doc().bestPractices.length) {
            <ul>
              @for (item of doc().bestPractices; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          } @else {
            <div class="j-doc-empty-detail">
              <j-icon name="lightbulb" />
              <p>No additional component-specific best practices are required.</p>
            </div>
          }
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
  private readonly confirmation = inject(JConfirmationService);
  private readonly dialogService = inject(JrDialogService);
  private readonly tour = inject(JTourService);

  readonly doc = input.required<ComponentDoc>();

  priorityGuidance(): PriorityComponentGuidance | null {
    return priorityComponentGuidance[this.doc().slug] ?? null;
  }
  readonly activeTab = signal<DetailTab>('preview');
  readonly dialogOpen = signal(false);
  readonly drawerOpen = signal(false);
  readonly popoverOpen = signal(false);
  readonly overlayPreviewSlugs = new Set([
    'action-menu',
    'autocomplete',
    'color-picker',
    'combobox',
    'confirm-popup',
    'context-menu',
    'date-picker',
    'date-range-picker',
    'drawer',
    'menubar',
    'overlay-panel',
    'popover',
    'select',
    'tiered-menu',
    'time-picker',
  ]);
  readonly statusPreviewSlugs = new Set(['empty-page', 'error-page', 'maintenance-page']);

  bottomSheetVisible = false;
  commandPaletteOpen = false;
  imagePreviewOpen = false;
  notificationOpen = false;
  checked = true;
  enabled = true;
  published = false;
  plan = 'pro';
  viewMode = 'list';
  brandColor = '#4f46e5';
  dueDate: Date | null = new Date(2026, 6, 18);
  pickerRange: readonly Date[] = [new Date(2026, 6, 12), new Date(2026, 6, 19)];
  floatEmail = 'avery@example.com';
  quantity = 3;
  budget = 2500;
  otp = '';
  selectedTeam = 'engineering';
  selectedSkills: string[] = ['angular', 'accessibility'];
  rating = 4;
  completion = 65;
  calendarDate = new Date(2026, 6, 12);
  dateRange: readonly string[] = ['2026-07-12', '2026-07-19'];
  editorValue = '<p>Build accessible Angular interfaces with stable components.</p>';
  meetingTime = '14:30';
  selectedCustomer = 'acme';
  tags: string[] = ['Angular', 'Accessibility'];
  maskedPhone = '(555) 123-4567';
  employeeId = 'JR-2048';
  galleryAnimation: 'fade' | 'zoom' | 'slide' | 'none' = 'fade';
  readonly galleryAnimations = ['fade', 'zoom', 'slide', 'none'] as const;

  readonly statuses = ['Draft', 'Published', 'Archived'];
  readonly brandPresets = ['#4f46e5', '#2563eb', '#0891b2', '#16a34a', '#d97706', '#dc2626'];
  readonly teams = [
    { id: 'design', name: 'Design' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'support', name: 'Support', disabled: true },
  ] as const;
  readonly customerSuggestions = [
    { label: 'Acme Inc.', value: 'acme' },
    { label: 'Northwind', value: 'northwind' },
    { label: 'Globex', value: 'globex' },
  ] as const;
  autocompleteSuggestions: readonly { label: string; value: string }[] = [
    ...this.customerSuggestions,
  ];
  readonly teamOptions = [
    { label: 'Design', value: 'design' },
    { label: 'Engineering', value: 'engineering' },
    { label: 'Support', value: 'support' },
  ] as const;
  readonly skillOptions = [
    { label: 'Angular', value: 'angular' },
    { label: 'Accessibility', value: 'accessibility' },
    { label: 'Testing', value: 'testing' },
  ] as const;
  readonly avatarGroupItems = [
    { label: 'Avery Reed' },
    { label: 'Morgan Kim' },
    { label: 'Jordan Lee' },
    { label: 'Taylor Smith' },
  ] as const;
  readonly radioGroupOptions = [
    { label: 'Starter', value: 'starter' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise', disabled: true },
  ] as const;
  readonly viewModes = [
    { label: 'List', value: 'list' },
    { label: 'Grid', value: 'grid' },
    { label: 'Kanban', value: 'kanban' },
  ] as const;
  readonly meterSegments = [
    { label: 'Used', value: 42, severity: 'primary' },
    { label: 'Reserved', value: 24, severity: 'success' },
    { label: 'Remaining', value: 18, severity: 'warning' },
  ] as const;
  readonly sparklineValues = [12, 18, 16, 24, 30, 28, 36, 42] as const;
  readonly previewImage = '/assets/gallery/alpine-dawn.png';
  readonly schedulerEvents = [
    {
      id: 'planning',
      title: 'Planning',
      start: new Date(2026, 6, 12, 10),
      end: new Date(2026, 6, 12, 11),
      color: '#6366f1',
    },
    {
      id: 'review',
      title: 'Design review',
      start: new Date(2026, 6, 14, 14),
      end: new Date(2026, 6, 14, 15),
      color: '#0ea5e9',
    },
  ] as const;
  readonly carouselItems = [
    {
      title: 'Alpine dawn',
      description: 'A quiet mountain lake at first light.',
      image: '/assets/gallery/alpine-dawn.png',
      alt: 'Mountain lake reflecting a warm sunrise',
    },
    {
      title: 'Coastal light',
      description: 'A lighthouse above a vivid blue coast.',
      image: '/assets/gallery/coastal-light.png',
      alt: 'Lighthouse on a rugged blue coastline',
    },
    {
      title: 'Desert arches',
      description: 'Sunlit sandstone against cobalt shadows.',
      image: '/assets/gallery/desert-arches.png',
      alt: 'Sandstone arches in golden desert light',
    },
  ] as const;
  readonly chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{ label: 'Signups', data: [32, 48, 41, 64, 78], backgroundColor: '#6366f1' }],
  };
  readonly lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active users',
        data: [120, 154, 148, 190, 224, 205, 248],
        borderColor: '#0891b2',
        backgroundColor: 'rgba(8, 145, 178, 0.14)',
        fill: true,
        tension: 0.35,
      },
    ],
  };
  readonly commands = [
    { id: 'new', label: 'Create project', description: 'Start a new project', group: 'Actions' },
    { id: 'search', label: 'Search docs', description: 'Find a component', group: 'Navigate' },
    { id: 'theme', label: 'Toggle theme', description: 'Switch color mode', group: 'Settings' },
  ] as const;
  readonly dataViewItems = ['Design system', 'Documentation portal', 'Admin workspace'];
  readonly galleryItems = [
    {
      src: '/assets/gallery/alpine-dawn.png',
      alt: 'Mountain lake at dawn',
      caption: 'Alpine dawn',
    },
    {
      src: '/assets/gallery/coastal-light.png',
      alt: 'Lighthouse on the coast',
      caption: 'Coastal light',
    },
    {
      src: '/assets/gallery/desert-arches.png',
      alt: 'Desert sandstone arches',
      caption: 'Desert arches',
    },
  ] as const;
  readonly ganttTasks = [
    { id: 'design', label: 'Design', start: '2026-07-06', end: '2026-07-12', progress: 100 },
    { id: 'build', label: 'Build', start: '2026-07-10', end: '2026-07-20', progress: 65 },
    { id: 'qa', label: 'QA', start: '2026-07-18', end: '2026-07-24', progress: 20 },
  ] as const;
  readonly kanbanColumns = [
    {
      id: 'todo',
      title: 'To do',
      cards: [
        { id: 'docs', title: 'Polish docs spacing', metadata: 'Design system' },
        { id: 'tests', title: 'Add visual tests', metadata: 'Quality' },
      ],
    },
    {
      id: 'doing',
      title: 'In progress',
      cards: [{ id: 'previews', title: 'Complete previews', metadata: 'Documentation' }],
    },
    {
      id: 'done',
      title: 'Done',
      cards: [{ id: 'checkbox', title: 'Fix checkbox alignment', metadata: 'Components' }],
    },
  ] as const;
  kanbanPreviewColumns: readonly JKanbanColumn[] = this.kanbanColumns;
  readonly megaMenuItems = [
    {
      label: 'Products',
      groups: [
        {
          label: 'Build',
          items: [{ label: 'Components' }, { label: 'Templates' }, { label: 'Themes' }],
        },
        { label: 'Learn', items: [{ label: 'Documentation' }, { label: 'Examples' }] },
      ],
    },
    { label: 'Resources' },
  ] as const;
  readonly transferSource = [
    { label: 'Customer', value: 'customer' },
    { label: 'Status', value: 'status' },
    { label: 'Created date', value: 'created' },
  ] as const;
  readonly transferTarget = [{ label: 'Order number', value: 'order' }] as const;
  readonly organization = {
    key: 'ceo',
    label: 'Avery Reed',
    expanded: true,
    children: [
      { key: 'design', label: 'Morgan Kim' },
      { key: 'engineering', label: 'Jordan Lee' },
    ],
  } as const;
  readonly stepperItems = [
    { label: 'Details', completed: true },
    { label: 'Review', description: 'Check your changes' },
    { label: 'Publish' },
  ] as const;
  readonly treeNodes = [
    {
      key: 'workspace',
      label: 'Workspace',
      children: [
        { key: 'components', label: 'Components', leaf: true },
        { key: 'guides', label: 'Guides', leaf: true },
      ],
    },
    { key: 'archive', label: 'Archive', leaf: true },
  ] as const;
  readonly treeColumns: readonly JTableColumn[] = [
    { field: 'label', header: 'Name' },
    { field: 'type', header: 'Type' },
  ];
  readonly virtualItems = Array.from({ length: 100 }, (_, index) => `Record ${index + 1}`);
  readonly orderColumns: readonly JTableColumn[] = [
    { field: 'order', header: 'Order', sortable: true },
    { field: 'customer', header: 'Customer', filterable: true, resizable: true },
    { field: 'status', header: 'Status', filterable: true },
    { field: 'total', header: 'Total', align: 'end', sortable: true },
    {
      field: 'actions',
      header: 'Actions',
      type: 'action',
      actions: [
        { key: 'view', label: 'View' },
        { key: 'delete', label: 'Delete', severity: 'danger' },
      ],
    },
  ];

  readonly tableConfig: JTableConfig = {
    pagination: true,
    sortable: true,
    multiSort: true,
    filterRow: true,
    columnFilter: true,
    globalSearch: true,
    columnManager: true,
    exportable: true,
    stateful: true,
    reorderableRows: true,
    lockableRows: true,
    reorderableColumns: true,
    resizableColumns: true,
    maximizable: true,
    size: 'medium',
    export: { rows: 'selected', visibleColumnsOnly: true },
  };

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

  readonly rowActions: readonly JTableAction[] = [
    { key: 'view', label: 'View' },
    { key: 'duplicate', label: 'Duplicate' },
    { key: 'delete', label: 'Delete', severity: 'danger' },
  ];

  readonly timelineItems: readonly JTimelineItem[] = [
    { title: 'Created', content: 'Order was created.', opposite: '09:00', severity: 'info' },
    {
      title: 'Approved',
      content: 'Manager approved the request.',
      opposite: '10:15',
      severity: 'success',
    },
    {
      title: 'Queued',
      content: 'Waiting for fulfillment.',
      opposite: '11:20',
      severity: 'warning',
    },
  ];

  readonly sampleDate = new Date(2026, 6, 5, 14, 30);
  readonly longText = 'Quarterly operations report with regional summaries and exception details';

  readonly pageHeaderBreadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Operations', url: '/docs' },
    { label: 'Orders' },
  ] as const;

  readonly menuItems: readonly JMenuItem[] = [
    { label: 'Open', icon: 'file' },
    { label: 'Duplicate', icon: 'copy', badge: 'New' },
    { separator: true },
    {
      label: 'More',
      icon: 'more-horizontal',
      items: [
        { label: 'Archive', icon: 'archive' },
        { label: 'Settings', icon: 'settings', disabled: true },
      ],
    },
  ];
  readonly menubarItems: readonly JMenuItem[] = [
    {
      label: 'File',
      icon: 'file',
      items: [
        { label: 'Open project', icon: 'folder-code' },
        { label: 'Duplicate', icon: 'copy' },
      ],
    },
    {
      label: 'Manage',
      icon: 'settings',
      items: [
        { label: 'Archive', icon: 'archive' },
        { label: 'Preferences', icon: 'settings' },
      ],
    },
  ];
  showToast(severity: 'success' | 'error' | 'warning'): void {
    if (severity === 'success') {
      this.toast.success('The project was saved.', 'Saved', { position: 'bottom-right' });
      return;
    }
    if (severity === 'error') {
      this.toast.error('Check the required fields and try again.', 'Could not save', {
        position: 'bottom-right',
      });
      return;
    }
    this.toast.warning('Some changes still need review.', 'Review required', {
      position: 'bottom-right',
    });
  }

  openConfirm(severity: 'default' | 'danger' = 'default'): void {
    this.confirmation.confirm({
      header: severity === 'danger' ? 'Delete record' : 'Confirm action',
      message:
        severity === 'danger'
          ? 'This action cannot be undone.'
          : 'Review the details before continuing.',
      acceptLabel: severity === 'danger' ? 'Delete' : 'Continue',
      rejectLabel: 'Cancel',
    });
  }

  openConfirmPopup(event: Event): void {
    this.confirmation.confirm({
      target: event.currentTarget as HTMLElement,
      header: 'Archive project?',
      message: 'You can restore it later from the archive.',
      acceptLabel: 'Archive',
      rejectLabel: 'Cancel',
    });
  }

  startPreviewTour(): void {
    void this.tour.start({
      id: 'docs-tour-preview',
      steps: ['create-button', 'filter-button'],
      showProgress: true,
    });
  }

  handleKanbanReorder(event: JKanbanMoveEvent): void {
    this.kanbanPreviewColumns = event.columns;
  }

  addKanbanCard(event: JKanbanColumnEvent): void {
    const nextNumber = this.kanbanPreviewColumns.reduce(
      (count, column) => count + column.cards.length,
      1,
    );
    this.kanbanPreviewColumns = this.kanbanPreviewColumns.map((column) =>
      column.id === event.column.id
        ? {
            ...column,
            cards: [
              ...column.cards,
              { id: `task-${nextNumber}`, title: `New task ${nextNumber}`, metadata: 'New' },
            ],
          }
        : column,
    );
  }

  removeKanbanCard(event: JKanbanCardEvent): void {
    this.kanbanPreviewColumns = this.kanbanPreviewColumns.map((column) =>
      column.id === event.column.id
        ? { ...column, cards: column.cards.filter((card) => card.id !== event.card.id) }
        : column,
    );
  }

  openDynamicDialog(): void {
    this.dialogService.open({
      title: 'Project summary',
      message: 'This dialog was created through the shared dialog service.',
      size: 'sm',
    });
  }

  filterCustomerSuggestions(query: string): void {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    this.autocompleteSuggestions = normalizedQuery
      ? this.customerSuggestions.filter((item) =>
          item.label.toLocaleLowerCase().includes(normalizedQuery),
        )
      : [...this.customerSuggestions];
  }

  handleTableExport(event: JTableExportEvent): void {
    event.preventDefault();
    this.toast.info(`${event.rows.length} row(s) prepared for export.`, 'Export event', {
      position: 'bottom-right',
    });
  }
}

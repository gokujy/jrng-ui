import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-form-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('cron-expression') {
        <j-cron-expression
          ariaLabel="Nightly customer report schedule"
          label="Nightly customer report"
          value="0 2 * * 1-5"
          [previewFrom]="cronPreviewFrom"
        />
      }
      @case ('query-builder') {
        <j-query-builder
          ariaLabel="Customer search query"
          label="Customer search"
          description="Match customers using typed, nested conditions."
          [fields]="queryBuilderFields"
          [value]="queryBuilderValue"
        />
      }
      @case ('autocomplete') {
        <div class="j-overlay-form-preview">
          <j-autocomplete
            label="Customer"
            [suggestions]="autocompleteSuggestions"
            placeholder="Type a customer name"
            (completeMethod)="filterCustomerSuggestions($event)"
          />
          <p class="j-preview-note">Type “Acme” or “Northwind” to filter suggestions.</p>
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
          @switch (example.key) {
            @case ('range') {
              <j-date-picker
                label="Reporting period"
                selectionMode="range"
                [presets]="datePresets"
                [(ngModel)]="pickerRange"
              />
            }
            @case ('multiple') {
              <j-date-picker
                label="Available dates"
                selectionMode="multiple"
                [(ngModel)]="multipleDates"
              />
            }
            @case ('constraints') {
              <j-date-picker
                label="Booking date"
                [minDate]="bookingMinDate"
                [maxDate]="bookingMaxDate"
                [(ngModel)]="bookingDate"
              />
            }
            @case ('disabled-dates') {
              <j-date-picker
                label="Appointment"
                [disabledDates]="unavailableDates"
                [(ngModel)]="appointmentDate"
              />
            }
            @case ('inline') {
              <j-date-picker label="Schedule" inline [(ngModel)]="inlineDate" />
            }
            @case ('time') {
              <j-date-picker
                label="Starts at"
                showTime
                hourFormat="12"
                [(ngModel)]="dateTimeValue"
              />
            }
            @case ('month') {
              <j-date-picker label="Billing month" view="month" [(ngModel)]="billingMonth" />
            }
            @case ('month-custom') {
              <j-date-picker
                label="Reporting month"
                view="month"
                dateFormat="MMM yyyy"
                [(ngModel)]="reportingMonth"
              />
            }
            @case ('disabled') {
              <j-date-picker label="Locked date" disabled [(ngModel)]="lockedDate" />
            }
            @default {
              <j-date-picker label="Due date" placeholder="Choose a date" [(ngModel)]="dueDate" />
            }
          }
        </div>
      }
      @case ('input-mask') {
        <j-input-mask
          label="Customer phone"
          mask="(999) 999-9999"
          placeholder="(555) 123-4567"
          [(ngModel)]="maskedPhone"
        />
      }
      @case ('input-number') {
        <j-input-number
          label="Outstanding balance"
          mode="currency"
          currency="USD"
          [(ngModel)]="budget"
        />
      }
      @case ('input-otp') {
        <j-input-otp label="Verification code" [length]="6" numericOnly [(ngModel)]="otp" />
      }
      @case ('listbox') {
        <j-listbox label="Account manager" [options]="teamOptions" [(ngModel)]="selectedTeam" />
      }
      @case ('multiselect') {
        <j-multiselect
          label="Customer segments"
          [options]="skillOptions"
          placeholder="Select skills"
          [(ngModel)]="selectedSkills"
        />
      }
      @case ('password') {
        <j-password
          label="Password"
          placeholder="Enter a secure password"
          feedback
          toggleVisibility
        />
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
        <j-input
          label="Email"
          placeholder="name@example.com"
          [variant]="inputVariants[example.index]"
        />
      }
      @case ('textarea') {
        <j-textarea
          label="Message"
          placeholder="Write a short message"
          [variant]="inputVariants[example.index]"
          showCount
          [maxLength]="120"
          [rows]="4"
          fullWidth
        />
      }
      @case ('select') {
        @if (example.key === 'multi-column') {
          <j-select
            label="Customer"
            [options]="customerSelectOptions"
            [columns]="customerSelectColumns"
            optionLabel="name"
            optionValue="id"
            searchable
            sortable
            placeholder="Choose customer"
          >
            <ng-template jSelectCell="status" let-value>
              <j-status-chip [label]="$any(value)" />
            </ng-template>
          </j-select>
        } @else {
          <j-select
            label="Customer status"
            [options]="statuses"
            placeholder="Choose status"
            clearable
          />
        }
      }
      @case ('tree-select') {
        <j-tree-select
          label="Customer segments"
          [nodes]="customerTree"
          selectionMode="checkbox"
          propagation="both"
          searchable
          clearable
          [(ngModel)]="selectedCustomerNodes"
        />
      }
      @case ('cascader') {
        <j-cascader
          label="Customer location"
          [options]="customerLocations"
          searchable
          clearable
          [(ngModel)]="selectedCustomerLocation"
        />
      }
      @case ('checkbox') {
        <div class="j-preview-row">
          @switch (example.key) {
            @case ('group') {
              <j-checkbox
                name="interests"
                label="Design"
                value="design"
                [(ngModel)]="selectedInterests"
              />
              <j-checkbox
                name="interests"
                label="Engineering"
                value="engineering"
                [(ngModel)]="selectedInterests"
              />
              <j-checkbox
                name="interests"
                label="Research"
                value="research"
                [(ngModel)]="selectedInterests"
              />
            }
            @case ('indeterminate') {
              <j-checkbox label="Select all projects" indeterminate />
            }
            @case ('sizes') {
              <j-checkbox label="Small" size="sm" />
              <j-checkbox label="Default" />
              <j-checkbox label="Large" size="lg" />
            }
            @case ('readonly') {
              <j-checkbox label="Verified by policy" readonly [(ngModel)]="policyVerified" />
            }
            @case ('invalid') {
              <j-checkbox label="Accept terms" required invalid error="Acceptance is required." />
            }
            @case ('disabled') {
              <j-checkbox label="Managed by administrator" disabled [(ngModel)]="managedSetting" />
            }
            @default {
              <j-checkbox label="Send receipt" [(ngModel)]="receiptEnabled" />
            }
          }
        </div>
      }
      @case ('radio') {
        <div class="j-preview-row">
          @if (example.key === 'sizes') {
            <j-radio
              name="densityChoice"
              label="Small"
              value="small"
              size="sm"
              [(ngModel)]="radioSizeChoice"
            />
            <j-radio
              name="densityChoice"
              label="Default"
              value="default"
              [(ngModel)]="radioSizeChoice"
            />
            <j-radio
              name="densityChoice"
              label="Large"
              value="large"
              size="lg"
              [(ngModel)]="radioSizeChoice"
            />
          } @else if (example.key === 'disabled') {
            <j-radio
              name="lockedChoice"
              label="Managed plan"
              value="managed"
              disabled
              [(ngModel)]="lockedPlan"
            />
          } @else {
            <j-radio name="planChoice" label="Starter" value="starter" [(ngModel)]="plan" />
            <j-radio name="planChoice" label="Pro" value="pro" [(ngModel)]="plan" />
            <j-radio name="planChoice" label="Enterprise" value="enterprise" [(ngModel)]="plan" />
          }
        </div>
      }
      @case ('switch') {
        <j-switch label="Customer email alerts" [(ngModel)]="enabled" />
      }
      @case ('label') {
        <j-label
          label="Email address"
          variant="floating"
          description="We use this for account notices."
        >
          <j-input type="email" [(ngModel)]="labeledEmail" width="full" />
        </j-label>
      }
      @case ('form-field') {
        <j-form-field label="Workspace name" hint="Use a short, recognizable team name.">
          <j-input placeholder="Operations" />
        </j-form-field>
      }
      @case ('icon-field') {
        @if (example.key === 'disabled') {
          <j-icon-field prefixIcon="lock" disabled fullWidth ariaLabel="Locked search">
            <j-input
              name="lockedSearch"
              disabled
              [(ngModel)]="iconFieldDisabledSearch"
              width="full"
            />
          </j-icon-field>
        } @else {
          <j-icon-field
            prefixIcon="search"
            clearable
            fullWidth
            ariaLabel="Project search"
            (clear)="iconFieldBasicSearch = ''"
          >
            <j-input
              name="projectSearch"
              placeholder="Search projects"
              [(ngModel)]="iconFieldBasicSearch"
              width="full"
            />
          </j-icon-field>
        }
      }
      @case ('input-group') {
        @switch (example.key) {
          @case ('website') {
            <j-input-group
              prefixAddon="https://"
              suffixAddon=".example.com"
              ariaLabel="Workspace URL"
            >
              <j-input name="workspaceSlug" [(ngModel)]="workspaceSlug" />
            </j-input-group>
          }
          @case ('email') {
            <j-input-group suffixAddon="@jrng.dev" fullWidth ariaLabel="Work email">
              <j-input name="emailAlias" [(ngModel)]="emailAlias" width="full" />
            </j-input-group>
          }
          @case ('comfortable') {
            <j-input-group prefixAddon="Qty" [compact]="false" ariaLabel="Order quantity">
              <j-input name="orderQuantity" type="number" [(ngModel)]="groupQuantity" />
            </j-input-group>
          }
          @case ('disabled') {
            <j-input-group prefixAddon="$" suffixAddon=".00" disabled ariaLabel="Locked amount">
              <j-input name="lockedAmount" disabled [ngModel]="1250" />
            </j-input-group>
          }
          @default {
            <j-input-group prefixAddon="$" suffixAddon=".00" ariaLabel="Budget amount">
              <j-input name="budgetAmount" type="number" [(ngModel)]="groupBudget" />
            </j-input-group>
          }
        }
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
        <j-select-button label="View mode" [options]="viewModes" [(ngModel)]="viewMode" />
      }
      @case ('toggle-button') {
        <j-toggle-button onLabel="Published" offLabel="Draft" [(ngModel)]="published" />
      }
      @case ('chips') {
        <j-chips label="Skills" placeholder="Add a skill" [(ngModel)]="tags" />
      }
      @case ('editor') {
        @if (example.key === 'html') {
          <j-editor
            label="Release notes"
            showSourceToggle
            showWordCount
            [(ngModel)]="editorHtmlValue"
          />
        } @else {
          <j-editor
            label="Description"
            placeholder="Write a short summary"
            hint="Use the toolbar to format the document."
            showWordCount
            showFullscreen
            [(ngModel)]="editorValue"
          />
        }
      }
      @case ('knob') {
        <j-knob label="Completion" [(ngModel)]="completion" />
      }
      @case ('time-picker') {
        <j-time-picker label="Meeting time" [(ngModel)]="meetingTime" />
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
  selectedCustomerNodes = [];
  selectedCustomerLocation: unknown = null;
}

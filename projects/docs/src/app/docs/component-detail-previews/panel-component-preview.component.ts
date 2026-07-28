import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-panel-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('accordion') {
        <j-accordion [variant]="accordionVariants[example.index]" value="account">
          <j-accordion-panel value="account">
            <j-accordion-header>Account details</j-accordion-header>
            <j-accordion-content>Update profile and contact information.</j-accordion-content>
          </j-accordion-panel>
          <j-accordion-panel value="disabled" disabled>
            <j-accordion-header>Disabled section</j-accordion-header>
            <j-accordion-content>Unavailable content.</j-accordion-content>
          </j-accordion-panel>
        </j-accordion>
      }
      @case ('accordion-panel') {
        <j-accordion value="summary">
          <j-accordion-panel value="summary">
            <j-accordion-header>Customer summary</j-accordion-header>
            <j-accordion-content>This panel is expanded by default.</j-accordion-content>
          </j-accordion-panel>
          <j-accordion-panel value="team">
            <j-accordion-header>Team members</j-accordion-header>
            <j-accordion-content
              >Panel content can contain any Angular template.</j-accordion-content
            >
          </j-accordion-panel>
        </j-accordion>
      }
      @case ('accordion-header') {
        <j-accordion [value]="example.key === 'disabled' ? null : 'section'">
          <j-accordion-panel value="section" [disabled]="example.key === 'disabled'">
            <j-accordion-header>
              {{
                example.key === 'rich'
                  ? 'Billing settings'
                  : example.key === 'disabled'
                    ? 'Managed by administrator'
                    : 'Account details'
              }}
              @if (example.key === 'rich') {
                <j-badge value="Required" severity="warning" />
              }
            </j-accordion-header>
            <j-accordion-content>
              {{
                example.key === 'disabled'
                  ? 'This section is unavailable.'
                  : 'Update the settings associated with this section.'
              }}
            </j-accordion-content>
          </j-accordion-panel>
        </j-accordion>
      }
      @case ('accordion-content') {
        <j-accordion value="section">
          <j-accordion-panel value="section">
            <j-accordion-header>
              {{ example.key === 'form' ? 'Customer settings' : 'Customer summary' }}
            </j-accordion-header>
            <j-accordion-content>
              @if (example.key === 'form') {
                <j-input label="Display name" value="Avery Reed" />
                <j-button label="Save profile" />
              } @else {
                <p>The renewal is on schedule and all required reviews have passed.</p>
              }
            </j-accordion-content>
          </j-accordion-panel>
        </j-accordion>
      }
      @case ('divider') {
        @if (example.key === 'vertical') {
          <div class="j-divider-row">
            <j-button label="Preview" variant="text" />
            <j-divider layout="vertical" />
            <j-button label="Publish" variant="text" />
          </div>
        } @else if (example.key === 'label') {
          <j-divider text="Advanced settings" position="start" />
        } @else if (example.key === 'styles') {
          <div class="j-preview-stack">
            <j-divider lineStyle="solid" />
            <j-divider lineStyle="dashed" />
            <j-divider lineStyle="dotted" />
            <j-divider lineStyle="double" />
          </div>
        } @else if (example.key === 'strength') {
          <div class="j-preview-stack">
            <j-divider strength="subtle" spacing="compact" />
            <j-divider strength="strong" spacing="spacious" />
          </div>
        } @else {
          <div class="j-preview-stack">
            <span>Profile details</span>
            <j-divider />
            <span>Notification preferences</span>
          </div>
        }
      }
      @case ('card') {
        @if (example.key === 'metric') {
          <app-card-metric-demo />
        } @else {
          @switch (example.key) {
            @case ('slots') {
              <j-card header="Customer plan" subheader="Enterprise subscription" footer="Updated today"
                >The next renewal review is scheduled.</j-card
              >
            }
            @case ('form') {
              <j-card header="Customer settings"
                ><j-input label="Customer segment" value="Growth" /><j-button
                  jCardActions
                  label="Save"
              /></j-card>
            }
            @case ('profile') {
              <j-card header="Avery Reed" subheader="Account manager"
                ><j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" size="lg"
              /></j-card>
            }
            @case ('product') {
              <j-card header="Team plan" subheader="For growing teams"
                ><strong>$24 / month</strong><j-button jCardActions label="Choose plan"
              /></j-card>
            }
            @case ('pricing') {
              <j-card header="Business" subheader="Advanced controls"
                ><strong>$49 / month</strong><j-button jCardActions label="Start trial"
              /></j-card>
            }
            @case ('trend') {
              <j-card header="Active accounts"
                ><strong>1,284</strong><j-badge value="+8.2%" severity="success"
              /></j-card>
            }
            @case ('chart') {
              <j-card header="Weekly volume"
                ><j-progress-bar [value]="64" label="64% of weekly target"
              /></j-card>
            }
            @case ('progress') {
              <j-card header="Storage"
                ><strong>72 GB of 100 GB</strong><j-progress-bar [value]="72" label="72% used"
              /></j-card>
            }
            @case ('status') {
              <j-card header="Customer status"
                ><j-badge value="Ready" severity="success" />
                <p>All required checks passed.</p></j-card
              >
            }
            @case ('clickable') {
              <j-card header="Open customer" subheader="Keyboard focusable" interactive
                ><p>View customer details.</p></j-card
              >
            }
            @case ('loading') {
              <j-card header="Loading report" skeleton />
            }
            @case ('empty') {
              <j-card header="Saved views"
                ><j-empty
                  title="No saved views"
                  description="Save a filter to reuse it here."
                  variant="inline"
              /></j-card>
            }
            @case ('error') {
              <j-card header="Account summary"
                ><j-empty
                  title="Could not load summary"
                  description="Try again in a moment."
                  variant="inline"
              /></j-card>
            }
            @case ('template') {
              <j-card
                ><div jCardHeader><strong>Custom header</strong></div>
                <p>Projected card content.</p>
                <j-button jCardActions label="Continue"
              /></j-card>
            }
            @default {
              <j-card header="Customer review"
                ><p>Review account activity and the upcoming renewal.</p></j-card
              >
            }
          }
        }
      }
      @case ('tabs') {
        <j-tabs [variant]="tabsVariants[example.index]">
          <j-tab header="Overview"><p>Summary for this record.</p></j-tab>
          <j-tab header="Activity"><p>Recent audit history.</p></j-tab>
          <j-tab header="Long settings label" disabled><p>Unavailable.</p></j-tab>
        </j-tabs>
      }
      @case ('fieldset') {
        <j-fieldset legend="Billing address" toggleable>
          <div class="j-preview-grid">
            <j-input label="Street" placeholder="123 Market St" />
            <j-input label="City" placeholder="San Francisco" />
          </div>
        </j-fieldset>
      }
      @case ('panel') {
        <j-panel header="Customer health" toggleable>
          The latest build passed and documentation coverage is improving.
        </j-panel>
      }
      @case ('toolbar') {
        <j-toolbar>
          <j-button label="New" />
          <j-button label="Export" variant="outlined" />
          <j-button label="Archive" variant="soft" />
        </j-toolbar>
      }
      @case ('text-expand') {
        <div class="j-preview-stack">
          @if (example.key === 'characters') {
            <app-text-expand-basic-demo />
          } @else if (example.key === 'responsive') {
            <j-card header="Customer summary">
              <j-text-expand [text]="productDescription" mode="lines" [collapsedLines]="2" />
            </j-card>
          } @else if (example.key === 'projected') {
            <j-text-expand mode="lines" [collapsedLines]="2">
              <strong>Customer note:</strong> {{ projectedSummary }}
            </j-text-expand>
          } @else {
            <j-text-expand
              [text]="textExpandValue(example.key)"
              [mode]="example.key === 'lines' || example.key === 'policy' ? 'lines' : 'characters'"
              [collapsedLength]="example.key === 'comment' ? 80 : 100"
              [collapsedLines]="3"
              [showMoreLabel]="example.key === 'labels' ? 'Read comment' : 'Show more'"
              [showLessLabel]="example.key === 'labels' ? 'Collapse comment' : 'Show less'"
              [expanded]="example.key === 'expanded'"
              [animation]="example.key !== 'motion'"
            />
          }
        </div>
      }
      @case ('splitter') {
        <j-splitter
          [orientation]="example.key === 'vertical' ? 'vertical' : 'horizontal'"
          [readOnly]="example.key === 'readonly'"
          [snapPoints]="example.key === 'invoice' ? [30, 50, 70] : []"
          [styleClass]="
            example.key === 'vertical'
              ? 'j-doc-splitter j-doc-splitter--vertical'
              : 'j-doc-splitter'
          "
        >
          <j-splitter-panel
            [size]="example.key === 'invoice' ? 40 : 35"
            [minSize]="example.key === 'invoice' ? 25 : 10"
          >
            <section class="j-splitter-demo-panel">
              <strong>{{
                example.key === 'invoice'
                  ? 'Standard invoice rows'
                  : example.key === 'vertical'
                    ? 'Editor'
                    : 'Navigation'
              }}</strong>
            </section>
          </j-splitter-panel>
          <j-splitter-panel
            [size]="example.key === 'invoice' ? 60 : 65"
            [minSize]="example.key === 'invoice' ? 30 : 10"
          >
            <section class="j-splitter-demo-panel">
              <strong>{{
                example.key === 'invoice'
                  ? 'Final invoice preview'
                  : example.key === 'vertical'
                    ? 'Preview'
                    : 'Content'
              }}</strong>
            </section>
          </j-splitter-panel>
        </j-splitter>
      }
      @case ('splitter-panel') {
        <j-splitter styleClass="j-doc-splitter">
          <j-splitter-panel [size]="30" [minSize]="20" [maxSize]="45">
            <section class="j-splitter-demo-panel">Filters</section>
          </j-splitter-panel>
          <j-splitter-panel [size]="70" [minSize]="55" [maxSize]="80">
            <section class="j-splitter-demo-panel">Results</section>
          </j-splitter-panel>
        </j-splitter>
      }
      @case ('stepper') {
        <j-stepper
          [variant]="
            example.key === 'rail'
              ? 'rail'
              : example.key === 'progress'
                ? 'progress'
                : example.key === 'vertical'
                  ? 'rail'
                  : 'default'
          "
          [orientation]="example.key === 'vertical' ? 'vertical' : 'horizontal'"
          [linear]="example.key === 'linear'"
          [disabled]="example.key === 'disabled'"
          [items]="stepperItems"
          [activeIndex]="example.key === 'linear' ? 0 : 1"
        />
      }
      @case ('tab') {
        <j-tabs>
          <j-tab header="Overview">Overview content</j-tab>
          <j-tab header="Activity">Activity content</j-tab>
        </j-tabs>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

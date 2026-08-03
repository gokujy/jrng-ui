import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-misc-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('watermark') {
        @if (example.key === 'directive') {
          <div
            class="j-watermark-doc-surface"
            [jWatermark]="['DRAFT', 'INV-2048']"
            [watermarkOpacity]="0.1"
          >
            <strong>Invoice preview</strong>
            <span>INV-2048</span>
            <p>Aster Labs · Due 30 August 2026 · ₹24,800</p>
            <j-button label="Review invoice" size="sm" />
          </div>
        } @else {
          <j-watermark [text]="['CONFIDENTIAL', 'Aster Labs']" [opacity]="0.12">
            <j-card header="Customer summary" subheader="CUS-1001">
              <p>Avery Reed · Technology · Active</p>
              <j-button label="Open customer" size="sm" />
            </j-card>
          </j-watermark>
        }
      }
      @case ('avatar') {
        <div class="j-preview-row">
          @if (example.key === 'zoom') {
            <app-avatar-zoom-demo />
          } @else {
            @switch (example.key) {
              @case ('character') {
                <j-avatar initials="A" ariaLabel="Avery" />
              }
              @case ('icon') {
                <j-avatar ariaLabel="Unassigned user"
                  ><j-icon name="user" aria-hidden="true"
                /></j-avatar>
              }
              @case ('image') {
                <j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" size="lg" />
              }
              @case ('square') {
                <j-avatar initials="AR" ariaLabel="Avery Reed" shape="square" size="lg" />
              }
              @case ('sizes') {
                <j-avatar initials="AR" ariaLabel="Avery Reed" size="sm" /><j-avatar
                  initials="AR"
                  ariaLabel="Avery Reed"
                /><j-avatar initials="AR" ariaLabel="Avery Reed" size="lg" />
              }
              @case ('colors') {
                <j-avatar
                  initials="AR"
                  ariaLabel="Avery Reed"
                  style="--j-color-surface-subtle: var(--j-color-primary-soft); --j-color-text: var(--j-color-primary)"
                />
              }
              @case ('status') {
                <j-avatar initials="AR" ariaLabel="Avery Reed, online" status="online" /><j-avatar
                  initials="MK"
                  ariaLabel="Morgan Kim, away"
                  status="away"
                /><j-avatar initials="JL" ariaLabel="Jordan Lee, offline" status="offline" />
              }
              @case ('badge') {
                <span class="j-avatar-doc-badge"
                  ><j-avatar
                    image="/assets/images/avatar-user-01.webp"
                    label="Avery Reed" /><j-badge value="4" severity="danger"
                /></span>
              }
              @case ('profile') {
                <div class="j-profile-avatar-example">
                  <j-avatar
                    image="/assets/images/avatar-user-01.webp"
                    label="Avery Reed"
                    size="lg"
                    previewable
                  />
                  <div><strong>Avery Reed</strong><span>Product designer</span></div>
                </div>
              }
              @case ('comment') {
                <div class="j-profile-avatar-example">
                  <j-avatar image="/assets/images/avatar-user-02.webp" label="Morgan Kim" />
                  <div><strong>Morgan Kim</strong><span>Updated the release checklist.</span></div>
                </div>
              }
              @case ('fallback') {
                <j-avatar image="/assets/avatars/missing.svg" label="Avery Reed" initials="AR" />
              }
              @case ('clickable') {
                <j-avatar
                  image="/assets/images/avatar-user-01.webp"
                  label="Avery Reed"
                  previewable
                  previewAriaLabel="Preview Avery Reed profile image"
                />
              }
              @case ('static') {
                <j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" size="lg" />
              }
              @default {
                <j-avatar initials="AR" ariaLabel="Avery Reed" />
              }
            }
          }
        </div>
      }
      @case ('chip') {
        <div class="j-preview-row">
          @switch (example.key) {
            @case ('icon') {
              <j-chip label="Technology" icon="settings" />
              <j-chip label="Verified" icon="check" severity="success" />
            }
            @case ('image') {
              <j-chip label="Avery Reed" image="/assets/images/avatar-user-01.webp" imageAlt="" />
              <j-chip label="Morgan Kim" image="/assets/images/avatar-user-02.webp" imageAlt="" />
            }
            @case ('removable') {
              <j-chip label="Angular" removable removeAriaLabel="Remove Angular" />
              <j-chip label="TypeScript" removable removeAriaLabel="Remove TypeScript" />
            }
            @case ('custom') {
              <j-chip ariaLabel="Priority: urgent" severity="danger"
                >🔥 <strong>Urgent</strong></j-chip
              >
              <j-chip ariaLabel="Release: version 3" severity="info"
                >🚀 <strong>Version 3</strong></j-chip
              >
            }
            @default {
              <j-chip label="Enterprise customer" />
              <j-chip label="Active" severity="success" variant="solid" />
              <j-chip label="Review" severity="warning" variant="outlined" />
            }
          }
        </div>
      }
      @case ('icon') {
        <div class="j-preview-row">
          <j-icon name="search" ariaLabel="Search" />
          <j-icon name="settings" ariaLabel="Settings" size="24" />
          <j-icon name="circle-check" ariaLabel="Complete" size="32" />
        </div>
      }
      @case ('progress-spinner') {
        <div class="j-preview-row">
          @if (example.key === 'sizes') {
            <j-progress-spinner [size]="20" label="Small loading indicator" />
            <j-progress-spinner [size]="40" label="Medium loading indicator" />
            <j-progress-spinner [size]="64" label="Large loading indicator" />
          } @else if (example.key === 'stroke') {
            <j-progress-spinner [size]="56" [strokeWidth]="2" label="Thin loading indicator" />
            <j-progress-spinner [size]="56" [strokeWidth]="6" label="Bold loading indicator" />
          } @else {
            <j-progress-spinner label="Loading customers" />
          }
        </div>
      }
      @case ('pull-to-refresh') {
        <j-pull-to-refresh #refresh [refresh]="refreshCustomers" [completeDelay]="300">
          <div class="j-preview-stack">
            <strong>Customer directory</strong>
            <span>{{ refreshCount() }} refresh requests completed</span>
            <j-button
              label="Keyboard refresh"
              variant="outlined"
              size="sm"
              (onClick)="refresh.beginRefresh()"
            />
          </div>
        </j-pull-to-refresh>
      }
      @case ('swipe-actions') {
        <div class="j-swipe-actions-doc-example">
          <j-swipe-actions
            #actions
            ariaLabel="Actions for Aster Labs"
            [disabled]="example.key === 'disabled'"
          >
            <ng-template jSwipeStartActions>
              <j-button label="Activate" icon="check" severity="success" width="full" />
            </ng-template>
            <ng-template jSwipeContent>
              <div class="j-swipe-actions-doc-row">
                <j-icon name="component" aria-hidden="true" size="24" />
                <div><strong>Aster Labs</strong><span>Customer ID CUS-2048 · Active</span></div>
                <j-tag label="Enterprise" severity="info" size="sm" rounded />
              </div>
            </ng-template>
            <ng-template jSwipeEndActions>
              <j-button label="Archive" icon="archive" severity="danger" width="full" />
            </ng-template>
          </j-swipe-actions>
          @if (example.key !== 'disabled') {
            <div class="j-preview-row">
              <j-button
                label="Show activate"
                icon="chevron-right"
                size="sm"
                (onClick)="actions.open('start')"
              />
              <j-button
                label="Show archive"
                icon="chevron-left"
                size="sm"
                variant="outlined"
                (onClick)="actions.open('end')"
              />
            </div>
          }
        </div>
      }
      @case ('badge') {
        <div class="j-preview-row">
          @switch (example.key) {
            @case ('severity') {
              <j-badge value="Default" />
              <j-badge value="Secondary" severity="secondary" />
              <j-badge value="Success" severity="success" />
              <j-badge value="Info" severity="info" />
              <j-badge value="Warning" severity="warning" />
              <j-badge value="Danger" severity="danger" />
              <j-badge value="Contrast" severity="contrast" />
            }
            @case ('size') {
              <j-badge value="XS" size="xs" />
              <j-badge value="Small" size="sm" />
              <j-badge value="Default" />
              <j-badge value="Large" size="lg" />
              <j-badge value="XLarge" size="xl" />
            }
            @case ('overlay') {
              <span class="j-badge-preview-anchor">
                <j-button
                  icon="message-square"
                  actionDisplay="icon"
                  ariaLabel="Notifications"
                  variant="outlined"
                />
                <j-badge value="4" severity="danger" overlay ariaLabel="4 notifications" />
              </span>
              <span class="j-badge-preview-anchor">
                <j-button
                  icon="calendar"
                  actionDisplay="icon"
                  ariaLabel="Events"
                  variant="outlined"
                />
                <j-badge dot severity="info" overlay ariaLabel="New messages" />
              </span>
            }
            @case ('variants') {
              <j-badge value="Verified" icon="check" severity="success" />
              <j-badge value="Draft" variant="soft" severity="secondary" />
              <j-badge value="Review" variant="outlined" severity="warning" />
            }
            @case ('button') {
              <j-button label="Emails" [badge]="8" badgeAriaLabel="8 unread emails" />
              <j-button
                label="Messages"
                icon="message-square"
                [badge]="2"
                badgeAriaLabel="2 unread messages"
                variant="outlined"
              />
            }
            @default {
              <j-badge value="8" ariaLabel="8 unread messages" />
            }
          }
        </div>
      }
      @case ('tag') {
        <div class="j-preview-row">
          @switch (example.key) {
            @case ('severity') {
              <j-tag label="Primary" severity="primary" />
              <j-tag label="Success" severity="success" />
              <j-tag label="Info" severity="info" />
              <j-tag label="Warning" severity="warning" />
              <j-tag label="Danger" severity="danger" />
              <j-tag label="Contrast" severity="contrast" />
            }
            @case ('size') {
              <j-tag label="Extra small" size="xs" />
              <j-tag label="Small" size="sm" />
              <j-tag label="Default" />
              <j-tag label="Large" size="lg" />
              <j-tag label="Extra large" size="xl" />
            }
            @case ('rounded') {
              <j-tag label="Featured" severity="info" rounded />
              <j-tag label="New" severity="success" rounded />
            }
            @case ('removable') {
              <j-tag label="Design" removable removeLabel="Remove Design" />
              <j-tag label="Research" removable removeLabel="Remove Research" />
            }
            @default {
              <j-tag label="Active" severity="success" />
            }
          }
        </div>
      }
      @case ('empty') {
        <j-empty
          title="No customer records"
          description="Customer records will appear here when they are available."
          actionLabel="Add customer"
          icon="inbox"
        />
      }
      @case ('empty-state') {
        <j-empty
          [variant]="emptyStateVariants[example.index]"
          title="No orders found"
          description="Try changing filters or create a new order."
          imageUrl="/assets/images/empty-state-search.webp"
          imageAlt="Document with a magnifying glass"
        >
          <j-button jEmptyStateAction label="Create order" />
        </j-empty>
      }
      @case ('progress-bar') {
        <div class="j-progress-doc-example">
          @if (example.key === 'indeterminate') {
            <span>Preparing export…</span>
            <j-progress-bar indeterminate label="Preparing export" />
          } @else if (example.key === 'labeled') {
            <j-progress-bar [value]="72" variant="labeled" label="72% uploaded" />
          } @else if (example.key === 'segmented') {
            <span>4 of 5 steps complete</span>
            <j-progress-bar
              [value]="80"
              variant="segmented"
              severity="success"
              label="4 of 5 steps"
            />
          } @else {
            <span>64% complete</span>
            <j-progress-bar [value]="64" label="64% complete" />
          }
        </div>
      }
      @case ('skeleton') {
        <div class="j-skeleton-doc-example" [class.j-preview-row]="example.key === 'shapes'">
          @switch (example.key) {
            @case ('text') {
              <j-skeleton variant="text" width="45%" />
              <j-skeleton variant="text" />
              <j-skeleton variant="text" width="75%" />
            }
            @case ('shapes') {
              <j-skeleton variant="avatar" />
              <j-skeleton variant="button" width="7rem" />
              <j-skeleton shape="rounded" width="8rem" height="4rem" />
            }
            @case ('table') {
              <j-skeleton variant="table" [rows]="4" />
            }
            @case ('animation') {
              <j-skeleton animation="wave" />
              <j-skeleton animation="pulse" />
              <j-skeleton [animated]="false" />
            }
            @default {
              <j-skeleton variant="card" />
            }
          }
        </div>
      }
      @case ('loader') {
        @if (example.key === 'basic') {
          <app-loader-types-demo />
        } @else if (example.key === 'button') {
          <j-button label="Saving" loading loadingLabel="Saving record" />
        } @else if (example.key === 'card') {
          <j-card header="Account summary"
            ><j-loader type="spinner" inline label="Loading account summary"
          /></j-card>
        } @else {
          <div
            class="j-loader-preview-grid"
            [class.j-loader-demo-overlay]="example.key === 'overlay'"
          >
            <j-loader
              [type]="loaderExampleType(example.key)"
              [inline]="example.key === 'inline' || example.key === 'label'"
              [overlay]="example.key === 'overlay'"
              [fullscreen]="false"
              [value]="example.key === 'determinate' ? 68 : null"
              [size]="example.key === 'size' ? 56 : 'md'"
              [label]="example.key === 'label' ? 'Loading customer profile' : 'Loading'"
            />
          </div>
        }
      }
      @case ('meter-group') {
        <div class="j-meter-group-doc-example">
          <j-meter-group [value]="meterSegments" />
        </div>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiscComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
  readonly refreshCount = signal(0);
  readonly refreshCustomers = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    this.refreshCount.update((value) => value + 1);
  };
}

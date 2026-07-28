import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
              @case ('group') {
                <j-avatar-group [items]="avatarPeople" [max]="3" ariaLabel="Project team" />
              }
              @case ('overflow') {
                <j-avatar-group
                  [items]="avatarPeople"
                  [max]="2"
                  ariaLabel="Project team, three more members"
                />
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
              @case ('team') {
                <j-avatar-group [items]="avatarPeople" [max]="4" ariaLabel="Assigned team" />
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
        <j-chip label="Enterprise customer" />
      }
      @case ('icon') {
        <div class="j-preview-row">
          <j-icon name="search" ariaLabel="Search" />
          <j-icon name="settings" ariaLabel="Settings" size="24" />
          <j-icon name="circle-check" ariaLabel="Complete" size="32" />
        </div>
      }
      @case ('progress-spinner') {
        <j-progress-spinner label="Loading customers" />
      }
      @case ('badge') {
        <j-badge value="12 active customers" />
      }
      @case ('tag') {
        <j-tag label="Active" severity="success" />
      }
      @case ('status-chip') {
        <j-status-chip status="active" />
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
        <j-progress-bar
          [variant]="progressBarVariants[example.index]"
          [value]="example.index === 1 ? 80 : example.index === 2 ? 42 : 64"
          [severity]="example.index === 1 ? 'success' : 'primary'"
          label="Operation progress"
        />
      }
      @case ('skeleton') {
        <j-skeleton variant="card" />
      }
      @case ('avatar-group') {
        <j-avatar-group [items]="avatarGroupItems" [max]="3" ariaLabel="Project team" />
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
        <j-meter-group [value]="meterSegments" />
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiscComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

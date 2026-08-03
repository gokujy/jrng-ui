import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-layout-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('container') {
        <j-container>
          <j-card header="Fluid content" subheader="Full width by default" variant="outlined">
            <p>Set size or maxWidth only when the page needs a narrower content measure.</p>
          </j-card>
        </j-container>
      }
      @case ('section-header') {
        <j-section-header title="Customers" description="Track account activity and ownership.">
          <j-button label="New customer" />
        </j-section-header>
      }
      @case ('section-footer') {
        <j-section-footer [align]="$any(example.key)">
          <j-button label="Cancel" variant="soft" />
          <j-button label="Apply updates" />
        </j-section-footer>
      }
      @case ('app-shell') {
        <div class="j-layout-preview-frame">
          <j-app-shell styleClass="j-doc-compact-shell">
            <strong jShellHeader>Customer workspace</strong>
            <nav jShellSidebar class="j-preview-mini-nav">
              <span class="is-active"><j-icon name="layout-dashboard" /><span>Overview</span></span>
              <span><j-icon name="boxes" /><span>Customers</span></span>
              <span><j-icon name="settings" /><span>Settings</span></span>
            </nav>
            <j-card header="Dashboard" subheader="Application shell content" variant="outlined" />
            <small jShellFooter>JRNG customer workspace</small>
          </j-app-shell>
        </div>
      }
      @case ('grid-layout') {
        @if (example.key === 'interactive' || example.key === 'responsive') {
          <j-grid-layout
            [(layout)]="customerDashboardLayout"
            [columns]="4"
            [responsiveLayouts]="customerResponsiveLayouts"
            [draggable]="example.key === 'interactive'"
            [resizable]="example.key === 'interactive'"
            compact
          >
            <ng-template jGridLayoutItem let-tile>
              <j-card [header]="tile.title" subheader="Dashboard tile" variant="outlined">
                @if (example.key === 'interactive') {
                  <button
                    type="button"
                    jGridLayoutDragHandle
                    class="j-dashboard-tile-drag-handle"
                    [attr.aria-label]="'Move ' + tile.title"
                  >
                    <j-icon name="more-vertical" />
                  </button>
                }
              </j-card>
            </ng-template>
          </j-grid-layout>
        } @else {
          <j-grid-layout
            [columns]="example.key === 'dashboard' ? 2 : 3"
            [minItemWidth]="example.key === 'dashboard' ? '16rem' : '12rem'"
            [gap]="example.key === 'dashboard' ? 'var(--j-spacing-5)' : 'var(--j-spacing-3)'"
          >
            <j-card
              [header]="example.key === 'dashboard' ? 'Revenue' : 'Design'"
              subheader="Responsive tile"
              variant="outlined"
            />
            <j-card
              [header]="example.key === 'dashboard' ? 'Active users' : 'Build'"
              subheader="Responsive tile"
              variant="outlined"
            />
            @if (example.key !== 'dashboard') {
              <j-card header="Ship" subheader="Responsive tile" variant="outlined" />
            }
          </j-grid-layout>
        }
      }
      @case ('grid') {
        <div class="j-doc-grid-demo">
          <j-grid gap="md" [fixed]="example.key === 'fixed'">
            <j-row>
              <j-col size="12" md="8">
                <div class="j-doc-grid-cell j-doc-grid-cell--primary">
                  <strong>Customer workspace</strong>
                  <span>12 columns on mobile, 8 from md</span>
                </div>
              </j-col>
              <j-col size="12" md="4">
                <div class="j-doc-grid-cell">
                  <strong>Context panel</strong>
                  <span>12 columns on mobile, 4 from md</span>
                </div>
              </j-col>
            </j-row>
          </j-grid>
        </div>
      }
      @case ('row') {
        <div class="j-doc-grid-demo">
          <j-grid>
            <j-row
              align="center"
              [justify]="example.key === 'alignment' ? 'between' : 'start'"
              gap="sm"
            >
              <j-col
                [size]="example.key === 'alignment' ? 'auto' : 12"
                [sm]="example.key === 'alignment' ? null : 6"
              >
                <div class="j-doc-grid-cell"><strong>Customer name</strong></div>
              </j-col>
              <j-col
                [size]="example.key === 'alignment' ? 'auto' : 12"
                [sm]="example.key === 'alignment' ? null : 6"
              >
                <div class="j-doc-grid-cell"><span>Header actions</span></div>
              </j-col>
            </j-row>
          </j-grid>
        </div>
      }
      @case ('col') {
        <div class="j-doc-grid-demo">
          <j-grid>
            <j-row>
              <j-col size="12" sm="6" lg="4">
                <div class="j-doc-grid-cell">
                  <strong>Responsive column</strong>
                  <span>12 / 6 / 4 columns</span>
                </div>
              </j-col>
              <j-col
                size="12"
                sm="6"
                lg="4"
                [offsetLg]="example.key === 'offset' ? 4 : null"
                [orderLg]="example.key === 'offset' ? 'last' : null"
              >
                <div class="j-doc-grid-cell">
                  <strong>{{
                    example.key === 'offset' ? 'Offset and ordered' : 'Responsive column'
                  }}</strong>
                  <span>{{
                    example.key === 'offset' ? '4-column offset at lg' : '12 / 6 / 4 columns'
                  }}</span>
                </div>
              </j-col>
            </j-row>
          </j-grid>
        </div>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

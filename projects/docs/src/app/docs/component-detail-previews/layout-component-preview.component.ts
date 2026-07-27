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
      @case ('page-header') {
        <j-page-header
          [variant]="pageHeaderVariants[example.index]"
          title="Orders"
          subtitle="Review fulfillment, exceptions, and exportable operational data that may wrap on narrow screens."
          [breadcrumbs]="pageHeaderBreadcrumbs"
        >
          <j-button jPageActions label="Export" variant="outlined" />
          <j-button jPageActions label="Create order" />
        </j-page-header>
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
      @case ('container') {
        <j-container>
          <j-card header="Contained content" subheader="Max-width layout helper" variant="outlined">
            <p>Container keeps page content aligned with consistent horizontal rhythm.</p>
          </j-card>
        </j-container>
      }
      @case ('section-header') {
        <j-section-header title="Projects" description="Track active work and ownership.">
          <j-button label="New project" />
        </j-section-header>
      }
      @case ('section-footer') {
        <j-section-footer>
          <j-button label="Cancel" variant="soft" />
          <j-button label="Apply updates" />
        </j-section-footer>
      }
      @case ('app-shell') {
        <div class="j-layout-preview-frame">
          <j-app-shell styleClass="j-doc-compact-shell">
            <strong jShellHeader>Workspace</strong>
            <nav jShellSidebar class="j-preview-mini-nav">
              <span class="is-active">Overview</span><span>Projects</span><span>Settings</span>
            </nav>
            <j-card header="Dashboard" subheader="Application shell content" variant="outlined" />
            <small jShellFooter>JRNG UI workspace</small>
          </j-app-shell>
        </div>
      }
      @case ('grid-layout') {
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
      @case ('grid') {
        <div class="j-doc-grid-demo">
          <j-grid gap="md" [fixed]="example.key === 'fixed'">
            <j-row>
              <j-col size="12" md="8">
                <div class="j-doc-grid-cell j-doc-grid-cell--primary">
                  <strong>Main workspace</strong>
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
                <div class="j-doc-grid-cell"><strong>Project title</strong></div>
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
      @case ('topbar') {
        <j-topbar [model]="menuItems" activeKey="Open">
          <strong jTopbarBrand>JRNG UI</strong>
        </j-topbar>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

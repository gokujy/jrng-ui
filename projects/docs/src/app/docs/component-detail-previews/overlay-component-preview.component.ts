import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-overlay-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @switch (doc().slug) {
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
                <j-button label="Cancel" variant="soft" (onClick)="dialogOpen.set(false)" />
                <j-button label="Save" (onClick)="dialogOpen.set(false)" />
              </div>
            </div>
          </j-dialog>
        </div>
      }
      @case ('confirm-dialog') {
        <div class="j-preview-row">
          <j-button label="Confirm save" (onClick)="openConfirm()" />
          <j-button label="Delete record" severity="danger" (onClick)="openConfirm('danger')" />
          <j-confirm-dialog />
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
      @case ('bottom-sheet') {
        <div class="j-preview-row">
          <j-button label="Open bottom sheet" (onClick)="bottomSheetVisible = true" />
          <j-bottom-sheet header="Project actions" [(visible)]="bottomSheetVisible" [modal]="false">
            <div class="j-preview-stack">
              <j-button label="Duplicate" variant="outlined" />
              <j-button label="Archive" variant="soft" />
            </div>
          </j-bottom-sheet>
        </div>
      }
      @case ('confirm-popup') {
        <div class="j-preview-row">
          <j-button label="Confirm archive" (onClick)="openConfirmPopup($event)" />
          <j-confirm-popup />
        </div>
      }
      @case ('dynamic-dialog') {
        <div class="j-preview-row">
          <j-button label="Open dynamic dialog" (onClick)="openDynamicDialog()" />
          <j-dynamic-dialog />
        </div>
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
          <j-notification-center [target]="notificationTrigger" [(visible)]="notificationOpen" />
        </div>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

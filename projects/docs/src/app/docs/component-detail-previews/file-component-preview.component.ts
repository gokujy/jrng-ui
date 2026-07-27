import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-file-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @switch (doc().slug) {
      @case ('file-upload') {
        <div class="j-preview-stack">
          <j-file-upload
            title="Add files"
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
      @case ('file-browser') {
        <j-file-browser
          title="Shared files"
          [items]="fileBrowserItems"
          [breadcrumbs]="fileBrowserBreadcrumbs"
          [selection]="fileBrowserSelection"
          selectionMode="multiple"
          [actions]="fileBrowserActions"
          (selectionChange)="fileBrowserSelection = $event"
          (action)="handleFileBrowserAction($event)"
        />
        @if (fileBrowserActionMessage()) {
          <p class="j-preview-action-status" role="status">{{ fileBrowserActionMessage() }}</p>
        }
      }
      @case ('file-preview') {
        <div class="j-file-preview-demo-grid">
          <j-file-preview
            fileName="statement.pdf"
            [fileSize]="245760"
            description="Financial statement uploaded 2 minutes ago"
            url="#"
            actionDisplay="icon-label"
          />
          <j-file-preview
            fileName="avatar.png"
            [fileSize]="56320"
            description="Image asset"
            showTypeLabel
            typeLabel="PNG"
            actionDisplay="icon-label"
          />
        </div>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

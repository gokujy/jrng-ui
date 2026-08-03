import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { JFileRemoteItem } from 'jrng-ui/file-upload';
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
            [existingFiles]="uploadedFileExamples"
            previewBaseUrl="/assets/images"
            downloadBaseUrl="/assets/images"
            showRename
            multiple
            (renameFile)="fileActionMessage.set('Renamed selected file to ' + $event.name)"
            (renameExistingFile)="fileActionMessage.set('Renamed uploaded file to ' + $event.name)"
            (previewFile)="
              fileActionMessage.set('Previewing ' + ($event.displayName || $event.file.name))
            "
            (downloadFile)="
              fileActionMessage.set('Downloading ' + ($event.displayName || $event.file.name))
            "
          />
          @if (fileActionMessage()) {
            <p class="j-preview-action-status" role="status">{{ fileActionMessage() }}</p>
          }
        </div>
      }
      @case ('file-browser') {
        <j-file-browser
          title="Customer files"
          [items]="fileBrowserItems"
          [breadcrumbs]="fileBrowserBreadcrumbs"
          [selection]="fileBrowserSelection"
          selectionMode="multiple"
          [actions]="fileBrowserActions"
          [sortField]="fileBrowserSortField"
          [viewMode]="fileBrowserViewMode"
          (selectionChange)="fileBrowserSelection = $event"
          (action)="handleFileBrowserAction($event)"
          (createFolder)="handleFileBrowserCreateFolder()"
          (upload)="handleFileBrowserUpload()"
          (refresh)="handleFileBrowserRefresh()"
          (sortChange)="fileBrowserSortField = $event.field"
          (viewModeChange)="fileBrowserViewMode = $event"
        />
        @if (fileBrowserActionMessage()) {
          <p class="j-preview-action-status" role="status">{{ fileBrowserActionMessage() }}</p>
        }
      }
      @case ('file-preview') {
        <div class="j-file-preview-demo-grid">
          <j-file-preview
            fileName="product-laptop.webp"
            [fileSize]="3792"
            description="Relative stored value resolved against separate action base paths"
            url="product-laptop.webp"
            previewBaseUrl="/assets/images"
            downloadBaseUrl="/assets/images"
            showRename
            actionDisplay="icon-label"
            (rename)="fileActionMessage.set('Renamed file to ' + $event)"
          />
          <j-file-preview
            fileName="product-headphones.webp"
            [fileSize]="7734"
            description="Already uploaded file using a complete application URL"
            previewUrl="/assets/images/product-headphones.webp"
            downloadUrl="/assets/images/product-headphones.webp"
            showTypeLabel
            typeLabel="WEBP"
            showRename
            actionDisplay="icon-label"
            (rename)="fileActionMessage.set('Renamed file to ' + $event)"
          />
          @if (fileActionMessage()) {
            <p class="j-preview-action-status" role="status">{{ fileActionMessage() }}</p>
          }
        </div>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
  readonly fileActionMessage = signal('');
  readonly uploadedFileExamples: readonly JFileRemoteItem[] = [
    {
      id: 'relative-image',
      name: 'product-laptop.webp',
      size: 3792,
      type: 'image/webp',
      url: 'product-laptop.webp',
    },
    {
      id: 'absolute-image',
      name: 'product-headphones.webp',
      size: 7734,
      type: 'image/webp',
      previewUrl: '/assets/images/product-headphones.webp',
      downloadUrl: '/assets/images/product-headphones.webp',
    },
  ];
}

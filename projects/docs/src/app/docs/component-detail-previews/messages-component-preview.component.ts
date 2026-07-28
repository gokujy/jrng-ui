import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-messages-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @switch (doc().slug) {
      @case ('toast') {
        <div class="j-preview-stack">
          <div class="j-preview-row">
            <j-button label="Show success" (onClick)="showToast('success')" />
          </div>
          <j-toast position="bottom-right" />
        </div>
      }
      @case ('validation-message') {
        <j-validation-message
          message="Enter a valid customer email."
          displayMode="always"
          severity="danger"
        />
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

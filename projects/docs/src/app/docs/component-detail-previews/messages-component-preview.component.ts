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
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('toast') {
        <div class="j-preview-stack">
          @switch (example.key) {
            @case ('appearance') {
              <div class="j-preview-row">
                <j-button label="Soft" variant="soft" (onClick)="showToastStyle('soft')" />
                <j-button
                  label="Outlined"
                  variant="outlined"
                  (onClick)="showToastStyle('outlined')"
                />
                <j-button label="Solid" (onClick)="showToastStyle('solid')" />
              </div>
            }
            @case ('actions') {
              <j-button
                label="Archive project"
                severity="danger"
                variant="outlined"
                (onClick)="showActionToast()"
              />
            }
            @default {
              <div class="j-preview-row">
                <j-button label="Success" severity="success" (onClick)="showToast('success')" />
                <j-button label="Error" severity="danger" (onClick)="showToast('error')" />
                <j-button label="Warning" severity="warning" (onClick)="showToast('warning')" />
                <j-button label="Info" severity="info" (onClick)="showToast('info')" />
              </div>
            }
          }
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

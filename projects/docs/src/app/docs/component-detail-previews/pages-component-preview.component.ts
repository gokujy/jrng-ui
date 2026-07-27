import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-pages-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @switch (doc().slug) {
      @case ('error-page') {
        <j-error-page
          code="500"
          title="Something went wrong"
          description="The page could not be loaded."
          ><j-button label="Try again"
        /></j-error-page>
      }
      @case ('maintenance-page') {
        <j-maintenance-page
          title="Maintenance in progress"
          description="The application will be back soon."
          detail="Estimated recovery: 20 minutes"
          ><j-button label="View system status" variant="outlined"
        /></j-maintenance-page>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

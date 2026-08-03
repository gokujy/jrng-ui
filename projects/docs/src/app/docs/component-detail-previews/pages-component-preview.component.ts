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
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('error-page') {
        <j-error-page
          [code]="
            example.key === 'animated' || example.key === 'minimal'
              ? '404'
              : example.key === 'color'
                ? '403'
                : example.key === 'split'
                  ? '503'
                  : '500'
          "
          [title]="
            example.key === 'animated'
              ? 'Page not found'
              : example.key === 'minimal'
                ? 'This page does not exist'
                : example.key === 'color'
                  ? 'Access denied'
                  : example.key === 'split'
                    ? 'We are reconnecting'
                    : 'Something went wrong'
          "
          [description]="
            example.key === 'animated' || example.key === 'minimal'
              ? 'The address may have changed or no longer exists.'
              : example.key === 'color'
                ? 'You do not have permission to view this page.'
                : example.key === 'split'
                  ? 'The service is temporarily unavailable. Try again shortly.'
                  : 'The page could not be loaded.'
          "
          [eyebrow]="
            example.key === 'split'
              ? 'Service unavailable'
              : example.key === 'minimal'
                ? 'Not found'
                : 'Unexpected error'
          "
          [layout]="
            example.key === 'split' ? 'split' : example.key === 'minimal' ? 'minimal' : 'centered'
          "
          [animation]="
            example.key === 'animated' ? 'bounce' : example.key === 'split' ? 'float' : 'none'
          "
          [codeColor]="
            example.key === 'animated' || example.key === 'minimal'
              ? 'var(--j-color-info)'
              : example.key === 'color'
                ? '#7c3aed'
                : 'var(--j-color-danger)'
          "
          ><j-button label="Try again"
        /></j-error-page>
      }
      @case ('maintenance-page') {
        <j-maintenance-page
          [variant]="
            example.key === 'minimal' ? 'minimal' : example.key === 'status' ? 'status' : 'default'
          "
          [animation]="
            example.key === 'progress' ? 'orbit' : example.key === 'minimal' ? 'pulse' : 'none'
          "
          [icon]="example.key === 'minimal' ? '↻' : example.key === 'status' ? '●' : '⚙'"
          [badge]="
            example.key === 'minimal'
              ? 'Quick update'
              : example.key === 'status'
                ? 'Database maintenance'
                : 'Scheduled maintenance'
          "
          [title]="
            example.key === 'minimal'
              ? 'Back in a few minutes'
              : example.key === 'status'
                ? 'Read-only mode'
                : 'Maintenance in progress'
          "
          [description]="
            example.key === 'status'
              ? 'Viewing remains available while updates are paused.'
              : 'We are upgrading the workspace to improve reliability.'
          "
          [detail]="
            example.key === 'minimal' || example.key === 'status'
              ? ''
              : example.key === 'progress'
                ? 'No action is required'
                : 'Expected back at 04:30 UTC'
          "
          [accentColor]="example.key === 'status' ? '#0ea5e9' : 'var(--j-color-warning)'"
          [showProgress]="example.key === 'progress'"
          progressLabel="Database migration is in progress"
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

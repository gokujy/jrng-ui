import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-utilities-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @switch (doc().slug) {
      @case ('diff-viewer') {
        <j-diff-viewer
          mode="object"
          layout="side-by-side"
          [before]="diffBefore"
          [after]="diffAfter"
        />
      }
      @case ('ripple') {
        <div class="j-preview-row">
          <button class="j-doc-preview-button" type="button" jRipple>Ripple button</button>
          <button class="j-doc-preview-button" type="button" [jRipple]="false">
            Disabled ripple
          </button>
        </div>
      }
      @case ('tour-guide') {
        <div class="j-preview-stack">
          <div class="j-preview-row">
            <j-button
              id="createBtn"
              label="Create customer"
              jTourStep="create-button"
              tourTitle="Create customer"
              tourDescription="Start a fictional customer record here."
            />
            <j-button
              label="Filter customers"
              variant="outlined"
              jTourStep="filter-button"
              tourTitle="Filter customers"
              tourDescription="Narrow the customer table to the records that matter."
            />
          </div>
          <j-button label="Start guided tour" (onClick)="startPreviewTour()" />
        </div>
      }
      @case ('highlight') {
        <j-highlight
          text="Search matching text without injecting HTML."
          [term]="['matching', 'HTML']"
        />
      }
      @case ('formatting') {
        <div class="j-format-demo">
          <span
            >Date/time <strong>{{ sampleDate | jDateTimeFormat }}</strong></span
          >
          <span
            >Currency <strong>{{ 42800 | jCurrencyFormat: 'USD' }}</strong></span
          >
          <span
            >Percent <strong>{{ 0.128 | jPercentFormat }}</strong></span
          >
          <span
            >File size <strong>{{ 2457600 | jFileSizeFormat }}</strong></span
          >
          <span
            >Truncate <strong>{{ longText | jTruncate: 36 }}</strong></span
          >
        </div>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilitiesComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

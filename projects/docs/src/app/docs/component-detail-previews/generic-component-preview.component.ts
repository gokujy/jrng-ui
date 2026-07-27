import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-generic-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    <div class="j-generated-component-preview">
      <header>
        <span class="j-doc-icon"><j-icon [name]="doc().icon" /></span>
        <div>
          <strong>{{ doc().name }} preview</strong>
          <p>
            Generated preview built from the public selector and import metadata. Use the code tab
            for the exact starter snippet.
          </p>
        </div>
      </header>

      <div class="j-generated-component-preview__sample" [attr.data-category]="doc().category">
        <div class="j-generated-preview-card">
          <div class="j-generated-preview-card__header">
            <span class="j-generated-preview-card__icon">
              <j-icon [name]="doc().icon" />
            </span>
            <div>
              <strong>{{ doc().name }}</strong>
              <span>{{ doc().category }}</span>
            </div>
          </div>

          <div class="j-generated-preview-card__body">
            @if (doc().category === 'Form') {
              <div class="j-generated-field">
                <span>{{ doc().name }}</span>
                <span class="j-generated-input">Enter value</span>
              </div>
              <div class="j-generated-actions">
                <span></span>
                <span></span>
              </div>
            } @else if (doc().category.includes('Layout')) {
              <div class="j-generated-layout">
                <aside></aside>
                <main>
                  <span></span>
                  <span></span>
                  <span></span>
                </main>
              </div>
            } @else if (doc().category.includes('Data')) {
              <div class="j-generated-table">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            } @else if (doc().category.includes('Navigation')) {
              <nav class="j-generated-menu" aria-label="Generated preview">
                <span class="is-active">Overview</span>
                <span>Activity</span>
                <span>Settings</span>
              </nav>
            } @else if (doc().category.includes('Overlay') || doc().category.includes('Status')) {
              <div class="j-generated-overlay">
                <strong>{{ doc().name }}</strong>
                <p>{{ doc().description }}</p>
                <j-button label="Action" />
              </div>
            } @else if (
              doc().category.includes('Media') || doc().category.includes('Visualization')
            ) {
              <div class="j-generated-visual">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            } @else {
              <div class="j-generated-surface">
                <strong>{{ doc().name }}</strong>
                <p>{{ doc().description }}</p>
              </div>
            }
          </div>

          <footer>
            <code>{{ doc().selector }}</code>
          </footer>
        </div>
      </div>

      <div class="j-generated-component-preview__meta">
        <span
          >Selector <code>{{ doc().selector }}</code></span
        >
        <span
          >Import <code>{{ doc().importPath }}</code></span
        >
      </div>

      <div class="j-generated-component-preview__code">
        <app-code-block label="Import" language="ts" [code]="doc().code.importCode" />
        <app-code-block label="Basic usage" language="html" [code]="doc().code.basic" />
        <app-code-block label="Example values" language="ts" [code]="doc().code.angular ?? ''" />
      </div>
    </div>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

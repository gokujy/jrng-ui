import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComponentDoc } from '../docs-types';
import { DetailFeatureExample } from '../component-detail-view-base';
import { ButtonComponentPreviewComponent } from './button-component-preview.component';
import { ChartComponentPreviewComponent } from './chart-component-preview.component';
import { DataComponentPreviewComponent } from './data-component-preview.component';
import { FileComponentPreviewComponent } from './file-component-preview.component';
import { FormComponentPreviewComponent } from './form-component-preview.component';
import { GenericComponentPreviewComponent } from './generic-component-preview.component';
import { LayoutComponentPreviewComponent } from './layout-component-preview.component';
import { MediaComponentPreviewComponent } from './media-component-preview.component';
import { MenuComponentPreviewComponent } from './menu-component-preview.component';
import { MessagesComponentPreviewComponent } from './messages-component-preview.component';
import { MiscComponentPreviewComponent } from './misc-component-preview.component';
import { OverlayComponentPreviewComponent } from './overlay-component-preview.component';
import { PagesComponentPreviewComponent } from './pages-component-preview.component';
import { PanelComponentPreviewComponent } from './panel-component-preview.component';
import { UtilitiesComponentPreviewComponent } from './utilities-component-preview.component';

@Component({
  selector: 'app-component-preview',
  imports: [
    ButtonComponentPreviewComponent,
    ChartComponentPreviewComponent,
    DataComponentPreviewComponent,
    FileComponentPreviewComponent,
    FormComponentPreviewComponent,
    GenericComponentPreviewComponent,
    LayoutComponentPreviewComponent,
    MediaComponentPreviewComponent,
    MenuComponentPreviewComponent,
    MessagesComponentPreviewComponent,
    MiscComponentPreviewComponent,
    OverlayComponentPreviewComponent,
    PagesComponentPreviewComponent,
    PanelComponentPreviewComponent,
    UtilitiesComponentPreviewComponent,
  ],
  template: `
    @switch (doc().category) {
      @case ('Panel') {
        <app-panel-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Form') {
        <app-form-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Misc') {
        <app-misc-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Data') {
        <app-data-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Button') {
        <app-button-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Menu') {
        <app-menu-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Layout') {
        <app-layout-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Messages') {
        <app-messages-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Overlay') {
        <app-overlay-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Utilities') {
        <app-utilities-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('File') {
        <app-file-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Pages') {
        <app-pages-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Chart') {
        <app-chart-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @case ('Media') {
        <app-media-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
      @default {
        <app-generic-component-preview [doc]="doc()" [previewExample]="previewExample()" />
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentPreviewComponent {
  readonly doc = input.required<ComponentDoc>();
  readonly previewExample = input.required<DetailFeatureExample>();
}

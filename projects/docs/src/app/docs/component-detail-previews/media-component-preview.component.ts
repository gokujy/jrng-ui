import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-media-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('carousel') {
        <j-carousel
          [value]="carouselItems"
          [visibleItems]="example.key === 'multiple' ? 2 : 1"
          [autoplay]="example.key === 'autoplay'"
          [interval]="3000"
          [loop]="example.key !== 'bounded'"
          [controls]="example.key !== 'minimal'"
          [indicators]="example.key !== 'minimal'"
          ariaLabel="Travel highlights"
        />
      }
      @case ('gallery') {
        <j-gallery
          [value]="galleryItems"
          [variant]="
            example.key === 'contained'
              ? 'contained'
              : example.key === 'filmstrip'
                ? 'filmstrip'
                : example.key === 'hero'
                  ? 'hero'
                  : 'standard'
          "
          [animation]="
            example.key === 'filmstrip'
              ? 'slide'
              : example.key === 'hero'
                ? 'crossfade'
                : example.key === 'reduced'
                  ? 'none'
                  : 'fade'
          "
        />
      }
      @case ('html-preview') {
        <j-html-preview
          [mode]="example.key === 'inline' ? 'inline' : 'iframe'"
          [device]="example.key === 'mobile' ? 'mobile' : 'desktop'"
          [height]="260"
          [html]="previewHtml"
          [loading]="example.key === 'loading'"
          [error]="example.key === 'error' ? 'The preview could not be generated.' : ''"
          loadingMessage="Generating invoice preview…"
        />
      }
      @case ('image') {
        <j-image
          [src]="previewImage"
          alt="Illustration of a laptop product"
          width="18rem"
          preview
        />
      }
      @case ('video-player') {
        <j-video-player src="/assets/demo-video.mp4" caption="YouTube embed example" />
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}

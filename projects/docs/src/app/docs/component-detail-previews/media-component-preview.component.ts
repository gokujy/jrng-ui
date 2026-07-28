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
      @case ('barcode') {
        <j-barcode
          value="CUS-TICKET-2048"
          ariaLabel="Customer ticket CUS-TICKET-2048"
          [width]="220"
          [height]="220"
          showValue
        />
      }
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
        @let video = videoPreviews[example.index];
        <j-video-player [src]="video.src" [caption]="video.caption" [ariaLabel]="video.ariaLabel" />
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
  readonly videoPreviews = [
    {
      src: '/assets/videos/sample-video-1.mp4',
      caption: 'Sample video 1',
      ariaLabel: 'Play sample video 1',
    },
    {
      src: '/assets/videos/sample-video-2.mp4',
      caption: 'Sample video 2',
      ariaLabel: 'Play sample video 2',
    },
    {
      src: '/assets/videos/sample-video-3.mp4',
      caption: 'Sample video 3',
      ariaLabel: 'Play sample video 3',
    },
  ] as const;
}

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  OnChanges,
  signal,
} from '@angular/core';
import { JInternalImageViewerComponent } from './image-viewer.component';

@Component({
  selector: 'j-image',
  imports: [JInternalImageViewerComponent],
  template: `
    <span
      class="j-image"
      [class]="styleClass()"
      data-jc-name="image"
      data-jc-section="root"
      [style.width]="width() || null"
      [style.height]="height() || null"
    >
      @if (previewable()) {
        <button
          type="button"
          class="j-image__button"
          [attr.aria-label]="'Preview image: ' + alt()"
          (click)="openPreview()"
        >
          <img
            [src]="currentSrc()"
            [alt]="alt()"
            [attr.loading]="loading()"
            (error)="useFallback()"
          />
        </button>
      } @else {
        <img
          [src]="currentSrc()"
          [alt]="alt()"
          [attr.loading]="loading()"
          (error)="useFallback()"
        />
      }
    </span>

    <j-internal-image-viewer
      [src]="currentSrc()"
      [alt]="alt()"
      [visible]="previewVisible()"
      (visibleChange)="previewVisible.set($event)"
    />
  `,
  styles: [
    `
      .j-image,
      .j-image__button,
      .j-image img {
        display: inline-block;
      }

      .j-image {
        border-radius: var(--j-radius-md);
        overflow: hidden;
      }

      .j-image__button {
        background: transparent;
        border: 0;
        cursor: zoom-in;
        padding: 0;
      }

      .j-image__button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-image img {
        height: 100%;
        max-width: 100%;
        object-fit: cover;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JImageComponent implements OnChanges {
  readonly src = input('');
  readonly alt = input('');
  readonly width = input('');
  readonly height = input('');
  readonly loading = input<'lazy' | 'eager'>('lazy');
  readonly previewable = input(false, { transform: booleanAttribute });
  readonly fallback = input('');
  readonly styleClass = input('');

  readonly currentSrc = signal('');
  readonly previewVisible = signal(false);

  ngOnChanges(): void {
    this.currentSrc.set(this.src());
  }

  openPreview(): void {
    this.previewVisible.set(true);
  }

  useFallback(): void {
    if (this.fallback() && this.currentSrc() !== this.fallback()) {
      this.currentSrc.set(this.fallback());
    }
  }
}

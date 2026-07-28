import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  Renderer2,
  afterRenderEffect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JBodyScrollLockService, JFocusTrapDirective, JOverlayStackService } from 'jrng-ui/core';
import { JInternalOverlayHeaderComponent } from 'jrng-ui/overlay-header';

/** @internal Fullscreen implementation shared by j-image, Avatar and Gallery. */
@Component({
  selector: 'j-internal-image-viewer',
  imports: [JButtonComponent, JFocusTrapDirective, JInternalOverlayHeaderComponent],
  template: `
    @if (visible()) {
      <div
        class="j-image-viewer"
        [class.j-image-viewer--sized]="width() || height()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="alt() || 'Image preview'"
      >
        <button
          type="button"
          class="j-image-viewer__backdrop"
          aria-label="Close preview"
          (click)="backdropClose()"
        ></button>
        <section
          class="j-image-viewer__surface"
          jFocusTrap
          [style.width]="width() || null"
          [style.height]="height() || null"
        >
          <j-overlay-header
            [title]="alt() || 'Image preview'"
            closeLabel="Close preview"
            (close)="close()"
          >
            <div jOverlayActions class="j-image-viewer__actions">
              <j-button
                variant="text"
                actionDisplay="icon"
                icon="zoom-in"
                ariaLabel="Zoom in"
                title="Zoom in"
                (onClick)="zoomBy(0.25)"
              />
              <j-button
                variant="text"
                actionDisplay="icon"
                icon="rotate-cw"
                ariaLabel="Rotate clockwise"
                title="Rotate clockwise"
                (onClick)="rotateBy(90)"
              />
              <j-button
                variant="text"
                actionDisplay="icon"
                icon="refresh-cw"
                ariaLabel="Reset image"
                title="Reset image"
                (onClick)="reset()"
              />
            </div>
          </j-overlay-header>
          <div class="j-image-viewer__viewport">
            <img [src]="src()" [alt]="alt()" [style.transform]="transform()" />
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .j-image-viewer {
        inset: 0;
        position: fixed;
        z-index: var(--j-z-index-fullscreen, 1200);
      }
      .j-image-viewer__backdrop {
        background: var(--j-image-viewer-backdrop-bg, var(--j-overlay-backdrop-bg));
        border: 0;
        cursor: zoom-out;
        inset: 0;
        position: absolute;
      }
      .j-image-viewer__surface {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        inset: clamp(0.5rem, 3vw, 2rem);
        position: absolute;
      }
      .j-image-viewer--sized {
        align-items: center;
        display: flex;
        justify-content: center;
        padding: 0.5rem;
      }
      .j-image-viewer--sized .j-image-viewer__surface {
        inset: auto;
        max-height: calc(100vh - 1rem);
        max-width: calc(100vw - 1rem);
        position: relative;
      }
      .j-image-viewer__header {
        align-items: center;
        background: var(--j-color-card);
        border-radius: var(--j-radius-lg, 0.75rem) var(--j-radius-lg, 0.75rem) 0 0;
        display: flex;
        gap: var(--j-spacing-md, 0.75rem);
        justify-content: space-between;
        min-height: 3rem;
        padding: var(--j-spacing-xs, 0.25rem) var(--j-spacing-sm, 0.5rem)
          var(--j-spacing-xs, 0.25rem) var(--j-spacing-md, 0.75rem);
      }
      .j-image-viewer__title {
        font-weight: var(--j-font-weight-semibold, 650);
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .j-image-viewer__actions {
        align-items: center;
        display: flex;
        flex: 0 0 auto;
        gap: var(--j-spacing-2xs, 0.125rem);
      }
      .j-image-viewer__viewport {
        align-items: center;
        background: var(--j-image-viewer-control-bg, var(--j-overlay-backdrop-bg));
        border-radius: 0 0 var(--j-radius-lg, 0.75rem) var(--j-radius-lg, 0.75rem);
        display: flex;
        justify-content: center;
        min-height: 0;
        overflow: auto;
        padding: var(--j-spacing-md, 0.75rem);
      }
      .j-image-viewer__viewport img {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        transition: transform var(--j-duration-fast, 150ms);
      }
      @media (prefers-reduced-motion: reduce) {
        .j-image-viewer__viewport img {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JInternalImageViewerComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bodyScrollLock = inject(JBodyScrollLockService);
  private readonly overlayStack = inject(JOverlayStackService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly overlayHeader = viewChild(JInternalOverlayHeaderComponent);
  private previousFocus: HTMLElement | null = null;
  private scrollLocked = false;
  private wasVisible = false;

  readonly src = input('');
  readonly alt = input('');
  readonly closeOnBackdrop = input(true);
  readonly width = input('');
  readonly height = input('');
  readonly visible = model(false);
  readonly closed = output<void>();
  readonly scale = signal(1);
  readonly rotation = signal(0);
  readonly transform = () => `scale(${this.scale()}) rotate(${this.rotation()}deg)`;

  constructor() {
    if (!this.browser) return;
    const remove = this.renderer.listen(this.documentRef, 'keydown', (event: KeyboardEvent) => {
      if (!this.visible()) return;
      if (!this.overlayStack.isTopmost(this)) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
      if (event.key === '+') this.zoomBy(0.25);
      if (event.key === '-') this.zoomBy(-0.25);
    });
    this.destroyRef.onDestroy(remove);
    afterRenderEffect(() => {
      if (this.visible() && !this.wasVisible) {
        this.overlayStack.push(this);
        this.previousFocus = this.documentRef.activeElement as HTMLElement | null;
        this.lockPageScroll();
        queueMicrotask(() => this.overlayHeader()?.focusClose());
      } else if (!this.visible() && this.wasVisible) {
        this.overlayStack.remove(this);
        this.restorePageScroll();
        queueMicrotask(() => this.previousFocus?.focus());
        this.previousFocus = null;
      }
      this.wasVisible = this.visible();
    });
    this.destroyRef.onDestroy(() => {
      this.overlayStack.remove(this);
      this.restorePageScroll();
    });
  }

  zoomBy(delta: number): void {
    this.scale.set(Math.min(4, Math.max(0.25, this.scale() + delta)));
  }
  rotateBy(degrees: number): void {
    this.rotation.update((value) => (value + degrees) % 360);
  }
  reset(): void {
    this.scale.set(1);
    this.rotation.set(0);
  }
  backdropClose(): void {
    if (this.closeOnBackdrop()) this.close();
  }
  close(): void {
    if (!this.visible()) return;
    this.overlayStack.remove(this);
    this.visible.set(false);
    this.reset();
    this.closed.emit();
  }

  private lockPageScroll(): void {
    if (this.scrollLocked) return;
    this.bodyScrollLock.lock();
    this.scrollLocked = true;
  }

  private restorePageScroll(): void {
    if (!this.scrollLocked) return;
    this.bodyScrollLock.unlock();
    this.scrollLocked = false;
  }
}

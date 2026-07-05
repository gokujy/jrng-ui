import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  effect,
  inject,
  model,
  output,
} from '@angular/core';
import { JBodyScrollLockService } from '../core/body-scroll-lock.service';
import { jFocusInitial } from '../core/focus';
import { JFocusTrapDirective } from '../core/focus-trap.directive';
import { jCreateId } from '../core/id';
import { JZIndexManagerService } from '../core/z-index-manager.service';

export type JDrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type JDrawerCloseReason = 'close-button' | 'backdrop' | 'escape' | 'gesture' | 'api';

@Component({
  selector: 'j-drawer',
  imports: [JFocusTrapDirective],
  template: `
    @if (visible()) {
      <div
        class="j-drawer__backdrop"
        [class.is-modal]="modal"
        [style.z-index]="zIndex || null"
        data-jc-name="drawer"
        data-jc-section="backdrop"
        data-j-open="true"
        (mousedown)="handleMask($event)"
      >
        <aside
          #drawerPanel
          jFocusTrap
          [class]="drawerClasses"
          [style.width]="width || null"
          [style.height]="computedHeight"
          [style.transform]="gestureTransform"
          role="dialog"
          [attr.aria-modal]="modal ? 'true' : 'false'"
          [attr.aria-labelledby]="header ? titleId : null"
          [attr.aria-label]="header ? null : 'Drawer'"
          tabindex="-1"
          data-jc-name="drawer"
          data-jc-section="root"
          data-jc-extend="handle header body footer close"
          data-j-open="true"
          (pointerdown)="startGesture($event)"
          (pointermove)="moveGesture($event)"
          (pointerup)="endGesture()"
          (pointercancel)="cancelGesture()"
        >
          @if (showHandle) {
            <button
              class="j-drawer__handle"
              type="button"
              aria-label="Close drawer"
              data-jc-section="handle"
              (click)="close('gesture')"
            ></button>
          }
          @if (header || closable) {
            <header class="j-drawer__header" data-jc-section="header">
              @if (header) {
                <h2 class="j-drawer__title" [id]="titleId">{{ header }}</h2>
              }
              <ng-content select="[jDrawerHeader]"></ng-content>
              @if (closable) {
                <button class="j-drawer__close" type="button" aria-label="Close drawer" (click)="close('close-button')">
                  x
                </button>
              }
            </header>
          }
          <div class="j-drawer__body" data-jc-section="body"><ng-content></ng-content></div>
          <footer class="j-drawer__footer" data-jc-section="footer">
            <ng-content select="[jDrawerFooter]"></ng-content>
          </footer>
        </aside>
      </div>
    }
  `,
  styles: [
    `
      .j-drawer__backdrop {
        display: flex;
        inset: 0;
        position: fixed;
        z-index: var(--j-z-index-modal);
      }

      .j-drawer__backdrop.is-modal {
        background: var(--j-overlay-backdrop-bg, rgb(15 23 42 / 56%));
      }

      .j-drawer {
        background: var(--j-color-card);
        box-shadow: var(--j-dialog-shadow, var(--j-shadow-lg));
        color: var(--j-color-card-foreground);
        display: flex;
        flex-direction: column;
        max-height: 100dvh;
        max-width: 100vw;
        outline: none;
        transition: transform 160ms ease;
      }

      .j-drawer--left,
      .j-drawer--right {
        height: 100%;
        width: min(28rem, 92vw);
      }

      .j-drawer--right {
        margin-inline-start: auto;
      }

      .j-drawer--top,
      .j-drawer--bottom {
        height: min(24rem, 80dvh);
        width: 100%;
      }

      .j-drawer--bottom {
        border-radius: var(--j-radius-xl, 1rem) var(--j-radius-xl, 1rem) 0 0;
        margin-block-start: auto;
      }

      .j-drawer--top {
        border-radius: 0 0 var(--j-radius-xl, 1rem) var(--j-radius-xl, 1rem);
      }

      .j-drawer__handle {
        align-self: center;
        background: var(--j-color-border);
        border: 0;
        border-radius: var(--j-radius-full);
        cursor: pointer;
        height: 0.25rem;
        margin: var(--j-spacing-3) 0 0;
        width: 2.5rem;
      }

      .j-drawer__header,
      .j-drawer__body,
      .j-drawer__footer {
        padding: var(--j-spacing-4);
      }

      .j-drawer__header {
        align-items: center;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        gap: var(--j-spacing-3);
        justify-content: space-between;
      }

      .j-drawer__title {
        font-size: var(--j-font-size-lg);
        letter-spacing: 0;
        margin: 0;
      }

      .j-drawer__body {
        flex: 1;
        overflow: auto;
      }

      .j-drawer__footer {
        border-top: 1px solid var(--j-color-border);
      }

      .j-drawer__footer:empty {
        display: none;
      }

      .j-drawer__close {
        align-items: center;
        background: var(--j-color-muted);
        border: 0;
        border-radius: var(--j-radius-full);
        color: var(--j-color-muted-foreground);
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        height: 2rem;
        justify-content: center;
        width: 2rem;
      }

      .j-drawer__close:focus-visible,
      .j-drawer__handle:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      @media (max-width: 640px) {
        .j-drawer.is-mobile-sheet {
          border-radius: var(--j-radius-xl, 1rem) var(--j-radius-xl, 1rem) 0 0;
          height: min(80dvh, var(--j-drawer-snap-height, 32rem));
          margin-block-start: auto;
          width: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDrawerComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bodyScrollLock = inject(JBodyScrollLockService);
  private readonly zIndexManager = inject(JZIndexManagerService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private wasVisible = false;
  private scrollLocked = false;
  private pendingCloseReason: JDrawerCloseReason | null = null;
  private previousFocus: HTMLElement | null = null;
  private gestureStart: { readonly x: number; readonly y: number } | null = null;

  @ViewChild('drawerPanel') private panel?: ElementRef<HTMLElement>;

  readonly visible = model(false);
  @Input() header = '';
  @Input() position: JDrawerPosition = 'right';
  @Input() width = '';
  @Input() height = '';
  @Input() styleClass = '';
  @Input() appendTo: 'self' | 'body' | string = 'self';
  @Input() snapPoints: readonly string[] = ['50%', '80%'];
  @Input({ transform: booleanAttribute }) modal = true;
  @Input({ transform: booleanAttribute }) closable = true;
  @Input({ transform: booleanAttribute }) dismissableMask = true;
  @Input({ transform: booleanAttribute }) closeOnEscape = true;
  @Input({ transform: booleanAttribute }) showHandle = true;
  @Input({ transform: booleanAttribute }) mobileBottomSheet = true;

  readonly opened = output<void>();
  readonly closed = output<JDrawerCloseReason>();
  readonly openChange = output<boolean>();

  readonly titleId = jCreateId('j-drawer-title');
  zIndex = 0;
  gestureOffset = 0;

  @Input({ transform: booleanAttribute })
  set open(value: boolean) {
    this.visible.set(value);
  }

  get drawerClasses(): string {
    return [
      'j-drawer',
      `j-drawer--${this.position}`,
      this.mobileBottomSheet ? 'is-mobile-sheet' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  get computedHeight(): string | null {
    return this.height || (this.position === 'bottom' && this.snapPoints[1] ? this.snapPoints[1] : null);
  }

  get gestureTransform(): string | null {
    if (!this.gestureOffset) {
      return null;
    }
    if (this.position === 'left' || this.position === 'right') {
      return `translateX(${this.gestureOffset}px)`;
    }
    return `translateY(${this.gestureOffset}px)`;
  }

  constructor() {
    effect(() => {
      const nextVisible = this.visible();
      if (nextVisible && !this.wasVisible) {
        this.handleOpened();
      }
      if (!nextVisible && this.wasVisible) {
        const reason = this.pendingCloseReason ?? 'api';
        this.handleClosed(reason, this.pendingCloseReason !== null);
        this.pendingCloseReason = null;
      }
      this.wasVisible = nextVisible;
    });

    if (!this.isBrowser) {
      return;
    }

    const removeKeydownListener = this.renderer.listen(this.documentRef, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.handleEscape(event);
      }
    });

    this.destroyRef.onDestroy(removeKeydownListener);
  }

  openDrawer(): void {
    if (this.visible()) {
      return;
    }
    this.visible.set(true);
    this.openChange.emit(true);
  }

  close(reason: JDrawerCloseReason = 'api'): void {
    if (!this.visible()) {
      return;
    }
    this.pendingCloseReason = reason;
    this.visible.set(false);
    this.openChange.emit(false);
  }

  handleEscape(event: Event): void {
    if (!this.visible() || !this.closeOnEscape) {
      return;
    }
    event.preventDefault();
    this.close('escape');
  }

  handleMask(event: MouseEvent): void {
    if (this.dismissableMask && event.target === event.currentTarget) {
      this.close('backdrop');
    }
  }

  startGesture(event: PointerEvent): void {
    if (!this.showHandle) {
      return;
    }
    this.gestureStart = { x: event.clientX, y: event.clientY };
  }

  moveGesture(event: PointerEvent): void {
    if (!this.gestureStart) {
      return;
    }
    const dx = event.clientX - this.gestureStart.x;
    const dy = event.clientY - this.gestureStart.y;
    const offsetMap: Record<JDrawerPosition, number> = {
      left: Math.min(0, dx),
      right: Math.max(0, dx),
      top: Math.min(0, dy),
      bottom: Math.max(0, dy),
    };
    this.gestureOffset = offsetMap[this.position];
  }

  endGesture(): void {
    const threshold = 96;
    const shouldClose = Math.abs(this.gestureOffset) > threshold;
    this.gestureStart = null;
    this.gestureOffset = 0;
    if (shouldClose) {
      this.close('gesture');
    }
  }

  cancelGesture(): void {
    this.gestureStart = null;
    this.gestureOffset = 0;
  }

  private handleOpened(): void {
    this.zIndex = this.zIndexManager.next(1100);
    const HTMLElementCtor = this.documentRef.defaultView?.HTMLElement;
    this.previousFocus =
      HTMLElementCtor && this.documentRef.activeElement instanceof HTMLElementCtor ? this.documentRef.activeElement : null;
    if (this.modal && !this.scrollLocked) {
      this.bodyScrollLock.lock();
      this.scrollLocked = true;
    }
    this.opened.emit();
    queueMicrotask(() => {
      const panel = this.panel?.nativeElement;
      if (panel && !jFocusInitial(panel)) {
        panel.focus();
      }
    });
  }

  private handleClosed(reason: JDrawerCloseReason, emitEvent: boolean): void {
    if (this.scrollLocked) {
      this.bodyScrollLock.unlock();
      this.scrollLocked = false;
    }
    if (emitEvent) {
      this.closed.emit(reason);
    }
    queueMicrotask(() => this.previousFocus?.focus());
    this.changeDetectorRef.markForCheck();
  }
}

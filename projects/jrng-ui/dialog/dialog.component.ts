import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  OnDestroy,
  model,
  output,
  PLATFORM_ID,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { JBodyScrollLockService } from 'jrng-ui/core';
import { JFocusTrapDirective } from 'jrng-ui/core';
import { jFocusInitial } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JOverlayStackService } from 'jrng-ui/core';
import { JAppendTo, JOverlayHandle, JOverlayService } from 'jrng-ui/core';
import { JZIndexManagerService } from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';

export type JDialogCloseReason = 'close-button' | 'backdrop' | 'escape' | 'api';
export type JDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type JDialogPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

@Component({
  selector: 'j-dialog',
  imports: [JFocusTrapDirective, JButtonComponent],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDialogComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  private readonly bodyScrollLock = inject(JBodyScrollLockService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zIndexManager = inject(JZIndexManagerService);
  private readonly overlayStack = inject(JOverlayStackService);
  private readonly overlay = inject(JOverlayService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private previouslyFocused: HTMLElement | null = null;
  private scrollLocked = false;
  private wasVisible = false;
  private pendingCloseReason: JDialogCloseReason | null = null;
  private dragStart: {
    readonly x: number;
    readonly y: number;
    readonly left: number;
    readonly top: number;
  } | null = null;
  private resizeStart: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  } | null = null;

  @ViewChild('dialogPanel') private panel?: ElementRef<HTMLElement>;
  @ViewChild('overlayRoot') private overlayRoot?: ElementRef<HTMLElement>;
  private overlayHandle?: JOverlayHandle;

  readonly visible = model(false);
  // `header`, `closable`, and `dismissableMask` are read as internal state and
  // also written by alias inputs (`title`, `showCloseButton`, `closeOnBackdrop`),
  // so they are writable signals seeded from their own inputs via effects below.
  readonly header = signal('');
  readonly closable = signal(true);
  readonly dismissableMask = signal(true);
  readonly headerInput = input('', { alias: 'header' });
  readonly closableInput = input(true, { alias: 'closable', transform: booleanAttribute });
  readonly dismissableMaskInput = input(true, {
    alias: 'dismissableMask',
    transform: booleanAttribute,
  });
  readonly modal = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly draggable = input(false, { transform: booleanAttribute });
  readonly resizable = input(false, { transform: booleanAttribute });
  readonly headless = input(false, { transform: booleanAttribute });
  readonly width = input('');
  readonly height = input('');
  readonly size = input<JDialogSize>('md');
  readonly position = input<JDialogPosition>('center');
  readonly styleClass = input('');
  readonly appendTo = input<JAppendTo | undefined>(undefined);
  readonly titleId = jCreateId('j-dialog-title');
  zIndex = 0;
  dragX = 0;
  dragY = 0;
  panelWidth = '';
  panelHeight = '';

  readonly opened = output<void>();
  readonly closed = output<JDialogCloseReason>();
  readonly hide = output<JDialogCloseReason>();
  readonly show = output<void>();
  readonly openChange = output<boolean>();
  readonly jrClose = output<JDialogCloseReason>();

  // Write-only alias inputs that feed other state. Each is optional so it only
  // writes its target when actually bound, preserving the `[(visible)]`
  // two-way binding and the `header`/`closable`/`dismissableMask` defaults.
  readonly open = input<boolean | undefined, unknown>(undefined, {
    transform: booleanAttribute,
  });
  readonly title = input<string | undefined>(undefined);
  readonly showCloseButton = input<boolean | undefined, unknown>(undefined, {
    transform: booleanAttribute,
  });
  readonly closeOnBackdrop = input<boolean | undefined, unknown>(undefined, {
    transform: booleanAttribute,
  });

  get dialogClasses(): string {
    return [
      'j-dialog',
      `j-dialog--${this.size()}`,
      `j-dialog--${this.position()}`,
      this.resizable() ? 'is-resizable' : '',
      this.draggable() ? 'is-draggable' : '',
      this.headless() ? 'is-headless' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  get backdropClasses(): string {
    return [
      'j-dialog__backdrop',
      `j-dialog__backdrop--${this.position()}`,
      this.modal() ? 'is-modal' : '',
    ].join(' ');
  }

  constructor() {
    // Seed writable state from its own alias input.
    effect(() => this.header.set(this.headerInput()));
    effect(() => this.closable.set(this.closableInput()));
    effect(() => this.dismissableMask.set(this.dismissableMaskInput()));

    // Alias inputs override the shared state only when explicitly bound.
    effect(() => {
      const value = this.title();
      if (value !== undefined) {
        this.header.set(value);
      }
    });
    effect(() => {
      const value = this.showCloseButton();
      if (value !== undefined) {
        this.closable.set(value);
      }
    });
    effect(() => {
      const value = this.closeOnBackdrop();
      if (value !== undefined) {
        this.dismissableMask.set(value);
      }
    });
    effect(() => {
      const value = this.open();
      if (value !== undefined) {
        this.visible.set(value);
      }
    });

    effect(() => {
      const nextVisible = this.visible();

      if (nextVisible && !this.wasVisible) {
        this.handleOpened();
      }

      if (!nextVisible && this.wasVisible) {
        const reason = this.pendingCloseReason ?? 'api';
        this.handleClosed(reason);
        this.pendingCloseReason = null;
      }

      this.wasVisible = nextVisible;
    });

    if (!this.isBrowser) {
      return;
    }

    const removeKeydownListener = this.renderer.listen(
      this.documentRef,
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.handleEscape(event);
        }
      },
    );

    this.destroyRef.onDestroy(removeKeydownListener);
  }

  ngOnDestroy(): void {
    this.overlayHandle?.detach();
    this.overlayStack.remove(this);
    if (this.scrollLocked) {
      this.bodyScrollLock.unlock();
    }
  }

  handleEscape(event: Event): void {
    // Only the front-most overlay should respond to Escape.
    if (!this.visible() || !this.closeOnEscape() || !this.overlayStack.isTopmost(this)) {
      return;
    }
    event.preventDefault();
    this.close('escape');
  }

  openDialog(): void {
    if (this.visible()) {
      return;
    }
    this.visible.set(true);
    this.openChange.emit(true);
    this.changeDetectorRef.markForCheck();
  }

  close(reason: JDialogCloseReason = 'api'): void {
    if (!this.visible()) {
      return;
    }
    this.pendingCloseReason = reason;
    this.visible.set(false);
    this.openChange.emit(false);
    this.changeDetectorRef.markForCheck();
  }

  handleBackdropClick(event: MouseEvent): void {
    if (!this.dismissableMask() || event.target !== event.currentTarget) {
      return;
    }
    this.close('backdrop');
  }

  startDrag(event: PointerEvent): void {
    if (!this.draggable() || !this.panel?.nativeElement) {
      return;
    }
    const rect = this.panel.nativeElement.getBoundingClientRect();
    this.dragStart = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    this.panel.nativeElement.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  moveDrag(event: PointerEvent): void {
    if (!this.dragStart) {
      return;
    }
    this.dragX = event.clientX - this.dragStart.x;
    this.dragY = event.clientY - this.dragStart.y;
  }

  endDrag(): void {
    this.dragStart = null;
  }

  startResize(event: PointerEvent): void {
    if (!this.resizable() || !this.panel?.nativeElement) {
      return;
    }
    const rect = this.panel.nativeElement.getBoundingClientRect();
    this.resizeStart = {
      x: event.clientX,
      y: event.clientY,
      width: rect.width,
      height: rect.height,
    };
    event.preventDefault();
  }

  moveResize(event: PointerEvent): void {
    if (!this.resizeStart) {
      return;
    }
    this.panelWidth = `${Math.max(280, this.resizeStart.width + event.clientX - this.resizeStart.x)}px`;
    this.panelHeight = `${Math.max(180, this.resizeStart.height + event.clientY - this.resizeStart.y)}px`;
  }

  endResize(): void {
    this.resizeStart = null;
  }

  private handleOpened(): void {
    this.zIndex = this.zIndexManager.next(1100);
    this.overlayStack.push(this);
    this.panelWidth = this.width();
    this.panelHeight = this.height();
    const HTMLElementCtor = this.documentRef.defaultView?.HTMLElement;
    this.previouslyFocused =
      HTMLElementCtor && this.documentRef.activeElement instanceof HTMLElementCtor
        ? this.documentRef.activeElement
        : null;
    if (this.modal() && !this.scrollLocked) {
      this.bodyScrollLock.lock();
      this.scrollLocked = true;
    }
    this.opened.emit();
    this.show.emit();
    queueMicrotask(() => {
      const root = this.overlayRoot?.nativeElement;
      if (root) this.overlayHandle = this.overlay.portal(root, this.appendTo());
      const panel = this.panel?.nativeElement;
      if (panel && !jFocusInitial(panel)) {
        panel.focus();
      }
    });
  }

  private handleClosed(reason: JDialogCloseReason): void {
    this.overlayHandle?.detach();
    this.overlayHandle = undefined;
    this.overlayStack.remove(this);
    if (this.scrollLocked) {
      this.bodyScrollLock.unlock();
      this.scrollLocked = false;
    }
    // Emit close outputs for every close path — including closing via the
    // `[(visible)]`/`open` model — so `(closed)`/`(hide)` fire consistently.
    this.closed.emit(reason);
    this.hide.emit(reason);
    this.jrClose.emit(reason);
    queueMicrotask(() => this.previouslyFocused?.focus());
  }
}

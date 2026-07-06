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
  Input,
  OnDestroy,
  model,
  output,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { JBodyScrollLockService } from 'jrng-ui/core';
import { JFocusTrapDirective } from 'jrng-ui/core';
import { jFocusInitial } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JZIndexManagerService } from 'jrng-ui/core';

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
export type JrDialogCloseReason = JDialogCloseReason;

@Component({
  selector: 'j-dialog',
  imports: [JFocusTrapDirective],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrDialogComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  private readonly bodyScrollLock = inject(JBodyScrollLockService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zIndexManager = inject(JZIndexManagerService);
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

  readonly visible = model(false);
  @Input() header = '';
  @Input({ transform: booleanAttribute }) modal = true;
  @Input({ transform: booleanAttribute }) closable = true;
  @Input({ transform: booleanAttribute }) dismissableMask = true;
  @Input({ transform: booleanAttribute }) closeOnEscape = true;
  @Input({ transform: booleanAttribute }) draggable = false;
  @Input({ transform: booleanAttribute }) resizable = false;
  @Input({ transform: booleanAttribute }) headless = false;
  @Input() width = '';
  @Input() height = '';
  @Input() size: JDialogSize = 'md';
  @Input() position: JDialogPosition = 'center';
  @Input() styleClass = '';
  @Input() appendTo: 'self' | 'body' | string = 'self';
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

  @Input({ transform: booleanAttribute })
  set open(value: boolean) {
    this.visible.set(value);
  }

  get open(): boolean {
    return this.visible();
  }

  @Input()
  set title(value: string) {
    this.header = value;
  }

  @Input({ transform: booleanAttribute })
  set showCloseButton(value: boolean) {
    this.closable = value;
  }

  @Input({ transform: booleanAttribute })
  set closeOnBackdrop(value: boolean) {
    this.dismissableMask = value;
  }

  get dialogClasses(): string {
    return [
      'j-dialog',
      `j-dialog--${this.size}`,
      `j-dialog--${this.position}`,
      this.resizable ? 'is-resizable' : '',
      this.draggable ? 'is-draggable' : '',
      this.headless ? 'is-headless' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  get backdropClasses(): string {
    return [
      'j-dialog__backdrop',
      `j-dialog__backdrop--${this.position}`,
      this.modal ? 'is-modal' : '',
    ].join(' ');
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
    if (this.scrollLocked) {
      this.bodyScrollLock.unlock();
    }
  }

  handleEscape(event: Event): void {
    if (!this.visible() || !this.closeOnEscape) {
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
    if (!this.dismissableMask || event.target !== event.currentTarget) {
      return;
    }
    this.close('backdrop');
  }

  startDrag(event: PointerEvent): void {
    if (!this.draggable || !this.panel?.nativeElement) {
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
    if (!this.resizable || !this.panel?.nativeElement) {
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
    this.panelWidth = this.width;
    this.panelHeight = this.height;
    const HTMLElementCtor = this.documentRef.defaultView?.HTMLElement;
    this.previouslyFocused =
      HTMLElementCtor && this.documentRef.activeElement instanceof HTMLElementCtor
        ? this.documentRef.activeElement
        : null;
    if (this.modal && !this.scrollLocked) {
      this.bodyScrollLock.lock();
      this.scrollLocked = true;
    }
    this.opened.emit();
    this.show.emit();
    queueMicrotask(() => {
      const panel = this.panel?.nativeElement;
      if (panel && !jFocusInitial(panel)) {
        panel.focus();
      }
    });
  }

  private handleClosed(reason: JDialogCloseReason, emitEvents: boolean): void {
    if (this.scrollLocked) {
      this.bodyScrollLock.unlock();
      this.scrollLocked = false;
    }
    if (emitEvents) {
      this.closed.emit(reason);
      this.hide.emit(reason);
      this.jrClose.emit(reason);
    }
    queueMicrotask(() => this.previouslyFocused?.focus());
  }
}

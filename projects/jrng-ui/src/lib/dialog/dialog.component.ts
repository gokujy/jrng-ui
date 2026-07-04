import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { JBodyScrollLockService } from '../core/body-scroll-lock.service';
import { JFocusTrapDirective } from '../core/focus-trap.directive';
import { jFocusFirst } from '../core/focus';
import { jCreateId } from '../core/id';

export type JDialogCloseReason = 'close-button' | 'backdrop' | 'escape' | 'api';
export type JDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type JDialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type JrDialogCloseReason = JDialogCloseReason;

@Component({
  selector: 'j-dialog',
  imports: [JFocusTrapDirective],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrDialogComponent implements OnChanges, OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  private readonly bodyScrollLock = inject(JBodyScrollLockService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private previouslyFocused: HTMLElement | null = null;
  private scrollLocked = false;

  @ViewChild('dialogPanel') private panel?: ElementRef<HTMLElement>;

  @Input({ transform: booleanAttribute }) visible = false;
  @Input() header = '';
  @Input({ transform: booleanAttribute }) modal = true;
  @Input({ transform: booleanAttribute }) closable = true;
  @Input({ transform: booleanAttribute }) dismissableMask = true;
  @Input({ transform: booleanAttribute }) closeOnEscape = true;
  @Input({ transform: booleanAttribute }) draggable = false;
  @Input({ transform: booleanAttribute }) resizable = false;
  @Input() width = '';
  @Input() height = '';
  @Input() size: JDialogSize = 'md';
  @Input() position: JDialogPosition = 'center';
  @Input() styleClass = '';
  @Input() appendTo: 'self' | 'body' | string = 'self';
  readonly titleId = jCreateId('j-dialog-title');

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<JDialogCloseReason>();
  @Output() hide = new EventEmitter<JDialogCloseReason>();
  @Output() show = new EventEmitter<void>();

  @Output() openChange = this.visibleChange;
  @Output() jrClose = this.closed;

  @Input({ transform: booleanAttribute })
  set open(value: boolean) {
    this.visible = value;
  }

  get open(): boolean {
    return this.visible;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      this.visible ? this.handleOpened() : this.handleClosed('api', false);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollLocked) {
      this.bodyScrollLock.unlock();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event): void {
    if (!this.visible || !this.closeOnEscape) {
      return;
    }
    event.preventDefault();
    this.close('escape');
  }

  openDialog(): void {
    if (this.visible) {
      return;
    }
    this.visible = true;
    this.visibleChange.emit(true);
    this.handleOpened();
    this.changeDetectorRef.markForCheck();
  }

  close(reason: JDialogCloseReason = 'api'): void {
    if (!this.visible) {
      return;
    }
    this.visible = false;
    this.visibleChange.emit(false);
    this.handleClosed(reason, true);
    this.changeDetectorRef.markForCheck();
  }

  handleBackdropClick(event: MouseEvent): void {
    if (!this.dismissableMask || event.target !== event.currentTarget) {
      return;
    }
    this.close('backdrop');
  }

  private handleOpened(): void {
    this.previouslyFocused =
      this.documentRef.activeElement instanceof HTMLElement ? this.documentRef.activeElement : null;
    if (this.modal && !this.scrollLocked) {
      this.bodyScrollLock.lock();
      this.scrollLocked = true;
    }
    this.opened.emit();
    this.show.emit();
    queueMicrotask(() => {
      const panel = this.panel?.nativeElement;
      if (panel && !jFocusFirst(panel)) {
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
    }
    queueMicrotask(() => this.previouslyFocused?.focus());
  }
}

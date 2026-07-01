import { CommonModule, DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { JrDialogSize } from './dialog.service';

export type JrDialogCloseReason = 'close-button' | 'backdrop' | 'escape' | 'api';

@Component({
  selector: 'jr-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrDialogComponent implements OnChanges {
  @Input({ transform: booleanAttribute }) open = false;
  @Input() title = '';
  @Input() size: JrDialogSize = 'md';
  @Input({ transform: booleanAttribute }) showCloseButton = true;
  @Input({ transform: booleanAttribute }) closeOnBackdrop = true;
  @Input({ transform: booleanAttribute }) closeOnEscape = true;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() jrClose = new EventEmitter<JrDialogCloseReason>();

  @ViewChild('dialogPanel') private panel?: ElementRef<HTMLElement>;

  private readonly document = inject(DOCUMENT);
  private previouslyFocused: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.prepareFocus();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event): void {
    if (!this.open || !this.closeOnEscape) {
      return;
    }

    event.preventDefault();
    this.close('escape');
  }

  show(): void {
    if (this.open) {
      return;
    }

    this.open = true;
    this.openChange.emit(true);
    this.prepareFocus();
  }

  close(reason: JrDialogCloseReason = 'api'): void {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.openChange.emit(false);
    this.jrClose.emit(reason);
    this.restoreFocus();
  }

  handleBackdropClick(event: MouseEvent): void {
    if (!this.closeOnBackdrop || event.target !== event.currentTarget) {
      return;
    }

    this.close('backdrop');
  }

  private prepareFocus(): void {
    this.previouslyFocused = this.document.activeElement as HTMLElement | null;
    queueMicrotask(() => this.panel?.nativeElement.focus());
  }

  private restoreFocus(): void {
    queueMicrotask(() => this.previouslyFocused?.focus());
  }
}

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  PLATFORM_ID,
  Renderer2,
  inject,
} from '@angular/core';

export type JDrawerPosition = 'left' | 'right' | 'top' | 'bottom';

@Component({
  selector: 'j-drawer',
  imports: [],
  template: `
    @if (visible) {
      <div class="j-drawer__backdrop" [class.is-modal]="modal" (mousedown)="handleMask($event)">
        <aside
          [class]="drawerClasses"
          [style.width]="width || null"
          [style.height]="height || null"
          role="dialog"
          [attr.aria-label]="header || 'Drawer'"
        >
          @if (header || closable) {
            <header class="j-drawer__header">
              @if (header) {
                <h2 class="j-drawer__title">{{ header }}</h2>
              }
              @if (closable) {
                <button
                  class="j-drawer__close"
                  type="button"
                  aria-label="Close drawer"
                  (click)="close()"
                >
                  x
                </button>
              }
            </header>
          }
          <div class="j-drawer__body"><ng-content></ng-content></div>
          <footer class="j-drawer__footer">
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
        background: rgb(15 23 42 / 56%);
      }
      .j-drawer {
        background: var(--j-color-surface);
        box-shadow: var(--j-shadow-lg);
        display: flex;
        flex-direction: column;
        max-height: 100vh;
        max-width: 100vw;
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
        height: min(24rem, 80vh);
        width: 100%;
      }
      .j-drawer--bottom {
        margin-block-start: auto;
      }
      .j-drawer__header,
      .j-drawer__body,
      .j-drawer__footer {
        padding: var(--j-spacing-lg);
      }
      .j-drawer__header {
        align-items: center;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        justify-content: space-between;
      }
      .j-drawer__title {
        font-size: var(--j-font-size-lg);
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
        background: transparent;
        border: 0;
        cursor: pointer;
        font: inherit;
      }
      .j-drawer__close:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDrawerComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @Input({ transform: booleanAttribute }) visible = false;
  @Input() header = '';
  @Input() position: JDrawerPosition = 'right';
  @Input() width = '';
  @Input() height = '';
  @Input() styleClass = '';
  @Input({ transform: booleanAttribute }) modal = true;
  @Input({ transform: booleanAttribute }) closable = true;
  @Input({ transform: booleanAttribute }) dismissableMask = true;
  @Input({ transform: booleanAttribute }) closeOnEscape = true;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  get drawerClasses(): string {
    return ['j-drawer', `j-drawer--${this.position}`, this.styleClass].filter(Boolean).join(' ');
  }

  constructor() {
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

  handleEscape(event: Event): void {
    if (!this.visible || !this.closeOnEscape) {
      return;
    }
    event.preventDefault();
    this.close();
  }

  open(): void {
    this.visible = true;
    this.visibleChange.emit(true);
    this.opened.emit();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  handleMask(event: MouseEvent): void {
    if (this.dismissableMask && event.target === event.currentTarget) {
      this.close();
    }
  }
}

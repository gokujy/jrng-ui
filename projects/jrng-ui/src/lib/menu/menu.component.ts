import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { JClickOutsideDirective } from '../core/click-outside.directive';

export interface JMenuItem {
  readonly label?: string;
  readonly icon?: string;
  readonly command?: (event: { item: JMenuItem; originalEvent: Event }) => void;
  readonly disabled?: boolean;
  readonly separator?: boolean;
  readonly items?: readonly JMenuItem[];
}

@Component({
  selector: 'j-menu',
  imports: [JClickOutsideDirective],
  template: `
    <nav [class]="menuClasses" [attr.aria-label]="ariaLabel" jClickOutside (jClickOutside)="hide()">
      @if (!popup || visible) {
        <ul class="j-menu__list" role="menu" (keydown)="handleKeydown($event)">
          @for (item of model; track item.label || item.icon || $index; let i = $index) {
            @if (item.separator) {
              <li class="j-menu__separator" role="separator"></li>
            }
            @if (!item.separator) {
              <li class="j-menu__item" role="none">
                <button
                  #menuButton
                  class="j-menu__button"
                  type="button"
                  role="menuitem"
                  [disabled]="item.disabled"
                  [attr.tabindex]="i === activeIndex ? 0 : -1"
                  (click)="activate(item, $event)"
                  (focus)="activeIndex = i"
                >
                  @if (item.icon) {
                    <span class="j-menu__icon" aria-hidden="true">{{ item.icon }}</span>
                  }
                  <span>{{ item.label }}</span>
                </button>
              </li>
            }
          }
        </ul>
      }
    </nav>
  `,
  styles: [
    `
      .j-menu {
        display: inline-block;
      }
      .j-menu--popup .j-menu__list {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-shadow: var(--j-shadow-lg);
        min-width: 12rem;
        position: absolute;
        z-index: var(--j-z-index-dropdown);
      }
      .j-menu__list {
        display: grid;
        gap: var(--j-spacing-xs);
        list-style: none;
        margin: 0;
        padding: var(--j-spacing-xs);
      }
      .j-menu__button {
        align-items: center;
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-sm);
        color: var(--j-color-text);
        cursor: pointer;
        display: flex;
        font: inherit;
        gap: var(--j-spacing-sm);
        min-height: 2rem;
        padding: 0 var(--j-spacing-md);
        text-align: left;
        width: 100%;
      }
      .j-menu__button:hover,
      .j-menu__button:focus-visible {
        background: var(--j-color-surface-muted);
        outline: none;
      }
      .j-menu__button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }
      .j-menu__separator {
        border-top: 1px solid var(--j-color-border);
        margin: var(--j-spacing-xs) 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMenuComponent {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChildren('menuButton') private buttons?: QueryList<ElementRef<HTMLButtonElement>>;

  @Input() model: readonly JMenuItem[] = [];
  @Input() ariaLabel = 'Menu';
  @Input() styleClass = '';
  @Input({ transform: booleanAttribute }) popup = false;
  @Input({ transform: booleanAttribute }) visible = false;

  @Output() visibleChange = new EventEmitter<boolean>();

  activeIndex = 0;

  get menuClasses(): string {
    return ['j-menu', this.popup ? 'j-menu--popup' : '', this.styleClass].filter(Boolean).join(' ');
  }

  show(): void {
    this.visible = true;
    this.visibleChange.emit(true);
    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => this.focusActive());
  }

  hide(): void {
    if (!this.popup || !this.visible) {
      return;
    }
    this.visible = false;
    this.visibleChange.emit(false);
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    this.visible ? this.hide() : this.show();
  }

  activate(item: JMenuItem, event: Event): void {
    if (item.disabled) {
      return;
    }
    item.command?.({ item, originalEvent: event });
    if (this.popup) {
      this.hide();
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hide();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.move(event.key === 'ArrowDown' ? 1 : -1);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.buttons?.get(this.activeButtonIndex())?.nativeElement.click();
    }
  }

  private move(direction: 1 | -1): void {
    const enabledIndexes = this.model
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.separator && !item.disabled)
      .map(({ index }) => index);
    if (!enabledIndexes.length) {
      return;
    }
    const current = enabledIndexes.indexOf(this.activeIndex);
    const next =
      enabledIndexes[(current + direction + enabledIndexes.length) % enabledIndexes.length] ??
      enabledIndexes[0];
    this.activeIndex = next;
    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => this.focusActive());
  }

  private activeButtonIndex(): number {
    return (
      this.model.filter((item, index) => !item.separator && index <= this.activeIndex).length - 1
    );
  }

  private focusActive(): void {
    this.buttons?.get(this.activeButtonIndex())?.nativeElement.focus();
  }
}

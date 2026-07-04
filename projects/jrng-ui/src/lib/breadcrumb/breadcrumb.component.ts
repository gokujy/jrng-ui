import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface JBreadcrumbItem {
  readonly label: string;
  readonly icon?: string;
  readonly routerLink?: string | readonly unknown[];
  readonly url?: string;
  readonly disabled?: boolean;
  readonly command?: (event: JBreadcrumbClickEvent) => void;
}

export interface JBreadcrumbClickEvent {
  readonly item: JBreadcrumbItem;
  readonly originalEvent: MouseEvent;
}

@Component({
  selector: 'j-breadcrumb',
  imports: [],
  template: `
    <nav class="j-breadcrumb" aria-label="Breadcrumb">
      <ol class="j-breadcrumb__list">
        @if (home) {
          <li class="j-breadcrumb__item">
            <a
              class="j-breadcrumb__link"
              [href]="home.url || null"
              [class.is-disabled]="home.disabled"
              (click)="handleClick(home, $event)"
            >
              @if (home.icon) {
                <span aria-hidden="true">{{ home.icon }}</span>
              }
              <span>{{ home.label }}</span>
            </a>
          </li>
        }
        @for (item of model; track item.url || item.routerLink || item.label || $index; let last = $last) {
          <li class="j-breadcrumb__item">
            <span class="j-breadcrumb__separator" aria-hidden="true">/</span>
            @if (!last) {
              <a
                class="j-breadcrumb__link"
                [href]="item.url || null"
                [class.is-disabled]="item.disabled"
                (click)="handleClick(item, $event)"
              >
                @if (item.icon) {
                  <span aria-hidden="true">{{ item.icon }}</span>
                }
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <span class="j-breadcrumb__current" aria-current="page">{{ item.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [
    `
      .j-breadcrumb__list {
        align-items: center;
        color: var(--j-color-text-muted, #64748b);
        display: flex;
        flex-wrap: wrap;
        font-size: var(--j-font-size-sm, 0.875rem);
        gap: var(--j-spacing-sm, 0.5rem);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-breadcrumb__item,
      .j-breadcrumb__link {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-sm, 0.5rem);
      }

      .j-breadcrumb__link {
        color: var(--j-color-primary, #4f46e5);
        text-decoration: none;
      }

      .j-breadcrumb__link:focus-visible {
        border-radius: var(--j-radius-sm, 0.375rem);
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-breadcrumb__link.is-disabled {
        color: var(--j-color-text-soft, #94a3b8);
        pointer-events: none;
      }

      .j-breadcrumb__current {
        color: var(--j-color-text, #111827);
        font-weight: var(--j-font-weight-medium, 550);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JBreadcrumbComponent {
  @Input() model: readonly JBreadcrumbItem[] = [];
  @Input() home?: JBreadcrumbItem;
  @Output() itemClick = new EventEmitter<JBreadcrumbClickEvent>();

  handleClick(item: JBreadcrumbItem, originalEvent: MouseEvent): void {
    if (item.disabled) {
      originalEvent.preventDefault();
      return;
    }

    const event = { item, originalEvent };
    item.command?.(event);
    this.itemClick.emit(event);

    if (!item.url) {
      originalEvent.preventDefault();
    }
  }
}

import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';

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

export type JBreadcrumbVariant = 'default' | 'steps' | 'contained';

@Component({
  selector: 'j-breadcrumb',
  imports: [NgTemplateOutlet, RouterLink],
  template: `
    <nav
      [class]="'j-breadcrumb j-breadcrumb--' + variant()"
      [attr.data-j-variant]="variant()"
      data-jc-name="breadcrumb"
      data-jc-section="root"
      aria-label="Breadcrumb"
    >
      <ol class="j-breadcrumb__list" data-jc-section="list">
        @if (home(); as home) {
          <li class="j-breadcrumb__item" data-jc-section="item">
            <a
              class="j-breadcrumb__link"
              [href]="home.url || null"
              [routerLink]="home.routerLink || null"
              [class.is-disabled]="home.disabled"
              [attr.data-j-disabled]="home.disabled ? 'true' : null"
              (click)="handleClick(home, $event)"
            >
              @if (home.icon) {
                <span class="j-breadcrumb__icon" aria-hidden="true">{{ home.icon }}</span>
              }
              <span>{{ home.label }}</span>
            </a>
          </li>
        }
        @for (
          item of model();
          track item.url || item.routerLink || item.label || $index;
          let last = $last
        ) {
          <li class="j-breadcrumb__item" data-jc-section="item">
            <span class="j-breadcrumb__separator" data-jc-section="separator" aria-hidden="true">
              @if (separatorTemplate) {
                <ng-container [ngTemplateOutlet]="separatorTemplate" />
              } @else {
                /
              }
            </span>
            @if (!last) {
              <a
                class="j-breadcrumb__link"
                [href]="item.url || null"
                [routerLink]="item.routerLink || null"
                [class.is-disabled]="item.disabled"
                [attr.data-j-disabled]="item.disabled ? 'true' : null"
                (click)="handleClick(item, $event)"
              >
                @if (item.icon) {
                  <span class="j-breadcrumb__icon" aria-hidden="true">{{ item.icon }}</span>
                }
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <span class="j-breadcrumb__current" data-jc-section="current" aria-current="page">
                @if (item.icon) {
                  <span class="j-breadcrumb__icon" aria-hidden="true">{{ item.icon }}</span>
                }
                <span>{{ item.label }}</span>
              </span>
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
        color: var(--j-color-muted-foreground);
        display: flex;
        flex-wrap: wrap;
        font-size: var(--j-font-size-sm);
        gap: var(--j-spacing-2);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-breadcrumb__item,
      .j-breadcrumb__link,
      .j-breadcrumb__current {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-2);
      }

      .j-breadcrumb__link {
        border-radius: var(--j-radius-sm);
        color: var(--j-color-primary);
        text-decoration: none;
      }

      .j-breadcrumb__link:hover {
        text-decoration: underline;
      }

      .j-breadcrumb__link:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-breadcrumb__link.is-disabled {
        color: var(--j-color-muted-foreground);
        pointer-events: none;
      }

      .j-breadcrumb__current {
        color: var(--j-color-foreground);
        font-weight: var(--j-font-weight-medium);
      }

      .j-breadcrumb--contained .j-breadcrumb__list {
        background: var(--j-color-surface-subtle, #eef2f7);
        border-radius: var(--j-radius-lg, 0.75rem);
        padding: var(--j-spacing-sm, 0.5rem) var(--j-spacing-md, 0.75rem);
      }

      .j-breadcrumb--steps .j-breadcrumb__list {
        align-items: stretch;
        flex-wrap: nowrap;
        gap: 0;
        overflow-x: auto;
      }

      .j-breadcrumb--steps .j-breadcrumb__item {
        background: var(--j-color-surface-subtle, #eef2f7);
        min-height: 2.5rem;
        padding-inline: var(--j-spacing-md, 0.75rem);
      }

      .j-breadcrumb--steps .j-breadcrumb__item:first-child {
        border-end-start-radius: var(--j-radius-md, 0.5rem);
        border-start-start-radius: var(--j-radius-md, 0.5rem);
      }

      .j-breadcrumb--steps .j-breadcrumb__item:last-child {
        background: var(--j-color-primary, #4f46e5);
        border-end-end-radius: var(--j-radius-md, 0.5rem);
        border-start-end-radius: var(--j-radius-md, 0.5rem);
      }

      .j-breadcrumb--steps .j-breadcrumb__item:last-child .j-breadcrumb__current {
        color: var(--j-color-on-primary, #ffffff);
      }

      .j-breadcrumb--steps .j-breadcrumb__separator {
        font-size: 0;
      }

      .j-breadcrumb--steps .j-breadcrumb__separator::after {
        color: var(--j-color-muted-foreground, #64748b);
        content: '›';
        font-size: var(--j-font-size-lg, 1.125rem);
        margin-inline-end: var(--j-spacing-md, 0.75rem);
      }

      @media (max-width: 640px) {
        .j-breadcrumb--steps .j-breadcrumb__item:not(:nth-last-child(-n + 2)):not(:first-child) {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JBreadcrumbComponent {
  readonly model = input<readonly JBreadcrumbItem[]>([]);
  readonly home = input<JBreadcrumbItem>();
  readonly variant = input<JBreadcrumbVariant>('default');
  @ContentChild('jBreadcrumbSeparator', { read: TemplateRef })
  separatorTemplate?: TemplateRef<unknown>;
  readonly itemClick = output<JBreadcrumbClickEvent>();

  handleClick(item: JBreadcrumbItem, originalEvent: MouseEvent): void {
    if (item.disabled) {
      originalEvent.preventDefault();
      return;
    }

    const event = { item, originalEvent };
    item.command?.(event);
    this.itemClick.emit(event);

    if (!item.url && !item.routerLink) {
      originalEvent.preventDefault();
    }
  }
}

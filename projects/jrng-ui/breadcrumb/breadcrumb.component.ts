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

@Component({
  selector: 'j-breadcrumb',
  imports: [NgTemplateOutlet, RouterLink],
  template: `
    <nav
      class="j-breadcrumb"
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JBreadcrumbComponent {
  readonly model = input<readonly JBreadcrumbItem[]>([]);
  readonly home = input<JBreadcrumbItem>();
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

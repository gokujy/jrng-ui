import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  contentChild,
  input,
  output,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JEmptyComponent } from 'jrng-ui/empty';
import { JIconComponent } from 'jrng-ui/icon';
import { JSkeletonComponent } from 'jrng-ui/skeleton';

export type JTimelineAlign = 'vertical' | 'horizontal';
export type JTimelineSeverity = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type JTimelineVariant = 'default' | 'activity' | 'alternating';

export interface JTimelineItem {
  readonly id?: string | number;
  readonly title?: string;
  readonly content?: string;
  readonly opposite?: string;
  readonly icon?: string;
  readonly severity?: JTimelineSeverity;
  readonly color?: string;
  readonly data?: unknown;
}

export interface JTimelineItemContext {
  readonly $implicit: JTimelineItem;
  readonly item: JTimelineItem;
  readonly index: number;
}

@Component({
  selector: 'j-timeline',
  imports: [
    JButtonComponent,
    JEmptyComponent,
    JIconComponent,
    JSkeletonComponent,
    NgTemplateOutlet,
  ],
  template: `
    @if (loading()) {
      <div class="j-timeline__state" role="status" [attr.aria-label]="loadingLabel()">
        <j-skeleton variant="text" [rows]="loadingRows()" />
      </div>
    } @else if (error()) {
      <j-empty variant="error" [title]="errorTitle()" [description]="errorDescription()" />
    } @else if (!value().length) {
      <j-empty variant="inline" [title]="emptyTitle()" [description]="emptyDescription()" />
    } @else {
      <ol
        class="j-timeline"
        [class]="styleClass()"
        [class.j-timeline--horizontal]="layout() === 'horizontal'"
        [class.j-timeline--compact]="compact()"
        [class.j-timeline--activity]="variant() === 'activity'"
        [class.j-timeline--alternating]="variant() === 'alternating'"
        [attr.data-j-variant]="variant()"
        data-jc-name="timeline"
        data-jc-section="root"
        [attr.aria-label]="ariaLabel()"
      >
        @for (item of value(); track item.title || item.content || $index; let index = $index) {
          <li
            class="j-timeline__item"
            data-jc-section="item"
            [attr.data-j-active]="item.severity ? 'true' : null"
            [attr.tabindex]="collapsible() ? 0 : null"
            [attr.aria-expanded]="collapsible() ? isExpanded(item, index) : null"
            (keydown)="handleItemKeydown($event, item, index)"
          >
            <div class="j-timeline__opposite" data-jc-section="opposite">
              @if (oppositeTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="itemContext(item, index)"
                />
              } @else {
                {{ item.opposite }}
              }
            </div>
            <div class="j-timeline__axis" aria-hidden="true">
              <span
                class="j-timeline__marker"
                [class]="'j-timeline__marker j-timeline__marker--' + (item.severity || 'neutral')"
                [style.--j-timeline-marker-color]="item.color || null"
              >
                @if (item.icon) {
                  <j-icon [name]="item.icon" aria-hidden="true" />
                }
              </span>
            </div>
            <article class="j-timeline__content" data-jc-section="content">
              @if (contentTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="itemContext(item, index)"
                />
              } @else {
                @if (item.title) {
                  <strong>{{ item.title }}</strong>
                }
                @if (collapsible()) {
                  <j-button
                    actionDisplay="icon"
                    size="sm"
                    variant="text"
                    [icon]="isExpanded(item, index) ? 'chevron-up' : 'chevron-down'"
                    [ariaLabel]="isExpanded(item, index) ? 'Collapse details' : 'Expand details'"
                    [ariaExpanded]="isExpanded(item, index)"
                    (onClick)="toggleItem(item, index, $event)"
                  />
                }
                @if (item.content && isExpanded(item, index)) {
                  <p>{{ item.content }}</p>
                }
              }
            </article>
          </li>
        }
      </ol>
    }
  `,
  styles: [
    `
      .j-timeline {
        display: grid;
        gap: var(--j-spacing-4);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-timeline__state {
        min-height: 8rem;
      }

      .j-timeline__item {
        display: grid;
        gap: var(--j-spacing-3);
        grid-template-columns: minmax(8rem, 0.5fr) auto minmax(0, 1fr);
      }

      .j-timeline__opposite {
        color: var(--j-color-muted-foreground);
        text-align: end;
      }

      .j-timeline__axis {
        align-items: center;
        display: flex;
        flex-direction: column;
      }

      .j-timeline__axis::after {
        background: var(--j-color-border);
        content: '';
        flex: 1;
        width: 1px;
      }

      .j-timeline__marker {
        align-items: center;
        background: var(--j-color-muted);
        border: 2px solid var(--j-color-card);
        border-radius: var(--j-radius-full);
        box-shadow: 0 0 0 1px var(--j-color-border);
        display: inline-flex;
        font-size: var(--j-font-size-xs);
        height: 2rem;
        justify-content: center;
        width: 2rem;
      }

      .j-timeline__marker--success {
        background: var(--j-timeline-marker-color, var(--j-color-success));
        color: var(--j-color-success-foreground, white);
      }

      .j-timeline__marker--warning {
        background: var(--j-timeline-marker-color, var(--j-color-warning));
        color: var(--j-color-warning-foreground, white);
      }

      .j-timeline__marker--danger {
        background: var(--j-timeline-marker-color, var(--j-color-danger));
        color: var(--j-color-danger-foreground, white);
      }

      .j-timeline__marker--info {
        background: var(--j-timeline-marker-color, var(--j-color-info));
        color: var(--j-color-info-foreground, white);
      }

      .j-timeline__content {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        padding: var(--j-spacing-4);
      }

      .j-timeline__content p {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1) 0 0;
      }

      .j-timeline--compact {
        gap: var(--j-spacing-2);
      }

      .j-timeline--compact .j-timeline__item {
        gap: var(--j-spacing-2);
        grid-template-columns: minmax(5rem, 0.35fr) auto minmax(0, 1fr);
      }

      .j-timeline--compact .j-timeline__marker {
        height: 1.5rem;
        width: 1.5rem;
      }

      .j-timeline--compact .j-timeline__content {
        padding: var(--j-spacing-3);
      }

      .j-timeline--horizontal {
        display: flex;
        overflow-x: auto;
      }

      .j-timeline--horizontal .j-timeline__item {
        grid-template-columns: minmax(12rem, 1fr);
        min-width: 16rem;
      }

      .j-timeline--horizontal .j-timeline__opposite {
        text-align: start;
      }

      .j-timeline--activity .j-timeline__item {
        grid-template-columns: auto minmax(0, 1fr);
      }

      .j-timeline--activity .j-timeline__opposite {
        grid-column: 2;
        grid-row: 2;
        text-align: start;
      }

      .j-timeline--activity .j-timeline__axis {
        grid-column: 1;
        grid-row: 1 / span 2;
      }

      .j-timeline--activity .j-timeline__marker {
        height: 1rem;
        margin-top: 0.25rem;
        width: 1rem;
      }

      .j-timeline--activity .j-timeline__content {
        background: transparent;
        border: 0;
        padding: 0;
      }

      .j-timeline--alternating .j-timeline__item {
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      }

      .j-timeline--alternating .j-timeline__item:nth-child(even) .j-timeline__opposite {
        grid-column: 3;
        text-align: start;
      }

      .j-timeline--alternating .j-timeline__item:nth-child(even) .j-timeline__axis {
        grid-column: 2;
        grid-row: 1;
      }

      .j-timeline--alternating .j-timeline__item:nth-child(even) .j-timeline__content {
        grid-column: 1;
        grid-row: 1;
      }

      @media (max-width: 640px) {
        .j-timeline:not(.j-timeline--horizontal) .j-timeline__item,
        .j-timeline--alternating .j-timeline__item {
          grid-template-columns: auto minmax(0, 1fr);
        }

        .j-timeline:not(.j-timeline--horizontal) .j-timeline__opposite,
        .j-timeline--alternating .j-timeline__item:nth-child(even) .j-timeline__opposite {
          grid-column: 2;
          grid-row: 2;
          text-align: start;
        }

        .j-timeline:not(.j-timeline--horizontal) .j-timeline__axis,
        .j-timeline--alternating .j-timeline__item:nth-child(even) .j-timeline__axis {
          grid-column: 1;
          grid-row: 1 / span 2;
        }

        .j-timeline:not(.j-timeline--horizontal) .j-timeline__content,
        .j-timeline--alternating .j-timeline__item:nth-child(even) .j-timeline__content {
          grid-column: 2;
          grid-row: 1;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTimelineComponent {
  readonly value = input<readonly JTimelineItem[]>([]);
  readonly layout = input<JTimelineAlign>('vertical');
  readonly compact = input(false, { transform: booleanAttribute });
  readonly variant = input<JTimelineVariant>('default');
  readonly styleClass = input('');
  readonly ariaLabel = input('Timeline');
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingRows = input(4);
  readonly loadingLabel = input('Loading timeline');
  readonly error = input<unknown>(null);
  readonly errorTitle = input('Unable to load timeline');
  readonly errorDescription = input('Try again later.');
  readonly emptyTitle = input('No timeline events');
  readonly emptyDescription = input('Events will appear here when available.');

  readonly itemToggle = output<{
    readonly item: JTimelineItem;
    readonly index: number;
    readonly expanded: boolean;
  }>();

  private readonly collapsedItems = new Set<string>();

  readonly contentTemplate = contentChild<unknown, TemplateRef<JTimelineItemContext>>(
    'jTimelineContent',
    { read: TemplateRef },
  );
  readonly oppositeTemplate = contentChild<unknown, TemplateRef<JTimelineItemContext>>(
    'jTimelineOpposite',
    { read: TemplateRef },
  );

  itemContext(item: JTimelineItem, index: number): JTimelineItemContext {
    return { $implicit: item, item, index };
  }

  isExpanded(item: JTimelineItem, index: number): boolean {
    return !this.collapsible() || !this.collapsedItems.has(this.itemKey(item, index));
  }

  toggleItem(item: JTimelineItem, index: number, event?: Event): void {
    event?.stopPropagation();
    if (!this.collapsible()) return;
    const key = this.itemKey(item, index);
    const expanded = this.collapsedItems.has(key);
    if (expanded) this.collapsedItems.delete(key);
    else this.collapsedItems.add(key);
    this.itemToggle.emit({ item, index, expanded });
  }

  handleItemKeydown(event: KeyboardEvent, item: JTimelineItem, index: number): void {
    if (!this.collapsible() || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    this.toggleItem(item, index);
  }

  private itemKey(item: JTimelineItem, index: number): string {
    return String(item.id ?? item.title ?? index);
  }
}

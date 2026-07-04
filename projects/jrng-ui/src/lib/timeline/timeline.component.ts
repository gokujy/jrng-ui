import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, contentChild, input } from '@angular/core';

export type JTimelineAlign = 'vertical' | 'horizontal';
export type JTimelineSeverity = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface JTimelineItem {
  readonly title?: string;
  readonly content?: string;
  readonly opposite?: string;
  readonly icon?: string;
  readonly severity?: JTimelineSeverity;
  readonly data?: unknown;
}

export interface JTimelineItemContext {
  readonly $implicit: JTimelineItem;
  readonly item: JTimelineItem;
  readonly index: number;
}

@Component({
  selector: 'j-timeline',
  imports: [NgTemplateOutlet],
  template: `
    <ol
      class="j-timeline"
      [class]="styleClass()"
      [class.j-timeline--horizontal]="layout() === 'horizontal'"
      data-jc-name="timeline"
      data-jc-section="root"
    >
      @for (item of value(); track item.title || item.content || $index; let index = $index) {
        <li class="j-timeline__item" data-jc-section="item" [attr.data-j-active]="item.severity ? 'true' : null">
          <div class="j-timeline__opposite" data-jc-section="opposite">
            @if (oppositeTemplate(); as template) {
              <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="itemContext(item, index)" />
            } @else {
              {{ item.opposite }}
            }
          </div>
          <div class="j-timeline__axis" aria-hidden="true">
            <span class="j-timeline__marker" [class]="'j-timeline__marker j-timeline__marker--' + (item.severity || 'neutral')">
              @if (item.icon) {
                {{ item.icon }}
              }
            </span>
          </div>
          <article class="j-timeline__content" data-jc-section="content">
            @if (contentTemplate(); as template) {
              <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="itemContext(item, index)" />
            } @else {
              @if (item.title) {
                <strong>{{ item.title }}</strong>
              }
              @if (item.content) {
                <p>{{ item.content }}</p>
              }
            }
          </article>
        </li>
      }
    </ol>
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
        background: var(--j-color-success);
        color: var(--j-color-success-foreground, white);
      }

      .j-timeline__marker--warning {
        background: var(--j-color-warning);
        color: var(--j-color-warning-foreground, white);
      }

      .j-timeline__marker--danger {
        background: var(--j-color-danger);
        color: var(--j-color-danger-foreground, white);
      }

      .j-timeline__marker--info {
        background: var(--j-color-info);
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTimelineComponent {
  readonly value = input<readonly JTimelineItem[]>([]);
  readonly layout = input<JTimelineAlign>('vertical');
  readonly styleClass = input('');

  readonly contentTemplate = contentChild<unknown, TemplateRef<JTimelineItemContext>>('jTimelineContent', { read: TemplateRef });
  readonly oppositeTemplate = contentChild<unknown, TemplateRef<JTimelineItemContext>>('jTimelineOpposite', { read: TemplateRef });

  itemContext(item: JTimelineItem, index: number): JTimelineItemContext {
    return { $implicit: item, item, index };
  }
}

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, contentChild, input, signal } from '@angular/core';

export interface JOrgChartNode {
  readonly key?: string;
  readonly label: string;
  readonly type?: string;
  readonly expanded?: boolean;
  readonly data?: unknown;
  readonly children?: readonly JOrgChartNode[];
}

export interface JOrgChartNodeContext {
  readonly $implicit: JOrgChartNode;
  readonly node: JOrgChartNode;
  readonly expanded: boolean;
}

@Component({
  selector: 'j-org-chart',
  imports: [NgTemplateOutlet],
  template: `
    <section
      class="j-org-chart"
      [class]="styleClass()"
      [class.j-org-chart--horizontal]="orientation() === 'horizontal'"
      data-jc-name="org-chart"
      data-jc-section="root"
    >
      @if (value(); as root) {
        <ng-container [ngTemplateOutlet]="nodeTemplateRef" [ngTemplateOutletContext]="{ node: root }" />
      }
    </section>

    <ng-template #nodeTemplateRef let-node="node">
      @let expanded = isExpanded(node);
      <div class="j-org-chart__branch" [attr.data-j-open]="expanded ? 'true' : null">
        <article class="j-org-chart__node" data-jc-section="node">
          @if (nodeTemplate(); as template) {
            <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="nodeContext(node)" />
          } @else {
            <strong>{{ node.label }}</strong>
            @if (node.type) {
              <small>{{ node.type }}</small>
            }
          }
          @if (collapsible() && node.children?.length) {
            <button class="j-org-chart__toggle" type="button" [attr.aria-expanded]="expanded" (click)="toggle(node)">
              {{ expanded ? '-' : '+' }}
            </button>
          }
        </article>
        @if (node.children?.length && expanded) {
          <div class="j-org-chart__children" data-jc-section="children">
            @for (child of node.children; track child.key || child.label || $index) {
              <ng-container [ngTemplateOutlet]="nodeTemplateRef" [ngTemplateOutletContext]="{ node: child }" />
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      .j-org-chart {
        overflow: auto;
        padding: var(--j-spacing-4);
      }

      .j-org-chart__branch {
        align-items: center;
        display: flex;
        flex-direction: column;
        gap: var(--j-spacing-4);
      }

      .j-org-chart__node {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-sm);
        display: grid;
        gap: var(--j-spacing-1);
        min-width: 10rem;
        padding: var(--j-spacing-3);
        position: relative;
        text-align: center;
      }

      .j-org-chart__node small {
        color: var(--j-color-muted-foreground);
      }

      .j-org-chart__toggle {
        background: var(--j-color-muted);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-full);
        cursor: pointer;
        height: 1.75rem;
        position: absolute;
        right: -0.75rem;
        top: -0.75rem;
        width: 1.75rem;
      }

      .j-org-chart__toggle:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-org-chart__children {
        align-items: flex-start;
        display: flex;
        gap: var(--j-spacing-4);
        position: relative;
      }

      .j-org-chart--horizontal .j-org-chart__branch {
        align-items: flex-start;
        flex-direction: row;
      }

      .j-org-chart--horizontal .j-org-chart__children {
        flex-direction: column;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JOrgChartComponent {
  readonly value = input<JOrgChartNode | null>(null);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly collapsible = input(true, { transform: booleanAttribute });
  readonly styleClass = input('');

  readonly nodeTemplate = contentChild<unknown, TemplateRef<JOrgChartNodeContext>>('jOrgChartNode', { read: TemplateRef });

  private readonly collapsedKeys = signal<ReadonlySet<string>>(new Set());
  private readonly expandedKeys = signal<ReadonlySet<string>>(new Set());

  isExpanded(node: JOrgChartNode): boolean {
    const key = this.nodeKey(node);
    if (this.expandedKeys().has(key)) {
      return true;
    }
    if (this.collapsedKeys().has(key)) {
      return false;
    }
    return node.expanded !== false;
  }

  toggle(node: JOrgChartNode): void {
    const key = this.nodeKey(node);
    const expanded = new Set(this.expandedKeys());
    const collapsed = new Set(this.collapsedKeys());
    if (this.isExpanded(node)) {
      expanded.delete(key);
      collapsed.add(key);
    } else {
      collapsed.delete(key);
      expanded.add(key);
    }
    this.expandedKeys.set(expanded);
    this.collapsedKeys.set(collapsed);
  }

  nodeContext(node: JOrgChartNode): JOrgChartNodeContext {
    return { $implicit: node, node, expanded: this.isExpanded(node) };
  }

  private nodeKey(node: JOrgChartNode): string {
    return node.key ?? node.label;
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  booleanAttribute,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JComponentSize } from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JAvatarComponent } from 'jrng-ui/avatar';

export interface JAvatarGroupItem {
  readonly label?: string;
  readonly image?: string;
  readonly ariaLabel?: string;
  readonly fullImage?: string;
  readonly bio?: string;
  readonly employeeId?: string;
}

export type JAvatarGroupMode = 'stacked' | 'spaced';

@Component({
  selector: 'j-avatar-group',
  imports: [JButtonComponent, JPopoverComponent, JTooltipDirective, JAvatarComponent],
  template: `
    <span
      [class]="groupClasses()"
      data-jc-name="avatar-group"
      data-jc-section="root"
      data-jc-extend="item overflow"
      [attr.aria-label]="ariaLabel() || null"
      [style.--j-avatar-group-overlap]="overlap()"
    >
      @for (item of visibleItems(); track item.image || item.ariaLabel || item.label || $index) {
        <span
          class="j-avatar-group__item"
          data-jc-section="item"
          [class]="itemClasses()"
          [attr.aria-label]="item.ariaLabel || item.label || null"
        >
          @if (item.image) {
            <img [src]="item.image" [alt]="item.ariaLabel || item.label || ''" />
          }
          @if (!item.image) {
            <span>{{ initials(item.label || item.ariaLabel || '') }}</span>
          }
        </span>
      }
      @if (overflowCount() > 0) {
        <span #overflowTarget class="j-avatar-group__overflow">
          <j-button
            variant="soft"
            shape="pill"
            size="sm"
            [label]="'+' + overflowCount()"
            [ariaLabel]="overflowLabel()"
            ariaHasPopup="dialog"
            [ariaExpanded]="overflowOpen()"
            [jTooltip]="overflowLabel()"
            (onClick)="overflowOpen.set(!overflowOpen())"
          >
            <ng-content select="[jAvatarGroupOverflow]"></ng-content>
          </j-button>
        </span>
        <j-popover
          [target]="overflowTargetRef()?.nativeElement || null"
          [visible]="overflowOpen()"
          (visibleChange)="overflowOpen.set($event)"
          position="bottom"
          styleClass="j-avatar-group__popover"
        >
          <div class="j-avatar-group__overflow-list" role="list" [attr.aria-label]="overflowLabel()">
            @for (
              item of overflowItems();
              track item.image || item.ariaLabel || item.label || $index
            ) {
              <span class="j-avatar-group__overflow-user" role="listitem">
                <j-avatar
                  [image]="item.fullImage || item.image || ''"
                  [label]="item.label || item.ariaLabel || ''"
                  [ariaLabel]="item.ariaLabel || item.label || 'Avatar'"
                  [previewable]="preview"
                  size="sm"
                />
                <span><strong>{{ item.label || item.ariaLabel || 'Avatar' }}</strong>
                  @if (item.employeeId) { <small>{{ item.employeeId }}</small> }
                  @if (item.bio) { <small>{{ item.bio }}</small> }
                </span>
              </span>
            }
          </div>
        </j-popover>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      .j-avatar-group {
        align-items: center;
        display: inline-flex;
        padding-inline-start: var(--j-spacing-sm, 0.5rem);
      }

      .j-avatar-group__item {
        align-items: center;
        background: var(--j-color-surface-subtle, #eef2f7);
        border: 2px solid var(--j-color-surface, #ffffff);
        border-radius: var(--j-radius-full, 999px);
        color: var(--j-color-text, #111827);
        display: inline-flex;
        font-weight: var(--j-font-weight-bold, 700);
        justify-content: center;
        margin-inline-start: calc(var(--j-avatar-group-overlap, 0.5rem) * -1);
        overflow: hidden;
      }

      .j-avatar-group--spaced {
        gap: var(--j-avatar-group-overlap, 0.5rem);
        padding-inline-start: 0;
      }
      .j-avatar-group--spaced .j-avatar-group__item {
        margin-inline-start: 0;
      }
      .j-avatar-group__overflow {
        position: relative;
      }
      .j-avatar-group__overflow-list {
        display: grid;
        gap: var(--j-spacing-2);
        min-width: 10rem;
        padding: var(--j-spacing-3);
      }
      .j-avatar-group__overflow-user { align-items: center; display: flex; gap: var(--j-spacing-2); }
      .j-avatar-group__overflow-user > span { display: grid; }
      .j-avatar-group__overflow-user small { color: var(--j-color-muted-foreground); }

      .j-avatar-group__item--sm {
        font-size: var(--j-font-size-xs, 0.75rem);
        height: 1.75rem;
        width: 1.75rem;
      }

      .j-avatar-group__item--md {
        font-size: var(--j-font-size-sm, 0.875rem);
        height: 2.25rem;
        width: 2.25rem;
      }

      .j-avatar-group__item--lg {
        font-size: var(--j-font-size-md, 1rem);
        height: 3rem;
        width: 3rem;
      }

      .j-avatar-group__item img {
        height: 100%;
        object-fit: cover;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAvatarGroupComponent {
  readonly items = input<readonly JAvatarGroupItem[]>([]);
  readonly size = input<JComponentSize>('md');
  readonly max = input(5, { transform: numberAttribute });
  readonly maxVisible = input<number | null>(null);
  readonly mode = input<JAvatarGroupMode>('stacked');
  readonly overlap = input('0.5rem');
  readonly overflowTooltip = input('');
  readonly ariaLabel = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly preview = input(false, { transform: booleanAttribute });
  readonly overflowOpen = signal(false);
  readonly overflowTargetRef = viewChild<ElementRef<HTMLElement>>('overflowTarget');

  readonly resolvedMax = computed(() => this.maxVisible() ?? this.max());
  readonly visibleItems = computed(() => this.items().slice(0, Math.max(0, this.resolvedMax())));
  readonly overflowItems = computed(() => this.items().slice(this.visibleItems().length));

  readonly overflowCount = computed(() =>
    Math.max(0, this.items().length - this.visibleItems().length),
  );

  readonly groupClasses = computed(() =>
    jMergePartClasses(
      ['j-avatar-group', `j-avatar-group--${this.mode()}`],
      this.styleClass(),
      this.pt(),
    ),
  );

  readonly overflowLabel = computed(() => this.overflowTooltip() || `${this.overflowCount()} more`);

  readonly itemClasses = computed(() => `j-avatar-group__item--${this.size()}`);

  initials(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}

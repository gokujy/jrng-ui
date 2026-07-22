import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JIconComponent } from 'jrng-ui/icon';

export type JDividerLayout = 'horizontal' | 'vertical';
export type JDividerStyle = 'solid' | 'dashed' | 'dotted' | 'double';
export type JDividerStrength = 'subtle' | 'default' | 'strong';
export type JDividerPosition = 'start' | 'center' | 'end';
export type JDividerSpacing = 'compact' | 'normal' | 'spacious';

@Component({
  selector: 'j-divider',
  imports: [JIconComponent],
  template: `
    <div
      [class]="dividerClasses()"
      data-jc-name="divider"
      data-jc-section="root"
      role="separator"
      [attr.aria-orientation]="layout()"
    >
      <span class="j-divider__line" aria-hidden="true"></span>
      @if (text() || icon()) {
        <span class="j-divider__content">
          @if (icon()) {
            <j-icon [name]="icon()" aria-hidden="true" />
          }
          @if (text()) {
            <span>{{ text() }}</span>
          }
          <ng-content />
        </span>
        <span class="j-divider__line" aria-hidden="true"></span>
      }
    </div>
  `,
  styles: [
    `
      .j-divider {
        --j-divider-color: var(--j-color-border);
        align-items: center;
        display: flex;
        gap: var(--j-spacing-3);
      }
      .j-divider__line {
        border-color: var(--j-divider-color);
        border-style: solid;
        flex: 1;
      }
      .j-divider--horizontal {
        margin-block: var(--j-spacing-4);
        width: 100%;
      }
      .j-divider--horizontal .j-divider__line {
        border-width: 1px 0 0;
      }
      .j-divider--vertical {
        align-self: stretch;
        flex-direction: column;
        margin-inline: var(--j-spacing-4);
        min-height: 1rem;
      }
      .j-divider--vertical .j-divider__line {
        border-width: 0 0 0 1px;
      }
      .j-divider--dashed .j-divider__line {
        border-style: dashed;
      }
      .j-divider--dotted .j-divider__line {
        border-style: dotted;
      }
      .j-divider--double .j-divider__line {
        border-style: double;
        border-width: 3px 0 0;
      }
      .j-divider--vertical.j-divider--double .j-divider__line {
        border-width: 0 0 0 3px;
      }
      .j-divider--subtle {
        --j-divider-color: color-mix(in srgb, var(--j-color-border) 55%, transparent);
      }
      .j-divider--strong {
        --j-divider-color: var(--j-color-muted-foreground);
      }
      .j-divider--inset {
        margin-inline: var(--j-spacing-6);
        width: auto;
      }
      .j-divider--compact {
        margin-block: var(--j-spacing-2);
      }
      .j-divider--spacious {
        margin-block: var(--j-spacing-8);
      }
      .j-divider--start .j-divider__line:first-child {
        flex: 0 0 var(--j-spacing-6);
      }
      .j-divider--end .j-divider__line:last-child {
        flex: 0 0 var(--j-spacing-6);
      }
      .j-divider__content {
        align-items: center;
        color: var(--j-color-muted-foreground);
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        gap: var(--j-spacing-2);
        white-space: nowrap;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDividerComponent {
  readonly layout = input<JDividerLayout>('horizontal');
  readonly lineStyle = input<JDividerStyle>('solid');
  readonly strength = input<JDividerStrength>('default');
  readonly position = input<JDividerPosition>('center');
  readonly spacing = input<JDividerSpacing>('normal');
  readonly text = input('');
  readonly icon = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly inset = input(false, { transform: booleanAttribute });

  readonly dividerClasses = computed(() =>
    jMergePartClasses(
      [
        'j-divider',
        `j-divider--${this.layout()}`,
        `j-divider--${this.lineStyle()}`,
        `j-divider--${this.strength()}`,
        `j-divider--${this.position()}`,
        `j-divider--${this.spacing()}`,
        this.inset() ? 'j-divider--inset' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}

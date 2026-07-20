import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JComponentSize } from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';

@Component({
  selector: 'j-input-group',
  imports: [],
  template: `
    <div
      [class]="groupClasses()"
      data-jc-name="input-group"
      data-jc-section="root"
      data-jc-extend="prefix suffix addon button"
      role="group"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-disabled]="disabled()"
      [attr.aria-readonly]="readonly()"
      [attr.inert]="disabled() ? '' : null"
      [attr.data-j-disabled]="disabled() ? 'true' : null"
      [attr.data-j-invalid]="invalid() ? 'true' : null"
    >
      @if (prefixAddon()) {
        <span class="j-input-group__addon" data-jc-section="prefix-addon">{{ prefixAddon() }}</span>
      }
      @if (prefixIcon()) {
        <span class="j-input-group__icon" data-jc-section="prefix-icon" aria-hidden="true">{{
          prefixIcon()
        }}</span>
      }
      <ng-content select="[jInputGroupPrefix]"></ng-content>
      <div class="j-input-group__control" data-jc-section="control">
        <ng-content></ng-content>
      </div>
      <ng-content select="[jInputGroupSuffix]"></ng-content>
      @if (suffixIcon()) {
        <span class="j-input-group__icon" data-jc-section="suffix-icon" aria-hidden="true">{{
          suffixIcon()
        }}</span>
      }
      @if (suffixAddon()) {
        <span class="j-input-group__addon" data-jc-section="suffix-addon">{{ suffixAddon() }}</span>
      }
      <ng-content select="[jInputGroupButton]"></ng-content>
    </div>
  `,
  styles: [
    `
      .j-input-group {
        align-items: stretch;
        display: inline-flex;
        min-width: 0;
      }

      .j-input-group--fluid {
        width: 100%;
      }

      .j-input-group--compact {
        gap: 0;
      }

      .j-input-group--compact:focus-within {
        border-radius: var(--j-input-radius, var(--j-radius-md));
        box-shadow: var(--j-focus-ring);
      }

      .j-input-group--comfortable {
        gap: var(--j-spacing-xs);
      }

      .j-input-group__control {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
      }

      .j-input-group__addon,
      .j-input-group__icon {
        align-items: center;
        background: var(--j-color-muted);
        border: 1px solid var(--j-color-border);
        color: var(--j-color-muted-foreground);
        display: inline-flex;
        flex: 0 0 auto;
        font-size: var(--j-font-size-sm);
        justify-content: center;
        padding-inline: var(--j-spacing-md);
      }

      .j-input-group--filled .j-input-group__addon,
      .j-input-group--filled .j-input-group__icon {
        background: var(--j-color-surface-muted);
      }

      .j-input-group--sm .j-input-group__addon,
      .j-input-group--sm .j-input-group__icon {
        min-height: var(--j-button-height-sm);
      }

      .j-input-group--md .j-input-group__addon,
      .j-input-group--md .j-input-group__icon {
        min-height: var(--j-button-height-md);
      }

      .j-input-group--lg .j-input-group__addon,
      .j-input-group--lg .j-input-group__icon {
        min-height: var(--j-button-height-lg);
      }

      .j-input-group--compact .j-input-group__addon:first-child,
      .j-input-group--compact .j-input-group__icon:first-child {
        border-radius: var(--j-input-radius) 0 0 var(--j-input-radius);
      }

      .j-input-group--compact .j-input-group__addon:last-child,
      .j-input-group--compact .j-input-group__icon:last-child {
        border-radius: 0 var(--j-input-radius) var(--j-input-radius) 0;
      }

      .j-input-group--compact > :not(:first-child),
      .j-input-group--compact > .j-input-group__control:not(:first-child) {
        margin-inline-start: -1px;
      }

      :host ::ng-deep .j-input-group--compact .j-input-group__control > * {
        flex: 1 1 auto;
        min-width: 0;
      }

      :host ::ng-deep .j-input-group--compact .j-input-group__control .j-input,
      :host ::ng-deep .j-input-group--compact .j-input-group__control .j-select,
      :host ::ng-deep .j-input-group--compact .j-input-group__control .j-button {
        border-radius: 0;
        box-shadow: none;
        height: 100%;
      }

      :host ::ng-deep .j-input-group--compact > :first-child,
      :host ::ng-deep .j-input-group--compact > :first-child .j-input,
      :host ::ng-deep .j-input-group--compact > :first-child .j-select,
      :host ::ng-deep .j-input-group--compact > :first-child .j-button {
        border-end-start-radius: var(--j-input-radius, var(--j-radius-md));
        border-start-start-radius: var(--j-input-radius, var(--j-radius-md));
      }

      :host ::ng-deep .j-input-group--compact > :last-child,
      :host ::ng-deep .j-input-group--compact > :last-child .j-input,
      :host ::ng-deep .j-input-group--compact > :last-child .j-select,
      :host ::ng-deep .j-input-group--compact > :last-child .j-button {
        border-end-end-radius: var(--j-input-radius, var(--j-radius-md));
        border-start-end-radius: var(--j-input-radius, var(--j-radius-md));
      }

      .j-input-group.is-invalid:focus-within {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--j-color-danger) 22%, transparent);
      }

      .j-input-group.is-invalid .j-input-group__addon,
      .j-input-group.is-invalid .j-input-group__icon {
        border-color: var(--j-color-danger);
      }

      .j-input-group.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-input-group.is-readonly {
        background: var(--j-color-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JInputGroupComponent {
  readonly prefixAddon = input('');
  readonly suffixAddon = input('');
  readonly prefixIcon = input('');
  readonly suffixIcon = input('');
  readonly ariaLabel = input('');
  readonly size = input<JComponentSize>('md');
  readonly variant = input<JInputVariant>('outlined');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly compact = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });

  readonly groupClasses = computed(() =>
    jMergePartClasses(
      [
        'j-input-group',
        `j-input-group--${this.size()}`,
        `j-input-group--${this.variant()}`,
        this.compact() ? 'j-input-group--compact' : 'j-input-group--comfortable',
        this.fullWidth() ? 'j-input-group--fluid' : '',
        this.disabled() ? 'is-disabled' : '',
        this.invalid() ? 'is-invalid' : '',
        this.readonly() ? 'is-readonly' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}

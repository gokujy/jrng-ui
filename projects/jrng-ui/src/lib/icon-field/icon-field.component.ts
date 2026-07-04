import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';

@Component({
  selector: 'j-icon-field',
  imports: [],
  template: `
    <div
      [class]="fieldClasses()"
      data-jc-name="icon-field"
      data-jc-section="root"
      data-jc-extend="prefix suffix"
    >
      @if (prefixIcon()) {
        <span class="j-icon-field__icon" data-jc-section="prefix" aria-hidden="true">{{ prefixIcon() }}</span>
      }
      <span class="j-icon-field__icon" data-jc-section="prefix" aria-hidden="true"
        ><ng-content select="[jIconFieldPrefix]"></ng-content
      ></span>
      <div class="j-icon-field__content" data-jc-section="content"><ng-content></ng-content></div>
      <span class="j-icon-field__icon" data-jc-section="suffix" aria-hidden="true"
        ><ng-content select="[jIconFieldSuffix]"></ng-content
      ></span>
      @if (suffixIcon()) {
        <span class="j-icon-field__icon" data-jc-section="suffix" aria-hidden="true">{{ suffixIcon() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .j-icon-field {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-sm);
      }

      .j-icon-field--fluid {
        width: 100%;
      }

      .j-icon-field__content {
        flex: 1;
        min-width: 0;
      }

      .j-icon-field__icon {
        color: var(--j-color-text-muted);
        display: inline-flex;
      }

      .j-icon-field__icon:empty {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JIconFieldComponent {
  readonly prefixIcon = input('');
  readonly suffixIcon = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });

  readonly fieldClasses = computed(() =>
    jMergePartClasses(
      ['j-icon-field', this.fluid() || this.fullWidth() ? 'j-icon-field--fluid' : ''],
      this.styleClass(),
      this.pt(),
    ),
  );
}

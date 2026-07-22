import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JIconComponent, JIconName } from 'jrng-ui/icon';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JSeverity } from 'jrng-ui/core';

export type JFieldsetVariant = 'bordered' | 'borderless' | 'filled' | 'elevated';
export type JFieldsetLegendPosition = 'start' | 'center' | 'end';

@Component({
  selector: 'j-fieldset',
  imports: [JButtonComponent, JIconComponent, JBadgeComponent],
  template: `
    <fieldset
      [class]="'j-fieldset j-fieldset--' + variant() + ' j-fieldset--' + density()"
      [class.is-collapsed]="collapsedState()"
      [attr.aria-readonly]="readOnly()"
      [disabled]="disabled()"
    >
      @if (legend()) {
        <legend [class]="'j-fieldset__legend j-fieldset__legend--' + legendPosition()">
          @if (toggleable()) {
            <j-button
              variant="text"
              size="sm"
              [icon]="collapsedState() ? 'chevron-right' : 'chevron-down'"
              [label]="legend()"
              [disabled]="disabled() || readOnly()"
              [ariaExpanded]="!collapsedState()"
              (onClick)="toggle()"
            />
          } @else {
            @if (icon()) {
              <j-icon [name]="icon()!" aria-hidden="true" />
            }
            <span>{{ legend() }}</span>
            @if (badge() !== null) {
              <j-badge [value]="badge()!" [severity]="badgeSeverity()" />
            }
          }
          <ng-content select="[jFieldsetLegend]"></ng-content>
        </legend>
      }
      <div class="j-fieldset__content" [hidden]="collapsedState()">
        <ng-content></ng-content>
      </div>
    </fieldset>
  `,
  styles: [
    `
      .j-fieldset {
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-md, 0.5rem);
        padding: var(--j-spacing-lg, 1rem);
      }
      .j-fieldset--borderless {
        border: 0;
      }
      .j-fieldset--filled {
        background: var(--j-color-surface-muted, #f8fafc);
      }
      .j-fieldset--elevated {
        border-color: transparent;
        box-shadow: var(--j-shadow-md);
      }
      .j-fieldset--compact {
        padding: var(--j-spacing-sm, 0.5rem);
      }
      .j-fieldset:disabled {
        opacity: var(--j-disabled-opacity, 0.55);
      }
      .j-fieldset__legend {
        align-items: center;
        color: var(--j-color-text, #111827);
        display: flex;
        font-weight: var(--j-font-weight-semibold, 650);
        gap: var(--j-spacing-xs, 0.25rem);
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }
      .j-fieldset__legend--center {
        margin-inline: auto;
      }
      .j-fieldset__legend--end {
        margin-inline-start: auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFieldsetComponent {
  readonly legend = input('');
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = input(false, { transform: booleanAttribute });
  readonly variant = input<JFieldsetVariant>('bordered');
  readonly density = input<'compact' | 'normal'>('normal');
  readonly legendPosition = input<JFieldsetLegendPosition>('start');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly icon = input<JIconName | null>(null);
  readonly badge = input<string | number | null>(null);
  readonly badgeSeverity = input<JSeverity>('primary');
  readonly collapsedChange = output<boolean>();
  protected readonly collapsedState = linkedSignal(() => this.collapsed());

  toggle(): void {
    if (!this.toggleable() || this.disabled() || this.readOnly()) return;
    this.collapsedState.set(!this.collapsedState());
    this.collapsedChange.emit(this.collapsedState());
  }
}

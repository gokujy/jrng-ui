import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  DestroyRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { JDensity, JSeverity } from 'jrng-ui/core';
import { JValidationMessageMap, J_VALIDATION_MESSAGES } from './validation-message.registry';

export type JValidationDisplayMode = 'touched' | 'dirty' | 'submit' | 'always';
export interface JValidationMessageItem {
  readonly key: string;
  readonly message: string;
  readonly error: unknown;
}
export interface JValidationMessageTemplateContext {
  readonly $implicit: JValidationMessageItem;
  readonly message: JValidationMessageItem;
}

@Component({
  selector: 'j-validation-message',
  template: `
    @if (visible()) {
      <div
        class="j-validation-message j-validation-message--{{ severity() }} j-validation-message--{{
          density()
        }}"
        [id]="id() || null"
        [attr.role]="severity() === 'danger' ? 'alert' : 'status'"
        [attr.aria-live]="severity() === 'danger' ? 'assertive' : 'polite'"
        aria-atomic="true"
      >
        @for (item of visibleMessages(); track item.key + item.message) {
          @if (messageTemplate) {
            <ng-container
              [ngTemplateOutlet]="messageTemplate"
              [ngTemplateOutletContext]="templateContext(item)"
            />
          } @else {
            <p class="j-validation-message__item">{{ item.message }}</p>
          }
        }
      </div>
    }
  `,
  imports: [NgTemplateOutlet],
  styles: [
    `
      .j-validation-message {
        color: var(--j-validation-color, var(--j-color-danger));
        font-size: var(--j-font-size-xs);
      }
      .j-validation-message--success {
        --j-validation-color: var(--j-color-success);
      }
      .j-validation-message--warning {
        --j-validation-color: var(--j-color-warning);
      }
      .j-validation-message__item {
        margin: var(--j-density-gap, var(--j-spacing-1)) 0 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JValidationMessageComponent {
  private readonly registry = inject(J_VALIDATION_MESSAGES);
  private readonly destroyRef = inject(DestroyRef);
  private readonly controlVersion = signal(0);
  private unsubscribe: (() => void) | undefined;

  readonly id = input('');
  readonly control = input<AbstractControl | null>(null);
  readonly errors = input<ValidationErrors | null>(null);
  readonly message = input<string | readonly string[] | null>(null);
  readonly messages = input<JValidationMessageMap>({});
  readonly displayMode = input<JValidationDisplayMode>('touched');
  readonly submitted = input(false);
  readonly multiple = input(true);
  readonly severity = input<Extract<JSeverity, 'success' | 'warning' | 'danger'>>('danger');
  readonly density = input<JDensity>('comfortable');
  @ContentChild(TemplateRef) messageTemplate?: TemplateRef<JValidationMessageTemplateContext>;

  readonly sourceErrors = computed(() => {
    this.controlVersion();
    return this.errors() ?? this.control()?.errors ?? null;
  });
  readonly visibleMessages = computed(() => {
    const direct = this.message();
    const result =
      direct == null
        ? this.mapErrors(this.sourceErrors())
        : (Array.isArray(direct) ? direct : [direct]).map((item, index) => ({
            key: `message-${index}`,
            message: item,
            error: item,
          }));
    return this.multiple() ? result : result.slice(0, 1);
  });
  readonly visible = computed(() => {
    this.controlVersion();
    if (!this.visibleMessages().length) return false;
    const control = this.control();
    if (!control || this.severity() !== 'danger') return true;
    switch (this.displayMode()) {
      case 'always':
        return true;
      case 'dirty':
        return control.dirty;
      case 'submit':
        return this.submitted();
      default:
        return control.touched;
    }
  });

  constructor() {
    effect(() => {
      const control = this.control();
      this.unsubscribe?.();
      if (!control) {
        this.unsubscribe = undefined;
        return;
      }
      const subscription = control.events.subscribe(() =>
        this.controlVersion.update((value) => value + 1),
      );
      this.unsubscribe = () => subscription.unsubscribe();
    });
    this.destroyRef.onDestroy(() => this.unsubscribe?.());
  }

  templateContext(item: JValidationMessageItem): JValidationMessageTemplateContext {
    return { $implicit: item, message: item };
  }

  private mapErrors(errors: ValidationErrors | null): JValidationMessageItem[] {
    if (!errors) return [];
    const mapping = { ...this.registry, ...this.messages() };
    return Object.entries(errors).map(([key, error]) => {
      const configured = mapping[key] ?? mapping['custom'];
      const message =
        typeof configured === 'function'
          ? configured(error, errors)
          : (configured ?? String(error));
      return { key, error, message };
    });
  }
}

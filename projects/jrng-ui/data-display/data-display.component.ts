import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { JComponentSize, JDensity, JOrientation, JSeverity } from 'jrng-ui/core';
import { JCopyButtonComponent } from 'jrng-ui/copy-button';
import { convertBytes, generateInitials, normalizeDate } from 'jrng-ui/utilities';

export type JDataDisplayType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'time'
  | 'datetime'
  | 'relative-time'
  | 'boolean'
  | 'status'
  | 'badge'
  | 'tag'
  | 'chip'
  | 'avatar'
  | 'link'
  | 'email'
  | 'phone'
  | 'list'
  | 'json'
  | 'file-size'
  | 'custom';
export type JDataDisplayResponsiveMode = 'none' | 'stack' | 'wrap';
export interface JDataDisplayTemplateContext {
  readonly $implicit: unknown;
  readonly value: unknown;
  readonly formattedValue: string;
  readonly type: JDataDisplayType;
}

@Component({
  selector: 'j-data-display',
  imports: [NgTemplateOutlet, JCopyButtonComponent],
  template: `
    <div
      [class]="classes()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-busy]="loading() ? 'true' : null"
      data-jc-name="data-display"
    >
      @if (label()) {
        <div class="j-data-display__label">{{ label() }}</div>
      }
      <div class="j-data-display__content">
        <span class="j-data-display__prefix"
          ><ng-content select="[jDataDisplayPrefix], [prefix]"
        /></span>
        @if (loading()) {
          <span class="j-data-display__loading" role="status"
            ><span aria-hidden="true"></span>{{ loadingLabel() }}</span
          >
        } @else if (error()) {
          <span class="j-data-display__error" role="alert">{{ error() }}</span>
        } @else if (type() === 'custom' && valueTemplate) {
          <ng-container
            [ngTemplateOutlet]="valueTemplate"
            [ngTemplateOutletContext]="templateContext()"
          />
        } @else if (isLink()) {
          <a
            class="j-data-display__link"
            [href]="href()"
            [target]="openInNewTab() ? '_blank' : null"
            [attr.rel]="openInNewTab() ? 'noopener noreferrer' : null"
            [attr.title]="tooltipText()"
            >{{ formattedValue() }}</a
          >
        } @else if (type() === 'avatar') {
          <span class="j-data-display__avatar" [attr.aria-label]="formattedValue()">{{
            initials()
          }}</span>
        } @else if (isSemanticPill()) {
          <span class="j-data-display__pill j-data-display__pill--{{ resolvedSeverity() }}">{{
            formattedValue()
          }}</span>
        } @else {
          <span class="j-data-display__value" [attr.title]="tooltipText()">{{
            formattedValue()
          }}</span>
        }
        <span class="j-data-display__suffix"
          ><ng-content select="[jDataDisplaySuffix], [suffix]"
        /></span>
        @if (copy() && !loading() && !error() && !isEmpty()) {
          <j-copy-button [text]="copyText()" [iconOnly]="true" [ariaLabel]="copyLabel()" />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .j-data-display {
        display: grid;
        gap: var(--j-density-gap, var(--j-spacing-1));
        min-width: 0;
      }
      .j-data-display--horizontal {
        align-items: baseline;
        grid-template-columns: minmax(8rem, var(--j-data-display-label-width, 12rem)) minmax(
            0,
            1fr
          );
      }
      .j-data-display--compact-row {
        align-items: baseline;
        grid-template-columns: minmax(6rem, 1fr) minmax(0, 2fr);
      }
      .j-data-display__label {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
      }
      .j-data-display__content {
        align-items: center;
        display: flex;
        gap: var(--j-density-gap, var(--j-spacing-2));
        min-width: 0;
      }
      .j-data-display__value,
      .j-data-display__link {
        min-width: 0;
      }
      .j-data-display--truncate .j-data-display__value,
      .j-data-display--truncate .j-data-display__link {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .j-data-display__error {
        color: var(--j-color-danger);
      }
      .j-data-display__loading {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-2);
        opacity: var(--j-loading-opacity);
      }
      .j-data-display__loading > span {
        animation: j-data-display-spin var(--j-duration-slow) linear infinite;
        border: 2px solid var(--j-color-border);
        border-radius: 50%;
        border-top-color: var(--j-color-primary);
        height: 1rem;
        width: 1rem;
      }
      .j-data-display__pill,
      .j-data-display__avatar {
        align-items: center;
        background: var(--j-pill-bg, var(--j-color-neutral-soft));
        border-radius: var(--j-radius-full);
        color: var(--j-pill-color, var(--j-color-neutral));
        display: inline-flex;
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        min-height: 1.5rem;
        padding: 0 var(--j-spacing-2);
      }
      .j-data-display__avatar {
        justify-content: center;
        min-width: 2rem;
        padding: 0;
      }
      .j-data-display__pill--primary {
        --j-pill-bg: var(--j-color-primary-soft);
        --j-pill-color: var(--j-color-primary);
      }
      .j-data-display__pill--secondary {
        --j-pill-bg: var(--j-color-secondary-soft);
        --j-pill-color: var(--j-color-secondary);
      }
      .j-data-display__pill--success {
        --j-pill-bg: var(--j-color-success-soft);
        --j-pill-color: var(--j-color-success);
      }
      .j-data-display__pill--info {
        --j-pill-bg: var(--j-color-info-soft);
        --j-pill-color: var(--j-color-info);
      }
      .j-data-display__pill--warning {
        --j-pill-bg: var(--j-color-warning-soft);
        --j-pill-color: var(--j-color-warning);
      }
      .j-data-display__pill--danger {
        --j-pill-bg: var(--j-color-danger-soft);
        --j-pill-color: var(--j-color-danger);
      }
      .j-data-display__pill--contrast {
        --j-pill-bg: var(--j-color-contrast);
        --j-pill-color: var(--j-color-contrast-foreground);
      }
      .j-data-display__prefix:empty,
      .j-data-display__suffix:empty {
        display: none;
      }
      @media (max-width: 40rem) {
        .j-data-display--responsive-stack.j-data-display--horizontal {
          grid-template-columns: 1fr;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .j-data-display__loading > span {
          animation: none;
        }
      }
      @keyframes j-data-display-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDataDisplayComponent {
  readonly label = input('');
  readonly value = input<unknown>(null);
  readonly type = input<JDataDisplayType>('text');
  readonly emptyText = input('—');
  readonly error = input('');
  readonly loadingLabel = input('Loading');
  readonly ariaLabel = input('');
  readonly locale = input<string | undefined>(undefined);
  readonly currency = input('USD');
  readonly currencyDisplay = input<Intl.NumberFormatOptions['currencyDisplay']>('symbol');
  readonly dateOptions = input<Intl.DateTimeFormatOptions>({});
  readonly numberOptions = input<Intl.NumberFormatOptions>({});
  readonly trueLabel = input('Yes');
  readonly falseLabel = input('No');
  readonly listSeparator = input(', ');
  readonly statusMap = input<Record<string, JSeverity>>({});
  readonly severity = input<JSeverity>('neutral');
  readonly orientation = input<JOrientation>('vertical');
  readonly responsiveMode = input<JDataDisplayResponsiveMode>('stack');
  readonly density = input<JDensity>('comfortable');
  readonly size = input<JComponentSize>('md');
  readonly maxLength = input(80);
  readonly hrefInput = input('', { alias: 'href' });
  readonly target = input<'self' | 'blank'>('self');
  readonly copyLabel = input('Copy value');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly copy = input(false, { transform: booleanAttribute });
  readonly truncate = input(false, { transform: booleanAttribute });
  readonly tooltip = input(true, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  @ContentChild(TemplateRef) valueTemplate?: TemplateRef<JDataDisplayTemplateContext>;

  readonly isEmpty = computed(() => {
    const value = this.value();
    return value == null || value === '' || (Array.isArray(value) && value.length === 0);
  });
  readonly formattedValue = computed(() =>
    this.isEmpty() ? this.emptyText() : this.format(this.value()),
  );
  readonly isLink = computed(() => ['link', 'email', 'phone'].includes(this.type()));
  readonly isSemanticPill = computed(() =>
    ['status', 'badge', 'tag', 'chip'].includes(this.type()),
  );
  readonly resolvedSeverity = computed(
    () => this.statusMap()[String(this.value()).toLocaleLowerCase()] ?? this.severity(),
  );
  readonly initials = computed(() => generateInitials(this.formattedValue()));
  readonly openInNewTab = computed(() => this.target() === 'blank');
  readonly href = computed(
    () =>
      this.hrefInput() ||
      (this.type() === 'email'
        ? `mailto:${String(this.value() ?? '')}`
        : this.type() === 'phone'
          ? `tel:${String(this.value() ?? '').replace(/[^+\d]/g, '')}`
          : String(this.value() ?? '')),
  );
  readonly copyText = computed(() =>
    this.type() === 'json' ? this.formattedValue() : String(this.value() ?? ''),
  );
  readonly tooltipText = computed(() =>
    this.tooltip() && this.truncate() && this.formattedValue().length > this.maxLength()
      ? this.formattedValue()
      : null,
  );
  readonly classes = computed(() =>
    [
      'j-data-display',
      `j-data-display--${this.orientation()}`,
      `j-data-display--density-${this.density()}`,
      `j-data-display--size-${this.size()}`,
      this.compact() ? 'j-data-display--compact-row' : '',
      this.truncate() ? 'j-data-display--truncate' : '',
      this.responsiveMode() === 'stack' ? 'j-data-display--responsive-stack' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  templateContext(): JDataDisplayTemplateContext {
    return {
      $implicit: this.value(),
      value: this.value(),
      formattedValue: this.formattedValue(),
      type: this.type(),
    };
  }

  private format(value: unknown): string {
    const type = this.type();
    if (type === 'number' || type === 'currency' || type === 'percent') {
      const number = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(number)) return this.emptyText();
      return new Intl.NumberFormat(this.locale(), {
        ...(type === 'currency'
          ? {
              style: 'currency',
              currency: this.currency(),
              currencyDisplay: this.currencyDisplay(),
            }
          : type === 'percent'
            ? { style: 'percent' }
            : {}),
        ...this.numberOptions(),
      }).format(number);
    }
    if (type === 'date' || type === 'time' || type === 'datetime') {
      const date = normalizeDate(value as Date | string | number);
      if (!date) return this.emptyText();
      const defaults: Intl.DateTimeFormatOptions =
        type === 'date'
          ? { dateStyle: 'medium' }
          : type === 'time'
            ? { timeStyle: 'short' }
            : { dateStyle: 'medium', timeStyle: 'short' };
      return new Intl.DateTimeFormat(this.locale(), { ...defaults, ...this.dateOptions() }).format(
        date,
      );
    }
    if (type === 'relative-time') {
      const date = normalizeDate(value as Date | string | number);
      if (!date) return this.emptyText();
      const seconds = (date.getTime() - Date.now()) / 1000;
      const [unit, divisor] = relativeUnit(seconds);
      return new Intl.RelativeTimeFormat(this.locale(), { numeric: 'auto' }).format(
        Math.round(seconds / divisor),
        unit,
      );
    }
    if (type === 'boolean') return value ? this.trueLabel() : this.falseLabel();
    if (type === 'list') return (Array.isArray(value) ? value : [value]).join(this.listSeparator());
    if (type === 'json') {
      try {
        return JSON.stringify(value, null, 2) ?? this.emptyText();
      } catch {
        return this.emptyText();
      }
    }
    if (type === 'file-size') return convertBytes(Number(value));
    return String(value);
  }
}

function relativeUnit(seconds: number): readonly [Intl.RelativeTimeFormatUnit, number] {
  return (
    (
      [
        ['year', 31_536_000],
        ['month', 2_592_000],
        ['week', 604_800],
        ['day', 86_400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
      ] as const
    ).find(([, amount]) => Math.abs(seconds) >= amount) ?? ['second', 1]
  );
}

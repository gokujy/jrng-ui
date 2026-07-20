import { Pipe, PipeTransform } from '@angular/core';
import {
  convertBytes,
  formatDuration,
  generateInitials,
  getFileExtension,
  normalizeDate,
} from 'jrng-ui/utilities';

type DateInput = Date | string | number | null | undefined;
type NumberInput = number | string | null | undefined;

@Pipe({ name: 'jDateFormat', standalone: true })
export class JDateFormatPipe implements PipeTransform {
  transform(value: DateInput, locale?: string, options?: Intl.DateTimeFormatOptions): string {
    return formatDateValue(value, locale, { dateStyle: 'medium', ...options });
  }
}

@Pipe({ name: 'jTimeFormat', standalone: true })
export class JTimeFormatPipe implements PipeTransform {
  transform(value: DateInput, locale?: string, options?: Intl.DateTimeFormatOptions): string {
    return formatDateValue(value, locale, { timeStyle: 'short', ...options });
  }
}

@Pipe({ name: 'jDateTimeFormat', standalone: true })
export class JDateTimeFormatPipe implements PipeTransform {
  transform(value: DateInput, locale?: string, options?: Intl.DateTimeFormatOptions): string {
    return formatDateValue(value, locale, { dateStyle: 'medium', timeStyle: 'short', ...options });
  }
}

@Pipe({ name: 'jCurrencyFormat', standalone: true })
export class JCurrencyFormatPipe implements PipeTransform {
  transform(
    value: NumberInput,
    currency = 'USD',
    locale?: string,
    options?: Intl.NumberFormatOptions,
  ): string {
    const numberValue = toNumber(value);
    if (numberValue == null) {
      return '';
    }
    return new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(
      numberValue,
    );
  }
}

@Pipe({ name: 'jNumberFormat', standalone: true })
export class JNumberFormatPipe implements PipeTransform {
  transform(value: NumberInput, locale?: string, options?: Intl.NumberFormatOptions): string {
    const numberValue = toNumber(value);
    if (numberValue == null) {
      return '';
    }
    return new Intl.NumberFormat(locale, options).format(numberValue);
  }
}

@Pipe({ name: 'jPercentFormat', standalone: true })
export class JPercentFormatPipe implements PipeTransform {
  transform(value: NumberInput, locale?: string, options?: Intl.NumberFormatOptions): string {
    const numberValue = toNumber(value);
    if (numberValue == null) {
      return '';
    }
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
      ...options,
    }).format(numberValue);
  }
}

@Pipe({ name: 'jFileSizeFormat', standalone: true })
export class JFileSizeFormatPipe implements PipeTransform {
  transform(value: NumberInput, fractionDigits = 1): string {
    const bytes = toNumber(value);
    if (bytes == null) {
      return '';
    }
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = bytes / 1024;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size.toFixed(fractionDigits)} ${units[unitIndex]}`;
  }
}

@Pipe({ name: 'jTruncate', standalone: true })
export class JTextTruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength = 80, suffix = '...'): string {
    const text = value ?? '';
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, Math.max(0, maxLength - suffix.length)).trimEnd()}${suffix}`;
  }
}

@Pipe({ name: 'jRelativeTime', standalone: true })
export class JRelativeTimePipe implements PipeTransform {
  transform(value: DateInput, locale?: string, now: DateInput = Date.now()): string {
    const date = normalizeDate(value);
    const reference = normalizeDate(now);
    if (!date || !reference) return '';
    const seconds = (date.getTime() - reference.getTime()) / 1000;
    const units: readonly [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 31_536_000],
      ['month', 2_592_000],
      ['week', 604_800],
      ['day', 86_400],
      ['hour', 3600],
      ['minute', 60],
      ['second', 1],
    ];
    const [unit, divisor] = units.find(([, amount]) => Math.abs(seconds) >= amount) ?? [
      'second',
      1,
    ];
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
      Math.round(seconds / divisor),
      unit,
    );
  }
}

@Pipe({ name: 'jDuration', standalone: true })
export class JDurationPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '' : formatDuration(value);
  }
}

@Pipe({ name: 'jBooleanLabel', standalone: true })
export class JBooleanLabelPipe implements PipeTransform {
  transform(
    value: boolean | null | undefined,
    trueLabel = 'Yes',
    falseLabel = 'No',
    emptyLabel = '—',
  ): string {
    return value == null ? emptyLabel : value ? trueLabel : falseLabel;
  }
}

@Pipe({ name: 'jInitials', standalone: true })
export class JInitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, maxParts = 2): string {
    return generateInitials(value ?? '', maxParts);
  }
}

@Pipe({ name: 'jMaskedEmail', standalone: true })
export class JMaskedEmailPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const at = value.lastIndexOf('@');
    if (at < 1) return value;
    const name = value.slice(0, at);
    return `${name[0]}${'*'.repeat(Math.max(1, name.length - 1))}${value.slice(at)}`;
  }
}

@Pipe({ name: 'jMaskedPhone', standalone: true })
export class JMaskedPhonePipe implements PipeTransform {
  transform(value: string | null | undefined, visibleDigits = 4): string {
    if (!value) return '';
    let remaining = Math.max(0, value.replace(/\D/g, '').length - visibleDigits);
    return value.replace(/\d/g, (digit) => (remaining-- > 0 ? '•' : digit));
  }
}

@Pipe({ name: 'jJoinValues', standalone: true })
export class JJoinValuesPipe implements PipeTransform {
  transform(value: readonly unknown[] | null | undefined, separator = ', '): string {
    return (value ?? []).filter((item) => item != null && item !== '').join(separator);
  }
}

@Pipe({ name: 'jDefaultText', standalone: true })
export class JDefaultTextPipe implements PipeTransform {
  transform(value: unknown, fallback = '—'): unknown {
    return value == null || value === '' ? fallback : value;
  }
}

@Pipe({ name: 'jPluralize', standalone: true })
export class JPluralizePipe implements PipeTransform {
  transform(
    count: number,
    singular: string,
    plural = `${singular}s`,
    includeCount = false,
  ): string {
    const label = new Intl.PluralRules().select(count) === 'one' ? singular : plural;
    return includeCount ? `${count} ${label}` : label;
  }
}

export interface JHighlightSegment {
  readonly text: string;
  readonly highlighted: boolean;
}
@Pipe({ name: 'jSearchHighlight', standalone: true })
export class JSearchHighlightPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    query: string | null | undefined,
  ): JHighlightSegment[] {
    const text = value ?? '';
    const search = query?.trim();
    if (!search) return [{ text, highlighted: false }];
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text
      .split(new RegExp(`(${escaped})`, 'gi'))
      .filter(Boolean)
      .map((part) => ({
        text: part,
        highlighted: part.localeCompare(search, undefined, { sensitivity: 'accent' }) === 0,
      }));
  }
}

@Pipe({ name: 'jJsonDisplay', standalone: true })
export class JJsonDisplayPipe implements PipeTransform {
  transform(value: unknown, spaces = 2): string {
    try {
      return JSON.stringify(value, null, spaces) ?? '';
    } catch {
      return '';
    }
  }
}

@Pipe({ name: 'jFileExtension', standalone: true })
export class JFileExtensionPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return getFileExtension(value ?? '');
  }
}

@Pipe({ name: 'jCompactNumber', standalone: true })
export class JCompactNumberPipe implements PipeTransform {
  transform(value: NumberInput, locale?: string, options?: Intl.NumberFormatOptions): string {
    const number = toNumber(value);
    return number == null
      ? ''
      : new Intl.NumberFormat(locale, { notation: 'compact', ...options }).format(number);
  }
}

@Pipe({ name: 'jAccountingCurrency', standalone: true })
export class JAccountingCurrencyPipe implements PipeTransform {
  transform(
    value: NumberInput,
    currency = 'USD',
    locale?: string,
    options?: Intl.NumberFormatOptions,
  ): string {
    const number = toNumber(value);
    return number == null
      ? ''
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          currencySign: 'accounting',
          ...options,
        }).format(number);
  }
}

@Pipe({ name: 'jBytes', standalone: true })
export class JBytesPipe implements PipeTransform {
  transform(value: NumberInput, fractionDigits = 1): string {
    const number = toNumber(value);
    return number == null ? '' : convertBytes(number, fractionDigits);
  }
}

function formatDateValue(
  value: DateInput,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = toDate(value);
  if (!date) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function toDate(value: DateInput): Date | null {
  if (value == null || value === '') {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toNumber(value: NumberInput): number | null {
  if (value == null || value === '') {
    return null;
  }
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

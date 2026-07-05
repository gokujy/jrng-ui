import { Pipe, PipeTransform } from '@angular/core';

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
  transform(value: NumberInput, currency = 'USD', locale?: string, options?: Intl.NumberFormatOptions): string {
    const numberValue = toNumber(value);
    if (numberValue == null) {
      return '';
    }
    return new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(numberValue);
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
    return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1, ...options }).format(numberValue);
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

function formatDateValue(value: DateInput, locale: string | undefined, options: Intl.DateTimeFormatOptions): string {
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

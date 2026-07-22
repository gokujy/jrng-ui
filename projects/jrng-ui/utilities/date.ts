export type JDateInput = Date | string | number | null | undefined;

export function normalizeDate(value: JDateInput): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfDay(value: JDateInput): Date | null {
  const date = normalizeDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(value: JDateInput): Date | null {
  const date = normalizeDate(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}

export function isValidDateRange(start: JDateInput, end: JDateInput, allowEqual = true): boolean {
  const startDate = normalizeDate(start);
  const endDate = normalizeDate(end);
  return !!startDate && !!endDate && (allowEqual ? startDate <= endDate : startDate < endDate);
}

export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds)) return '';
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    [days, 'd'],
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
  ]
    .filter(([amount]) => amount || (totalSeconds === 0 && amount === seconds))
    .map(([amount, unit]) => `${amount}${unit}`)
    .join(' ');
}

export function compareDates(left: JDateInput, right: JDateInput): -1 | 0 | 1 | null {
  const leftDate = normalizeDate(left);
  const rightDate = normalizeDate(right);
  if (!leftDate || !rightDate) return null;
  return leftDate < rightDate ? -1 : leftDate > rightDate ? 1 : 0;
}

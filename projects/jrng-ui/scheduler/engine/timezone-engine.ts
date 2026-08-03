import { JSchedulerTimeZone } from '../scheduler.models';

export interface JSchedulerZonedParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly offsetMinutes: number;
}

export function jSchedulerZonedParts(
  instant: Date,
  timeZone: JSchedulerTimeZone,
  locale = 'en-US',
): JSchedulerZonedParts {
  const zone = timeZone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timeZone;
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    numberingSystem: 'latn',
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(instant)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );
  const asUtc = Date.UTC(
    parts['year'],
    parts['month'] - 1,
    parts['day'],
    parts['hour'],
    parts['minute'],
    parts['second'],
  );
  return {
    year: parts['year'],
    month: parts['month'],
    day: parts['day'],
    hour: parts['hour'],
    minute: parts['minute'],
    second: parts['second'],
    offsetMinutes: Math.round((asUtc - instant.getTime()) / 60_000),
  };
}

export function jSchedulerFormatInZone(
  instant: Date,
  timeZone: JSchedulerTimeZone,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: timeZone === 'local' ? undefined : timeZone,
  }).format(instant);
}

export function jSchedulerIsValidTimeZone(timeZone: JSchedulerTimeZone): boolean {
  if (timeZone === 'local') return true;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

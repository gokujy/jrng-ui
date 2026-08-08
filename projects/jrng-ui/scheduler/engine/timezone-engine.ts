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

export type JSchedulerDstDisambiguation = 'compatible' | 'earlier' | 'later' | 'reject';
export type JSchedulerWallTime = Omit<JSchedulerZonedParts, 'offsetMinutes'>;

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

export function jSchedulerZonedDateToInstant(
  wallTime: JSchedulerWallTime,
  timeZone: JSchedulerTimeZone,
  disambiguation: JSchedulerDstDisambiguation = 'compatible',
): Date {
  const zone = timeZone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timeZone;
  const wallUtc = Date.UTC(
    wallTime.year,
    wallTime.month - 1,
    wallTime.day,
    wallTime.hour,
    wallTime.minute,
    wallTime.second,
  );
  const offsets = new Set<number>();
  for (let hours = -36; hours <= 36; hours += 6)
    offsets.add(jSchedulerZonedParts(new Date(wallUtc + hours * 3_600_000), zone).offsetMinutes);
  const approximateOffset = jSchedulerZonedParts(new Date(wallUtc), zone).offsetMinutes;
  const approximate = wallUtc - approximateOffset * 60_000;
  const matches = [...offsets]
    .map((offset) => new Date(wallUtc - offset * 60_000))
    .filter((candidate) => sameWallTime(jSchedulerZonedParts(candidate, zone), wallTime))
    .sort((left, right) => left.getTime() - right.getTime());
  if (matches.length) {
    if (disambiguation === 'later') return matches.at(-1)!;
    return matches[0]!;
  }
  if (disambiguation === 'reject')
    throw new RangeError('The wall time does not exist in this timezone.');
  const direction = disambiguation === 'earlier' ? -1 : 1;
  for (let delta = 0; delta <= 360; delta += 1) {
    const candidate = new Date(approximate + direction * delta * 60_000);
    const projected = jSchedulerZonedParts(candidate, zone);
    const comparison = compareWallTime(projected, wallTime);
    if ((direction > 0 && comparison >= 0) || (direction < 0 && comparison <= 0)) return candidate;
  }
  return new Date(approximate);
}

export function jSchedulerAddZonedCalendar(
  instant: Date,
  timeZone: JSchedulerTimeZone,
  duration: { readonly days?: number; readonly months?: number; readonly years?: number },
): Date {
  if (timeZone === 'local') {
    const result = new Date(instant);
    if (duration.years) result.setFullYear(result.getFullYear() + duration.years);
    if (duration.months) result.setMonth(result.getMonth() + duration.months);
    if (duration.days) result.setDate(result.getDate() + duration.days);
    return result;
  }
  const source = jSchedulerZonedParts(instant, timeZone);
  const calendar = new Date(
    Date.UTC(
      source.year + (duration.years ?? 0),
      source.month - 1 + (duration.months ?? 0),
      source.day + (duration.days ?? 0),
      source.hour,
      source.minute,
      source.second,
    ),
  );
  return jSchedulerZonedDateToInstant(
    {
      year: calendar.getUTCFullYear(),
      month: calendar.getUTCMonth() + 1,
      day: calendar.getUTCDate(),
      hour: calendar.getUTCHours(),
      minute: calendar.getUTCMinutes(),
      second: calendar.getUTCSeconds(),
    },
    timeZone,
  );
}

function sameWallTime(actual: JSchedulerZonedParts, expected: JSchedulerWallTime): boolean {
  return compareWallTime(actual, expected) === 0;
}

function compareWallTime(actual: JSchedulerZonedParts, expected: JSchedulerWallTime): number {
  const left = Date.UTC(
    actual.year,
    actual.month - 1,
    actual.day,
    actual.hour,
    actual.minute,
    actual.second,
  );
  const right = Date.UTC(
    expected.year,
    expected.month - 1,
    expected.day,
    expected.hour,
    expected.minute,
    expected.second,
  );
  return Math.sign(left - right);
}

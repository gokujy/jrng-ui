import { jSchedulerAddDays } from './date-engine';
import {
  JSchedulerDateRange,
  JSchedulerEvent,
  JSchedulerRecurrenceException,
  JSchedulerRecurrenceRule,
} from '../scheduler.models';
import { jSchedulerEventEnd, jSchedulerEventIntersects } from './event-engine';
import {
  jSchedulerAddZonedCalendar,
  jSchedulerZonedDateToInstant,
  jSchedulerZonedParts,
} from './timezone-engine';

const WEEKDAYS: Readonly<Record<string, number>> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};
const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export function jSchedulerParseRecurrenceRule(
  value: string | JSchedulerRecurrenceRule,
): JSchedulerRecurrenceRule | null {
  if (typeof value !== 'string') return value;
  const fields = new Map(
    value
      .replace(/^RRULE:/i, '')
      .split(';')
      .map((part) => {
        const [key = '', item = ''] = part.split('=');
        return [key.toUpperCase(), item];
      }),
  );
  const frequency = fields.get('FREQ')?.toLowerCase();
  if (!frequency || !['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) return null;
  const untilText = fields.get('UNTIL');
  const until = untilText ? jSchedulerParseIcsDate(untilText) : undefined;
  const byDay = fields.get('BYDAY')?.split(',') ?? [];
  const ordinalWeekday = byDay
    .map((day) => /^([+-]?\d+)(SU|MO|TU|WE|TH|FR|SA)$/i.exec(day))
    .find((match) => match !== null);
  return {
    frequency: frequency as JSchedulerRecurrenceRule['frequency'],
    interval: positive(fields.get('INTERVAL')),
    count: positive(fields.get('COUNT')),
    until,
    weekdays: byDay
      .map((day) => WEEKDAYS[day.slice(-2).toUpperCase()])
      .filter((day): day is number => day != null),
    monthDay: fields.get('BYMONTHDAY') ? Number(fields.get('BYMONTHDAY')) : undefined,
    weekPosition: fields.get('BYSETPOS')
      ? Number(fields.get('BYSETPOS'))
      : ordinalWeekday
        ? Number(ordinalWeekday[1])
        : undefined,
    month: fields.get('BYMONTH') ? Number(fields.get('BYMONTH')) : undefined,
  };
}

export function jSchedulerSerializeRecurrenceRule(rule: JSchedulerRecurrenceRule): string {
  const parts = [`FREQ=${rule.frequency.toUpperCase()}`];
  if (rule.interval && rule.interval !== 1) parts.push(`INTERVAL=${rule.interval}`);
  if (rule.weekdays?.length)
    parts.push(
      `BYDAY=${rule.weekdays
        .map((day) => WEEKDAY_CODES[day])
        .filter(Boolean)
        .join(',')}`,
    );
  if (rule.monthDay) parts.push(`BYMONTHDAY=${rule.monthDay}`);
  if (rule.weekPosition) parts.push(`BYSETPOS=${rule.weekPosition}`);
  if (rule.month) parts.push(`BYMONTH=${rule.month}`);
  if (rule.count) parts.push(`COUNT=${rule.count}`);
  if (rule.until) parts.push(`UNTIL=${icsInstant(rule.until)}`);
  return parts.join(';');
}

export function jSchedulerRecurrenceSummary(
  value: string | JSchedulerRecurrenceRule,
  locale = 'en-US',
): string {
  const rule = jSchedulerParseRecurrenceRule(value);
  if (!rule) return 'Does not repeat';
  const interval = Math.max(1, rule.interval ?? 1);
  const units: Readonly<Record<JSchedulerRecurrenceRule['frequency'], readonly [string, string]>> =
    {
      daily: ['day', 'days'],
      weekly: ['week', 'weeks'],
      monthly: ['month', 'months'],
      yearly: ['year', 'years'],
    };
  const unit = units[rule.frequency][interval === 1 ? 0 : 1];
  let summary = interval === 1 ? `Every ${unit}` : `Every ${interval} ${unit}`;
  if (rule.weekdays?.length) {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const labels = rule.weekdays.map((day) => formatter.format(new Date(2026, 7, 2 + day)));
    summary += ` on ${labels.join(', ')}`;
  } else if (rule.monthDay) summary += ` on day ${rule.monthDay}`;
  if (rule.count) summary += `, ${rule.count} times`;
  else if (rule.until)
    summary += ` until ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(rule.until)}`;
  return summary;
}

export function jSchedulerExpandRecurrence(
  events: readonly JSchedulerEvent[],
  range: JSchedulerDateRange,
  bufferDays = 2,
): readonly JSchedulerEvent[] {
  const buffered = {
    start: jSchedulerAddDays(range.start, -bufferDays),
    end: jSchedulerAddDays(range.end, bufferDays),
  };
  return events.flatMap((event) => {
    if (!event.recurrenceRule) return jSchedulerEventIntersects(event, buffered) ? [event] : [];
    const rule = jSchedulerParseRecurrenceRule(event.recurrenceRule);
    if (!rule) return [];
    const occurrences: JSchedulerEvent[] = [];
    const duration = jSchedulerEventEnd(event).getTime() - event.start.getTime();
    const limit = Math.max(1, rule.count ?? 10_000);
    let generated = 0;
    let cursor = new Date(event.start);
    const recurrenceTimeZone = event.startTimezone ?? event.timezone ?? 'local';
    while (generated < limit && cursor < buffered.end && (!rule.until || cursor <= rule.until)) {
      const candidates = candidatesFor(cursor, event.start, rule, recurrenceTimeZone);
      for (const start of candidates.sort((a, b) => a.getTime() - b.getTime())) {
        if (start < event.start || generated >= limit || (rule.until && start > rule.until))
          continue;
        generated += 1;
        const exception = exceptionFor(event.recurrenceExceptions, start);
        if (exception?.excluded || rule.excludedDates?.some((date) => sameInstant(date, start)))
          continue;
        const occurrence = applyException(event, start, duration, exception);
        if (jSchedulerEventIntersects(occurrence, buffered)) occurrences.push(occurrence);
      }
      cursor = nextCursor(cursor, rule, recurrenceTimeZone);
    }
    return occurrences;
  });
}

export function jSchedulerEditRecurrence(
  series: JSchedulerEvent,
  originalStart: Date,
  updated: JSchedulerEvent,
  scope: 'occurrence' | 'future' | 'series',
): import('../scheduler.models').JSchedulerRecurrenceEditResult {
  if (!series.recurrenceRule || scope === 'series')
    return {
      upsert: [{ ...updated, id: series.id, recurrenceRule: series.recurrenceRule }],
      removeIds: [],
    };
  if (scope === 'occurrence') {
    const exception: JSchedulerRecurrenceException = {
      originalStart: new Date(originalStart),
      start: new Date(updated.start),
      end: updated.end ? new Date(updated.end) : undefined,
      title: updated.title,
      resourceId: updated.resourceId,
      metadata: updated.metadata,
    };
    return {
      upsert: [
        {
          ...series,
          recurrenceExceptions: replaceException(series.recurrenceExceptions, exception),
        },
      ],
      removeIds: [],
    };
  }
  const sourceRule = jSchedulerParseRecurrenceRule(series.recurrenceRule);
  if (!sourceRule) return { upsert: [], removeIds: [] };
  const previousRule: JSchedulerRecurrenceRule = {
    ...sourceRule,
    count: undefined,
    until: new Date(originalStart.getTime() - 1),
  };
  const futureRule: JSchedulerRecurrenceRule = {
    ...sourceRule,
    count: sourceRule.count
      ? Math.max(1, sourceRule.count - occurrencesBefore(series, originalStart))
      : undefined,
  };
  return {
    upsert: [
      { ...series, recurrenceRule: previousRule },
      {
        ...updated,
        id: `${series.id}-future-${originalStart.getTime()}`,
        recurrenceId: series.id,
        recurrenceRule: futureRule,
        recurrenceExceptions: [],
      },
    ],
    removeIds: [],
  };
}

export function jSchedulerDeleteRecurrence(
  series: JSchedulerEvent,
  originalStart: Date,
  scope: 'occurrence' | 'future' | 'series',
): import('../scheduler.models').JSchedulerRecurrenceEditResult {
  if (!series.recurrenceRule || scope === 'series') return { upsert: [], removeIds: [series.id] };
  if (scope === 'occurrence') {
    const exception: JSchedulerRecurrenceException = {
      originalStart: new Date(originalStart),
      excluded: true,
    };
    return {
      upsert: [
        {
          ...series,
          recurrenceExceptions: replaceException(series.recurrenceExceptions, exception),
        },
      ],
      removeIds: [],
    };
  }
  const rule = jSchedulerParseRecurrenceRule(series.recurrenceRule);
  return rule
    ? {
        upsert: [
          {
            ...series,
            recurrenceRule: {
              ...rule,
              count: undefined,
              until: new Date(originalStart.getTime() - 1),
            },
          },
        ],
        removeIds: [],
      }
    : { upsert: [], removeIds: [] };
}

function candidatesFor(
  cursor: Date,
  start: Date,
  rule: JSchedulerRecurrenceRule,
  timeZone: string,
): Date[] {
  if (rule.frequency === 'weekly' && rule.weekdays?.length) {
    const parts = jSchedulerZonedParts(cursor, timeZone);
    const cursorWeekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
    return rule.weekdays.map((weekday) =>
      jSchedulerAddZonedCalendar(cursor, timeZone, {
        days: (weekday - cursorWeekday + 7) % 7,
      }),
    );
  }
  if (rule.frequency === 'monthly') {
    const cursorParts = jSchedulerZonedParts(cursor, timeZone);
    const startParts = jSchedulerZonedParts(start, timeZone);
    const day =
      rule.weekPosition && rule.weekdays?.length
        ? positionalWeekday(
            cursorParts.year,
            cursorParts.month - 1,
            rule.weekdays[0]!,
            rule.weekPosition,
          )
        : resolveMonthDay(cursorParts.year, cursorParts.month, rule.monthDay ?? startParts.day);
    return day
      ? [zonedCandidate(cursorParts.year, cursorParts.month, day, startParts, timeZone)]
      : [];
  }
  if (rule.frequency === 'yearly') {
    const cursorParts = jSchedulerZonedParts(cursor, timeZone);
    const startParts = jSchedulerZonedParts(start, timeZone);
    const month = Math.min(12, Math.max(1, rule.month ?? startParts.month));
    const day =
      rule.weekPosition && rule.weekdays?.length
        ? positionalWeekday(cursorParts.year, month - 1, rule.weekdays[0]!, rule.weekPosition)
        : resolveMonthDay(cursorParts.year, month, rule.monthDay ?? startParts.day);
    return day ? [zonedCandidate(cursorParts.year, month, day, startParts, timeZone)] : [];
  }
  return [cursor];
}

function positionalWeekday(
  year: number,
  month: number,
  weekday: number,
  position: number,
): number | undefined {
  const days = new Date(year, month + 1, 0).getDate();
  const matching = Array.from({ length: days }, (_, index) => index + 1).filter(
    (day) => new Date(year, month, day).getDay() === weekday,
  );
  return position > 0 ? matching[position - 1] : matching.at(position);
}

function resolveMonthDay(year: number, month: number, requestedDay: number): number | undefined {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const resolved = requestedDay < 0 ? days + requestedDay + 1 : requestedDay;
  return resolved >= 1 && resolved <= days ? resolved : undefined;
}

function zonedCandidate(
  year: number,
  month: number,
  day: number,
  source: ReturnType<typeof jSchedulerZonedParts>,
  timeZone: string,
): Date {
  return jSchedulerZonedDateToInstant(
    { year, month, day, hour: source.hour, minute: source.minute, second: source.second },
    timeZone,
  );
}

function replaceException(
  exceptions: readonly JSchedulerRecurrenceException[] | undefined,
  replacement: JSchedulerRecurrenceException,
): readonly JSchedulerRecurrenceException[] {
  return [
    ...(exceptions ?? []).filter(
      (item) => !sameInstant(item.originalStart, replacement.originalStart),
    ),
    replacement,
  ];
}

function occurrencesBefore(series: JSchedulerEvent, split: Date): number {
  return jSchedulerExpandRecurrence([series], { start: series.start, end: split }, 0).length;
}

function nextCursor(value: Date, rule: JSchedulerRecurrenceRule, timeZone: string): Date {
  const interval = Math.max(1, rule.interval ?? 1);
  if (rule.frequency === 'daily')
    return jSchedulerAddZonedCalendar(value, timeZone, { days: interval });
  if (rule.frequency === 'weekly')
    return jSchedulerAddZonedCalendar(value, timeZone, { days: interval * 7 });
  const parts = jSchedulerZonedParts(value, timeZone);
  if (rule.frequency === 'monthly') {
    const monthIndex = parts.year * 12 + parts.month - 1 + interval;
    return jSchedulerZonedDateToInstant(
      {
        ...parts,
        year: Math.floor(monthIndex / 12),
        month: (monthIndex % 12) + 1,
        day: 1,
      },
      timeZone,
    );
  }
  return jSchedulerZonedDateToInstant(
    { ...parts, year: parts.year + interval, month: 1, day: 1 },
    timeZone,
  );
}

function applyException(
  event: JSchedulerEvent,
  start: Date,
  duration: number,
  exception?: JSchedulerRecurrenceException,
): JSchedulerEvent {
  const resolvedStart = exception?.start ?? start;
  return {
    ...event,
    id: `${event.id}@${start.toISOString()}`,
    recurrenceId: event.id,
    title: exception?.title ?? event.title,
    start: new Date(resolvedStart),
    end: new Date(exception?.end ?? resolvedStart.getTime() + duration),
    resourceId: exception?.resourceId ?? event.resourceId,
    recurrenceRule: undefined,
  };
}

function exceptionFor(
  exceptions: readonly JSchedulerRecurrenceException[] | undefined,
  start: Date,
) {
  return exceptions?.find((item) => sameInstant(item.originalStart, start));
}
function sameInstant(left: Date, right: Date) {
  return left.getTime() === right.getTime();
}
function positive(value: string | undefined) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}
function jSchedulerParseIcsDate(value: string): Date | undefined {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/.exec(value);
  if (!match) return undefined;
  return new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4] ?? 0),
      Number(match[5] ?? 0),
      Number(match[6] ?? 0),
    ),
  );
}

function icsInstant(value: Date): string {
  return value
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

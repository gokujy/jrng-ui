import { jSchedulerAddDays, jSchedulerAddMonths, jSchedulerAddYears } from './date-engine';
import {
  JSchedulerDateRange,
  JSchedulerEvent,
  JSchedulerRecurrenceException,
  JSchedulerRecurrenceRule,
} from '../scheduler.models';
import { jSchedulerEventEnd, jSchedulerEventIntersects } from './event-engine';

const WEEKDAYS: Readonly<Record<string, number>> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

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
  return {
    frequency: frequency as JSchedulerRecurrenceRule['frequency'],
    interval: positive(fields.get('INTERVAL')),
    count: positive(fields.get('COUNT')),
    until,
    weekdays: fields
      .get('BYDAY')
      ?.split(',')
      .map((day) => WEEKDAYS[day.slice(-2)])
      .filter((day): day is number => day != null),
    monthDay: fields.get('BYMONTHDAY') ? Number(fields.get('BYMONTHDAY')) : undefined,
  };
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
    while (generated < limit && cursor < buffered.end && (!rule.until || cursor <= rule.until)) {
      const candidates =
        rule.frequency === 'weekly' && rule.weekdays?.length
          ? rule.weekdays.map((weekday) =>
              jSchedulerAddDays(cursor, (weekday - cursor.getDay() + 7) % 7),
            )
          : [cursor];
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
      cursor = nextCursor(cursor, rule);
    }
    return occurrences;
  });
}

function nextCursor(value: Date, rule: JSchedulerRecurrenceRule): Date {
  const interval = Math.max(1, rule.interval ?? 1);
  if (rule.frequency === 'daily') return jSchedulerAddDays(value, interval);
  if (rule.frequency === 'weekly') return jSchedulerAddDays(value, interval * 7);
  if (rule.frequency === 'monthly') return jSchedulerAddMonths(value, interval);
  return jSchedulerAddYears(value, interval);
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

import { JSchedulerDateRange, JSchedulerDuration, JSchedulerView } from '../scheduler.models';

export const J_SCHEDULER_DAY_MS = 86_400_000;

export interface JSchedulerDateEngineOptions {
  readonly firstDayOfWeek?: number;
  readonly daysOfWeek?: readonly number[];
  readonly agendaDays?: number;
}

export interface JSchedulerMonthCell {
  readonly date: Date;
  readonly inMonth: boolean;
  readonly today: boolean;
  readonly weekNumber: number;
}

export function jSchedulerCloneDate(value: Date): Date {
  return new Date(value.getTime());
}

export function jSchedulerStartOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function jSchedulerEndOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
}

export function jSchedulerAddDays(value: Date, amount: number): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate() + amount,
    value.getHours(),
    value.getMinutes(),
    value.getSeconds(),
    value.getMilliseconds(),
  );
}

export function jSchedulerStartOfWeek(value: Date, firstDayOfWeek = 0): Date {
  const date = jSchedulerStartOfDay(value);
  const normalizedFirstDay = ((firstDayOfWeek % 7) + 7) % 7;
  return jSchedulerAddDays(date, -((date.getDay() - normalizedFirstDay + 7) % 7));
}

export function jSchedulerStartOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

export function jSchedulerStartOfYear(value: Date): Date {
  return new Date(value.getFullYear(), 0, 1);
}

export function jSchedulerAddMonths(value: Date, amount: number): Date {
  const day = value.getDate();
  const result = new Date(value.getFullYear(), value.getMonth() + amount, 1);
  result.setDate(Math.min(day, new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()));
  result.setHours(
    value.getHours(),
    value.getMinutes(),
    value.getSeconds(),
    value.getMilliseconds(),
  );
  return result;
}

export function jSchedulerAddYears(value: Date, amount: number): Date {
  return jSchedulerAddMonths(value, amount * 12);
}

export function jSchedulerDurationToMs(value: JSchedulerDuration): number {
  if (typeof value === 'number') return Math.max(0, value);
  if (typeof value === 'string') {
    const [hours = 0, minutes = 0] = value.split(':').map(Number);
    return Math.max(0, (hours * 60 + minutes) * 60_000);
  }
  return Math.max(
    0,
    (((value.weeks ?? 0) * 7 + (value.days ?? 0)) * 24 * 60 * 60 +
      (value.hours ?? 0) * 60 * 60 +
      (value.minutes ?? 0) * 60 +
      (value.seconds ?? 0)) *
      1000 +
      (value.milliseconds ?? 0),
  );
}

export function jSchedulerAddDuration(value: Date, duration: JSchedulerDuration): Date {
  if (typeof duration !== 'object')
    return new Date(value.getTime() + jSchedulerDurationToMs(duration));
  const withCalendarUnits = new Date(
    value.getFullYear() + (duration.years ?? 0),
    value.getMonth() + (duration.months ?? 0),
    value.getDate() + (duration.weeks ?? 0) * 7 + (duration.days ?? 0),
    value.getHours(),
    value.getMinutes(),
    value.getSeconds(),
    value.getMilliseconds(),
  );
  return new Date(
    withCalendarUnits.getTime() +
      (((duration.hours ?? 0) * 60 * 60 + (duration.minutes ?? 0) * 60 + (duration.seconds ?? 0)) *
        1000 +
        (duration.milliseconds ?? 0)),
  );
}

export function jSchedulerVisibleRange(
  activeDate: Date,
  view: JSchedulerView,
  options: JSchedulerDateEngineOptions = {},
): JSchedulerDateRange {
  const firstDay = options.firstDayOfWeek ?? 0;
  if (
    view === 'year' ||
    view === 'multiMonthYear' ||
    view === 'timelineYear' ||
    view === 'resourceTimelineYear'
  ) {
    const start = jSchedulerStartOfYear(activeDate);
    return { start, end: jSchedulerAddYears(start, 1) };
  }
  if (view === 'timelineQuarter') {
    const start = new Date(activeDate.getFullYear(), Math.floor(activeDate.getMonth() / 3) * 3, 1);
    return { start, end: jSchedulerAddMonths(start, 3) };
  }
  if (view === 'multiMonth') {
    const start = jSchedulerStartOfMonth(activeDate);
    return { start, end: jSchedulerAddMonths(start, 12) };
  }
  if (view === 'month' || view.endsWith('Month')) {
    const monthStart = jSchedulerStartOfMonth(activeDate);
    const start = view === 'month' ? jSchedulerStartOfWeek(monthStart, firstDay) : monthStart;
    const end =
      view === 'month' ? jSchedulerAddDays(start, 42) : jSchedulerAddMonths(monthStart, 1);
    return { start, end };
  }
  if (view === 'week' || view.endsWith('Week')) {
    const start = jSchedulerStartOfWeek(activeDate, firstDay);
    return { start, end: jSchedulerAddDays(start, 7) };
  }
  if (view === 'agenda' || view === 'monthAgenda') {
    const start = jSchedulerStartOfDay(activeDate);
    return { start, end: jSchedulerAddDays(start, Math.max(1, options.agendaDays ?? 30)) };
  }
  const start = jSchedulerStartOfDay(activeDate);
  return { start, end: jSchedulerAddDays(start, 1) };
}

export function jSchedulerNavigateDate(
  activeDate: Date,
  view: JSchedulerView,
  direction: -1 | 1,
  agendaDays = 30,
): Date {
  if (
    view === 'year' ||
    view === 'multiMonthYear' ||
    view === 'timelineYear' ||
    view === 'resourceTimelineYear'
  )
    return jSchedulerAddYears(activeDate, direction);
  if (view === 'timelineQuarter') return jSchedulerAddMonths(activeDate, 3 * direction);
  if (view === 'month' || view.endsWith('Month')) return jSchedulerAddMonths(activeDate, direction);
  if (view === 'week' || view.endsWith('Week')) return jSchedulerAddDays(activeDate, 7 * direction);
  if (view === 'agenda') return jSchedulerAddDays(activeDate, agendaDays * direction);
  return jSchedulerAddDays(activeDate, direction);
}

export function jSchedulerIsoWeekNumber(value: Date): number {
  const date = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(
    (Number(date) - Number(yearStart) + J_SCHEDULER_DAY_MS) / (7 * J_SCHEDULER_DAY_MS),
  );
}

export function jSchedulerMonthCells(
  activeDate: Date,
  firstDayOfWeek = 0,
  now = new Date(),
): readonly JSchedulerMonthCell[] {
  const monthStart = jSchedulerStartOfMonth(activeDate);
  const gridStart = jSchedulerStartOfWeek(monthStart, firstDayOfWeek);
  const today = jSchedulerStartOfDay(now).getTime();
  return Array.from({ length: 42 }, (_, index) => {
    const date = jSchedulerAddDays(gridStart, index);
    return {
      date,
      inMonth: date.getMonth() === activeDate.getMonth(),
      today: date.getTime() === today,
      weekNumber: jSchedulerIsoWeekNumber(date),
    };
  });
}

export function jSchedulerDatesInRange(
  range: JSchedulerDateRange,
  daysOfWeek: readonly number[] = [0, 1, 2, 3, 4, 5, 6],
): readonly Date[] {
  const result: Date[] = [];
  for (let date = range.start; date < range.end; date = jSchedulerAddDays(date, 1)) {
    if (daysOfWeek.includes(date.getDay())) result.push(date);
  }
  return result;
}

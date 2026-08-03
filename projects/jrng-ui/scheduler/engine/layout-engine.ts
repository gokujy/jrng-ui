import { jSchedulerAddDays, jSchedulerStartOfDay } from './date-engine';
import { JSchedulerDateRange, JSchedulerVisibleEvent } from '../scheduler.models';
import { jSchedulerCompareVisibleEvents } from './event-engine';

export interface JSchedulerMonthSegment {
  readonly event: JSchedulerVisibleEvent;
  readonly row: number;
  readonly startColumn: number;
  readonly span: number;
  readonly level: number;
  readonly continuesBefore: boolean;
  readonly continuesAfter: boolean;
}

export interface JSchedulerTimedPlacement {
  readonly event: JSchedulerVisibleEvent;
  readonly day: Date;
  readonly topPercent: number;
  readonly heightPercent: number;
  readonly column: number;
  readonly columnCount: number;
  readonly insetPercent: number;
  readonly widthPercent: number;
}

export function jSchedulerLayoutMonthEvents(
  events: readonly JSchedulerVisibleEvent[],
  range: JSchedulerDateRange,
): readonly JSchedulerMonthSegment[] {
  const segments: JSchedulerMonthSegment[] = [];
  for (let row = 0; row < 6; row += 1) {
    const rowStart = jSchedulerAddDays(range.start, row * 7);
    const rowEnd = jSchedulerAddDays(rowStart, 7);
    const occupancy: boolean[][] = [];
    const rowEvents = events
      .filter((event) => event.start < rowEnd && event.end > rowStart)
      .slice()
      .sort(jSchedulerCompareVisibleEvents);
    for (const event of rowEvents) {
      const clippedStart = event.start > rowStart ? jSchedulerStartOfDay(event.start) : rowStart;
      const clippedEnd = event.end < rowEnd ? event.end : rowEnd;
      const startColumn = Math.max(
        0,
        Math.round((clippedStart.getTime() - rowStart.getTime()) / 86_400_000),
      );
      const span = Math.max(
        1,
        Math.min(
          7 - startColumn,
          Math.ceil((clippedEnd.getTime() - clippedStart.getTime()) / 86_400_000),
        ),
      );
      let level = 0;
      while (occupancy[level]?.slice(startColumn, startColumn + span).some(Boolean)) level += 1;
      occupancy[level] ??= Array.from({ length: 7 }, () => false);
      occupancy[level]?.fill(true, startColumn, startColumn + span);
      segments.push({
        event,
        row,
        startColumn,
        span,
        level,
        continuesBefore: event.start < rowStart,
        continuesAfter: event.end > rowEnd,
      });
    }
  }
  return segments;
}

export function jSchedulerLayoutTimedEvents(
  events: readonly JSchedulerVisibleEvent[],
  days: readonly Date[],
  minMinutes: number,
  maxMinutes: number,
): readonly JSchedulerTimedPlacement[] {
  const placements: JSchedulerTimedPlacement[] = [];
  const visibleMinutes = Math.max(1, maxMinutes - minMinutes);
  for (const day of days) {
    const dayStart = jSchedulerStartOfDay(day);
    const dayEnd = jSchedulerAddDays(dayStart, 1);
    const timed = events
      .filter((event) => !event.allDay && event.start < dayEnd && event.end > dayStart)
      .slice()
      .sort(jSchedulerCompareVisibleEvents);
    const columns: JSchedulerVisibleEvent[][] = [];
    const provisional: { event: JSchedulerVisibleEvent; column: number }[] = [];
    for (const event of timed) {
      let column = columns.findIndex((items) => (items.at(-1)?.end ?? dayStart) <= event.start);
      if (column < 0) {
        column = columns.length;
        columns.push([]);
      }
      columns[column]?.push(event);
      provisional.push({ event, column });
    }
    const columnCount = Math.max(1, columns.length);
    for (const item of provisional) {
      const startMinutes = Math.max(
        minMinutes,
        item.event.start.getHours() * 60 + item.event.start.getMinutes(),
      );
      const endMinutes = Math.min(
        maxMinutes,
        item.event.end.getDate() !== item.event.start.getDate()
          ? maxMinutes
          : item.event.end.getHours() * 60 + item.event.end.getMinutes(),
      );
      placements.push({
        event: item.event,
        day,
        topPercent: ((startMinutes - minMinutes) / visibleMinutes) * 100,
        heightPercent: Math.max(1.5, ((endMinutes - startMinutes) / visibleMinutes) * 100),
        column: item.column,
        columnCount,
        insetPercent: (item.column / columnCount) * 100,
        widthPercent: 100 / columnCount,
      });
    }
  }
  return placements;
}

export function jSchedulerParseTime(value: string, fallback: number): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59 || (hours === 24 && minutes !== 0)) return fallback;
  return hours * 60 + minutes;
}

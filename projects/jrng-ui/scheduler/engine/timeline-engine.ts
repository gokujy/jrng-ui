import { jSchedulerAddDays, jSchedulerAddMonths } from './date-engine';
import { JSchedulerDateRange, JSchedulerView } from '../scheduler.models';

export interface JSchedulerTimelineSlot {
  readonly index: number;
  readonly start: Date;
  readonly end: Date;
  readonly label: string;
}
export interface JSchedulerVirtualWindow<T> {
  readonly items: readonly T[];
  readonly startIndex: number;
  readonly endIndex: number;
  readonly before: number;
  readonly after: number;
  readonly totalSize: number;
}

export function jSchedulerTimelineSlots(
  range: JSchedulerDateRange,
  view: JSchedulerView,
  locale = 'en-US',
  durationMinutes = 60,
): readonly JSchedulerTimelineSlot[] {
  const slots: JSchedulerTimelineSlot[] = [];
  let cursor = new Date(range.start);
  const timelineYear = view === 'timelineYear';
  const hourly = view.endsWith('Day');
  while (cursor < range.end) {
    const end = timelineYear
      ? jSchedulerAddMonths(cursor, 1)
      : hourly
        ? new Date(cursor.getTime() + Math.max(5, durationMinutes) * 60_000)
        : jSchedulerAddDays(cursor, 1);
    slots.push({
      index: slots.length,
      start: cursor,
      end: end > range.end ? range.end : end,
      label: new Intl.DateTimeFormat(
        locale,
        hourly
          ? { hour: 'numeric', minute: '2-digit' }
          : timelineYear
            ? { month: 'short' }
            : { month: 'short', day: 'numeric' },
      ).format(cursor),
    });
    cursor = end;
  }
  return slots;
}

export function jSchedulerVirtualWindow<T>(
  items: readonly T[],
  itemSize: number,
  scrollOffset: number,
  viewportSize: number,
  overscan: number,
): JSchedulerVirtualWindow<T> {
  const size = Math.max(1, itemSize);
  const startIndex = Math.max(0, Math.floor(scrollOffset / size) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollOffset + viewportSize) / size) + overscan,
  );
  return {
    items: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    before: startIndex * size,
    after: (items.length - endIndex) * size,
    totalSize: items.length * size,
  };
}

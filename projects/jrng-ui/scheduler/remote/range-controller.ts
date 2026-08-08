import {
  JSchedulerDateRange,
  JSchedulerFilterState,
  JSchedulerId,
  JSchedulerTimeZone,
  JSchedulerView,
} from '../scheduler.models';

export interface JSchedulerRangeContext {
  readonly view: JSchedulerView;
  readonly timezone: JSchedulerTimeZone;
  readonly resourceIds?: readonly JSchedulerId[];
  readonly filters?: JSchedulerFilterState;
  readonly cursor?: string;
  readonly pageSize?: number;
}

export function jSchedulerRangeKey(
  range: JSchedulerDateRange,
  context: JSchedulerRangeContext,
): string {
  return JSON.stringify({
    start: range.start.toISOString(),
    end: range.end.toISOString(),
    view: context.view,
    timezone: context.timezone,
    resourceIds: context.resourceIds?.map(String).sort(),
    filters: context.filters,
    cursor: context.cursor,
    pageSize: context.pageSize,
  });
}

export function jSchedulerAdjacentRanges(
  range: JSchedulerDateRange,
): readonly JSchedulerDateRange[] {
  const duration = range.end.getTime() - range.start.getTime();
  return [
    {
      start: new Date(range.start.getTime() - duration),
      end: new Date(range.end.getTime() - duration),
    },
    {
      start: new Date(range.start.getTime() + duration),
      end: new Date(range.end.getTime() + duration),
    },
  ];
}

export class JSchedulerRangeCache {
  private readonly completed = new Set<string>();

  has(key: string): boolean {
    return this.completed.has(key);
  }

  complete(key: string): void {
    this.completed.add(key);
  }

  invalidate(key?: string): void {
    if (key) this.completed.delete(key);
    else this.completed.clear();
  }
}

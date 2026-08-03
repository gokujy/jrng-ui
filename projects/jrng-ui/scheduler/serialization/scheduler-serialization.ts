import {
  JSchedulerCategory,
  JSchedulerEvent,
  JSchedulerId,
  JSchedulerResource,
} from '../scheduler.models';

export type JSchedulerImportFormat = 'json' | 'csv' | 'ics';
export type JSchedulerMergeStrategy = 'append' | 'upsert' | 'replaceRange';
export interface JSchedulerImportIssue {
  readonly row?: number;
  readonly field?: string;
  readonly message: string;
  readonly severity: 'warning' | 'error';
}
export interface JSchedulerImportResult {
  readonly format: JSchedulerImportFormat;
  readonly events: readonly JSchedulerEvent[];
  readonly resources: readonly JSchedulerResource[];
  readonly categories: readonly JSchedulerCategory[];
  readonly errors: readonly JSchedulerImportIssue[];
  readonly warnings: readonly JSchedulerImportIssue[];
  readonly range?: { readonly start: Date; readonly end: Date };
  readonly schemaVersion?: number;
}
export interface JSchedulerJsonDocument {
  readonly schemaVersion: 1;
  readonly events: readonly JSchedulerEvent[];
  readonly resources: readonly JSchedulerResource[];
  readonly categories: readonly JSchedulerCategory[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface JSchedulerCsvOptions {
  readonly delimiter?: string;
  readonly columns?: readonly string[];
  readonly mapping?: Readonly<Record<string, string>>;
}

export function jSchedulerExportJson(
  events: readonly JSchedulerEvent[],
  resources: readonly JSchedulerResource[] = [],
  categories: readonly JSchedulerCategory[] = [],
  metadata?: Readonly<Record<string, unknown>>,
): string {
  return JSON.stringify(
    { schemaVersion: 1, events, resources, categories, metadata },
    dateReplacer,
    2,
  );
}

export function jSchedulerImportJson(text: string): JSchedulerImportResult {
  try {
    const source = JSON.parse(text) as Partial<JSchedulerJsonDocument>;
    const issues: JSchedulerImportIssue[] = [];
    const events = (source.events ?? []).flatMap((item, index) =>
      normalizeEvent(item, index + 1, issues),
    );
    return result(
      'json',
      events,
      source.resources ?? [],
      source.categories ?? [],
      issues,
      source.schemaVersion,
    );
  } catch (error) {
    return result(
      'json',
      [],
      [],
      [],
      [{ message: error instanceof Error ? error.message : 'Invalid JSON.', severity: 'error' }],
    );
  }
}

export function jSchedulerExportCsv(
  events: readonly JSchedulerEvent[],
  options: JSchedulerCsvOptions = {},
): string {
  const delimiter = options.delimiter ?? ',';
  const columns = options.columns ?? [
    'id',
    'title',
    'start',
    'end',
    'allDay',
    'resourceId',
    'categoryId',
    'description',
    'location',
  ];
  return [
    columns.join(delimiter),
    ...events.map((event) =>
      columns.map((column) => csvCell(serializeField(event, column))).join(delimiter),
    ),
  ].join('\r\n');
}

export function jSchedulerImportCsv(
  text: string,
  options: JSchedulerCsvOptions = {},
): JSchedulerImportResult {
  const delimiter = options.delimiter ?? ',';
  const rows = parseCsv(text, delimiter);
  const headers = rows.shift() ?? [];
  const issues: JSchedulerImportIssue[] = [];
  const events = rows.flatMap((row, index) => {
    const record = Object.fromEntries(
      headers.map((header, column) => [options.mapping?.[header] ?? header, row[column] ?? '']),
    );
    return normalizeEvent(record, index + 2, issues);
  });
  return result('csv', events, [], [], issues);
}

export function jSchedulerExportIcs(events: readonly JSchedulerEvent[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JRNG UI//Scheduler//EN'];
  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsEscape(String(event.metadata?.['externalUid'] ?? event.id))}`,
      `SUMMARY:${icsEscape(event.title)}`,
      `DTSTART:${icsDate(event.start, event.allDay)}`,
    );
    if (event.end) lines.push(`DTEND:${icsDate(event.end, event.allDay)}`);
    else if (event.duration) lines.push(`DURATION:PT${Math.round(event.duration / 60_000)}M`);
    if (event.description) lines.push(`DESCRIPTION:${icsEscape(event.description)}`);
    if (event.location) lines.push(`LOCATION:${icsEscape(event.location)}`);
    if (typeof event.recurrenceRule === 'string')
      lines.push(`RRULE:${event.recurrenceRule.replace(/^RRULE:/i, '')}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function jSchedulerImportIcs(text: string): JSchedulerImportResult {
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const blocks = [...unfolded.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)\r?\nEND:VEVENT/g)].map(
    (match) => match[1],
  );
  const issues: JSchedulerImportIssue[] = [];
  const events = blocks.flatMap((block, index) => {
    const fields = new Map<string, string>();
    for (const line of block.split(/\r?\n/)) {
      const separator = line.indexOf(':');
      if (separator > 0)
        fields.set(
          line.slice(0, separator).split(';')[0]!.toUpperCase(),
          line.slice(separator + 1),
        );
    }
    const uid = fields.get('UID');
    const title = fields.get('SUMMARY');
    const start = parseIcsDate(fields.get('DTSTART'));
    if (!uid || !title || !start) {
      issues.push({
        row: index + 1,
        message: 'VEVENT requires UID, SUMMARY and valid DTSTART.',
        severity: 'error',
      });
      return [];
    }
    const end = parseIcsDate(fields.get('DTEND'));
    return [
      {
        id: uid,
        title: icsUnescape(title),
        start,
        end,
        allDay: /^\d{8}$/.test(fields.get('DTSTART') ?? ''),
        description: fields.get('DESCRIPTION')
          ? icsUnescape(fields.get('DESCRIPTION')!)
          : undefined,
        location: fields.get('LOCATION') ? icsUnescape(fields.get('LOCATION')!) : undefined,
        recurrenceRule: fields.get('RRULE'),
        metadata: { externalUid: uid },
      } satisfies JSchedulerEvent,
    ];
  });
  return result('ics', events, [], [], issues);
}

export function jSchedulerMergeEvents(
  current: readonly JSchedulerEvent[],
  imported: JSchedulerImportResult,
  strategy: JSchedulerMergeStrategy,
): readonly JSchedulerEvent[] {
  if (strategy === 'append') return [...current, ...imported.events];
  if (strategy === 'replaceRange' && imported.range)
    return [
      ...current.filter(
        (event) => event.start < imported.range!.start || event.start >= imported.range!.end,
      ),
      ...imported.events,
    ];
  const byUid = new Map(
    current.map((event) => [String(event.metadata?.['externalUid'] ?? event.id), event]),
  );
  for (const event of imported.events)
    byUid.set(String(event.metadata?.['externalUid'] ?? event.id), event);
  return [...byUid.values()];
}

function normalizeEvent(
  source: unknown,
  row: number,
  issues: JSchedulerImportIssue[],
): JSchedulerEvent[] {
  if (!source || typeof source !== 'object') {
    issues.push({ row, message: 'Row is not an object.', severity: 'error' });
    return [];
  }
  const item = source as Record<string, unknown>;
  const id = item['id'] as JSchedulerId;
  const title = String(item['title'] ?? '');
  const start = toDate(item['start']);
  const end = toDate(item['end']);
  if (id == null || id === '' || !title || !start) {
    issues.push({ row, message: 'Event requires id, title and valid start.', severity: 'error' });
    return [];
  }
  if (end && end <= start) {
    issues.push({ row, field: 'end', message: 'End must be after start.', severity: 'error' });
    return [];
  }
  return [
    {
      ...item,
      id,
      title,
      start,
      end,
      allDay: item['allDay'] === true || item['allDay'] === 'true',
    } as JSchedulerEvent,
  ];
}
function result(
  format: JSchedulerImportFormat,
  events: readonly JSchedulerEvent[],
  resources: readonly JSchedulerResource[],
  categories: readonly JSchedulerCategory[],
  issues: readonly JSchedulerImportIssue[],
  schemaVersion?: number,
): JSchedulerImportResult {
  const times = events.flatMap((event) =>
    [event.start, event.end].filter((date): date is Date => !!date),
  );
  return {
    format,
    events,
    resources,
    categories,
    errors: issues.filter((issue) => issue.severity === 'error'),
    warnings: issues.filter((issue) => issue.severity === 'warning'),
    range: times.length
      ? {
          start: new Date(Math.min(...times.map(Number))),
          end: new Date(Math.max(...times.map(Number))),
        }
      : undefined,
    schemaVersion,
  };
}
function dateReplacer(_key: string, value: unknown) {
  return value instanceof Date ? value.toISOString() : value;
}
function toDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
function serializeField(event: JSchedulerEvent, column: string) {
  const value = (event as unknown as Record<string, unknown>)[column];
  return value instanceof Date ? value.toISOString() : value == null ? '' : String(value);
}
function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
function parseCsv(text: string, delimiter: string) {
  const rows: string[][] = [[]];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        rows.at(-1)!.push('"');
        index += 1;
      } else quoted = !quoted;
    } else if (char === delimiter && !quoted) rows.at(-1)!.push('\0');
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      rows.push([]);
    } else rows.at(-1)!.push(char);
  }
  return rows.filter((row) => row.length).map((row) => row.join('').split('\0'));
}
function icsDate(date: Date, allDay?: boolean) {
  return allDay
    ? `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
    : `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}
function parseIcsDate(value?: string) {
  if (!value) return undefined;
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/.exec(value);
  return match
    ? new Date(
        Date.UTC(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(match[4] ?? 0),
          Number(match[5] ?? 0),
          Number(match[6] ?? 0),
        ),
      )
    : undefined;
}
function pad(value: number) {
  return String(value).padStart(2, '0');
}
function icsEscape(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
function icsUnescape(value: string) {
  return value.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
}

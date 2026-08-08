import {
  JSchedulerAppointmentSlot,
  JSchedulerAvailabilityRule,
  JSchedulerBlockedInterval,
  JSchedulerCategory,
  JSchedulerDateRange,
  JSchedulerEvent,
  JSchedulerId,
  JSchedulerResource,
  JSchedulerView,
} from '../scheduler.models';
import { jSchedulerDurationToMs } from '../engine/date-engine';
import { jSchedulerSerializeRecurrenceRule } from '../engine/recurrence-engine';
import { jSchedulerEventEnd } from '../engine/event-engine';

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
  readonly availability: readonly JSchedulerAvailabilityRule[];
  readonly blockedIntervals: readonly JSchedulerBlockedInterval[];
  readonly appointmentSlots: readonly JSchedulerAppointmentSlot[];
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
  readonly availability: readonly JSchedulerAvailabilityRule[];
  readonly blockedIntervals: readonly JSchedulerBlockedInterval[];
  readonly appointmentSlots: readonly JSchedulerAppointmentSlot[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface JSchedulerJsonData {
  readonly availability?: readonly JSchedulerAvailabilityRule[];
  readonly blockedIntervals?: readonly JSchedulerBlockedInterval[];
  readonly appointmentSlots?: readonly JSchedulerAppointmentSlot[];
}
export interface JSchedulerCsvOptions {
  readonly delimiter?: string;
  readonly columns?: readonly string[];
  readonly mapping?: Readonly<Record<string, string>>;
}
export interface JSchedulerXlsxOptions extends JSchedulerCsvOptions {
  readonly sheetName?: string;
}
export interface JSchedulerPdfOptions {
  readonly title?: string;
  readonly orientation?: 'portrait' | 'landscape';
  readonly locale?: string;
  readonly pageNumbers?: boolean;
  readonly eventsPerPage?: number;
  readonly generatedAt?: Date;
  readonly view?: JSchedulerView;
  readonly range?: JSchedulerDateRange;
  readonly resources?: readonly JSchedulerResource[];
}

export function jSchedulerExportJson(
  events: readonly JSchedulerEvent[],
  resources: readonly JSchedulerResource[] = [],
  categories: readonly JSchedulerCategory[] = [],
  metadata?: Readonly<Record<string, unknown>>,
  data: JSchedulerJsonData = {},
): string {
  return JSON.stringify(
    {
      schemaVersion: 1,
      events,
      resources,
      categories,
      availability: data.availability ?? [],
      blockedIntervals: data.blockedIntervals ?? [],
      appointmentSlots: data.appointmentSlots ?? [],
      metadata,
    },
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
      normalizeResources(source.resources ?? []),
      source.categories ?? [],
      issues,
      source.schemaVersion,
      {
        availability: normalizeAvailability(source.availability ?? []),
        blockedIntervals: normalizeBlockedIntervals(source.blockedIntervals ?? []),
        appointmentSlots: normalizeAppointmentSlots(source.appointmentSlots ?? []),
      },
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

export function jSchedulerExportExcelXml(
  events: readonly JSchedulerEvent[],
  options: JSchedulerCsvOptions = {},
): string {
  const columns = options.columns ?? [
    'id',
    'title',
    'start',
    'end',
    'allDay',
    'resourceId',
    'location',
  ];
  const row = (values: readonly string[]) =>
    `<Row>${values.map((value) => `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`).join('')}</Row>`;
  return [
    '<?xml version="1.0"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<Worksheet ss:Name="Schedule"><Table>',
    row(columns.map((column) => options.mapping?.[column] ?? column)),
    ...events.map((event) => row(columns.map((column) => serializeField(event, column)))),
    '</Table></Worksheet></Workbook>',
  ].join('');
}

/** Creates a dependency-free OOXML workbook using ZIP's portable stored-entry mode. */
export function jSchedulerExportXlsx(
  events: readonly JSchedulerEvent[],
  options: JSchedulerXlsxOptions = {},
): Uint8Array {
  const columns = options.columns ?? [
    'id',
    'title',
    'start',
    'end',
    'allDay',
    'resourceId',
    'location',
  ];
  const rows = [
    columns.map((column) => options.mapping?.[column] ?? column),
    ...events.map((event) => columns.map((column) => serializeField(event, column))),
  ];
  const sheetName = sanitizeSheetName(options.sheetName ?? 'Schedule');
  const worksheet = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>',
    ...rows.map(
      (values, rowIndex) =>
        `<row r="${rowIndex + 1}">${values
          .map(
            (value, columnIndex) =>
              `<c r="${xlsxColumnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`,
          )
          .join('')}</row>`,
    ),
    '</sheetData></worksheet>',
  ].join('');
  return zipStoredEntries([
    {
      name: '[Content_Types].xml',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    },
    {
      name: '_rels/.rels',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEscape(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    },
    { name: 'xl/worksheets/sheet1.xml', content: worksheet },
  ]);
}

interface StoredZipEntry {
  readonly name: string;
  readonly content: string;
}

function zipStoredEntries(entries: readonly StoredZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = encoder.encode(entry.content);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    locals.push(local);

    const directory = new Uint8Array(46 + name.length);
    const directoryView = new DataView(directory.buffer);
    directoryView.setUint32(0, 0x02014b50, true);
    directoryView.setUint16(4, 20, true);
    directoryView.setUint16(6, 20, true);
    directoryView.setUint16(8, 0x0800, true);
    directoryView.setUint32(16, crc, true);
    directoryView.setUint32(20, data.length, true);
    directoryView.setUint32(24, data.length, true);
    directoryView.setUint16(28, name.length, true);
    directoryView.setUint32(42, offset, true);
    directory.set(name, 46);
    central.push(directory);
    offset += local.length;
  }
  const centralSize = central.reduce((total, item) => total + item.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  return concatBytes([...locals, ...central, end]);
}

function concatBytes(chunks: readonly Uint8Array[]): Uint8Array {
  const output = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function xlsxColumnName(index: number): string {
  let value = index + 1;
  let name = '';
  while (value > 0) {
    value -= 1;
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26);
  }
  return name;
}

function sanitizeSheetName(value: string): string {
  return (
    value
      .replace(/[\\/*?:[\]]/g, ' ')
      .trim()
      .slice(0, 31) || 'Schedule'
  );
}

export function jSchedulerExportPdf(
  events: readonly JSchedulerEvent[],
  options: JSchedulerPdfOptions = {},
): Uint8Array {
  const landscape = options.orientation !== 'portrait';
  const width = landscape ? 792 : 612;
  const height = landscape ? 612 : 792;
  const formatter = new Intl.DateTimeFormat(options.locale ?? 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const perPage = Math.max(1, options.eventsPerPage ?? (landscape ? 36 : 50));
  const chunks = events.length
    ? Array.from({ length: Math.ceil(events.length / perPage) }, (_, index) =>
        events.slice(index * perPage, (index + 1) * perPage),
      )
    : [[]];
  const pageCount = chunks.length;
  const fontObject = 3 + pageCount;
  const contentStart = fontObject + 1;
  const pageObjects = chunks.map((_, index) => 3 + index);
  const commands = chunks.map((pageEvents, pageIndex) => {
    const lines = [
      options.title ?? 'Schedule',
      `Generated ${formatter.format(options.generatedAt ?? new Date())}`,
      '',
      ...pageEvents.map((event) =>
        `${formatter.format(event.start)}  ${event.title}${event.location ? ` - ${event.location}` : ''}`.slice(
          0,
          105,
        ),
      ),
      ...(options.pageNumbers === false ? [] : ['', `Page ${pageIndex + 1} of ${pageCount}`]),
    ];
    return [
      ...pdfViewCommands(pageEvents, width, height, options),
      'BT',
      '/F1 11 Tf',
      `40 ${height - 44} Td`,
      ...lines
        .flatMap((line, index) => [index ? '0 -13 Td' : '', `(${pdfEscape(line)}) Tj`])
        .filter(Boolean),
      'ET',
    ].join('\n');
  });
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageObjects.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageCount} >>`,
    ...pageObjects.map(
      (_, index) =>
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 ${fontObject} 0 R >> >> /Contents ${contentStart + index} 0 R >>`,
    ),
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ...commands.map(
      (command) =>
        `<< /Length ${new TextEncoder().encode(command).length} >>\nstream\n${command}\nendstream`,
    ),
  ];
  let document = '%PDF-1.4\n';
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(new TextEncoder().encode(document).length);
    document += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xref = new TextEncoder().encode(document).length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  document += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(document);
}

function pdfViewCommands(
  events: readonly JSchedulerEvent[],
  width: number,
  height: number,
  options: JSchedulerPdfOptions,
): readonly string[] {
  if (!options.range || !options.view) return [];
  const range = options.range;
  if (options.view === 'month' || options.view === 'resourceMonth') {
    const left = 40;
    const bottom = 55;
    const gridWidth = width - 80;
    const gridHeight = height - 145;
    const cellWidth = gridWidth / 7;
    const cellHeight = gridHeight / 6;
    const commands = ['q', '0.5 w'];
    for (let column = 0; column <= 7; column += 1)
      commands.push(`${left + column * cellWidth} ${bottom} m 0 ${gridHeight} l S`);
    for (let row = 0; row <= 6; row += 1)
      commands.push(`${left} ${bottom + row * cellHeight} m ${gridWidth} 0 l S`);
    for (const event of events) {
      const day = Math.max(
        0,
        Math.min(
          41,
          Math.floor((new Date(event.start).getTime() - range.start.getTime()) / 86_400_000),
        ),
      );
      const column = day % 7;
      const row = Math.floor(day / 7);
      commands.push(
        `BT /F1 7 Tf ${left + column * cellWidth + 3} ${bottom + gridHeight - (row + 1) * cellHeight + 7} Td (${pdfEscape(event.title.slice(0, 20))}) Tj ET`,
      );
    }
    commands.push('Q');
    return commands;
  }
  if (options.view.toLowerCase().includes('timeline')) {
    const left = 110;
    const right = width - 35;
    const top = height - 95;
    const duration = Math.max(1, range.end.getTime() - range.start.getTime());
    const rows = options.resources?.length
      ? options.resources
      : [{ id: '__all', name: 'Schedule' }];
    const commands = ['q', '0.5 w', `${left} ${top} m ${right - left} 0 l S`];
    rows.slice(0, 20).forEach((resource, index) => {
      const y = top - 18 - index * 19;
      commands.push(`BT /F1 7 Tf 40 ${y + 3} Td (${pdfEscape(resource.name.slice(0, 18))}) Tj ET`);
      for (const event of events) {
        const resourceIds = [event.resourceId, ...(event.resourceIds ?? [])].map(String);
        if (resource.id !== '__all' && !resourceIds.includes(String(resource.id))) continue;
        const start = Math.max(range.start.getTime(), new Date(event.start).getTime());
        const end = Math.min(range.end.getTime(), jSchedulerEventEnd(event).getTime());
        if (end <= start) continue;
        const x = left + ((start - range.start.getTime()) / duration) * (right - left);
        const eventWidth = Math.max(4, ((end - start) / duration) * (right - left));
        commands.push(`${x} ${y} ${eventWidth} 10 re S`);
      }
    });
    commands.push('Q');
    return commands;
  }
  return [];
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
      icsDateProperty('DTSTART', event.start, event.allDay, event.startTimezone ?? event.timezone),
    );
    if (event.end)
      lines.push(
        icsDateProperty('DTEND', event.end, event.allDay, event.endTimezone ?? event.timezone),
      );
    else if (event.duration)
      lines.push(`DURATION:PT${Math.round(jSchedulerDurationToMs(event.duration) / 60_000)}M`);
    if (event.description) lines.push(`DESCRIPTION:${icsEscape(event.description)}`);
    if (event.location) lines.push(`LOCATION:${icsEscape(event.location)}`);
    if (event.status) lines.push(`STATUS:${icsEscape(event.status.toUpperCase())}`);
    if (event.recurrenceRule)
      lines.push(
        `RRULE:${typeof event.recurrenceRule === 'string' ? event.recurrenceRule.replace(/^RRULE:/i, '') : jSchedulerSerializeRecurrenceRule(event.recurrenceRule)}`,
      );
    const excluded = event.recurrenceExceptions?.filter((item) => item.excluded);
    if (excluded?.length)
      lines.push(`EXDATE:${excluded.map((item) => icsDate(item.originalStart)).join(',')}`);
    if (event.originalStart) lines.push(`RECURRENCE-ID:${icsDate(event.originalStart)}`);
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

export function jSchedulerReviewImport(
  imported: JSchedulerImportResult,
  existing: readonly JSchedulerEvent[] = [],
  resources: readonly JSchedulerResource[] = [],
): JSchedulerImportResult {
  const warnings = [...imported.warnings];
  const knownResources = new Set(flattenResourceIds(resources).map(String));
  const existingIds = new Set(existing.map((event) => String(event.id)));
  const seen = new Set<string>();
  for (const [index, event] of imported.events.entries()) {
    const id = String(event.id);
    if (seen.has(id))
      warnings.push({
        row: index + 1,
        field: 'id',
        message: `Duplicate imported event ID: ${id}.`,
        severity: 'warning',
      });
    if (existingIds.has(id))
      warnings.push({
        row: index + 1,
        field: 'id',
        message: `Event ID already exists: ${id}.`,
        severity: 'warning',
      });
    seen.add(id);
    const assigned = [event.resourceId, ...(event.resourceIds ?? [])].filter(
      (value): value is JSchedulerId => value != null,
    );
    for (const resourceId of assigned)
      if (resources.length && !knownResources.has(String(resourceId)))
        warnings.push({
          row: index + 1,
          field: 'resourceId',
          message: `Unknown resource: ${resourceId}.`,
          severity: 'warning',
        });
    const conflict = existing.some(
      (current) =>
        String(current.id) !== id &&
        current.start < jSchedulerEventEnd(event) &&
        jSchedulerEventEnd(current) > event.start &&
        sameResource(current, event),
    );
    if (conflict)
      warnings.push({
        row: index + 1,
        message: 'Event overlaps an existing resource assignment.',
        severity: 'warning',
      });
  }
  return { ...imported, warnings };
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
  data: JSchedulerJsonData = {},
): JSchedulerImportResult {
  const times = events.flatMap((event) =>
    [event.start, event.end].filter((date): date is Date => !!date),
  );
  return {
    format,
    events,
    resources,
    categories,
    availability: data.availability ?? [],
    blockedIntervals: data.blockedIntervals ?? [],
    appointmentSlots: data.appointmentSlots ?? [],
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

function normalizeResources(
  resources: readonly JSchedulerResource[],
): readonly JSchedulerResource[] {
  return resources.map((resource) => ({
    ...resource,
    availability: normalizeAvailability(resource.availability ?? []),
    blockedIntervals: normalizeBlockedIntervals(resource.blockedIntervals ?? []),
    children: resource.children ? normalizeResources(resource.children) : undefined,
  }));
}

function normalizeAvailability(
  rules: readonly JSchedulerAvailabilityRule[],
): readonly JSchedulerAvailabilityRule[] {
  return rules.map((rule) => ({
    ...rule,
    effectiveStart: toDate(rule.effectiveStart),
    effectiveEnd: toDate(rule.effectiveEnd),
    excludedDates: rule.excludedDates?.map(toDate).filter((date): date is Date => !!date),
  }));
}

function normalizeBlockedIntervals(
  intervals: readonly JSchedulerBlockedInterval[],
): readonly JSchedulerBlockedInterval[] {
  return intervals.flatMap((interval) => {
    const start = toDate(interval.start);
    const end = toDate(interval.end);
    return start && end ? [{ ...interval, start, end }] : [];
  });
}

function normalizeAppointmentSlots(
  slots: readonly JSchedulerAppointmentSlot[],
): readonly JSchedulerAppointmentSlot[] {
  return slots.flatMap((slot) => {
    const start = toDate(slot.start);
    const end = toDate(slot.end);
    return start && end ? [{ ...slot, start, end }] : [];
  });
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
function icsDateProperty(name: string, date: Date, allDay?: boolean, timezone?: string) {
  if (allDay) return `${name};VALUE=DATE:${icsDate(date, true)}`;
  if (!timezone || timezone === 'UTC' || timezone === 'local') return `${name}:${icsDate(date)}`;
  return `${name};TZID=${icsEscape(timezone)}:${icsDateInZone(date, timezone)}`;
}
function icsDateInZone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}${value('month')}${value('day')}T${value('hour')}${value('minute')}${value('second')}`;
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
function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function pdfEscape(value: string) {
  return value.replace(/[^\x20-\x7e]/g, '?').replace(/([\\()])/g, '\\$1');
}
function flattenResourceIds(resources: readonly JSchedulerResource[]): JSchedulerId[] {
  return resources.flatMap((resource) => [
    resource.id,
    ...flattenResourceIds(resource.children ?? []),
  ]);
}
function sameResource(left: JSchedulerEvent, right: JSchedulerEvent): boolean {
  const leftIds = new Set(
    [left.resourceId, ...(left.resourceIds ?? [])].filter((id) => id != null).map(String),
  );
  const rightIds = [right.resourceId, ...(right.resourceIds ?? [])]
    .filter((id) => id != null)
    .map(String);
  return !leftIds.size || !rightIds.length || rightIds.some((id) => leftIds.has(id));
}

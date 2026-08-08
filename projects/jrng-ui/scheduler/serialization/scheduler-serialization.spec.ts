import { describe, expect, it } from 'vitest';
import {
  jSchedulerExportCsv,
  jSchedulerExportIcs,
  jSchedulerExportExcelXml,
  jSchedulerExportXlsx,
  jSchedulerExportPdf,
  jSchedulerExportJson,
  jSchedulerImportCsv,
  jSchedulerImportIcs,
  jSchedulerImportJson,
  jSchedulerMergeEvents,
  jSchedulerReviewImport,
} from './scheduler-serialization';

describe('JRNG scheduler serialization', () => {
  const events = [
    {
      id: 'review',
      title: 'Product, review',
      start: new Date('2026-08-03T09:00:00Z'),
      end: new Date('2026-08-03T10:00:00Z'),
      location: 'Room 1',
    },
  ];
  it('round trips JSON dates without changing live state', () => {
    const imported = jSchedulerImportJson(jSchedulerExportJson(events));
    expect(imported.errors).toEqual([]);
    expect(imported.events[0]?.start).toEqual(events[0]?.start);
  });
  it('round trips availability, blocks and appointment slots with normalized dates', () => {
    const start = new Date('2026-08-03T11:00:00Z');
    const end = new Date('2026-08-03T12:00:00Z');
    const imported = jSchedulerImportJson(
      jSchedulerExportJson(events, [], [], undefined, {
        availability: [
          { id: 'weekday', startTime: '09:00', endTime: '17:00', effectiveStart: start },
        ],
        blockedIntervals: [{ id: 'maintenance', start, end }],
        appointmentSlots: [{ id: 'slot', start, end, status: 'available' }],
      }),
    );
    expect(imported.availability[0]?.effectiveStart).toEqual(start);
    expect(imported.blockedIntervals[0]?.end).toEqual(end);
    expect(imported.appointmentSlots[0]?.start).toEqual(start);
  });
  it('round trips quoted CSV cells', () => {
    const imported = jSchedulerImportCsv(jSchedulerExportCsv(events));
    expect(imported.events[0]?.title).toBe('Product, review');
  });
  it('round trips common ICS fields', () => {
    const imported = jSchedulerImportIcs(jSchedulerExportIcs(events));
    expect(imported.events[0]).toMatchObject({
      id: 'review',
      title: 'Product, review',
      location: 'Room 1',
    });
  });
  it('previews deterministic upserts', () => {
    const imported = jSchedulerImportJson(
      jSchedulerExportJson([{ ...events[0]!, title: 'Updated' }]),
    );
    expect(jSchedulerMergeEvents(events, imported, 'upsert')).toHaveLength(1);
  });
  it('creates Excel SpreadsheetML and a valid PDF byte stream', () => {
    expect(jSchedulerExportExcelXml(events)).toContain('<Worksheet ss:Name="Schedule">');
    const pdf = new TextDecoder().decode(jSchedulerExportPdf(events, { title: 'Operations' }));
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('Operations');
    expect(pdf).toContain('%%EOF');
  });
  it('creates a native ZIP-based XLSX workbook with escaped worksheet data', () => {
    const xlsx = jSchedulerExportXlsx(events, { sheetName: 'Operations / Week' });
    const archive = new TextDecoder().decode(xlsx);
    expect(Array.from(xlsx.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(archive).toContain('[Content_Types].xml');
    expect(archive).toContain('xl/worksheets/sheet1.xml');
    expect(archive).toContain('Operations   Week');
    expect(archive).toContain('Product, review');
    expect(Array.from(xlsx.slice(-22, -18))).toEqual([0x50, 0x4b, 0x05, 0x06]);
  });
  it('paginates every requested event in PDF output without truncating virtual data', () => {
    const many = Array.from({ length: 45 }, (_, index) => ({
      ...events[0]!,
      id: `event-${index}`,
      title: `Event ${index}`,
    }));
    const pdf = new TextDecoder().decode(
      jSchedulerExportPdf(many, {
        eventsPerPage: 20,
        generatedAt: new Date('2026-08-08T00:00:00Z'),
      }),
    );
    expect(pdf).toContain('/Count 3');
    expect(pdf).toContain('Event 44');
    expect(pdf).toContain('Page 3 of 3');
    expect(pdf).not.toContain('additional events omitted');
  });
  it('renders view-aware vector geometry for month and resource timelines', () => {
    const range = {
      start: new Date('2026-08-01T00:00:00Z'),
      end: new Date('2026-09-01T00:00:00Z'),
    };
    const month = new TextDecoder().decode(
      jSchedulerExportPdf(events, { view: 'month', range, generatedAt: range.start }),
    );
    expect(month).toContain('0.5 w');
    expect(month).toContain('(Product, review) Tj');
    const timeline = new TextDecoder().decode(
      jSchedulerExportPdf([{ ...events[0]!, resourceId: 'room-1' }], {
        view: 'resourceTimelineMonth',
        range,
        resources: [{ id: 'room-1', name: 'Room 1' }],
        generatedAt: range.start,
      }),
    );
    expect(timeline).toContain('(Room 1) Tj');
    expect(timeline).toMatch(/ re S/);
  });
  it('exports recurrence, exceptions and timezone identifiers to ICS', () => {
    const text = jSchedulerExportIcs([
      {
        ...events[0]!,
        startTimezone: 'Asia/Kolkata',
        status: 'confirmed',
        recurrenceRule: { frequency: 'weekly', weekdays: [1, 3], count: 4 },
        recurrenceExceptions: [{ originalStart: new Date('2026-08-10T09:00:00Z'), excluded: true }],
      },
    ]);
    expect(text).toContain('DTSTART;TZID=Asia/Kolkata:');
    expect(text).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=4');
    expect(text).toContain('EXDATE:20260810T090000Z');
    expect(text).toContain('STATUS:CONFIRMED');
  });
  it('reports duplicate IDs, unknown resources and overlaps in import previews', () => {
    const parsed = jSchedulerImportJson(
      jSchedulerExportJson([
        { ...events[0]!, id: 'new', resourceId: 'missing' },
        { ...events[0]!, id: 'new', resourceId: 'missing' },
      ]),
    );
    const reviewed = jSchedulerReviewImport(
      parsed,
      [{ ...events[0]!, resourceId: 'room-1' }],
      [{ id: 'room-1', name: 'Room 1' }],
    );
    expect(reviewed.warnings.some((warning) => warning.message.includes('Duplicate'))).toBe(true);
    expect(reviewed.warnings.some((warning) => warning.message.includes('Unknown resource'))).toBe(
      true,
    );
  });
});

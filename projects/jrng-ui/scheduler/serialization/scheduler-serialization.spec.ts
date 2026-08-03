import { describe, expect, it } from 'vitest';
import {
  jSchedulerExportCsv,
  jSchedulerExportIcs,
  jSchedulerExportJson,
  jSchedulerImportCsv,
  jSchedulerImportIcs,
  jSchedulerImportJson,
  jSchedulerMergeEvents,
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
});

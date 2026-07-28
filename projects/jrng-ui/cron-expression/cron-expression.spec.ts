import { describe, expect, it } from 'vitest';
import {
  jDescribeCronExpression,
  jFormatCronExpression,
  jNextCronRuns,
  jParseCronExpression,
} from './cron-expression';

describe('Linux five-field cron grammar', () => {
  it.each(['* * * * *', '*/15 9-17 * * 1-5', '0,30 8,12 * 1-12 0,7', '5 4 1 * *', '@daily'])(
    'parses and formats %s',
    (expression) => {
      const result = jParseCronExpression(`  ${expression}  `);
      expect(result.valid).toBe(true);
      expect(result.parts && jFormatCronExpression(result.parts)).toBe(result.expression);
    },
  );

  it.each([
    '',
    '* * * *',
    '* * * * * *',
    '60 * * * *',
    '* 24 * * *',
    '* * 0 * *',
    '* * * 13 *',
    '* * * * 8',
    '10-2 * * * *',
    '*/0 * * * *',
    'L * * * *',
  ])('rejects unsupported or out-of-bounds grammar: %s', (expression) => {
    expect(jParseCronExpression(expression).valid).toBe(false);
  });

  it('documents the Linux OR rule when both day fields are restricted', () => {
    const runs = jNextCronRuns('0 0 13 * 1', new Date('2026-07-12T23:59:00Z'), 2, 60 * 24 * 10);
    expect(runs.map((run) => run.toISOString().slice(0, 10))).toEqual(['2026-07-13', '2026-07-20']);
  });

  it('terminates impossible schedules at the explicit bound', () => {
    expect(jNextCronRuns('0 0 31 2 *', new Date('2026-01-01T00:00:00Z'), 1, 10_000)).toEqual([]);
  });

  it('describes common schedules without claiming scheduler execution', () => {
    expect(jDescribeCronExpression('*/10 * * * *')).toBe('Every 10 minutes.');
    expect(jDescribeCronExpression('0 2 * * *')).toBe('Every day at 02:00.');
    expect(jDescribeCronExpression('bad')).toBe('Invalid cron expression.');
  });
});

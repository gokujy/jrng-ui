import { describe, expect, it } from 'vitest';
import { jEncodeQrMatrix } from './qr-encoder';

describe('JRNG QR encoder', () => {
  it.each([
    ['HELLO WORLD', 'L', 21],
    ['customer-42', 'M', 21],
    ['customer account 2026', 'Q', 29],
    ['1234567', 'H', 21],
  ] as const)(
    'produces a deterministic standards-compatible structure for %s at level %s',
    (value, level, size) => {
      const qr = jEncodeQrMatrix(value, level);
      expect(qr.size).toBe(size);
      expect(
        qr.modules.slice(0, 7).every((row) => row.slice(0, 7).filter(Boolean).length > 0),
      ).toBe(true);
      expect(jEncodeQrMatrix(value, level)).toEqual(qr);
    },
  );

  it('selects versions from UTF-8 byte capacity rather than JavaScript string length', () => {
    expect(jEncodeQrMatrix('x'.repeat(17), 'L').size).toBe(21);
    expect(jEncodeQrMatrix('x'.repeat(18), 'L').size).toBe(25);
    expect(jEncodeQrMatrix('😀'.repeat(5), 'L').size).toBe(25);
  });

  it('supports the complete version range and rejects data beyond the selected level', () => {
    expect(jEncodeQrMatrix('x'.repeat(2_953), 'L').size).toBe(177);
    expect(jEncodeQrMatrix('x'.repeat(1_273), 'H').size).toBe(177);
    expect(() => jEncodeQrMatrix('x'.repeat(1_274), 'H')).toThrow(RangeError);
  });

  it('returns a square immutable-by-contract boolean matrix', () => {
    const qr = jEncodeQrMatrix('Customer portal', 'M');
    expect(qr.modules).toHaveLength(qr.size);
    expect(qr.modules.every((row) => row.length === qr.size)).toBe(true);
    expect(qr.modules.flat().every((module) => typeof module === 'boolean')).toBe(true);
  });
});

import {
  JAccountingCurrencyPipe,
  JBooleanLabelPipe,
  JBytesPipe,
  JCompactNumberPipe,
  JCurrencyFormatPipe,
  JDateFormatPipe,
  JDateTimeFormatPipe,
  JDefaultTextPipe,
  JDurationPipe,
  JFileExtensionPipe,
  JFileSizeFormatPipe,
  JInitialsPipe,
  JJoinValuesPipe,
  JJsonDisplayPipe,
  JMaskedEmailPipe,
  JMaskedPhonePipe,
  JNumberFormatPipe,
  JPercentFormatPipe,
  JPluralizePipe,
  JRelativeTimePipe,
  JSearchHighlightPipe,
  JTextTruncatePipe,
  JTimeFormatPipe,
} from './formatting.pipes';

describe('enterprise formatting pipes', () => {
  it('formats relative time and duration deterministically', () => {
    expect(new JRelativeTimePipe().transform('2025-01-02', 'en', '2025-01-01')).toBe('tomorrow');
    expect(new JDurationPipe().transform(3_661_000)).toBe('1h 1m 1s');
  });
  it('formats generic labels and masking', () => {
    expect(new JBooleanLabelPipe().transform(true)).toBe('Yes');
    expect(new JInitialsPipe().transform('Grace Hopper')).toBe('GH');
    expect(new JMaskedEmailPipe().transform('ada@example.com')).toBe('a**@example.com');
    expect(new JMaskedPhonePipe().transform('+91 98765 43210')).toContain('3210');
    expect(new JJoinValuesPipe().transform(['a', null, 'b'])).toBe('a, b');
  });
  it('returns safe highlight segments rather than HTML', () => {
    expect(new JSearchHighlightPipe().transform('<b>Test</b>', 'test')).toEqual([
      { text: '<b>', highlighted: false },
      { text: 'Test', highlighted: true },
      { text: '</b>', highlighted: false },
    ]);
  });
  it('formats extensions, compact numbers and accounting values', () => {
    expect(new JFileExtensionPipe().transform('file.TXT')).toBe('txt');
    expect(new JCompactNumberPipe().transform(1200, 'en')).toMatch(/1\.2K/i);
    expect(new JAccountingCurrencyPipe().transform(-10, 'USD', 'en-US')).toContain('(');
  });
  it('preserves the established generic formatting pipe contracts', () => {
    const date = '2025-01-02T12:30:00Z';
    expect(new JDateFormatPipe().transform(date, 'en-US')).not.toBe('');
    expect(new JTimeFormatPipe().transform(date, 'en-US')).not.toBe('');
    expect(new JDateTimeFormatPipe().transform(date, 'en-US')).not.toBe('');
    expect(new JCurrencyFormatPipe().transform(12, 'USD', 'en-US')).toContain('12');
    expect(new JNumberFormatPipe().transform(1234, 'en-US')).toBe('1,234');
    expect(new JPercentFormatPipe().transform(0.5, 'en-US')).toBe('50%');
    expect(new JFileSizeFormatPipe().transform(1024)).toBe('1.0 KB');
    expect(new JTextTruncatePipe().transform('abcdef', 5)).toBe('ab...');
    expect(new JDefaultTextPipe().transform('', 'fallback')).toBe('fallback');
    expect(new JPluralizePipe().transform(2, 'record')).toBe('records');
    expect(new JJsonDisplayPipe().transform({ safe: true })).toContain('"safe"');
    expect(new JBytesPipe().transform(1024)).toBe('1.0 KB');
  });
});

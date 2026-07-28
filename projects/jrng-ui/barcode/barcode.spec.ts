import { describe, expect, it } from 'vitest';
import { jBarcodeSvg, jEan13Checksum, jEncodeBarcode, jValidateBarcode } from './barcode';

describe('barcode encoders', () => {
  it('matches the published EAN-13 checksum example and deterministic dimensions', () => {
    expect(jEan13Checksum('400638133393')).toBe(1);
    const fromTwelve = jEncodeBarcode({
      symbology: 'ean13',
      value: '400638133393',
      quietZone: 10,
    });
    const fromThirteen = jEncodeBarcode({
      symbology: 'ean13',
      value: '4006381333931',
      quietZone: 10,
    });
    expect(fromTwelve.encodedValue).toBe('4006381333931');
    expect(fromTwelve.path).toBe(fromThirteen.path);
    expect(fromTwelve.viewBoxWidth).toBe(115);
  });

  it('rejects EAN-13 length and checksum errors', () => {
    expect(jValidateBarcode('ean13', '123').map((issue) => issue.code)).toContain('invalid-length');
    expect(jValidateBarcode('ean13', '4006381333932').map((issue) => issue.code)).toContain(
      'invalid-checksum',
    );
  });

  it('encodes Code 128 B start, data, checksum, and stop deterministically', () => {
    const first = jEncodeBarcode({ symbology: 'code128', value: 'AB', quietZone: 10 });
    const second = jEncodeBarcode({ symbology: 'code128', value: 'AB', quietZone: 10 });
    expect(first).toEqual(second);
    expect(first.viewBoxWidth).toBe(77);
    expect(first.path).toMatch(/^M10 0h2v50h-2z/);
    expect(first.path).toContain('v50');
  });

  it('rejects empty, non-printable, and oversized linear values', () => {
    expect(jValidateBarcode('code128', '').map((issue) => issue.code)).toContain('empty');
    expect(jValidateBarcode('code128', 'line\nbreak').map((issue) => issue.code)).toContain(
      'unsupported-character',
    );
    expect(jValidateBarcode('code128', 'x'.repeat(161)).map((issue) => issue.code)).toContain(
      'oversized',
    );
  });

  it('matches stable QR version-one geometry for a trusted HELLO WORLD fixture', () => {
    const graphic = jEncodeBarcode({
      symbology: 'qr',
      value: 'HELLO WORLD',
      errorCorrection: 'L',
      quietZone: 4,
    });
    expect(graphic.issues).toEqual([]);
    expect(graphic.viewBoxWidth).toBe(29);
    expect(graphic.viewBoxHeight).toBe(29);
    expect(graphic.path.startsWith('M4 4h7v1h-7z')).toBe(true);
    expect(graphic.path).toBe(
      jEncodeBarcode({
        symbology: 'qr',
        value: 'HELLO WORLD',
        errorCorrection: 'L',
        quietZone: 4,
      }).path,
    );
  });

  it('reports contrast and color problems instead of failing silently', () => {
    expect(jValidateBarcode('qr', 'value', '#777777', '#888888')).toContainEqual(
      expect.objectContaining({ code: 'low-contrast', severity: 'warning' }),
    );
    expect(jValidateBarcode('qr', 'value', 'red', '#fff')).toContainEqual(
      expect.objectContaining({ code: 'invalid-color', severity: 'error' }),
    );
  });

  it('produces one accessible, escaped SVG document', () => {
    const graphic = jEncodeBarcode({ symbology: 'qr', value: '<tag>' });
    const svg = jBarcodeSvg(graphic, '#000', '#fff', 'Ticket "A"');
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="Ticket &quot;A&quot;"');
    expect(svg).toContain('<path');
    expect(svg.match(/<svg/g)).toHaveLength(1);
  });
});

import { jEncodeQrMatrix } from './qr-encoder';

export type JBarcodeSymbology = 'qr' | 'code128' | 'ean13';
export type JQrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface JBarcodeIssue {
  readonly code:
    | 'empty'
    | 'unsupported-character'
    | 'invalid-length'
    | 'invalid-checksum'
    | 'oversized'
    | 'invalid-size'
    | 'invalid-color'
    | 'low-contrast';
  readonly message: string;
  readonly severity: 'error' | 'warning';
}

export interface JBarcodeGraphic {
  readonly symbology: JBarcodeSymbology;
  readonly encodedValue: string;
  readonly path: string;
  readonly viewBoxWidth: number;
  readonly viewBoxHeight: number;
  readonly issues: readonly JBarcodeIssue[];
}

export interface JBarcodeEncodeOptions {
  readonly symbology: JBarcodeSymbology;
  readonly value: string;
  readonly quietZone?: number;
  readonly errorCorrection?: JQrErrorCorrection;
  readonly foreground?: string;
  readonly background?: string;
}

const CODE128_PATTERNS = [
  '212222',
  '222122',
  '222221',
  '121223',
  '121322',
  '131222',
  '122213',
  '122312',
  '132212',
  '221213',
  '221312',
  '231212',
  '112232',
  '122132',
  '122231',
  '113222',
  '123122',
  '123221',
  '223211',
  '221132',
  '221231',
  '213212',
  '223112',
  '312131',
  '311222',
  '321122',
  '321221',
  '312212',
  '322112',
  '322211',
  '212123',
  '212321',
  '232121',
  '111323',
  '131123',
  '131321',
  '112313',
  '132113',
  '132311',
  '211313',
  '231113',
  '231311',
  '112133',
  '112331',
  '132131',
  '113123',
  '113321',
  '133121',
  '313121',
  '211331',
  '231131',
  '213113',
  '213311',
  '213131',
  '311123',
  '311321',
  '331121',
  '312113',
  '312311',
  '332111',
  '314111',
  '221411',
  '431111',
  '111224',
  '111422',
  '121124',
  '121421',
  '141122',
  '141221',
  '112214',
  '112412',
  '122114',
  '122411',
  '142112',
  '142211',
  '241211',
  '221114',
  '413111',
  '241112',
  '134111',
  '111242',
  '121142',
  '121241',
  '114212',
  '124112',
  '124211',
  '411212',
  '421112',
  '421211',
  '212141',
  '214121',
  '412121',
  '111143',
  '111341',
  '131141',
  '114113',
  '114311',
  '411113',
  '411311',
  '113141',
  '114131',
  '311141',
  '411131',
  '211412',
  '211214',
  '211232',
  '2331112',
] as const;

const EAN_L = [
  '0001101',
  '0011001',
  '0010011',
  '0111101',
  '0100011',
  '0110001',
  '0101111',
  '0111011',
  '0110111',
  '0001011',
] as const;
const EAN_G = [
  '0100111',
  '0110011',
  '0011011',
  '0100001',
  '0011101',
  '0111001',
  '0000101',
  '0010001',
  '0001001',
  '0010111',
] as const;
const EAN_R = [
  '1110010',
  '1100110',
  '1101100',
  '1000010',
  '1011100',
  '1001110',
  '1010000',
  '1000100',
  '1001000',
  '1110100',
] as const;
const EAN_PARITY = [
  'LLLLLL',
  'LLGLGG',
  'LLGGLG',
  'LLGGGL',
  'LGLLGG',
  'LGGLLG',
  'LGGGLL',
  'LGLGLG',
  'LGLGGL',
  'LGGLGL',
] as const;

export function jEncodeBarcode(options: JBarcodeEncodeOptions): JBarcodeGraphic {
  const value = String(options.value ?? '');
  const quietZone = Math.max(
    0,
    Math.floor(options.quietZone ?? defaultQuietZone(options.symbology)),
  );
  const issues = jValidateBarcode(
    options.symbology,
    value,
    options.foreground ?? '#000000',
    options.background ?? '#ffffff',
  );
  if (issues.some((issue) => issue.severity === 'error')) {
    return {
      symbology: options.symbology,
      encodedValue: value,
      path: '',
      viewBoxWidth: 1,
      viewBoxHeight: 1,
      issues,
    };
  }

  try {
    if (options.symbology === 'qr') {
      const qr = jEncodeQrMatrix(value, options.errorCorrection ?? 'M');
      const count = qr.size;
      let path = '';
      for (let row = 0; row < count; row += 1) {
        let start = -1;
        for (let column = 0; column <= count; column += 1) {
          const dark = column < count && qr.modules[row][column];
          if (dark && start < 0) start = column;
          if (!dark && start >= 0) {
            path += `M${start + quietZone} ${row + quietZone}h${column - start}v1h-${column - start}z`;
            start = -1;
          }
        }
      }
      const size = count + quietZone * 2;
      return {
        symbology: 'qr',
        encodedValue: value,
        path,
        viewBoxWidth: size,
        viewBoxHeight: size,
        issues,
      };
    }

    const linear = options.symbology === 'ean13' ? encodeEan13(value) : encodeCode128B(value);
    return {
      symbology: options.symbology,
      encodedValue: linear.encodedValue,
      path: bitsToPath(linear.bits, quietZone),
      viewBoxWidth: linear.bits.length + quietZone * 2,
      viewBoxHeight: 50,
      issues,
    };
  } catch {
    const oversized: JBarcodeIssue = {
      code: 'oversized',
      message: 'The value is too large for the selected barcode settings.',
      severity: 'error',
    };
    return {
      symbology: options.symbology,
      encodedValue: value,
      path: '',
      viewBoxWidth: 1,
      viewBoxHeight: 1,
      issues: [...issues, oversized],
    };
  }
}

export function jValidateBarcode(
  symbology: JBarcodeSymbology,
  value: string,
  foreground = '#000000',
  background = '#ffffff',
): readonly JBarcodeIssue[] {
  const issues: JBarcodeIssue[] = [];
  if (!value) issues.push(error('empty', 'Provide a value to encode.'));
  if (symbology === 'code128' && /[^\x20-\x7e]/.test(value)) {
    issues.push(
      error('unsupported-character', 'Code 128 B supports printable ASCII characters 32–126.'),
    );
  }
  if (symbology === 'code128' && value.length > 160) {
    issues.push(error('oversized', 'Code 128 values are limited to 160 characters.'));
  }
  if (symbology === 'ean13') {
    if (!/^\d{12,13}$/.test(value)) {
      issues.push(error('invalid-length', 'EAN-13 requires exactly 12 or 13 decimal digits.'));
    } else if (value.length === 13 && Number(value[12]) !== jEan13Checksum(value.slice(0, 12))) {
      issues.push(
        error('invalid-checksum', 'The EAN-13 check digit does not match the first 12 digits.'),
      );
    }
  }
  if (symbology === 'qr' && utf8ByteLength(value) > 2_953) {
    issues.push(error('oversized', 'QR byte values are limited to 2,953 UTF-8 bytes.'));
  }

  const foregroundRgb = parseHexColor(foreground);
  const backgroundRgb = parseHexColor(background);
  if (!foregroundRgb || !backgroundRgb) {
    issues.push(
      error('invalid-color', 'Foreground and background must use #RGB or #RRGGBB colors.'),
    );
  } else if (contrastRatio(foregroundRgb, backgroundRgb) < 3) {
    issues.push({
      code: 'low-contrast',
      message: 'Foreground and background contrast is below 3:1 and may not scan reliably.',
      severity: 'warning',
    });
  }
  return issues;
}

export function jEan13Checksum(firstTwelveDigits: string): number {
  if (!/^\d{12}$/.test(firstTwelveDigits)) return Number.NaN;
  const sum = [...firstTwelveDigits].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return (10 - (sum % 10)) % 10;
}

export function jBarcodeSvg(
  graphic: JBarcodeGraphic,
  foreground = '#000000',
  background = '#ffffff',
  ariaLabel = 'Barcode',
): string {
  const label = escapeXml(ariaLabel);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${graphic.viewBoxWidth} ${graphic.viewBoxHeight}" role="img" aria-label="${label}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${escapeXml(background)}"/><path d="${graphic.path}" fill="${escapeXml(foreground)}" aria-hidden="true"/></svg>`;
}

function encodeCode128B(value: string): { readonly bits: string; readonly encodedValue: string } {
  const codes = [...value].map((character) => character.charCodeAt(0) - 32);
  const checksum = (104 + codes.reduce((sum, code, index) => sum + code * (index + 1), 0)) % 103;
  const sequence = [104, ...codes, checksum, 106];
  let bits = '';
  for (const code of sequence) {
    const pattern = CODE128_PATTERNS[code];
    let bar = true;
    for (const width of pattern) {
      bits += (bar ? '1' : '0').repeat(Number(width));
      bar = !bar;
    }
  }
  return { bits, encodedValue: value };
}

function encodeEan13(value: string): { readonly bits: string; readonly encodedValue: string } {
  const normalized = value.length === 12 ? `${value}${jEan13Checksum(value)}` : value;
  const parity = EAN_PARITY[Number(normalized[0])];
  let bits = '101';
  for (let index = 1; index <= 6; index += 1) {
    const digit = Number(normalized[index]);
    bits += parity[index - 1] === 'L' ? EAN_L[digit] : EAN_G[digit];
  }
  bits += '01010';
  for (let index = 7; index <= 12; index += 1) bits += EAN_R[Number(normalized[index])];
  return { bits: `${bits}101`, encodedValue: normalized };
}

function bitsToPath(bits: string, quietZone: number): string {
  let path = '';
  let start = -1;
  for (let index = 0; index <= bits.length; index += 1) {
    if (bits[index] === '1' && start < 0) start = index;
    if (bits[index] !== '1' && start >= 0) {
      path += `M${start + quietZone} 0h${index - start}v50h-${index - start}z`;
      start = -1;
    }
  }
  return path;
}

function defaultQuietZone(symbology: JBarcodeSymbology): number {
  return symbology === 'qr' ? 4 : 10;
}

function error(code: JBarcodeIssue['code'], message: string): JBarcodeIssue {
  return { code, message, severity: 'error' };
}

function parseHexColor(value: string): readonly [number, number, number] | null {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value);
  if (!match) return null;
  const hex = match[1].length === 3 ? [...match[1]].map((part) => part + part).join('') : match[1];
  return [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)) as unknown as [
    number,
    number,
    number,
  ];
}

function contrastRatio(
  first: readonly [number, number, number],
  second: readonly [number, number, number],
): number {
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

function luminance(rgb: readonly [number, number, number]): number {
  return rgb
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[character];
  });
}

function utf8ByteLength(value: string): number {
  let length = 0;
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    length += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
  }
  return length;
}

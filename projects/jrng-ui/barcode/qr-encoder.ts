import type { JQrErrorCorrection } from './barcode';

export interface JQrMatrix {
  readonly size: number;
  readonly modules: readonly (readonly boolean[])[];
}

const ECC_CODEWORDS_PER_BLOCK: Readonly<Record<JQrErrorCorrection, readonly number[]>> = {
  L: [
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30,
    30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  M: [
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  ],
  Q: [
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30,
    30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  H: [
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
};

const ERROR_CORRECTION_BLOCKS: Readonly<Record<JQrErrorCorrection, readonly number[]>> = {
  L: [
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14,
    15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ],
  M: [
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23,
    25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ],
  Q: [
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34,
    34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ],
  H: [
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35,
    37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81,
  ],
};

const FORMAT_BITS: Readonly<Record<JQrErrorCorrection, number>> = { L: 1, M: 0, Q: 3, H: 2 };

export function jEncodeQrMatrix(value: string, errorCorrection: JQrErrorCorrection): JQrMatrix {
  const bytes = utf8Bytes(value);
  const version = selectVersion(bytes.length, errorCorrection);
  if (!version) throw new RangeError('QR payload is too large.');
  const dataCodewords = createDataCodewords(bytes, version, errorCorrection);
  const allCodewords = addErrorCorrection(dataCodewords, version, errorCorrection);
  return createBestMatrix(allCodewords, version, errorCorrection);
}

function selectVersion(byteLength: number, level: JQrErrorCorrection): number {
  for (let version = 1; version <= 40; version += 1) {
    const countBits = version <= 9 ? 8 : 16;
    if (byteLength >= 1 << countBits) continue;
    const requiredBits = 4 + countBits + byteLength * 8;
    if (requiredBits <= dataCodewordCount(version, level) * 8) return version;
  }
  return 0;
}

function createDataCodewords(
  bytes: readonly number[],
  version: number,
  level: JQrErrorCorrection,
): number[] {
  const capacity = dataCodewordCount(version, level) * 8;
  const bits: number[] = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, version <= 9 ? 8 : 16);
  for (const byte of bytes) appendBits(bits, byte, 8);
  for (let index = 0; index < Math.min(4, capacity - bits.length); index += 1) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const result: number[] = [];
  for (let index = 0; index < bits.length; index += 8) {
    result.push(bits.slice(index, index + 8).reduce((value, bit) => (value << 1) | bit, 0));
  }
  for (let pad = 0; result.length < capacity / 8; pad += 1) result.push(pad % 2 ? 0x11 : 0xec);
  return result;
}

function addErrorCorrection(
  data: readonly number[],
  version: number,
  level: JQrErrorCorrection,
): number[] {
  const blockCount = ERROR_CORRECTION_BLOCKS[level][version];
  const eccLength = ECC_CODEWORDS_PER_BLOCK[level][version];
  const rawCount = Math.floor(rawDataModuleCount(version) / 8);
  const shortBlockCount = blockCount - (rawCount % blockCount);
  const shortBlockLength = Math.floor(rawCount / blockCount);
  const divisor = reedSolomonDivisor(eccLength);
  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];
  let offset = 0;
  for (let block = 0; block < blockCount; block += 1) {
    const length = shortBlockLength - eccLength + (block < shortBlockCount ? 0 : 1);
    const current = data.slice(offset, offset + length);
    offset += length;
    dataBlocks.push([...current]);
    eccBlocks.push(reedSolomonRemainder(current, divisor));
  }
  const result: number[] = [];
  const longestDataBlock = Math.max(...dataBlocks.map((block) => block.length));
  for (let index = 0; index < longestDataBlock; index += 1) {
    for (const block of dataBlocks) if (index < block.length) result.push(block[index]);
  }
  for (let index = 0; index < eccLength; index += 1) {
    for (const block of eccBlocks) result.push(block[index]);
  }
  return result;
}

function createBestMatrix(
  codewords: readonly number[],
  version: number,
  level: JQrErrorCorrection,
): JQrMatrix {
  let best: boolean[][] = [];
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let mask = 0; mask < 8; mask += 1) {
    const matrix = createMatrix(codewords, version, level, mask);
    const penalty = penaltyScore(matrix);
    if (penalty < bestPenalty) {
      best = matrix;
      bestPenalty = penalty;
    }
  }
  return { size: best.length, modules: best };
}

function createMatrix(
  codewords: readonly number[],
  version: number,
  level: JQrErrorCorrection,
  mask: number,
): boolean[][] {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const functions = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const setFunction = (x: number, y: number, dark: boolean): void => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    modules[y][x] = dark;
    functions[y][x] = true;
  };

  for (let index = 0; index < size; index += 1) {
    setFunction(6, index, index % 2 === 0);
    setFunction(index, 6, index % 2 === 0);
  }
  drawFinder(setFunction, 3, 3);
  drawFinder(setFunction, size - 4, 3);
  drawFinder(setFunction, 3, size - 4);
  const alignments = alignmentPositions(version);
  for (let row = 0; row < alignments.length; row += 1) {
    for (let column = 0; column < alignments.length; column += 1) {
      if (
        (row === 0 && column === 0) ||
        (row === 0 && column === alignments.length - 1) ||
        (row === alignments.length - 1 && column === 0)
      )
        continue;
      drawAlignment(setFunction, alignments[column], alignments[row]);
    }
  }
  drawFormat(setFunction, size, level, mask);
  if (version >= 7) drawVersion(setFunction, size, version);

  const bits = codewords.flatMap((byte) =>
    Array.from({ length: 8 }, (_, bit) => (byte >>> (7 - bit)) & 1),
  );
  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < size; vertical += 1) {
      const y = upward ? size - 1 - vertical : vertical;
      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (functions[y][x]) continue;
        const dark = (bits[bitIndex] ?? 0) !== 0;
        modules[y][x] = dark !== maskBit(mask, x, y);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
  return modules;
}

function drawFinder(
  set: (x: number, y: number, dark: boolean) => void,
  centerX: number,
  centerY: number,
): void {
  for (let y = -4; y <= 4; y += 1) {
    for (let x = -4; x <= 4; x += 1) {
      const distance = Math.max(Math.abs(x), Math.abs(y));
      set(centerX + x, centerY + y, distance !== 2 && distance !== 4);
    }
  }
}

function drawAlignment(
  set: (x: number, y: number, dark: boolean) => void,
  centerX: number,
  centerY: number,
): void {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1)
      set(centerX + x, centerY + y, Math.max(Math.abs(x), Math.abs(y)) !== 1);
  }
}

function drawFormat(
  set: (x: number, y: number, dark: boolean) => void,
  size: number,
  level: JQrErrorCorrection,
  mask: number,
): void {
  const data = (FORMAT_BITS[level] << 3) | mask;
  let remainder = data;
  for (let index = 0; index < 10; index += 1)
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  const bits = ((data << 10) | remainder) ^ 0x5412;
  const bit = (index: number): boolean => ((bits >>> index) & 1) !== 0;
  for (let index = 0; index <= 5; index += 1) set(8, index, bit(index));
  set(8, 7, bit(6));
  set(8, 8, bit(7));
  set(7, 8, bit(8));
  for (let index = 9; index < 15; index += 1) set(14 - index, 8, bit(index));
  for (let index = 0; index < 8; index += 1) set(size - 1 - index, 8, bit(index));
  for (let index = 8; index < 15; index += 1) set(8, size - 15 + index, bit(index));
  set(8, size - 8, true);
}

function drawVersion(
  set: (x: number, y: number, dark: boolean) => void,
  size: number,
  version: number,
): void {
  let remainder = version;
  for (let index = 0; index < 12; index += 1)
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  const bits = (version << 12) | remainder;
  for (let index = 0; index < 18; index += 1) {
    const dark = ((bits >>> index) & 1) !== 0;
    const a = size - 11 + (index % 3);
    const b = Math.floor(index / 3);
    set(a, b, dark);
    set(b, a, dark);
  }
}

function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + count * 2 + 1) / (count * 2 - 2)) * 2;
  const result = [6];
  for (let position = version * 4 + 10; result.length < count; position -= step)
    result.splice(1, 0, position);
  return result;
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function penaltyScore(modules: readonly (readonly boolean[])[]): number {
  const size = modules.length;
  let result = 0;
  const scoreLine = (line: readonly boolean[]): number => {
    let score = 0;
    let run = 1;
    for (let index = 1; index < line.length; index += 1) {
      if (line[index] === line[index - 1]) run += 1;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    if (run >= 5) score += run - 2;
    const text = line.map((dark) => (dark ? '1' : '0')).join('');
    for (let index = 0; index <= text.length - 11; index += 1) {
      const pattern = text.slice(index, index + 11);
      if (pattern === '00001011101' || pattern === '10111010000') score += 40;
    }
    return score;
  };
  for (let index = 0; index < size; index += 1) {
    result += scoreLine(modules[index]);
    result += scoreLine(modules.map((row) => row[index]));
  }
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const color = modules[y][x];
      if (
        modules[y][x + 1] === color &&
        modules[y + 1][x] === color &&
        modules[y + 1][x + 1] === color
      )
        result += 3;
    }
  }
  const dark = modules.reduce((total, row) => total + row.filter(Boolean).length, 0);
  result += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
  return result;
}

function reedSolomonDivisor(degree: number): number[] {
  const result = Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let index = 0; index < degree; index += 1) {
    for (let coefficient = 0; coefficient < result.length; coefficient += 1) {
      result[coefficient] = gfMultiply(result[coefficient], root);
      if (coefficient + 1 < result.length) result[coefficient] ^= result[coefficient + 1];
    }
    root = gfMultiply(root, 2);
  }
  return result;
}

function reedSolomonRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const result = Array<number>(divisor.length).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift()!;
    result.push(0);
    for (let index = 0; index < result.length; index += 1)
      result[index] ^= gfMultiply(divisor[index], factor);
  }
  return result;
}

function gfMultiply(left: number, right: number): number {
  let result = 0;
  for (let bit = 7; bit >= 0; bit -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    if (((right >>> bit) & 1) !== 0) result ^= left;
  }
  return result;
}

function dataCodewordCount(version: number, level: JQrErrorCorrection): number {
  return (
    Math.floor(rawDataModuleCount(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK[level][version] * ERROR_CORRECTION_BLOCKS[level][version]
  );
}

function rawDataModuleCount(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const alignmentCount = Math.floor(version / 7) + 2;
    result -= (25 * alignmentCount - 10) * alignmentCount - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function appendBits(target: number[], value: number, length: number): void {
  for (let bit = length - 1; bit >= 0; bit -= 1) target.push((value >>> bit) & 1);
}

function utf8Bytes(value: string): number[] {
  const result: number[] = [];
  for (const character of value) {
    const point = character.codePointAt(0)!;
    if (point <= 0x7f) result.push(point);
    else if (point <= 0x7ff) result.push(0xc0 | (point >>> 6), 0x80 | (point & 0x3f));
    else if (point <= 0xffff)
      result.push(0xe0 | (point >>> 12), 0x80 | ((point >>> 6) & 0x3f), 0x80 | (point & 0x3f));
    else
      result.push(
        0xf0 | (point >>> 18),
        0x80 | ((point >>> 12) & 0x3f),
        0x80 | ((point >>> 6) & 0x3f),
        0x80 | (point & 0x3f),
      );
  }
  return result;
}

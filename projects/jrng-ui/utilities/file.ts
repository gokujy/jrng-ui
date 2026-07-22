import { sanitizeFilename } from './string';

export interface JFileValidationOptions {
  readonly maxSize?: number;
  readonly types?: readonly string[];
}
export interface JFileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ('size' | 'type')[];
}

export function getFileExtension(filename: string): string {
  const name = filename.split(/[\\/]/).pop() ?? '';
  const index = name.lastIndexOf('.');
  return index > 0 && index < name.length - 1 ? name.slice(index + 1).toLocaleLowerCase() : '';
}

export function validateFile(
  file: Pick<File, 'name' | 'size' | 'type'>,
  options: JFileValidationOptions,
): JFileValidationResult {
  const errors: ('size' | 'type')[] = [];
  if (options.maxSize != null && file.size > options.maxSize) errors.push('size');
  if (
    options.types?.length &&
    !options.types.some((type) =>
      type.startsWith('.')
        ? getFileExtension(file.name) === type.slice(1).toLocaleLowerCase()
        : type.endsWith('/*')
          ? file.type.startsWith(type.slice(0, -1))
          : file.type === type,
    )
  )
    errors.push('type');
  return { valid: errors.length === 0, errors };
}

export function convertBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let index = -1;
  do {
    value /= 1024;
    index += 1;
  } while (value >= 1024 && index < units.length - 1);
  return `${value.toFixed(fractionDigits)} ${units[index]}`;
}

export function generateDownloadFilename(base: string, extension?: string): string {
  const safe = sanitizeFilename(base);
  const ext = (extension ?? '').replace(/^\./, '').toLocaleLowerCase();
  return ext && getFileExtension(safe) !== ext ? `${safe}.${ext}` : safe;
}

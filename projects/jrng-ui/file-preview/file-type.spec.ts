import { describe, expect, it } from 'vitest';
import { formatFileSize, getFileExtension, resolveFileType } from './file-type';

describe('file type utilities', () => {
  it('uses MIME type before the extension', () => {
    expect(resolveFileType({ fileName: 'preview.bin', mimeType: 'image/webp' }).category).toBe(
      'image',
    );
  });

  it('resolves common business file extensions', () => {
    expect(resolveFileType({ fileName: 'report.final.XLSX' }).category).toBe('spreadsheet');
    expect(resolveFileType({ fileName: 'contract.pdf' }).previewable).toBe(true);
    expect(resolveFileType({ fileName: 'backup.tar.gz' }).category).toBe('archive');
    expect(resolveFileType({ fileName: 'no-extension' }).category).toBe('file');
  });

  it('handles paths, dot files and readable sizes', () => {
    expect(getFileExtension('folder/report.final.pdf')).toBe('pdf');
    expect(getFileExtension('.env')).toBe('');
    expect(formatFileSize(1536, 'en-US')).toBe('1.5 KB');
  });
});

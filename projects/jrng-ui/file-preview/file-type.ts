export type JFileCategory =
  | 'folder'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'text'
  | 'code'
  | 'email'
  | 'file';

export interface JFileTypeInput {
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly kind?: 'file' | 'folder';
}

export interface JFileTypePresentation {
  readonly category: JFileCategory;
  readonly extension: string;
  readonly icon: string;
  readonly label: string;
  readonly previewable: boolean;
}

const EXTENSIONS: Readonly<Record<string, JFileCategory>> = {
  pdf: 'pdf',
  doc: 'document',
  docx: 'document',
  odt: 'document',
  rtf: 'document',
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  csv: 'spreadsheet',
  ods: 'spreadsheet',
  ppt: 'presentation',
  pptx: 'presentation',
  odp: 'presentation',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  avif: 'image',
  bmp: 'image',
  svg: 'image',
  mp4: 'video',
  webm: 'video',
  mov: 'video',
  avi: 'video',
  mkv: 'video',
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  m4a: 'audio',
  flac: 'audio',
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  txt: 'text',
  md: 'text',
  log: 'text',
  json: 'code',
  xml: 'code',
  html: 'code',
  css: 'code',
  scss: 'code',
  js: 'code',
  ts: 'code',
  eml: 'email',
  msg: 'email',
};

const PRESENTATIONS: Readonly<Record<JFileCategory, Omit<JFileTypePresentation, 'extension'>>> = {
  folder: { category: 'folder', icon: 'folder', label: 'Folder', previewable: false },
  pdf: { category: 'pdf', icon: 'file-text', label: 'PDF document', previewable: true },
  document: { category: 'document', icon: 'file-text', label: 'Document', previewable: false },
  spreadsheet: { category: 'spreadsheet', icon: 'table', label: 'Spreadsheet', previewable: false },
  presentation: {
    category: 'presentation',
    icon: 'presentation',
    label: 'Presentation',
    previewable: false,
  },
  image: { category: 'image', icon: 'image', label: 'Image', previewable: true },
  video: { category: 'video', icon: 'video', label: 'Video', previewable: true },
  audio: { category: 'audio', icon: 'volume-2', label: 'Audio', previewable: true },
  archive: { category: 'archive', icon: 'archive', label: 'Archive', previewable: false },
  text: { category: 'text', icon: 'file-text', label: 'Text file', previewable: true },
  code: { category: 'code', icon: 'code', label: 'Code file', previewable: true },
  email: { category: 'email', icon: 'mail', label: 'Email file', previewable: false },
  file: { category: 'file', icon: 'file', label: 'File', previewable: false },
};

export function getFileExtension(fileName = ''): string {
  const normalized = fileName.split(/[\\/]/).pop()?.trim() ?? '';
  const dot = normalized.lastIndexOf('.');
  return dot > 0 && dot < normalized.length - 1 ? normalized.slice(dot + 1).toLowerCase() : '';
}

export function resolveFileType(input: JFileTypeInput): JFileTypePresentation {
  const extension = getFileExtension(input.fileName);
  const mimeType = input.mimeType?.toLowerCase().split(';', 1)[0]?.trim() ?? '';
  let category: JFileCategory = input.kind === 'folder' ? 'folder' : categoryFromMimeType(mimeType);
  if (category === 'file') category = EXTENSIONS[extension] ?? 'file';
  return { ...PRESENTATIONS[category], extension };
}

export function formatFileSize(size: number, locale?: string): string {
  if (!Number.isFinite(size) || size <= 0) return size === 0 ? '0 B' : '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** unitIndex;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: unitIndex === 0 ? 0 : 1 }).format(value)} ${units[unitIndex]}`;
}

function categoryFromMimeType(mimeType: string): JFileCategory {
  if (!mimeType) return 'file';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/'))
    return mimeType.includes('html') || mimeType.includes('css') ? 'code' : 'text';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv')
    return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (
    mimeType.includes('word') ||
    mimeType.includes('opendocument.text') ||
    mimeType === 'application/rtf'
  )
    return 'document';
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive'))
    return 'archive';
  if (mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('javascript'))
    return 'code';
  return 'file';
}

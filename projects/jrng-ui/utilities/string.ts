export function generateInitials(value: string, maxParts = 2): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, Math.max(1, maxParts))
    .map((part) => part[0]?.toLocaleUpperCase() ?? '')
    .join('');
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function slugify(value: string): string {
  return normalizeSearchText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sanitizeFilename(value: string, fallback = 'download'): string {
  const withoutControls = Array.from(value.normalize('NFKC'), (character) =>
    character.charCodeAt(0) < 32 ? '-' : character,
  ).join('');
  const sanitized = withoutControls
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/[. ]+$/g, '')
    .trim();
  return sanitized || fallback;
}

export function equalsIgnoreCase(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  return normalizeSearchText(left ?? '') === normalizeSearchText(right ?? '');
}

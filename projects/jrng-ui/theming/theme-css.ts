import { JThemeTokenName, JThemeTokens } from './preset.types';

const TOKEN_NAME = /^--j-[a-z0-9][a-z0-9-]*$/;

/** Return valid JRNG variables in stable lexical order. */
export function jNormalizeThemeTokens(tokens: JThemeTokens = {}): JThemeTokens {
  return Object.fromEntries(
    Object.entries(tokens)
      .filter(
        (entry): entry is [JThemeTokenName, string] =>
          TOKEN_NAME.test(entry[0]) && typeof entry[1] === 'string' && entry[1].trim().length > 0,
      )
      .sort(([left], [right]) => left.localeCompare(right)),
  ) as JThemeTokens;
}

/** Serialize variables deterministically for managed and server-rendered CSS. */
export function jThemeDeclarations(tokens: JThemeTokens = {}): string {
  return Object.entries(jNormalizeThemeTokens(tokens))
    .map(([name, value]) => `${name}:${value};`)
    .join('');
}

/** Apply variables and remove variables previously managed by the same owner. */
export function jApplyThemeTokens(
  target: HTMLElement,
  tokens: JThemeTokens,
  previous: readonly string[] = [],
): readonly string[] {
  const normalized = jNormalizeThemeTokens(tokens);
  const next = new Set(Object.keys(normalized));
  for (const name of previous) {
    if (!next.has(name)) {
      target.style.removeProperty(name);
    }
  }
  for (const [name, value] of Object.entries(normalized)) {
    if (value !== undefined) target.style.setProperty(name, value);
  }
  return [...next];
}

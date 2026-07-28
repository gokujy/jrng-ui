import { JResolvedTheme, JThemeTokens } from './preset.types';
import { jNormalizeThemeTokens } from './theme-css';

export type JPrimaryPaletteName =
  'blue' | 'indigo' | 'violet' | 'emerald' | 'teal' | 'orange' | 'rose';
export type JPaletteStep =
  '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';
export type JThemePalette = Partial<Record<JPaletteStep, string>>;
export type JPrimaryPaletteSource = JPrimaryPaletteName | JThemePalette;
export type JSurfacePaletteName = 'cool' | 'neutral' | 'warm';

export interface JSurfaceScale {
  readonly ground?: string;
  readonly section?: string;
  readonly card?: string;
  readonly overlay?: string;
  readonly border?: string;
  readonly borderStrong?: string;
  readonly muted?: string;
  readonly hover?: string;
  readonly selected?: string;
}
export interface JSurfacePalette {
  readonly light?: JSurfaceScale;
  readonly dark?: JSurfaceScale;
}
export type JSurfacePaletteSource = JSurfacePaletteName | JSurfacePalette;

const scale = (...values: string[]): JThemePalette =>
  Object.fromEntries(
    ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map(
      (step, index) => [step, values[index]],
    ),
  );

export const jPrimaryPalettes: Readonly<Record<JPrimaryPaletteName, Readonly<JThemePalette>>> = {
  blue: scale(
    '#edf6ff',
    '#d9ebff',
    '#b8d9ff',
    '#88c0fb',
    '#55a3ef',
    '#2e86db',
    '#1e6bb9',
    '#195796',
    '#194979',
    '#1a3d63',
    '#10253e',
  ),
  indigo: scale(
    '#f0f1ff',
    '#e1e3ff',
    '#c7caff',
    '#a4a8fd',
    '#8185ee',
    '#6669dc',
    '#4f52c3',
    '#40439e',
    '#373a80',
    '#30336a',
    '#1d1e3e',
  ),
  violet: scale(
    '#f7f0ff',
    '#ecddff',
    '#ddc2ff',
    '#c69cff',
    '#aa70ee',
    '#9050d5',
    '#7837b8',
    '#632d97',
    '#52277b',
    '#452466',
    '#2b113f',
  ),
  emerald: scale(
    '#eaf9f2',
    '#d2f1e2',
    '#a9e2c8',
    '#76cca9',
    '#45b187',
    '#269670',
    '#19795b',
    '#176149',
    '#174d3c',
    '#153f33',
    '#0a241d',
  ),
  teal: scale(
    '#e9f9f8',
    '#cef1ef',
    '#9fe2df',
    '#68cbc7',
    '#39ada9',
    '#208f8c',
    '#187371',
    '#175b5a',
    '#174949',
    '#163d3d',
    '#082424',
  ),
  orange: scale(
    '#fff5e9',
    '#ffe7cc',
    '#ffcd9b',
    '#faac62',
    '#ed8730',
    '#d96b16',
    '#b8520d',
    '#933f0f',
    '#763513',
    '#612e14',
    '#371606',
  ),
  rose: scale(
    '#fff0f3',
    '#ffe0e7',
    '#ffc5d1',
    '#fa9aae',
    '#ed6b87',
    '#d94a6a',
    '#ba3155',
    '#982746',
    '#7d243e',
    '#692238',
    '#3b0d1c',
  ),
};

export const jSurfacePalettes: Readonly<Record<JSurfacePaletteName, JSurfacePalette>> = {
  cool: {
    light: {
      ground: '#f5f7fa',
      section: '#eef2f6',
      card: '#ffffff',
      overlay: '#ffffff',
      border: '#d4dce6',
      borderStrong: '#b6c2d0',
      muted: '#eef2f6',
      hover: '#e8edf3',
      selected: '#e1e9f4',
    },
    dark: {
      ground: '#0d1520',
      section: '#14202d',
      card: '#121d29',
      overlay: '#182534',
      border: '#2c3c4c',
      borderStrong: '#485c6e',
      muted: '#1b2937',
      hover: '#223443',
      selected: '#253c50',
    },
  },
  neutral: {
    light: {
      ground: '#f7f7f7',
      section: '#efefef',
      card: '#ffffff',
      overlay: '#ffffff',
      border: '#d6d6d6',
      borderStrong: '#b9b9b9',
      muted: '#eeeeee',
      hover: '#e8e8e8',
      selected: '#e3e5e8',
    },
    dark: {
      ground: '#141414',
      section: '#1c1c1c',
      card: '#1a1a1a',
      overlay: '#222222',
      border: '#383838',
      borderStrong: '#575757',
      muted: '#262626',
      hover: '#303030',
      selected: '#36383d',
    },
  },
  warm: {
    light: {
      ground: '#faf8f4',
      section: '#f2eee7',
      card: '#fffefa',
      overlay: '#ffffff',
      border: '#ded6ca',
      borderStrong: '#c0b4a4',
      muted: '#f2eee7',
      hover: '#ede7dd',
      selected: '#eee4d5',
    },
    dark: {
      ground: '#17130f',
      section: '#211b16',
      card: '#1e1914',
      overlay: '#28211a',
      border: '#40362c',
      borderStrong: '#625345',
      muted: '#2a231c',
      hover: '#352c23',
      selected: '#403326',
    },
  },
};

export function jResolvePrimaryPalette(
  source?: JPrimaryPaletteSource,
): Readonly<JThemePalette> | undefined {
  if (!source) return undefined;
  if (typeof source === 'string') return jPrimaryPalettes[source] ?? jPrimaryPalettes.indigo;
  const supplied = Object.fromEntries(
    Object.entries(source).filter(([, value]) => typeof value === 'string' && value.trim()),
  );
  return { ...jPrimaryPalettes.indigo, ...supplied };
}

function primaryTokens(palette: Readonly<JThemePalette>, dark: boolean): JThemeTokens {
  const primary = palette[dark ? '400' : '600'] ?? palette['500']!;
  const hover = palette[dark ? '300' : '700'] ?? primary;
  const active = palette[dark ? '200' : '800'] ?? hover;
  const soft = palette[dark ? '900' : '50'] ?? palette[dark ? '800' : '100']!;
  return {
    '--j-color-primary': primary,
    '--j-color-primary-hover': hover,
    '--j-color-primary-active': active,
    '--j-color-primary-soft': soft,
    '--j-color-primary-foreground': dark ? (palette['950'] ?? '#101827') : '#ffffff',
    '--j-color-ring': `color-mix(in srgb, ${primary} ${dark ? '42%' : '34%'}, transparent)`,
    '--j-color-selected-background': `color-mix(in srgb, ${primary} ${dark ? '24%' : '13%'}, var(--j-color-card))`,
  };
}

function surfaceTokens(source: JSurfacePaletteSource | undefined, dark: boolean): JThemeTokens {
  if (!source) return {};
  const palette =
    typeof source === 'string' ? (jSurfacePalettes[source] ?? jSurfacePalettes.cool) : source;
  const value = dark ? palette.dark : palette.light;
  if (!value) return {};
  return jNormalizeThemeTokens({
    '--j-color-background': value.ground,
    '--j-color-page': value.ground,
    '--j-color-muted': value.muted ?? value.section,
    '--j-color-card': value.card,
    '--j-color-popover': value.overlay,
    '--j-color-surface': value.card,
    '--j-color-surface-elevated': value.overlay,
    '--j-color-surface-muted': value.muted ?? value.section,
    '--j-color-surface-subtle': value.section,
    '--j-color-border': value.border,
    '--j-color-input': value.border,
    '--j-color-border-strong': value.borderStrong,
    '--j-color-hover-background': value.hover,
    '--j-color-selected-background': value.selected,
  });
}

/** Apply palettes after preset values and before explicit semantic overrides. */
export function jApplyThemePalettes(
  resolved: JResolvedTheme,
  primary?: JPrimaryPaletteSource,
  surface?: JSurfacePaletteSource,
): JResolvedTheme {
  const palette = jResolvePrimaryPalette(primary);
  return {
    ...resolved,
    light: jNormalizeThemeTokens({
      ...resolved.light,
      ...surfaceTokens(surface, false),
      ...(palette ? primaryTokens(palette, false) : {}),
    }),
    dark: jNormalizeThemeTokens({
      ...resolved.dark,
      ...surfaceTokens(surface, true),
      ...(palette ? primaryTokens(palette, true) : {}),
    }),
  };
}

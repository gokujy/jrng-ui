import { JThemePreset } from '../preset.types';

/**
 * Built-in JRNG UI theme presets. Each overrides the primary palette (and its
 * hover/active/foreground/ring tokens) for light and dark modes. Values are
 * standard open palette shades — apply via `JThemeService.setPreset(...)` or
 * `provideJrngTheme({ preset })`, or author your own {@link JThemePreset}.
 */

export const indigoPreset: JThemePreset = {
  name: 'indigo',
  light: {
    '--j-color-primary': '#4f46e5',
    '--j-color-primary-hover': '#4338ca',
    '--j-color-primary-active': '#3730a3',
    '--j-color-primary-foreground': '#ffffff',
    '--j-color-ring': 'rgb(79 70 229 / 28%)',
  },
  dark: {
    '--j-color-primary': '#818cf8',
    '--j-color-primary-hover': '#a5b4fc',
    '--j-color-primary-active': '#6366f1',
    '--j-color-primary-foreground': '#1e1b4b',
    '--j-color-ring': 'rgb(129 140 248 / 34%)',
  },
};

export const violetPreset: JThemePreset = {
  name: 'violet',
  light: {
    '--j-color-primary': '#7c3aed',
    '--j-color-primary-hover': '#6d28d9',
    '--j-color-primary-active': '#5b21b6',
    '--j-color-primary-foreground': '#ffffff',
    '--j-color-ring': 'rgb(124 58 237 / 28%)',
  },
  dark: {
    '--j-color-primary': '#a78bfa',
    '--j-color-primary-hover': '#c4b5fd',
    '--j-color-primary-active': '#8b5cf6',
    '--j-color-primary-foreground': '#1e1b4b',
    '--j-color-ring': 'rgb(167 139 250 / 34%)',
  },
};

export const emeraldPreset: JThemePreset = {
  name: 'emerald',
  light: {
    '--j-color-primary': '#059669',
    '--j-color-primary-hover': '#047857',
    '--j-color-primary-active': '#065f46',
    '--j-color-primary-foreground': '#ffffff',
    '--j-color-ring': 'rgb(5 150 105 / 28%)',
  },
  dark: {
    '--j-color-primary': '#34d399',
    '--j-color-primary-hover': '#6ee7b7',
    '--j-color-primary-active': '#10b981',
    '--j-color-primary-foreground': '#022c22',
    '--j-color-ring': 'rgb(52 211 153 / 34%)',
  },
};

export const rosePreset: JThemePreset = {
  name: 'rose',
  light: {
    '--j-color-primary': '#e11d48',
    '--j-color-primary-hover': '#be123c',
    '--j-color-primary-active': '#9f1239',
    '--j-color-primary-foreground': '#ffffff',
    '--j-color-ring': 'rgb(225 29 72 / 28%)',
  },
  dark: {
    '--j-color-primary': '#fb7185',
    '--j-color-primary-hover': '#fda4af',
    '--j-color-primary-active': '#f43f5e',
    '--j-color-primary-foreground': '#4c0519',
    '--j-color-ring': 'rgb(251 113 133 / 34%)',
  },
};

export const amberPreset: JThemePreset = {
  name: 'amber',
  light: {
    '--j-color-primary': '#d97706',
    '--j-color-primary-hover': '#b45309',
    '--j-color-primary-active': '#92400e',
    '--j-color-primary-foreground': '#ffffff',
    '--j-color-ring': 'rgb(217 119 6 / 28%)',
  },
  dark: {
    '--j-color-primary': '#fbbf24',
    '--j-color-primary-hover': '#fcd34d',
    '--j-color-primary-active': '#f59e0b',
    '--j-color-primary-foreground': '#451a03',
    '--j-color-ring': 'rgb(251 191 36 / 34%)',
  },
};

export const skyPreset: JThemePreset = {
  name: 'sky',
  light: {
    '--j-color-primary': '#0284c7',
    '--j-color-primary-hover': '#0369a1',
    '--j-color-primary-active': '#075985',
    '--j-color-primary-foreground': '#ffffff',
    '--j-color-ring': 'rgb(2 132 199 / 28%)',
  },
  dark: {
    '--j-color-primary': '#38bdf8',
    '--j-color-primary-hover': '#7dd3fc',
    '--j-color-primary-active': '#0ea5e9',
    '--j-color-primary-foreground': '#082f49',
    '--j-color-ring': 'rgb(56 189 248 / 34%)',
  },
};

/** Name of a built-in preset. */
export type JThemePresetName = 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber' | 'sky';

/** Registry of all built-in presets, keyed by name. */
export const jThemePresets: Record<JThemePresetName, JThemePreset> = {
  indigo: indigoPreset,
  violet: violetPreset,
  emerald: emeraldPreset,
  rose: rosePreset,
  amber: amberPreset,
  sky: skyPreset,
};

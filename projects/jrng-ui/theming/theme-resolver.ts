import { JComponentThemeTokens, JResolvedTheme, JThemePreset, JThemeTokens } from './preset.types';
import { jNormalizeThemeTokens } from './theme-css';
import { jPresetId } from './theme-registry';

function flatten(components?: JComponentThemeTokens): JThemeTokens {
  return Object.keys(components ?? {})
    .sort()
    .reduce<JThemeTokens>((tokens, name) => ({ ...tokens, ...(components?.[name] ?? {}) }), {});
}

function aliases(tokens: JThemeTokens, mapping?: JThemePreset['aliases']): JThemeTokens {
  const values = { ...tokens };
  for (const [alias, canonical] of Object.entries(mapping ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    values[alias as `--j-${string}`] = `var(${canonical})`;
  }
  return values;
}

/** Resolve all three layers into stable light and dark variable maps. */
export function jResolveTheme(preset: JThemePreset): JResolvedTheme {
  const shared = {
    ...preset.primitive,
    ...preset.semantic,
    ...flatten(preset.components),
  };
  return {
    preset,
    presetId: jPresetId(preset),
    light: jNormalizeThemeTokens(
      aliases({ ...shared, ...preset.light, ...flatten(preset.lightComponents) }, preset.aliases),
    ),
    dark: jNormalizeThemeTokens(
      aliases({ ...shared, ...preset.dark, ...flatten(preset.darkComponents) }, preset.aliases),
    ),
  };
}

export function jMergeThemeOverrides(
  base: JThemeTokens,
  tokens?: JThemeTokens,
  components?: JComponentThemeTokens,
): JThemeTokens {
  return jNormalizeThemeTokens({ ...base, ...tokens, ...flatten(components) });
}

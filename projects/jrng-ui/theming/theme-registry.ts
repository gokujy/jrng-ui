import { Injectable } from '@angular/core';
import { JThemePreset, JThemePresetSource } from './preset.types';
import { defaultPreset } from './presets/default.preset';
import { materialPreset } from './presets/material.preset';
import { nexusPreset } from './presets/nexus.preset';

/** @deprecated Default is now a complete official preset. */
export const J_EMPTY_DEFAULT_PRESET: JThemePreset = defaultPreset;

export function jPresetId(preset: JThemePreset): string {
  return (preset.id ?? preset.name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Tree-shakable registry for official and application-owned presets. */
@Injectable({ providedIn: 'root' })
export class JThemePresetRegistry {
  private readonly presets = new Map<string, JThemePreset>([
    ['default', J_EMPTY_DEFAULT_PRESET],
    ['material', materialPreset],
    ['nexus', nexusPreset],
  ]);

  register(preset: JThemePreset): () => void {
    const id = jPresetId(preset);
    if (!id) {
      throw new Error('JRNG theme presets require a non-empty name or id.');
    }
    const previous = this.presets.get(id);
    this.presets.set(id, preset);
    return () => {
      if (this.presets.get(id) !== preset) return;
      if (previous) {
        this.presets.set(id, previous);
      } else {
        this.presets.delete(id);
      }
    };
  }

  get(id: string): JThemePreset | undefined {
    return this.presets.get(id.trim().toLowerCase());
  }

  resolve(source: JThemePresetSource | undefined): JThemePreset {
    if (typeof source === 'object') return source;
    return this.get(source ?? 'default') ?? this.get('default') ?? J_EMPTY_DEFAULT_PRESET;
  }

  has(id: string): boolean {
    return this.presets.has(id.trim().toLowerCase());
  }

  list(): readonly JThemePreset[] {
    return [...this.presets.values()];
  }
}

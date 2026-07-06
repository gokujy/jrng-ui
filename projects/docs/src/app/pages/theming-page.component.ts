import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JButtonComponent } from 'jrng-ui/button';
import { JCardComponent } from 'jrng-ui/card';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JInputComponent } from 'jrng-ui/input';
import { JSelectComponent } from 'jrng-ui/select';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JTagComponent } from 'jrng-ui/tag';
import { JThemeMode } from 'jrng-ui/core';
import { JThemePresetName, JThemeService, jThemePresets } from 'jrng-ui/theming';

@Component({
  selector: 'app-theming-page',
  imports: [
    JButtonComponent,
    JInputComponent,
    JSelectComponent,
    JCheckboxComponent,
    JSwitchComponent,
    JBadgeComponent,
    JTagComponent,
    JCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-container">
      <section class="docs-section">
        <span class="docs-eyebrow">Theming</span>
        <h1>Design-token theming playground</h1>
        <p class="docs-lead">
          JRNG UI ships a runtime theming API. Pick a mode and preset below — every component on
          this page (and the whole site) updates live via <code>JThemeService</code>.
        </p>
      </section>

      <section class="docs-section">
        <h2>Mode</h2>
        <div class="docs-chips">
          @for (option of modes; track option) {
            <button
              class="docs-chip"
              type="button"
              [class.is-active]="mode() === option"
              (click)="setMode(option)"
            >
              {{ label(option) }}
            </button>
          }
        </div>
        <p class="docs-lead">
          Active: <strong>{{ label(mode()) }}</strong> — resolved to
          <strong>{{ isDark() ? 'dark' : 'light' }}</strong
          >.
        </p>
      </section>

      <section class="docs-section">
        <h2>Preset</h2>
        <div class="docs-chips">
          @for (name of presetNames; track name) {
            <button
              class="docs-chip"
              type="button"
              [class.is-active]="preset() === name"
              (click)="applyPreset(name)"
            >
              <span class="docs-chip__swatch" [style.background]="swatch(name)"></span>
              {{ name }}
            </button>
          }
        </div>
      </section>

      <section class="docs-section">
        <h2>Live components</h2>
        <div class="docs-demo">
          <j-button label="Primary" />
          <j-button label="Raised" raised="true" />
          <j-button label="Outlined" outlined="true" />
          <j-input label="Search" placeholder="Type to search" />
          <j-select label="Status" [options]="statuses" />
          <j-checkbox label="Remember me" />
          <j-switch label="Auto-sync" />
          <j-badge value="12" />
          <j-tag label="Themed" />
          <j-card title="Surface" subtitle="Reacts to tokens" bordered="true">
            <p>Cards, controls, and overlays share the active preset and mode.</p>
          </j-card>
        </div>
      </section>

      <section class="docs-section">
        <h2>Semantic tokens</h2>
        <p class="docs-lead">The CSS variables driving the current theme.</p>
        <div class="docs-tokens">
          @for (token of tokens; track token) {
            <div class="docs-token">
              <span class="docs-token__swatch" [style.background]="'var(' + token + ')'"></span>
              <span class="docs-token__name">{{ token }}</span>
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class ThemingPageComponent {
  private readonly theme = inject(JThemeService);

  readonly modes: readonly JThemeMode[] = ['light', 'dark', 'system'];
  readonly presetNames = Object.keys(jThemePresets) as JThemePresetName[];

  readonly mode = this.theme.mode;
  readonly isDark = this.theme.isDark;
  readonly preset = signal<JThemePresetName | null>(null);

  readonly statuses = ['Active', 'Pending', 'Archived'];

  readonly tokens = [
    '--j-color-primary',
    '--j-color-primary-hover',
    '--j-color-background',
    '--j-color-foreground',
    '--j-color-card',
    '--j-color-border',
    '--j-color-muted',
    '--j-color-muted-foreground',
    '--j-color-danger',
    '--j-color-ring',
  ];

  setMode(mode: JThemeMode): void {
    this.theme.setMode(mode);
  }

  applyPreset(name: JThemePresetName): void {
    this.preset.set(name);
    this.theme.setPreset(jThemePresets[name]);
  }

  swatch(name: JThemePresetName): string {
    return jThemePresets[name].light?.['--j-color-primary'] ?? 'transparent';
  }

  label(mode: JThemeMode): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }
}

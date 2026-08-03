import { isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JDrawerComponent } from 'jrng-ui/drawer';
import {
  JPrimaryPaletteName,
  JSurfacePaletteName,
  JThemeColorScheme,
  JThemePresetId,
  JThemeService,
  jPrimaryPalettes,
  jSurfacePalettes,
} from 'jrng-ui/theming';

interface DocsThemePreference {
  readonly version: 1;
  readonly preset: JThemePresetId;
  readonly mode: Exclude<JThemeColorScheme, 'system'>;
  readonly primary: JPrimaryPaletteName;
  readonly surface: JSurfacePaletteName;
}

const STORAGE_KEY = 'j-docs-theme:v1';
const DEFAULT_PREFERENCE: DocsThemePreference = {
  version: 1,
  preset: 'default',
  mode: 'light',
  primary: 'indigo',
  surface: 'cool',
};

const PRESET_DESCRIPTIONS: Readonly<Record<JThemePresetId, string>> = {
  default: 'Modern, balanced JRNG design',
  material: 'Material Design-inspired JRNG preset',
  nexus:
    'Compact enterprise preset for ERP, CRM, admin panels, dashboards and data-heavy applications',
};

@Component({
  selector: 'app-docs-theme-settings',
  imports: [TitleCasePipe, JButtonComponent, JDrawerComponent],
  template: `
    <div class="j-docs-theme-settings" [class.is-open]="open()">
      <j-button
        styleClass="j-docs-theme-settings__trigger"
        icon="settings"
        actionDisplay="icon"
        shape="square"
        variant="outlined"
        ariaLabel="Open theme settings"
        title="Open theme settings"
        ariaHasPopup="dialog"
        [ariaExpanded]="open()"
        ariaControls="j-docs-theme-panel"
        (onClick)="openPanel()"
      />
    </div>

    <j-drawer
      id="j-docs-theme-panel"
      header="Theme settings"
      subtitle="Personalize this documentation experience."
      position="right"
      width="min(26rem, 100vw)"
      [mobileBottomSheet]="false"
      [(visible)]="open"
    >
      <div class="j-docs-theme-panel">
        <section class="j-docs-theme-panel__section" aria-labelledby="j-docs-theme-primary">
          <div class="j-docs-theme-panel__heading">
            <h2 id="j-docs-theme-primary">Primary</h2>
            <span>{{ primary() | titlecase }}</span>
          </div>
          <div class="j-docs-theme-panel__swatches">
            @for (name of primaryNames; track name) {
              <button
                type="button"
                class="j-docs-theme-panel__swatch"
                [class.is-active]="primary() === name"
                [style.--j-docs-swatch]="primarySwatch(name)"
                [attr.aria-label]="'Use ' + name + ' primary palette'"
                [attr.aria-pressed]="primary() === name"
                (click)="selectPrimary(name)"
              >
                <span aria-hidden="true"></span>
                <small>{{ name | titlecase }}</small>
              </button>
            }
          </div>
        </section>

        <section class="j-docs-theme-panel__section" aria-labelledby="j-docs-theme-surface">
          <div class="j-docs-theme-panel__heading">
            <h2 id="j-docs-theme-surface">Surface</h2>
            <span>{{ surface() | titlecase }}</span>
          </div>
          <div class="j-docs-theme-panel__choices">
            @for (name of surfaceNames; track name) {
              <j-button
                [label]="name | titlecase"
                [variant]="surface() === name ? 'solid' : 'outlined'"
                [ariaPressed]="surface() === name"
                (onClick)="selectSurface(name)"
              />
            }
          </div>
        </section>

        <section class="j-docs-theme-panel__section" aria-labelledby="j-docs-theme-preset">
          <h2 id="j-docs-theme-preset">Preset</h2>
          <div class="j-docs-theme-panel__presets">
            @for (name of presetNames; track name) {
              <button
                type="button"
                class="j-docs-theme-panel__preset"
                [class.is-active]="preset() === name"
                [attr.aria-pressed]="preset() === name"
                (click)="selectPreset(name)"
              >
                <strong>{{ name | titlecase }}</strong>
                <span>{{ presetDescriptions[name] }}</span>
              </button>
            }
          </div>
        </section>

        <section class="j-docs-theme-panel__section" aria-labelledby="j-docs-theme-mode">
          <h2 id="j-docs-theme-mode">Theme Mode</h2>
          <div class="j-docs-theme-panel__choices">
            @for (name of modeNames; track name) {
              <j-button
                [label]="name | titlecase"
                [variant]="mode() === name ? 'solid' : 'outlined'"
                [ariaPressed]="mode() === name"
                (onClick)="selectMode(name)"
              />
            }
          </div>
        </section>

        <section class="j-docs-theme-panel__section j-docs-theme-panel__reset">
          <div>
            <h2>Reset Theme</h2>
            <p>Restore Default, Light, Indigo, and Cool.</p>
          </div>
          <j-button label="Reset Theme" icon="undo" variant="outlined" (onClick)="reset()" />
        </section>
      </div>
    </j-drawer>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .j-docs-theme-settings {
        display: inline-flex;
      }

      :host ::ng-deep .j-docs-theme-settings__trigger {
        background: var(--j-color-card);
        border-color: var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: var(--j-color-foreground);
        height: 2.25rem;
        padding: 0;
        width: 2.25rem;
      }

      :host ::ng-deep .j-docs-theme-settings__trigger:hover {
        border-color: var(--j-color-primary);
      }

      :host ::ng-deep .j-docs-theme-settings__trigger .j-icon {
        animation: j-docs-settings-turn 12s linear infinite;
      }

      :host ::ng-deep .j-docs-theme-settings__trigger:hover .j-icon,
      :host ::ng-deep .j-docs-theme-settings__trigger:focus-visible .j-icon {
        animation-duration: 3s;
      }

      :host ::ng-deep .j-docs-theme-settings__trigger:active {
        transform: scale(0.94);
      }

      .j-docs-theme-settings.is-open ::ng-deep .j-docs-theme-settings__trigger .j-icon {
        animation-play-state: paused;
      }

      .j-docs-theme-panel {
        display: grid;
        gap: var(--j-spacing-6);
      }

      .j-docs-theme-panel__section {
        display: grid;
        gap: var(--j-spacing-3);
      }

      .j-docs-theme-panel__section + .j-docs-theme-panel__section {
        border-top: 1px solid var(--j-color-border);
        padding-top: var(--j-spacing-5);
      }

      .j-docs-theme-panel h2,
      .j-docs-theme-panel p {
        margin: 0;
      }

      .j-docs-theme-panel h2 {
        font-size: var(--j-font-size-sm);
      }

      .j-docs-theme-panel__heading,
      .j-docs-theme-panel__reset {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-3);
        justify-content: space-between;
      }

      .j-docs-theme-panel__heading > span,
      .j-docs-theme-panel__reset p {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
      }

      .j-docs-theme-panel__swatches {
        display: grid;
        gap: var(--j-spacing-2);
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .j-docs-theme-panel__swatch {
        align-items: center;
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--j-radius-md);
        color: var(--j-color-foreground);
        cursor: pointer;
        display: grid;
        gap: var(--j-spacing-1);
        justify-items: center;
        padding: var(--j-spacing-2);
      }

      .j-docs-theme-panel__swatch > span {
        background: var(--j-docs-swatch);
        border: 1px solid color-mix(in srgb, var(--j-docs-swatch) 70%, var(--j-color-border));
        border-radius: var(--j-radius-full);
        height: 1.75rem;
        width: 1.75rem;
      }

      .j-docs-theme-panel__swatch:hover {
        background: var(--j-color-hover-background);
      }

      .j-docs-theme-panel__swatch.is-active {
        border-color: var(--j-color-primary);
      }

      .j-docs-theme-panel__swatch:focus-visible,
      .j-docs-theme-panel__preset:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-docs-theme-panel__choices {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }

      .j-docs-theme-panel__presets {
        display: grid;
        gap: var(--j-spacing-2);
      }

      .j-docs-theme-panel__preset {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: var(--j-color-card-foreground);
        cursor: pointer;
        display: grid;
        gap: var(--j-spacing-1);
        padding: var(--j-spacing-3);
        text-align: left;
      }

      .j-docs-theme-panel__preset span {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        line-height: var(--j-line-height-normal);
      }

      .j-docs-theme-panel__preset:hover {
        background: var(--j-color-hover-background);
      }

      .j-docs-theme-panel__preset.is-active {
        border-color: var(--j-color-primary);
        box-shadow: inset 0 0 0 1px var(--j-color-primary);
      }

      @keyframes j-docs-settings-turn {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host ::ng-deep .j-docs-theme-settings__trigger .j-icon {
          animation: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsThemeSettingsComponent {
  private readonly theme = inject(JThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly open = signal(false);
  readonly preset = signal<JThemePresetId>(DEFAULT_PREFERENCE.preset);
  readonly mode = signal<DocsThemePreference['mode']>(DEFAULT_PREFERENCE.mode);
  readonly primary = signal<JPrimaryPaletteName>(DEFAULT_PREFERENCE.primary);
  readonly surface = signal<JSurfacePaletteName>(DEFAULT_PREFERENCE.surface);

  readonly primaryNames = Object.keys(jPrimaryPalettes) as JPrimaryPaletteName[];
  readonly surfaceNames = Object.keys(jSurfacePalettes) as JSurfacePaletteName[];
  readonly presetNames: readonly JThemePresetId[] = ['default', 'material', 'nexus'];
  readonly modeNames: readonly DocsThemePreference['mode'][] = ['light', 'dark'];
  readonly presetDescriptions = PRESET_DESCRIPTIONS;

  constructor() {
    this.apply(this.readPreference());
  }

  openPanel(): void {
    this.open.set(true);
  }

  selectPrimary(primary: JPrimaryPaletteName): void {
    this.primary.set(primary);
    this.theme.setPrimaryPalette(primary);
    this.persist();
  }

  selectSurface(surface: JSurfacePaletteName): void {
    this.surface.set(surface);
    this.theme.setSurfacePalette(surface);
    this.persist();
  }

  selectPreset(preset: JThemePresetId): void {
    this.preset.set(preset);
    this.theme.setPreset(preset);
    this.persist();
  }

  selectMode(mode: DocsThemePreference['mode']): void {
    this.mode.set(mode);
    this.theme.setColorScheme(mode);
    this.persist();
  }

  reset(): void {
    this.apply(DEFAULT_PREFERENCE);
    this.persist();
  }

  primarySwatch(name: JPrimaryPaletteName): string {
    return jPrimaryPalettes[name]['600'] ?? 'var(--j-color-primary)';
  }

  private apply(preference: DocsThemePreference): void {
    this.preset.set(preference.preset);
    this.mode.set(preference.mode);
    this.primary.set(preference.primary);
    this.surface.set(preference.surface);
    this.theme.setPreset(preference.preset);
    this.theme.setPrimaryPalette(preference.primary);
    this.theme.setSurfacePalette(preference.surface);
    this.theme.setColorScheme(preference.mode);
  }

  private readPreference(): DocsThemePreference {
    if (!this.isBrowser) return DEFAULT_PREFERENCE;
    try {
      const parsed = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? 'null',
      ) as Partial<DocsThemePreference> | null;
      if (
        parsed?.version === 1 &&
        this.presetNames.includes(parsed.preset as JThemePresetId) &&
        this.modeNames.includes(parsed.mode as DocsThemePreference['mode']) &&
        this.primaryNames.includes(parsed.primary as JPrimaryPaletteName) &&
        this.surfaceNames.includes(parsed.surface as JSurfacePaletteName)
      ) {
        return parsed as DocsThemePreference;
      }
    } catch {
      // Invalid application-owned preferences fall back to the documented default.
    }
    return DEFAULT_PREFERENCE;
  }

  private persist(): void {
    if (!this.isBrowser) return;
    const preference: DocsThemePreference = {
      version: 1,
      preset: this.preset(),
      mode: this.mode(),
      primary: this.primary(),
      surface: this.surface(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  }
}

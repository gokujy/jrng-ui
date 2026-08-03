import { TestBed } from '@angular/core/testing';
import { provideJrngTheme, JThemeService } from 'jrng-ui/theming';
import { DocsThemeSettingsComponent } from './docs-theme-settings.component';

describe('DocsThemeSettingsComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DocsThemeSettingsComponent],
      providers: [provideJrngTheme()],
    }).compileComponents();
  });

  it('opens from one accessible trigger and renders the settings drawer', () => {
    const fixture = TestBed.createComponent(DocsThemeSettingsComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '[aria-label="Open theme settings"]',
    ) as HTMLButtonElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('[data-jc-name="drawer"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Density');
  });

  it('applies and persists every supported setting type', () => {
    const fixture = TestBed.createComponent(DocsThemeSettingsComponent);
    const component = fixture.componentInstance;
    const theme = TestBed.inject(JThemeService);

    component.selectPreset('nexus');
    component.selectPrimary('emerald');
    component.selectSurface('warm');
    component.selectMode('dark');

    expect(theme.presetId()).toBe('nexus');
    expect(theme.isDark()).toBe(true);
    expect(JSON.parse(localStorage.getItem('j-docs-theme:v1') ?? '{}')).toEqual({
      version: 1,
      preset: 'nexus',
      mode: 'dark',
      primary: 'emerald',
      surface: 'warm',
    });

    component.reset();
    expect(component.preset()).toBe('default');
    expect(component.mode()).toBe('light');
    expect(component.primary()).toBe('indigo');
    expect(component.surface()).toBe('cool');
  });

  it('rejects invalid stored configuration', () => {
    localStorage.setItem(
      'j-docs-theme:v1',
      JSON.stringify({
        version: 1,
        preset: 'unknown',
        mode: 'system',
        primary: 'not-a-palette',
        surface: 'not-a-surface',
      }),
    );

    const fixture = TestBed.createComponent(DocsThemeSettingsComponent);
    const component = fixture.componentInstance;

    expect(component.preset()).toBe('default');
    expect(component.mode()).toBe('light');
    expect(component.primary()).toBe('indigo');
    expect(component.surface()).toBe('cool');
  });
});

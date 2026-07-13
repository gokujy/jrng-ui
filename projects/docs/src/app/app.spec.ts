import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { componentDocs } from './docs/component-docs.data';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.docs-brand')?.textContent).toContain('JRNG UI');
  });

  it('should render documentation navigation groups', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/docs');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebar = compiled.querySelector('.docs-sidebar');

    expect(sidebar?.textContent).toContain('Getting Started');
    expect(sidebar?.textContent).toContain('Components');
    expect(sidebar?.textContent).toContain('Charts');
  });

  it('should keep the homepage in the full-width layout', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.docs-layout')?.classList).toContain('docs-layout--full');
    expect(compiled.querySelector('.docs-sidebar')).toBeNull();
  });

  it('supports responsive navigation state and theme switching', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.navOpen()).toBe(false);
    app.toggleNavigation();
    expect(app.navOpen()).toBe(true);
    const before = app.isDark();
    app.toggleDark();
    expect(app.isDark()).toBe(!before);
  });

  it('opens the theme configurator and applies a color preset', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.configOpen()).toBe(false);
    app.toggleConfig();
    expect(app.configOpen()).toBe(true);
    app.selectPreset('emerald');
    expect(app.activePreset()).toBe('emerald');
    app.closeConfig();
    expect(app.configOpen()).toBe(false);
  });

  it('updates canonical and social metadata for documentation routes', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/docs');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain(
      '/docs',
    );
    expect(
      document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    ).toContain('five minutes');
  });

  it('should provide useful code for curated generated component examples', () => {
    const expectedExamples = [
      'accordion',
      'autocomplete',
      'avatar',
      'date-picker',
      'input-number',
      'multiselect',
      'paginator',
      'rating',
      'slider',
    ];

    for (const slug of expectedExamples) {
      const doc = componentDocs.find((record) => record.slug === slug);
      expect(doc, `Missing documentation for ${slug}`).toBeDefined();
      expect(doc?.code.basic, `Generic example found for ${slug}`).not.toBe(
        `<${doc?.selector}></${doc?.selector}>`,
      );
    }
  });
});

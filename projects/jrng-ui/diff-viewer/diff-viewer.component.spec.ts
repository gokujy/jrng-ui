import { TestBed } from '@angular/core/testing';
import { JDiffViewerComponent, jDiffValues } from './diff-viewer.component';
describe('JDiffViewerComponent', () => {
  it('calculates added removed changed and unchanged fields', () => {
    expect(jDiffValues({ a: 1, b: 2, c: 3 }, { a: 1, b: 4, d: 5 }).map((x) => x.state)).toEqual([
      'unchanged',
      'changed',
      'removed',
      'added',
    ]);
  });
  it('renders masked values', () => {
    const f = TestBed.createComponent(JDiffViewerComponent);
    f.componentRef.setInput('before', { secret: 'old' });
    f.componentRef.setInput('after', { secret: 'new' });
    f.componentRef.setInput('mask', () => '••••');
    f.detectChanges();
    expect(f.nativeElement.textContent).not.toContain('old');
    expect(f.nativeElement.textContent).toContain('••••');
  });

  it('flattens nested object paths and renders accessible Before and After headers', () => {
    expect(
      jDiffValues(
        { profile: { name: 'Before', role: 'Reader' } },
        { profile: { name: 'After', role: 'Reader' } },
      ).map((row) => [row.key, row.state]),
    ).toEqual([
      ['profile.name', 'changed'],
      ['profile.role', 'unchanged'],
    ]);

    const fixture = TestBed.createComponent(JDiffViewerComponent);
    fixture.componentRef.setInput('before', { status: 'draft' });
    fixture.componentRef.setInput('after', { status: 'published' });
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('[role="columnheader"]');
    expect([...headers].map((header) => header.textContent.trim())).toEqual([
      'Field',
      'Before',
      'After',
    ]);
    expect(
      fixture.nativeElement.querySelector('[data-state="changed"]').getAttribute('aria-label'),
    ).toBe('status: changed');
  });
});

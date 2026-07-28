import { TestBed } from '@angular/core/testing';
import { JHtmlPreviewComponent } from './html-preview.component';
describe('JHtmlPreviewComponent', () => {
  it('defaults to an isolated script-free iframe', () => {
    const f = TestBed.createComponent(JHtmlPreviewComponent);
    f.componentRef.setInput(
      'html',
      '<p>Safe</p><img src="https://example.invalid/pixel"><script>alert(1)</script>',
    );
    f.detectChanges();
    const frame = f.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(frame.getAttribute('sandbox')).toBe('');
    expect(frame.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(frame.getAttribute('srcdoc')).not.toContain('script');
    expect(frame.getAttribute('srcdoc')).not.toContain('https://');
  });

  it('uses JRNG buttons and keeps content visible after viewing source', () => {
    const fixture = TestBed.createComponent(JHtmlPreviewComponent);
    fixture.componentRef.setInput('html', '<p>Preview content</p>');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('j-button button');
    expect(buttons.length).toBeGreaterThanOrEqual(5);

    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.j-html-preview__source')?.textContent).toContain(
      'Preview content',
    );

    fixture.nativeElement.querySelectorAll('j-button button')[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('iframe')?.getAttribute('srcdoc')).toContain(
      'Preview content',
    );
  });

  it('blocks protocol-relative remote sources and normalizes preview dimensions', () => {
    const fixture = TestBed.createComponent(JHtmlPreviewComponent);
    fixture.componentRef.setInput(
      'html',
      '<img src="//example.invalid/tracker.png" alt="Tracker">',
    );
    fixture.componentRef.setInput('width', Number.NaN);
    fixture.componentRef.setInput('height', -1);
    fixture.componentRef.setInput('zoom', Number.POSITIVE_INFINITY);
    fixture.detectChanges();

    const frame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    const surface = fixture.nativeElement.querySelector('.j-html-preview__surface') as HTMLElement;
    expect(frame.getAttribute('srcdoc')).not.toContain('example.invalid');
    expect(surface.style.width).toBe('1200px');
    expect(surface.style.height).toBe('600px');
    expect(surface.style.transform).toBe('scale(1)');
  });
});

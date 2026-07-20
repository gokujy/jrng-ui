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
});

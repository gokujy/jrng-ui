import { TestBed } from '@angular/core/testing';
import { JHighlightComponent, jHighlightText } from './highlight.component';
describe('JHighlightComponent', () => {
  it('matches multiple terms without interpreting HTML', () => {
    expect(
      jHighlightText('Résumé <script>x</script>', ['resume', 'script'])
        .filter((x) => x.match)
        .map((x) => x.text),
    ).toEqual(['Résumé', 'script', 'script']);
    const f = TestBed.createComponent(JHighlightComponent);
    f.componentRef.setInput('text', '<img src=x onerror=alert(1)>');
    f.componentRef.setInput('term', 'img');
    f.detectChanges();
    expect(f.nativeElement.querySelector('img')).toBeNull();
    expect(f.nativeElement.textContent).toContain('onerror=alert(1)');
  });
});

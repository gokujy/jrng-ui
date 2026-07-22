import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTimelineComponent } from './timeline.component';

describe('JTimelineComponent variants', () => {
  let fixture: ComponentFixture<JTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JTimelineComponent] }).compileComponents();
    fixture = TestBed.createComponent(JTimelineComponent);
    fixture.componentRef.setInput('value', [
      { id: 'created', title: 'Created', opposite: '09:15', severity: 'success', icon: 'check' },
      { title: 'Review requested', content: 'Waiting for finance approval', severity: 'warning' },
    ]);
  });

  it('renders activity and alternating structures with the same ordered-list semantics', () => {
    fixture.componentRef.setInput('variant', 'activity');
    fixture.detectChanges();
    const root = fixture.debugElement.query(By.css('ol')).nativeElement as HTMLElement;
    expect(root.classList).toContain('j-timeline--activity');
    expect(root.children).toHaveLength(2);

    fixture.componentRef.setInput('variant', 'alternating');
    fixture.detectChanges();
    expect(root.dataset['jVariant']).toBe('alternating');
  });

  it('renders JRNG markers and toggles detail with keyboard', () => {
    fixture.componentRef.setInput('collapsible', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-icon svg')).toBeTruthy();
    const items = fixture.nativeElement.querySelectorAll(
      '.j-timeline__item',
    ) as NodeListOf<HTMLElement>;
    expect(items[1].getAttribute('aria-expanded')).toBe('true');

    items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(items[1].getAttribute('aria-expanded')).toBe('false');
    expect(items[1].textContent).not.toContain('Waiting for finance approval');
  });

  it('renders isolated loading, empty, and error states', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-skeleton')).toBeTruthy();

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('value', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No timeline events');

    fixture.componentRef.setInput('error', new Error('offline'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unable to load timeline');
  });
});

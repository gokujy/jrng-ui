import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTimelineComponent } from './timeline.component';

describe('JTimelineComponent variants', () => {
  let fixture: ComponentFixture<JTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JTimelineComponent] }).compileComponents();
    fixture = TestBed.createComponent(JTimelineComponent);
    fixture.componentRef.setInput('value', [
      { title: 'Created', opposite: '09:15', severity: 'success' },
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
});

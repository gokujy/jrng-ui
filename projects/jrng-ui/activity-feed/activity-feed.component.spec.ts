import { TestBed } from '@angular/core/testing';
import { JActivityFeedComponent } from './activity-feed.component';
describe('JActivityFeedComponent', () => {
  it('renders loading, empty, error and load-more states', () => {
    const f = TestBed.createComponent(JActivityFeedComponent);
    f.componentRef.setInput('loading', true);
    f.detectChanges();
    expect(f.nativeElement.querySelector('[role=status]')).not.toBeNull();
    f.componentRef.setInput('loading', false);
    f.componentRef.setInput('error', 'Unable');
    f.detectChanges();
    expect(f.nativeElement.querySelector('[role=alert]').textContent).toContain('Unable');
    f.componentRef.setInput('error', '');
    f.componentRef.setInput('lazy', true);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Load more');
  });
});

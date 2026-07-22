import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTourGuideComponent } from './tour-guide.component';
import { JTourService } from './tour.service';

describe('JTourGuideComponent', () => {
  it('renders an accessible native guide with keyboard-operable JRNG actions', async () => {
    await TestBed.configureTestingModule({ imports: [JTourGuideComponent] }).compileComponents();
    const fixture = TestBed.createComponent(JTourGuideComponent);
    const target = document.createElement('button');
    target.id = 'tour-guide-target';
    document.body.appendChild(target);
    const tour = TestBed.inject(JTourService);

    await tour.start({
      animate: false,
      showProgress: true,
      steps: [{ element: '#tour-guide-target', title: 'Welcome', description: 'Start here.' }],
    });
    fixture.detectChanges();

    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialog).toBeTruthy();
    expect(dialog.attributes['aria-labelledby']).toBe('j-tour-title');
    expect(fixture.nativeElement.textContent).toContain('1 / 1');
    expect(fixture.debugElement.queryAll(By.css('j-button')).length).toBeGreaterThan(0);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(tour.isActive()).toBe(false);
    target.remove();
  });
});

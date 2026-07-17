import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JProgressBarComponent } from './progress-bar.component';

describe('JProgressBarComponent variants', () => {
  let fixture: ComponentFixture<JProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JProgressBarComponent] }).compileComponents();
    fixture = TestBed.createComponent(JProgressBarComponent);
    fixture.componentRef.setInput('value', 67);
  });

  it('renders segmented and labeled concepts with a stable progressbar contract', () => {
    fixture.componentRef.setInput('variant', 'labeled');
    fixture.detectChanges();
    const root = fixture.debugElement.query(By.css('[role="progressbar"]'))
      .nativeElement as HTMLElement;
    expect(root.getAttribute('aria-valuenow')).toBe('67');
    expect(root.textContent).toContain('67%');

    fixture.componentRef.setInput('variant', 'segmented');
    fixture.detectChanges();
    expect(root.classList).toContain('j-progress-bar--segmented');
  });

  it('omits value semantics and the visible value while indeterminate', () => {
    fixture.componentRef.setInput('variant', 'labeled');
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    const root = fixture.debugElement.query(By.css('[role="progressbar"]'))
      .nativeElement as HTMLElement;
    expect(root.hasAttribute('aria-valuenow')).toBe(false);
    expect(fixture.debugElement.query(By.css('.j-progress-bar__value'))).toBeNull();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JStepperComponent } from './stepper.component';

describe('JStepperComponent variants', () => {
  let fixture: ComponentFixture<JStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JStepperComponent] }).compileComponents();
    fixture = TestBed.createComponent(JStepperComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Account', completed: true },
      { label: 'Profile' },
      { label: 'Review', disabled: true },
    ]);
  });

  it('keeps default rendering and exposes opt-in rail and progress presets', () => {
    fixture.detectChanges();
    const root = fixture.debugElement.query(By.css('nav')).nativeElement as HTMLElement;
    expect(root.classList).toContain('j-stepper--default');

    fixture.componentRef.setInput('variant', 'rail');
    fixture.detectChanges();
    expect(root.dataset['jVariant']).toBe('rail');

    fixture.componentRef.setInput('variant', 'progress');
    fixture.detectChanges();
    expect(root.classList).toContain('j-stepper--progress');
  });

  it('preserves completed, disabled, and aria-current states across variants', () => {
    fixture.componentRef.setInput('variant', 'rail');
    fixture.componentRef.setInput('activeIndex', 1);
    fixture.detectChanges();
    const steps = fixture.debugElement.queryAll(By.css('button'));
    expect(steps[0].nativeElement.classList).toContain('is-completed');
    expect(steps[1].nativeElement.getAttribute('aria-current')).toBe('step');
    expect(steps[2].nativeElement.disabled).toBe(true);
  });

  it('renders an accessible custom label and a semantic-free completed marker', () => {
    fixture.componentRef.setInput('ariaLabel', 'Account setup progress');
    fixture.detectChanges();

    const root = fixture.debugElement.query(By.css('nav')).nativeElement as HTMLElement;
    const marker = fixture.debugElement.query(By.css('.j-stepper__marker')).nativeElement;
    expect(root.getAttribute('aria-label')).toBe('Account setup progress');
    expect(marker.getAttribute('aria-hidden')).toBe('true');
    expect(marker.textContent.trim()).toBe('✓');
  });
});

import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JCopyButtonComponent } from './copy-button.component';

describe('JCopyButtonComponent icon presentation', () => {
  it('renders an opt-in icon-only button while retaining its accessible label', async () => {
    await TestBed.configureTestingModule({ imports: [JCopyButtonComponent] }).compileComponents();
    const fixture = TestBed.createComponent(JCopyButtonComponent);
    fixture.componentRef.setInput('icon', 'copy');
    fixture.componentRef.setInput('iconOnly', true);
    fixture.componentRef.setInput('ariaLabel', 'Copy example code');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.classList).toContain('j-copy-button--icon-only');
    expect(button.getAttribute('aria-label')).toBe('Copy example code');
    expect(fixture.debugElement.query(By.css('j-icon svg'))).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-jc-section="label"]')).nativeElement.textContent,
    ).toContain('Copy');
  });
});

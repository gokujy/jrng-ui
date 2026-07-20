import { TestBed } from '@angular/core/testing';
import { JLabelComponent } from './label.component';

describe('JLabelComponent', () => {
  it('associates its native label and message with the projected control', async () => {
    await TestBed.configureTestingModule({ imports: [JLabelComponent] }).compileComponents();
    const fixture = TestBed.createComponent(JLabelComponent);
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('message', 'Required');
    fixture.nativeElement.querySelector('.j-label__control').innerHTML = '<input>';
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.id).toBeTruthy();
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toContain('j-label-message');
  });
});

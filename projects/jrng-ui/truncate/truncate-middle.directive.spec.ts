import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTruncateMiddleDirective } from './truncate-middle.directive';

@Component({
  imports: [JTruncateMiddleDirective],
  template: `
    <span
      [jTruncateMiddle]="value"
      [maxCharacters]="18"
      [leading]="8"
      [trailing]="9"
      preserveExtension
    ></span>
  `,
})
class TruncateHostComponent {
  value = 'customer-contract-final.pdf';
}

describe('JTruncateMiddleDirective', () => {
  it('preserves the beginning, ending, accessible name and full title', () => {
    const fixture = TestBed.createComponent(TruncateHostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(element.textContent).toBe('customer…final.pdf');
    expect(element.getAttribute('title')).toBe('customer-contract-final.pdf');
    expect(element.getAttribute('aria-label')).toBe('customer-contract-final.pdf');
  });

  it('updates when the input changes and handles short and empty values', async () => {
    const fixture = TestBed.createComponent(TruncateHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.value = 'short.pdf';
    fixture.changeDetectorRef.detectChanges();
    fixture.debugElement
      .query(By.directive(JTruncateMiddleDirective))
      .injector.get(JTruncateMiddleDirective)
      .recalculate();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('short.pdf');
    fixture.componentInstance.value = '';
    fixture.changeDetectorRef.detectChanges();
    fixture.debugElement
      .query(By.directive(JTruncateMiddleDirective))
      .injector.get(JTruncateMiddleDirective)
      .recalculate();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('');
  });
});

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JDataDisplayComponent, JDataDisplayType } from './data-display.component';

@Component({
  imports: [JDataDisplayComponent],
  template: `<j-data-display
    label="Value"
    [type]="type()"
    [value]="value()"
    [loading]="loading()"
    [error]="error()"
    [currency]="currency()"
    [dateOptions]="dateOptions()"
    locale="en-US"
  />`,
})
class Host {
  type = signal<JDataDisplayType>('text');
  value = signal<unknown>('Hello');
  loading = signal(false);
  error = signal('');
  currency = signal('USD');
  dateOptions = signal<Intl.DateTimeFormatOptions>({});
}

describe('JDataDisplayComponent', () => {
  let fixture: ComponentFixture<Host>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });
  it('formats common enterprise display types', () => {
    fixture.componentInstance.type.set('currency');
    fixture.componentInstance.value.set(1234.5);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('$1,234.50');
    fixture.componentInstance.type.set('boolean');
    fixture.componentInstance.value.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No');
    fixture.componentInstance.type.set('file-size');
    fixture.componentInstance.value.set(1024);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1.0 KB');
  });
  it('renders empty, loading, and error states', () => {
    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('—');
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.error.set('Unavailable');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Unavailable',
    );
  });

  it('falls back to empty text for invalid Intl configuration', () => {
    fixture.componentInstance.type.set('currency');
    fixture.componentInstance.value.set(10);
    fixture.componentInstance.currency.set('not-a-currency');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('—');

    fixture.componentInstance.type.set('date');
    fixture.componentInstance.value.set(new Date(2026, 0, 1));
    fixture.componentInstance.dateOptions.set({ dateStyle: 'medium', year: 'numeric' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('—');
  });

  it('handles circular JSON values without throwing', () => {
    const value: { self?: unknown } = {};
    value.self = value;
    fixture.componentInstance.type.set('json');
    fixture.componentInstance.value.set(value);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('—');
  });
});

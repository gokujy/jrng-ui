import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JIconComponent } from 'jrng-ui/icon';
import { JIconFieldComponent } from './icon-field.component';

@Component({
  imports: [JIconFieldComponent],
  template: `
    <j-icon-field
      prefixIcon="search"
      suffixIcon="filter"
      clearable
      filterable
      [disabled]="disabled()"
      (clear)="recordClear()"
      (filter)="recordFilter()"
    >
      <input />
    </j-icon-field>
  `,
})
class IconFieldHostComponent {
  readonly disabled = signal(false);
  clearCount = 0;
  filterCount = 0;

  recordClear(): void {
    this.clearCount += 1;
  }

  recordFilter(): void {
    this.filterCount += 1;
  }
}

describe('JIconFieldComponent', () => {
  let fixture: ComponentFixture<IconFieldHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IconFieldHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(IconFieldHostComponent);
    fixture.detectChanges();
  });

  it('renders icon components instead of icon-name text', () => {
    expect(
      fixture.debugElement.queryAll(By.directive(JIconComponent)).length,
    ).toBeGreaterThanOrEqual(4);
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('emits clear and filter actions only while enabled', () => {
    const host = fixture.componentInstance;
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    buttons[1].click();
    expect(host.clearCount).toBe(1);
    expect(host.filterCount).toBe(1);

    host.disabled.set(true);
    fixture.detectChanges();
    buttons[0].click();
    buttons[1].click();
    expect(host.clearCount).toBe(1);
    expect(host.filterCount).toBe(1);
    expect(fixture.nativeElement.querySelector('.j-icon-field').hasAttribute('inert')).toBe(true);
  });
});

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { JSelectComponent, JSelectOptionSource } from './select.component';

@Component({
  imports: [JSelectComponent, ReactiveFormsModule],
  template: `
    <j-select
      label="Status"
      placeholder="Select status"
      [formControl]="control"
      [options]="options"
      [error]="error"
      [searchable]="searchable"
      (valueChange)="lastValue = $event"
      (filterChange)="lastFilter = $event"
    />
  `,
})
class SelectHostComponent {
  control = new FormControl<string>('', { nonNullable: true });
  error = '';
  searchable = false;
  lastValue: unknown = '';
  lastFilter = '';
  options: readonly JSelectOptionSource[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Archived', value: 'archived', disabled: true },
  ];
}

describe('JSelectComponent', () => {
  let fixture: ComponentFixture<SelectHostComponent>;
  let host: SelectHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function trigger(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.j-select')).nativeElement as HTMLButtonElement;
  }

  function detectHostChanges(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('renders options and placeholder', () => {
    expect(trigger().textContent).toContain('Select status');

    trigger().click();
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('.j-select__option'));
    expect(options.length).toBe(3);
    expect(options[2]?.nativeElement.disabled).toBe(true);
  });

  it('writes the form control value to the select', () => {
    host.control.setValue('approved');
    detectHostChanges();

    expect(trigger().textContent).toContain('Approved');
  });

  it('updates the form control and emits valueChange', () => {
    trigger().click();
    fixture.detectChanges();

    fixture.debugElement.queryAll(By.css('.j-select__option'))[0]?.nativeElement.click();
    fixture.detectChanges();

    expect(host.control.value).toBe('pending');
    expect(host.lastValue).toBe('pending');
  });

  it('reflects disabled state from forms', () => {
    host.control.disable();
    detectHostChanges();

    expect(trigger().disabled).toBe(true);
  });

  it('renders error state', () => {
    host.error = 'Required';
    detectHostChanges();

    const control = fixture.debugElement.query(By.css('.j-select-field'))
      .nativeElement as HTMLElement;
    const message = fixture.debugElement.query(By.css('.j-select-field__message'))
      .nativeElement as HTMLElement;

    expect(control.classList).toContain('is-invalid');
    expect(message.textContent).toContain('Required');
  });

  it('supports keyboard open, search, select, and escape close', async () => {
    host.searchable = true;
    detectHostChanges();

    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    detectHostChanges();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    const filter = fixture.debugElement.query(By.css('.j-select__filter'))
      .nativeElement as HTMLInputElement;
    expect(filter.getAttribute('aria-label')).toBe('Search');

    filter.value = 'app';
    filter.dispatchEvent(new Event('input'));
    filter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    detectHostChanges();

    expect(host.lastFilter).toBe('app');
    expect(host.control.value).toBe('approved');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');

    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    detectHostChanges();
    fixture.debugElement
      .query(By.css('.j-select__filter'))
      .nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    detectHostChanges();
    await Promise.resolve();

    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });

  it('enables virtual scrolling only for flat (ungrouped) option lists', () => {
    const select = fixture.debugElement.query(By.directive(JSelectComponent))
      .componentInstance as JSelectComponent;
    select.virtualScroll = true;
    detectHostChanges();
    expect(select.isGrouped).toBe(false);
    expect(select.useVirtual).toBe(true);

    host.options = [
      {
        label: 'Group 1',
        items: [
          { label: 'Alpha', value: 'a' },
          { label: 'Beta', value: 'b' },
        ],
      },
    ];
    detectHostChanges();
    expect(select.isGrouped).toBe(true);
    expect(select.useVirtual).toBe(false); // grouped lists fall back to normal rendering
  });
});

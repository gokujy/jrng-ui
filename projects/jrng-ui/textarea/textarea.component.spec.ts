import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { JTextareaComponent } from './textarea.component';

describe('JTextareaComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [JTextareaComponent],
    });
  });

  it('reflects the value written via writeValue', () => {
    const fixture = TestBed.createComponent(JTextareaComponent);
    fixture.componentInstance.writeValue('hello world');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(fixture.componentInstance.value).toBe('hello world');
    expect(textarea.value).toBe('hello world');
  });

  it('coerces null/undefined to an empty string in writeValue', () => {
    const fixture = TestBed.createComponent(JTextareaComponent);
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe('');
  });

  it('updates value and emits valueChange on input', () => {
    const fixture = TestBed.createComponent(JTextareaComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    let changed: string | undefined;
    let emitted: string | undefined;
    component.registerOnChange((v: string) => (changed = v));
    component.valueChange.subscribe((v) => (emitted = v));

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'typed text';
    textarea.dispatchEvent(new Event('input'));

    expect(component.value).toBe('typed text');
    expect(changed).toBe('typed text');
    expect(emitted).toBe('typed text');
  });

  it('renders the character count when showCount and maxLength are set', () => {
    const fixture = TestBed.createComponent(JTextareaComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('showCount', true);
    fixture.componentRef.setInput('maxLength', 100);
    component.writeValue('abcde');
    fixture.detectChanges();

    const count = fixture.nativeElement.querySelector('.j-textarea__count') as HTMLElement;
    expect(count.textContent?.trim()).toBe('5/100');
  });

  it('renders the label when provided', () => {
    const fixture = TestBed.createComponent(JTextareaComponent);
    fixture.componentRef.setInput('label', 'Comments');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.j-textarea__label') as HTMLElement;
    expect(label).toBeTruthy();
    expect(label.textContent).toContain('Comments');
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { JCronExpressionComponent } from './cron-expression.component';

@Component({
  imports: [ReactiveFormsModule, JCronExpressionComponent],
  template: `<j-cron-expression
    [formControl]="control"
    [readonly]="readonly"
    [dir]="direction"
    [previewFrom]="previewFrom"
  />`,
})
class CronHost {
  readonly control = new FormControl('*/15 * * * *', { nonNullable: true });
  readonly previewFrom = new Date('2026-07-28T00:00:00Z');
  readonly = false;
  direction: 'ltr' | 'rtl' = 'ltr';
}

describe('JCronExpressionComponent', () => {
  it('renders raw and structured controls in standard token order', () => {
    const fixture = TestBed.createComponent(JCronExpressionComponent);
    fixture.componentRef.setInput('value', '5 4 3 2 1');
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('.j-cron-expression__fields input');
    expect([...inputs].map((input) => input.value)).toEqual(['5', '4', '3', '2', '1']);
    expect(fixture.nativeElement.textContent).toContain('Minute');
    expect(fixture.nativeElement.textContent).toContain('Day of week');
  });

  it('preserves invalid raw input visibly without emitting a normalised value', () => {
    const fixture = TestBed.createComponent(JCronExpressionComponent);
    fixture.detectChanges();
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));
    fixture.componentInstance.changeRaw(inputEvent('99 * * * *'));
    fixture.detectChanges();
    expect(fixture.componentInstance.raw()).toBe('99 * * * *');
    expect(emitted).toEqual([]);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('normalises whitespace, updates structured parts, and applies shortcuts', () => {
    const fixture = TestBed.createComponent(JCronExpressionComponent);
    fixture.detectChanges();
    const values: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => values.push(value));
    fixture.componentInstance.changeRaw(inputEvent('  */5   *  * * * '));
    fixture.componentInstance.changePart('hour', inputEvent('9-17'));
    fixture.componentInstance.applyShortcut('@monthly');
    expect(values).toEqual(['*/5 * * * *', '*/5 9-17 * * *', '0 0 1 * *']);
  });

  it('integrates with Reactive Forms, disabled, touched, and validation states', () => {
    const fixture = TestBed.createComponent(CronHost);
    fixture.detectChanges();
    const editor = fixture.debugElement.query(By.directive(JCronExpressionComponent))
      .componentInstance as JCronExpressionComponent;
    editor.changeRaw(inputEvent('0 2 * * *'));
    expect(fixture.componentInstance.control.value).toBe('0 2 * * *');
    fixture.componentInstance.control.setValue('invalid');
    fixture.detectChanges();
    expect(fixture.componentInstance.control.hasError('cronExpression')).toBe(true);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(editor.isDisabled()).toBe(true);
    editor.applyShortcut('@daily');
    expect(editor.raw()).toBe('invalid');
  });

  it('supports read-only and RTL UI while preserving LTR token order', () => {
    const fixture = TestBed.createComponent(CronHost);
    fixture.componentInstance.readonly = true;
    fixture.componentInstance.direction = 'rtl';
    fixture.detectChanges();
    const editor = fixture.debugElement.query(By.directive(JCronExpressionComponent))
      .componentInstance as JCronExpressionComponent;
    const root = fixture.nativeElement.querySelector('.j-cron-expression');
    expect(root.getAttribute('dir')).toBe('rtl');
    expect(
      fixture.nativeElement.querySelector('.j-cron-expression__fields').getAttribute('dir'),
    ).toBe('ltr');
    editor.changeRaw(inputEvent('0 0 * * *'));
    expect(editor.raw()).toBe('*/15 * * * *');
  });

  it('announces a bounded preview and remains SSR-safe', () => {
    const fixture = TestBed.createComponent(CronHost);
    fixture.detectChanges();
    const preview = fixture.nativeElement.querySelector('.j-cron-expression__preview');
    expect(preview.textContent).toContain('Every 15 minutes');
    expect(preview.querySelectorAll('li')).toHaveLength(3);
    expect(JCronExpressionComponent.toString()).not.toContain('window.');
    expect(JCronExpressionComponent.toString()).not.toContain('document.');
  });
});

function inputEvent(value: string): Event {
  return { target: { value } } as unknown as Event;
}

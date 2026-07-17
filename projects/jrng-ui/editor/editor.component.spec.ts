import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JEditorCommandService } from './editor-command.service';
import { JEditorComponent } from './editor.component';

@Component({
  imports: [FormsModule, JEditorComponent],
  template: `<j-editor [(ngModel)]="value" (valueChange)="emissions.push($event)" />`,
})
class NgModelHost {
  value: string | null = '<p>Hello <strong>world</strong></p>';
  emissions: string[] = [];
}

@Component({
  imports: [ReactiveFormsModule, JEditorComponent],
  template: `<j-editor [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl<string | null>('<p>Initial</p>');
}

describe('JEditorComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [JEditorComponent] }));

  it('preserves and sanitizes an initial ngModel value without emitting a user change', async () => {
    const fixture = TestBed.createComponent(NgModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const editable = fixture.nativeElement.querySelector('.j-editor__control') as HTMLElement;
    expect(editable.innerHTML).toBe('<p>Hello <strong>world</strong></p>');
    expect(fixture.componentInstance.value).toBe('<p>Hello <strong>world</strong></p>');
    expect(fixture.componentInstance.emissions).toEqual([]);
  });

  it('supports initial values, programmatic updates, reset and disabled Reactive Forms state', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const editable = fixture.nativeElement.querySelector('.j-editor__control') as HTMLElement;
    expect(editable.innerHTML).toBe('<p>Initial</p>');

    fixture.componentInstance.control.setValue('<h2>Updated</h2>');
    fixture.detectChanges();
    expect(editable.innerHTML).toBe('<h2>Updated</h2>');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(editable.getAttribute('contenteditable')).toBe('false');

    fixture.componentInstance.control.setValue('<p>While disabled</p>');
    fixture.detectChanges();
    expect(editable.innerHTML).toBe('<p>While disabled</p>');

    fixture.componentInstance.control.reset();
    fixture.detectChanges();
    expect(editable.innerHTML).toBe('');
  });

  it('removes unsafe content and preserves supported formatting', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(
      '<p style="color:red" onclick="evil()"><strong>Safe</strong><script>bad()</script>' +
        '<a href="javascript:bad()">link</a></p>',
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('<p><strong>Safe</strong><a>link</a></p>');
  });

  it('keeps plain-text mode literal and converts newlines only in the view', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.componentRef.setInput('outputFormat', 'text');
    fixture.detectChanges();
    fixture.componentInstance.writeValue('<b>literal</b>\nnext');
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('<b>literal</b>\nnext');
    expect(
      (fixture.nativeElement.querySelector('.j-editor__control') as HTMLElement).innerHTML,
    ).toBe('&lt;b&gt;literal&lt;/b&gt;<br>next');
  });

  it('emits once for user input, marks touched on blur, and does not emit from writeValue', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    const onChange = vi.fn();
    const onTouched = vi.fn();
    const output = vi.fn();
    fixture.componentInstance.registerOnChange(onChange);
    fixture.componentInstance.registerOnTouched(onTouched);
    fixture.componentInstance.valueChange.subscribe(output);

    fixture.componentInstance.writeValue('<p>model</p>');
    expect(onChange).not.toHaveBeenCalled();
    expect(output).not.toHaveBeenCalled();

    const editable = fixture.nativeElement.querySelector('.j-editor__control') as HTMLElement;
    editable.innerHTML = '<p>typed</p>';
    editable.dispatchEvent(new InputEvent('input', { bubbles: true }));
    editable.dispatchEvent(new FocusEvent('blur'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('<p>typed</p>');
    expect(output).toHaveBeenCalledOnce();
    expect(onTouched).toHaveBeenCalledOnce();
  });

  it('sanitizes pasted HTML and blocks paste while readonly', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    const commands = TestBed.inject(JEditorCommandService);
    const execute = vi.spyOn(commands, 'execute').mockReturnValue(true);
    const clipboardData = {
      getData: (type: string) =>
        type === 'text/html' ? '<b onclick="bad()">ok</b><script>bad()</script>' : '',
    } as DataTransfer;
    const paste = { clipboardData, preventDefault: vi.fn() } as unknown as ClipboardEvent;

    fixture.componentInstance.handlePaste(paste);
    expect(paste.preventDefault).toHaveBeenCalled();
    expect(execute).toHaveBeenCalledWith('insertHTML', '<b>ok</b>');

    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    execute.mockClear();
    fixture.componentInstance.handlePaste(paste);
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    'bold',
    'italic',
    'underline',
    'insertOrderedList',
    'insertUnorderedList',
    'undo',
    'redo',
  ])('routes %s through the guarded command adapter', (command) => {
    const fixture: ComponentFixture<JEditorComponent> = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    const commands = TestBed.inject(JEditorCommandService);
    const execute = vi.spyOn(commands, 'execute').mockReturnValue(true);
    fixture.componentInstance.execute(command);
    expect(execute).toHaveBeenCalledWith(command, undefined);
  });
});

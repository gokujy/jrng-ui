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

  it('reports maximum-length validation and dirty state', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.componentRef.setInput('maxLength', 3);
    fixture.detectChanges();
    fixture.componentInstance.writeValue('<p>abc</p>');
    const validation = vi.fn();
    fixture.componentInstance.validationChange.subscribe(validation);
    const editable = fixture.nativeElement.querySelector('.j-editor__control') as HTMLElement;
    editable.innerHTML = '<p>abcd</p>';
    editable.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(fixture.componentInstance.dirty()).toBe(true);
    expect(validation).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false }));
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

  it('uses accessible JRNG icon actions and preserves content across HTML mode', async () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.componentRef.setInput('showSourceToggle', true);
    fixture.detectChanges();

    const bold = fixture.nativeElement.querySelector(
      'button[aria-label="Bold"]',
    ) as HTMLButtonElement;
    const source = fixture.nativeElement.querySelector(
      'button[aria-label="Show HTML"]',
    ) as HTMLButtonElement;

    expect(bold.querySelector('j-icon')).toBeTruthy();
    expect(source.querySelector('j-icon')).toBeTruthy();

    source.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.j-editor__source')).toBeTruthy();
    const visual = fixture.nativeElement.querySelector(
      'button[aria-label="Show visual editor"]',
    ) as HTMLButtonElement;
    expect(visual).toBeTruthy();

    visual.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement.querySelector('.j-editor__control') as HTMLElement).innerHTML,
    ).toBe(fixture.componentInstance.value());
  });

  it('opens an image file picker instead of requesting an image URL', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    const picker = fixture.nativeElement.querySelector(
      'input[aria-label="Choose an image to upload"]',
    ) as HTMLInputElement;
    const pickerClick = vi.spyOn(picker, 'click');
    const prompt = vi.spyOn(window, 'prompt');

    (
      fixture.nativeElement.querySelector('button[aria-label="Upload image"]') as HTMLButtonElement
    ).click();

    expect(picker.accept).toBe('image/png,image/jpeg,image/webp,image/gif');
    expect(pickerClick).toHaveBeenCalledOnce();
    expect(prompt).not.toHaveBeenCalled();
  });

  it('reads a selected image and inserts safe image markup', async () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    const commands = TestBed.inject(JEditorCommandService);
    const execute = vi.spyOn(commands, 'execute').mockReturnValue(true);
    const picker = fixture.nativeElement.querySelector(
      'input[aria-label="Choose an image to upload"]',
    ) as HTMLInputElement;
    Object.defineProperty(picker, 'files', {
      configurable: true,
      value: [new File(['customer-image'], 'northwind-logo.png', { type: 'image/png' })],
    });

    picker.dispatchEvent(new Event('change', { bubbles: true }));

    await vi.waitFor(() => {
      expect(execute).toHaveBeenCalledWith(
        'insertHTML',
        expect.stringMatching(/^<img src="data:image\/png;base64,[^"]+" alt="northwind-logo">$/),
      );
    });
    expect(fixture.componentInstance.imageError()).toBe('');
  });

  it('reports an accessible error for unsupported or oversized image files', async () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.componentRef.setInput('imageMaxFileSize', 4);
    fixture.detectChanges();
    const picker = fixture.nativeElement.querySelector(
      'input[aria-label="Choose an image to upload"]',
    ) as HTMLInputElement;
    const imageError = vi.fn();
    fixture.componentInstance.imageErrorChange.subscribe(imageError);
    Object.defineProperty(picker, 'files', {
      configurable: true,
      value: [new File(['too large'], 'customer.png', { type: 'image/png' })],
    });

    await fixture.componentInstance.handleImageSelection({ target: picker } as unknown as Event);
    fixture.detectChanges();

    expect(imageError).toHaveBeenCalledWith('Choose an image smaller than 1 KB.');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Choose an image smaller than 1 KB.',
    );
  });

  it('resizes, aligns, describes, and removes a selected image', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(
      '<p><img src="https://example.com/customer.png" alt="Customer"></p>',
    );
    fixture.detectChanges();

    let image = fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement;
    image.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Selected image tools"]')).toBeTruthy();

    fixture.componentInstance.resizeSelectedImage('50%');
    expect(fixture.componentInstance.value()).toContain('style="width: 50%"');
    expect(
      (fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement).style
        .width,
    ).toBe('50%');
    expect(fixture.componentInstance.selectedImage()).not.toBeNull();

    fixture.componentInstance.resizeSelectedImage('25%');
    expect(
      (fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement).style
        .width,
    ).toBe('25%');
    expect(fixture.componentInstance.selectedImage()).not.toBeNull();

    fixture.componentInstance.resizeSelectedImage(null);
    expect(
      (fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement).style
        .width,
    ).toBe('');
    expect(fixture.componentInstance.selectedImage()).not.toBeNull();

    image = fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement;
    image.click();
    fixture.componentInstance.alignSelectedImage('right');
    expect(fixture.componentInstance.value()).toContain('data-j-align="right"');

    image = fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement;
    image.click();
    fixture.componentInstance.selectedImageAlt.set('Northwind Harbor logo');
    fixture.componentInstance.applySelectedImageAlt();
    expect(fixture.componentInstance.value()).toContain('alt="Northwind Harbor logo"');

    image = fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement;
    image.click();
    fixture.componentInstance.removeSelectedImage();
    expect(fixture.componentInstance.value()).not.toContain('<img');
  });

  it('anchors image tools beside the image and flips above near the viewport edge', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(
      '<p><img src="https://example.com/customer.png" alt="Customer"></p>',
    );
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement;
    const root = fixture.nativeElement.querySelector('.j-editor') as HTMLElement;
    vi.spyOn(image, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 200,
      top: 700,
      bottom: 740,
      width: 100,
      height: 40,
      x: 100,
      y: 700,
      toJSON: () => ({}),
    });
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 600,
      top: 0,
      bottom: 800,
      width: 600,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    image.click();
    fixture.detectChanges();
    const tools = fixture.nativeElement.querySelector('.j-editor__context--image') as HTMLElement;
    vi.spyOn(tools, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 400,
      top: 0,
      bottom: 120,
      width: 400,
      height: 120,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fixture.componentInstance.positionSelectedImageTools();
    fixture.detectChanges();

    expect(tools.classList.contains('is-positioned')).toBe(true);
    expect(tools.classList.contains('is-above')).toBe(true);
    expect(tools.style.position || getComputedStyle(tools).position).toBe('absolute');
    expect(tools.style.left).toBe('208px');
    expect(tools.style.top).toBe('692px');
  });

  it('closes the selected-image tools on outside pointer interaction', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(
      '<p><img src="https://example.com/customer.png" alt="Customer"></p>',
    );
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.j-editor__control img') as HTMLImageElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedImage()).not.toBeNull();

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedImage()).toBeNull();
    expect(fixture.nativeElement.querySelector('.j-editor__context--image')).toBeNull();
  });

  it('provides comprehensive formatting controls through guarded commands', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    const commands = TestBed.inject(JEditorCommandService);
    const execute = vi.spyOn(commands, 'execute').mockReturnValue(true);

    fixture.componentInstance.setFontFamily({ target: { value: 'Georgia' } } as unknown as Event);
    fixture.componentInstance.setFontSize({ target: { value: '18' } } as unknown as Event);
    fixture.componentInstance.setColor('foreColor', {
      target: { value: '#2563eb' },
    } as unknown as Event);

    expect(execute).toHaveBeenCalledWith('fontName', 'Georgia');
    expect(execute).toHaveBeenCalledWith('fontSize', '5');
    expect(execute).toHaveBeenCalledWith('foreColor', '#2563eb');
    expect(fixture.nativeElement.querySelector('[aria-label="Line height"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Insert video"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Increase indent"]')).toBeTruthy();
  });

  it('adds and removes rows and columns through the selected table tools', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(
      '<table><tbody><tr><td>Customer</td><td>Status</td></tr></tbody></table>',
    );
    fixture.detectChanges();

    let cell = fixture.nativeElement.querySelector('.j-editor__control td') as HTMLTableCellElement;
    cell.click();
    fixture.componentInstance.addTableRow('after');
    expect(fixture.nativeElement.querySelectorAll('.j-editor__control tr')).toHaveLength(2);

    cell = fixture.nativeElement.querySelector('.j-editor__control td') as HTMLTableCellElement;
    cell.click();
    fixture.componentInstance.addTableColumn('after');
    expect(
      fixture.nativeElement.querySelectorAll('.j-editor__control tr:first-child td'),
    ).toHaveLength(3);

    cell = fixture.nativeElement.querySelector('.j-editor__control td') as HTMLTableCellElement;
    cell.click();
    fixture.componentInstance.deleteSelectedTable();
    expect(fixture.componentInstance.value()).not.toContain('<table');
  });

  it('edits and removes a selected link with safe attributes', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(
      '<p><a href="https://example.com">Customer portal</a></p>',
    );
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.j-editor__control a') as HTMLAnchorElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Selected link tools"]')).toBeTruthy();

    fixture.componentInstance.selectedLinkText.set('Account portal');
    fixture.componentInstance.selectedLinkUrl.set('https://accounts.example.com');
    fixture.componentInstance.selectedLinkNewWindow.set(true);
    fixture.componentInstance.applySelectedLink();
    expect(fixture.componentInstance.value()).toContain(
      '<a href="https://accounts.example.com" target="_blank" rel="noopener noreferrer">Account portal</a>',
    );

    (fixture.nativeElement.querySelector('.j-editor__control a') as HTMLAnchorElement).click();
    fixture.componentInstance.removeSelectedLink();
    expect(fixture.componentInstance.value()).toContain('Account portal');
    expect(fixture.componentInstance.value()).not.toContain('<a');
  });

  it('supports configurable height, resize, toolbar position, air mode, and spellcheck', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.componentRef.setInput('height', '18rem');
    fixture.componentRef.setInput('minHeight', '8rem');
    fixture.componentRef.setInput('resizable', false);
    fixture.componentRef.setInput('toolbarPosition', 'bottom');
    fixture.componentRef.setInput('airMode', true);
    fixture.componentRef.setInput('stickyToolbar', true);
    fixture.componentRef.setInput('spellcheck', false);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.j-editor') as HTMLElement;
    const editable = fixture.nativeElement.querySelector('.j-editor__control') as HTMLElement;
    expect(root.dataset['jToolbarPosition']).toBe('bottom');
    expect(root.classList.contains('j-editor--air')).toBe(true);
    expect(root.classList.contains('j-editor--sticky-toolbar')).toBe(true);
    expect(editable.style.height).toBe('18rem');
    expect(editable.style.minHeight).toBe('8rem');
    expect(editable.style.resize).toBe('none');
    expect(editable.getAttribute('spellcheck')).toBe('false');
  });

  it('handles editor shortcuts and lets applications opt into native Tab focus movement', () => {
    const fixture = TestBed.createComponent(JEditorComponent);
    fixture.detectChanges();
    const commands = TestBed.inject(JEditorCommandService);
    const execute = vi.spyOn(commands, 'execute').mockReturnValue(true);
    const editable = fixture.nativeElement.querySelector('.j-editor__control') as HTMLElement;

    editable.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true }),
    );
    editable.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(execute).toHaveBeenCalledWith('bold', undefined);
    expect(execute).toHaveBeenCalledWith('insertText', '    ');

    execute.mockClear();
    fixture.componentRef.setInput('tabMovesFocus', true);
    fixture.detectChanges();
    editable.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(execute).not.toHaveBeenCalled();
  });
});

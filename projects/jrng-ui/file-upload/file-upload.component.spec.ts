import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JFileUploadComponent } from './file-upload.component';

describe('JFileUploadComponent', () => {
  let fixture: ComponentFixture<JFileUploadComponent>;
  let component: JFileUploadComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JFileUploadComponent] });
    fixture = TestBed.createComponent(JFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function select(files: File[]): void {
    component.handleFileInput({ target: { files, value: 'selected' } } as unknown as Event);
  }

  it('emits validated files without starting progress in custom upload mode', () => {
    fixture.componentRef.setInput('customUpload', true);
    fixture.componentRef.setInput('auto', true);
    fixture.detectChanges();
    const upload = vi.fn();
    component.upload.subscribe(upload);
    select([new File(['data'], 'report.txt', { type: 'text/plain' })]);

    expect(upload).toHaveBeenCalledOnce();
    expect(component.queue()[0]?.status).toBe('pending');
  });

  it('starts built-in upload state when customUpload is false', () => {
    fixture.componentRef.setInput('customUpload', false);
    fixture.detectChanges();
    select([new File(['data'], 'report.txt', { type: 'text/plain' })]);
    component.emitUpload();
    expect(component.queue()[0]?.status).toBe('uploading');
    component.setComplete(component.queue()[0]!.id);
    expect(component.queue()[0]).toMatchObject({ status: 'complete', progress: 100 });
  });

  it('enforces type, size, total size, count and duplicate constraints', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('accept', '.txt');
    fixture.componentRef.setInput('maxFileSize', 5);
    fixture.componentRef.setInput('maxTotalSize', 8);
    fixture.componentRef.setInput('maxFileCount', 2);
    fixture.detectChanges();
    const first = new File(['1234'], 'one.txt', { type: 'text/plain', lastModified: 1 });
    select([first]);
    select([
      first,
      new File(['123456'], 'large.txt', { type: 'text/plain' }),
      new File(['12'], 'image.png', { type: 'image/png' }),
      new File(['12345'], 'two.txt', { type: 'text/plain' }),
    ]);

    expect(component.queue().map((item) => item.file.name)).toEqual(['one.txt']);
    expect(component.errors().map((error) => error.message)).toEqual([
      'File is already selected',
      'File exceeds 5 B',
      'File type is not allowed',
      'Total size exceeds 8 B',
    ]);
  });

  it('accepts zero-byte files, clears same-file selection, and blocks disabled interaction', () => {
    const empty = new File([], 'empty.txt', { type: 'text/plain' });
    const target = { files: [empty], value: 'selected' };
    component.handleFileInput({ target } as unknown as Event);
    expect(target.value).toBe('');
    expect(component.queue()[0]?.file.size).toBe(0);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.clear();
    expect(component.queue()).toHaveLength(1);
  });

  it('handles drag and drop, cancel, retry and remove', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    const file = new File(['x'], 'drop.txt', { type: 'text/plain' });
    component.handleDrop({ preventDefault: vi.fn(), dataTransfer: { files: [file] } } as unknown as DragEvent);
    const item = component.queue()[0]!;
    component.emitUpload();
    component.cancel(item);
    expect(component.queue()[0]?.status).toBe('cancelled');
    component.retry(component.queue()[0]!);
    expect(component.queue()[0]?.status).toBe('pending');
    component.removeItem(component.queue()[0]!);
    expect(component.queue()).toEqual([]);
  });
});

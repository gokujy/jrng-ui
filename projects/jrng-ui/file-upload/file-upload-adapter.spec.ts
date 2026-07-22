import { TestBed } from '@angular/core/testing';
import { JFileUploadComponent, JFileUploadItem } from './file-upload.component';

describe('JFileUploadComponent adapters', () => {
  it('runs an adapter, reports progress, and completes the item', async () => {
    const fixture = TestBed.createComponent(JFileUploadComponent);
    const file = new File(['data'], 'report.csv', { type: 'text/csv' });
    const item: JFileUploadItem = { id: '1', file, progress: 0, status: 'pending' };
    fixture.componentInstance.queue.set([item]);
    fixture.componentRef.setInput('uploadAdapter', {
      upload: async (_file: File, context: { reportProgress: (value: number) => void }) => {
        context.reportProgress(40);
        return { remote: { id: 'remote-1' } };
      },
    });
    fixture.componentInstance.emitUpload();
    await new Promise((resolve) => setTimeout(resolve));
    expect(fixture.componentInstance.queue()[0]).toMatchObject({
      status: 'complete',
      progress: 100,
    });
  });

  it('cancels an active adapter through AbortSignal', () => {
    const fixture = TestBed.createComponent(JFileUploadComponent);
    const file = new File(['data'], 'large.bin');
    const item: JFileUploadItem = { id: '1', file, progress: 0, status: 'pending' };
    let signal: AbortSignal | undefined;
    fixture.componentInstance.queue.set([item]);
    fixture.componentRef.setInput('uploadAdapter', {
      upload: (_file: File, context: { signal: AbortSignal }) => {
        signal = context.signal;
        return new Promise(() => undefined);
      },
    });
    fixture.componentInstance.emitUpload();
    fixture.componentInstance.cancel(item);
    expect(signal?.aborted).toBe(true);
    expect(fixture.componentInstance.queue()[0]?.status).toBe('cancelled');
  });
});

import { JPopoutRef } from './popout-ref';

describe('JPopoutRef', () => {
  it('communicates, focuses, and closes idempotently', () => {
    const popup = {
      closed: false,
      postMessage: vi.fn(),
      focus: vi.fn(),
    } as unknown as Window;
    const ref = new JPopoutRef('customer', popup, { id: 1 }, 'window');
    const cleanup = vi.fn();
    const fromParent = vi.fn();
    const fromPopout = vi.fn();
    ref._setCleanup(cleanup);
    ref.messageFromParent.subscribe(fromParent);
    ref.messageFromPopout.subscribe(fromPopout);
    ref.state.set('open');

    expect(ref.postMessage({ selected: 2 })).toBe(true);
    expect(popup.postMessage).toHaveBeenCalledWith(
      { channel: 'customer', direction: 'parent', message: { selected: 2 } },
      '*',
    );
    ref._receiveFromParent('refresh');
    ref.sendToParent('ready');
    expect(fromParent).toHaveBeenCalledWith('refresh');
    expect(fromPopout).toHaveBeenCalledWith('ready');
    expect(ref.focus()).toBe(true);
    ref.close();
    ref.close();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(ref.state()).toBe('closed');
  });
});

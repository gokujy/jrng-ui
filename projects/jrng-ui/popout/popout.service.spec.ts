import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JComponentPortal, JDomPortal } from 'jrng-ui/portal';
import { J_POPOUT_REF, JPopoutRef } from './popout-ref';
import { JPopoutService } from './popout.service';
import { J_POPOUT_WINDOW_ADAPTER, JPopoutWindowAdapter } from './popout.types';

@Component({ selector: 'j-popout-test-content', template: 'Customer monitoring panel' })
class PopoutContentComponent {
  readonly popoutRef = inject(J_POPOUT_REF);
}

class FakeWindow extends EventTarget {
  readonly document = document.implementation.createHTMLDocument('Popup');
  closed = false;
  readonly focus = vi.fn();
  readonly postMessage = vi.fn((data: unknown) => {
    this.dispatchEvent(new MessageEvent('message', { data }));
  });
  close = vi.fn(() => {
    this.closed = true;
  });
}

describe('JPopoutService', () => {
  let service: JPopoutService;
  let popup: FakeWindow;
  let adapter: JPopoutWindowAdapter;

  beforeEach(() => {
    popup = new FakeWindow();
    adapter = {
      supported: true,
      pictureInPictureSupported: false,
      open: vi.fn(() => popup as unknown as Window),
      requestPictureInPicture: vi.fn(async () => null),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: J_POPOUT_WINDOW_ADAPTER, useValue: adapter }],
    });
    service = TestBed.inject(JPopoutService);
  });

  it('opens a component portal without bootstrapping another app and cleans it up', async () => {
    const ref = await service.open<PopoutContentComponent>(
      new JComponentPortal(PopoutContentComponent),
      { title: 'Customer monitor', copyStyles: false, syncTheme: false },
    );
    expect(ref.state()).toBe('open');
    expect(ref.instance).toBeInstanceOf(PopoutContentComponent);
    expect(ref.instance?.popoutRef).toBe(ref);
    expect(popup.document.title).toBe('Customer monitor');
    expect(popup.document.body.textContent).toContain('Customer monitoring panel');
    expect(popup.focus).toHaveBeenCalled();
    ref.close();
    expect(popup.close).toHaveBeenCalled();
    expect(ref.state()).toBe('closed');
  });

  it('restores DOM portals and supports parent/popout messages', async () => {
    const parent = document.createElement('div');
    const content = document.createElement('p');
    content.textContent = 'Live chart';
    parent.append(content);
    document.body.append(parent);
    const ref = await service.open(new JDomPortal(content), {
      copyStyles: false,
      syncTheme: false,
    });
    const received = vi.fn();
    ref.messageFromParent.subscribe(received);
    expect(ref.postMessage('refresh')).toBe(true);
    expect(received).toHaveBeenCalledWith('refresh');
    ref.close();
    expect(parent.contains(content)).toBe(true);
    parent.remove();
  });

  it('uses Document Picture-in-Picture when available', async () => {
    adapter = {
      ...adapter,
      pictureInPictureSupported: true,
      requestPictureInPicture: vi.fn(async () => popup as unknown as Window),
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: J_POPOUT_WINDOW_ADAPTER, useValue: adapter }],
    });
    service = TestBed.inject(JPopoutService);
    const node = document.createElement('div');
    document.body.append(node);
    const ref = await service.open(new JDomPortal(node), {
      mode: 'picture-in-picture',
      copyStyles: false,
      syncTheme: false,
    });
    expect(ref.mode).toBe('picture-in-picture');
    expect(adapter.requestPictureInPicture).toHaveBeenCalled();
    ref.close();
    node.remove();
  });

  it('reuses and focuses an existing named popout', async () => {
    const first = await service.open(new JComponentPortal(PopoutContentComponent), {
      name: 'customer-monitor',
      reuse: true,
      copyStyles: false,
      syncTheme: false,
    });
    const second = await service.open(new JComponentPortal(PopoutContentComponent), {
      name: 'customer-monitor',
      reuse: true,
    });
    expect(second).toBe(first);
    expect(adapter.open).toHaveBeenCalledOnce();
    first.close();
  });

  it('provides an inline popup-blocked fallback and closeAll cleanup', async () => {
    (adapter.open as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const node = document.createElement('div');
    node.textContent = 'Fallback detail';
    document.body.append(node);
    const ref = await service.open(new JDomPortal(node), { fallback: 'inline' });
    expect(ref.state()).toBe('inline');
    expect(document.querySelector('j-popout')?.textContent).toContain('Fallback detail');
    service.closeAll();
    expect(ref.state()).toBe('closed');
    node.remove();
  });

  it('returns an unsupported state without touching browser APIs', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: J_POPOUT_WINDOW_ADAPTER,
          useValue: {
            supported: false,
            pictureInPictureSupported: false,
            open: vi.fn(),
            requestPictureInPicture: vi.fn(),
          },
        },
      ],
    });
    service = TestBed.inject(JPopoutService);
    const node = document.createElement('div');
    const ref: JPopoutRef = await service.open(new JDomPortal(node), { fallback: 'none' });
    expect(ref.state()).toBe('unsupported');
  });
});

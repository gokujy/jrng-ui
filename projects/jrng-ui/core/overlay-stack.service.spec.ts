import { describe, expect, it } from 'vitest';
import { JOverlayStackService } from './overlay-stack.service';

describe('JOverlayStackService', () => {
  it('reports the most recently pushed overlay as topmost', () => {
    const stack = new JOverlayStackService();
    const a = {};
    const b = {};
    stack.push(a);
    expect(stack.isTopmost(a)).toBe(true);
    stack.push(b);
    expect(stack.isTopmost(b)).toBe(true);
    expect(stack.isTopmost(a)).toBe(false);
  });

  it('restores the previous overlay as topmost after removing the front one', () => {
    const stack = new JOverlayStackService();
    const a = {};
    const b = {};
    stack.push(a);
    stack.push(b);
    stack.remove(b);
    expect(stack.isTopmost(a)).toBe(true);
  });

  it('re-pushing an existing overlay moves it to the top', () => {
    const stack = new JOverlayStackService();
    const a = {};
    const b = {};
    stack.push(a);
    stack.push(b);
    stack.push(a);
    expect(stack.isTopmost(a)).toBe(true);
  });

  it('nothing is topmost once the stack is empty', () => {
    const stack = new JOverlayStackService();
    const a = {};
    stack.push(a);
    stack.remove(a);
    expect(stack.isTopmost(a)).toBe(false);
  });
});

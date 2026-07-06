import { describe, expect, it } from 'vitest';
import { jComputeConnectedPosition } from './overlay-position';

const viewport = { width: 1000, height: 800 };
const panel = { width: 200, height: 150 };

describe('jComputeConnectedPosition', () => {
  it('places the panel below the trigger when there is room', () => {
    const pos = jComputeConnectedPosition({
      trigger: { top: 100, bottom: 130, left: 50, width: 180 },
      panel,
      viewport,
    });
    expect(pos.placement).toBe('bottom');
    expect(pos.top).toBe(134); // bottom + gap(4)
    expect(pos.left).toBe(50);
  });

  it('flips above when there is not enough room below', () => {
    const pos = jComputeConnectedPosition({
      trigger: { top: 700, bottom: 740, left: 50, width: 180 },
      panel,
      viewport,
    });
    expect(pos.placement).toBe('top');
    expect(pos.top).toBe(700 - 150 - 4); // trigger.top - height - gap
  });

  it('matches the trigger width by default', () => {
    const pos = jComputeConnectedPosition({
      trigger: { top: 100, bottom: 130, left: 50, width: 180 },
      panel,
      viewport,
    });
    expect(pos.width).toBe(180);
  });

  it('clamps horizontally to stay within the viewport', () => {
    const pos = jComputeConnectedPosition({
      trigger: { top: 100, bottom: 130, left: 950, width: 180 },
      panel,
      viewport,
      matchWidth: false,
    });
    // left would be 950, but panel(200) must fit within 1000 - margin(4)
    expect(pos.left).toBe(1000 - 200 - 4);
  });

  it('honors an explicit placement', () => {
    const pos = jComputeConnectedPosition({
      trigger: { top: 100, bottom: 130, left: 50, width: 180 },
      panel,
      viewport,
      placement: 'top',
    });
    expect(pos.placement).toBe('top');
  });
});

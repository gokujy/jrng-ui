import { describe, expect, it } from 'vitest';
import { JIdGenerator, jCreateId } from './id';

describe('JIdGenerator', () => {
  it('creates unique sequential ids scoped to the instance', () => {
    const gen = new JIdGenerator();
    expect(gen.create('x')).toBe('x-1');
    expect(gen.create('x')).toBe('x-2');
    expect(gen.create('y')).toBe('y-3');
  });

  it('defaults the prefix to "j"', () => {
    expect(new JIdGenerator().create()).toBe('j-1');
  });

  it('gives each instance its own counter (per-injector isolation)', () => {
    const a = new JIdGenerator();
    const b = new JIdGenerator();
    a.create('a');
    a.create('a');
    expect(b.create('b')).toBe('b-1');
  });
});

describe('jCreateId', () => {
  it('falls back to a prefixed unique id outside an injection context', () => {
    const first = jCreateId('field');
    const second = jCreateId('field');
    expect(first).toMatch(/^field-\d+$/);
    expect(second).toMatch(/^field-\d+$/);
    expect(first).not.toBe(second);
  });
});

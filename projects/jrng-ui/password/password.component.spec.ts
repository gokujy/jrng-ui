import { reflectComponentType } from '@angular/core';
import { JPasswordComponent } from './password.component';
import { jEvaluatePassword } from './password.component';

describe('JPasswordComponent public contract', () => {
  const metadata = reflectComponentType(JPasswordComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-password');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('password strength guidance', () => {
  it('evaluates configurable rules without claiming server security', () => {
    expect(
      jEvaluatePassword('Ab1!', [
        { id: 'upper', label: 'Upper', test: (value) => /[A-Z]/.test(value) },
      ]),
    ).toEqual([{ id: 'upper', label: 'Upper', passed: true }]);
  });
});

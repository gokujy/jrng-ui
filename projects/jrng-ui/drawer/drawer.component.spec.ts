import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JBodyScrollLockService } from 'jrng-ui/core';
import { JDrawerComponent } from './drawer.component';

describe('JDrawerComponent public contract', () => {
  const metadata = reflectComponentType(JDrawerComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-drawer');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JDrawerComponent bottom sheet sizing', () => {
  it('opens at the first configured snap point', () => {
    const fixture = TestBed.createComponent(JDrawerComponent);
    fixture.componentRef.setInput('position', 'bottom');
    fixture.componentRef.setInput('snapPoints', ['36%', '80%']);
    fixture.detectChanges();

    expect(fixture.componentInstance.computedHeight).toBe('36%');
  });

  it('releases its shared scroll lock when destroyed while open', () => {
    const fixture = TestBed.createComponent(JDrawerComponent);
    const scrollLock = TestBed.inject(JBodyScrollLockService);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.destroy();

    expect(document.body.style.overflow).toBe('');
    scrollLock.clear();
  });
});

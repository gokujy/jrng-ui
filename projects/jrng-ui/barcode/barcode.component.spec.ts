import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { JBarcodeComponent } from './barcode.component';

describe('JBarcodeComponent', () => {
  it('renders one named graphic while hiding SVG internals', () => {
    const fixture = TestBed.createComponent(JBarcodeComponent);
    fixture.componentRef.setInput('value', 'https://jrngui.dev');
    fixture.componentRef.setInput('ariaLabel', 'JRNG documentation QR code');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('JRNG documentation QR code');
    expect(svg.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(svg.querySelectorAll('[tabindex]')).toHaveLength(0);
  });

  it('renders normalized EAN text separately from the graphic', () => {
    const fixture = TestBed.createComponent(JBarcodeComponent);
    fixture.componentRef.setInput('symbology', 'ean13');
    fixture.componentRef.setInput('value', '400638133393');
    fixture.componentRef.setInput('showValue', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('figcaption').textContent).toContain(
      '4006381333931',
    );
    expect(fixture.nativeElement.querySelector('svg').textContent).not.toContain('4006381333931');
  });

  it('emits ready and invalid states for repeated controlled changes', () => {
    const fixture = TestBed.createComponent(JBarcodeComponent);
    const ready = vi.fn();
    const invalid = vi.fn();
    fixture.componentInstance.ready.subscribe(ready);
    fixture.componentInstance.invalid.subscribe(invalid);
    fixture.componentRef.setInput('value', 'first');
    fixture.detectChanges();
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();
    expect(ready).toHaveBeenCalledOnce();
    expect(invalid).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('exports stable SVG without requiring browser globals', () => {
    const fixture = TestBed.createComponent(JBarcodeComponent);
    fixture.componentRef.setInput('value', 'asset-42');
    fixture.detectChanges();
    const first = fixture.componentInstance.toSvg();
    const second = fixture.componentInstance.exportSvg();
    expect(first).toBe(second);
    expect(first).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(JBarcodeComponent.toString()).not.toContain('window.');
  });

  it('blocks export actions when disabled and preserves encoded order in RTL', () => {
    const fixture = TestBed.createComponent(JBarcodeComponent);
    fixture.componentRef.setInput('symbology', 'code128');
    fixture.componentRef.setInput('value', 'ABC-123');
    fixture.componentRef.setInput('dir', 'rtl');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('figure').getAttribute('dir')).toBe('rtl');
    expect(fixture.componentInstance.graphic().encodedValue).toBe('ABC-123');
    expect(fixture.componentInstance.exportSvg()).toBe('');
  });

  it('rejects non-positive dimensions instead of emitting broken SVG', () => {
    const fixture = TestBed.createComponent(JBarcodeComponent);
    fixture.componentRef.setInput('value', 'size');
    fixture.componentRef.setInput('width', 0);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasErrors()).toBe(true);
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('keeps responsive and print safeguards in the component styles', () => {
    const source = JBarcodeComponent.toString();
    expect(source).toContain('max-width: 100%');
    expect(source).toContain('@media print');
    expect(source).toContain('print-color-adjust');
  });
});

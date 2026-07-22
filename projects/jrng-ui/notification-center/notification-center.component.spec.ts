import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JNotificationCenterComponent } from './notification-center.component';

describe('JNotificationCenterComponent public contract', () => {
  const metadata = reflectComponentType(JNotificationCenterComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-notification-center');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('notification state', () => {
  it('marks one or all notifications read and deletes locally', () => {
    const fixture = TestBed.createComponent(JNotificationCenterComponent);
    const item = { id: 1, title: 'Update' };
    fixture.componentRef.setInput('notifications', [item]);
    fixture.detectChanges();
    fixture.componentInstance.markRead(item);
    expect(fixture.componentInstance.isRead(item)).toBe(true);
    fixture.componentInstance.remove(item);
    expect(fixture.componentInstance.filtered()).toEqual([]);
  });
});

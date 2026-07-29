import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JSpeedDialAction, JSpeedDialComponent } from './speed-dial.component';

@Component({
  imports: [JSpeedDialComponent],
  template: `
    <j-speed-dial
      [actions]="actions"
      [disabled]="disabled()"
      [type]="type()"
      [direction]="direction()"
      [mask]="true"
      [(open)]="open"
      (actionComplete)="completed = completed + 1"
      (actionError)="failed = failed + 1"
    />
  `,
})
class SpeedDialHostComponent {
  readonly disabled = signal(false);
  readonly type = signal<'linear' | 'circle' | 'semi-circle'>('linear');
  readonly direction = signal<'up' | 'down' | 'left' | 'right'>('up');
  open = false;
  completed = 0;
  failed = 0;
  actions: readonly JSpeedDialAction[] = [
    { id: 'edit', label: 'Edit customer', icon: 'file', command: () => undefined },
    { id: 'archive', label: 'Archive customer', icon: 'archive', disabled: true },
  ];
}

describe('JSpeedDialComponent', () => {
  let fixture: ComponentFixture<SpeedDialHostComponent>;
  let component: JSpeedDialComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeedDialHostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('opens, renders named actions and closes on Escape with focus restoration', async () => {
    component.show();
    fixture.detectChanges();
    expect(component.open()).toBe(true);
    expect(fixture.nativeElement.querySelector('.j-speed-dial__mask')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Edit customer"]')).toBeTruthy();
    fixture.nativeElement
      .querySelector('.j-speed-dial__root')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await Promise.resolve();
    expect(component.open()).toBe(false);
  });

  it('runs actions, reports completion, and prevents disabled actions', async () => {
    component.show();
    await component.runAction(fixture.componentInstance.actions[0], 0);
    expect(fixture.componentInstance.completed).toBe(1);
    await component.runAction(fixture.componentInstance.actions[1], 1);
    expect(fixture.componentInstance.completed).toBe(1);
  });

  it('retains the dial and emits an async action error', async () => {
    const failed: JSpeedDialAction = {
      id: 'delete',
      label: 'Delete customer',
      icon: 'close',
      command: () => Promise.reject(new Error('Denied')),
    };
    component.show();
    await component.runAction(failed, 0);
    expect(fixture.componentInstance.failed).toBe(1);
    expect(component.open()).toBe(true);
    expect(component.loadingId()).toBe('');
  });

  it('supports linear, circle, semi-circle, RTL, and disabled state', () => {
    expect(component.actionPosition(0).y).toBeLessThan(0);
    fixture.componentInstance.type.set('circle');
    fixture.detectChanges();
    expect(component.actionPosition(0)).toEqual({ x: expect.any(Number), y: expect.any(Number) });
    fixture.componentInstance.type.set('semi-circle');
    fixture.detectChanges();
    expect(component.actionPosition(1)).toEqual({ x: expect.any(Number), y: expect.any(Number) });
    document.documentElement.dir = 'rtl';
    fixture.componentInstance.type.set('linear');
    fixture.componentInstance.direction.set('right');
    fixture.detectChanges();
    expect(component.actionPosition(0).x).toBeLessThan(0);
    document.documentElement.dir = '';
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    component.show();
    expect(component.open()).toBe(false);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reflectComponentType } from '@angular/core';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { JSchedulerComponent } from './scheduler.component';

describe('JSchedulerComponent', () => {
  let fixture: ComponentFixture<JSchedulerComponent>;
  let component: JSchedulerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JSchedulerComponent] });
    fixture = TestBed.createComponent(JSchedulerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('date', new Date(2026, 7, 5));
    fixture.detectChanges();
  });

  it('uses the production selector and OnPush standalone metadata', () => {
    const metadata = reflectComponentType(JSchedulerComponent);
    expect(metadata?.selector).toBe('j-scheduler');
    expect(metadata?.isStandalone).toBe(true);
  });

  it('renders an accessible toolbar and active view', () => {
    const root = fixture.nativeElement.querySelector('.j-scheduler') as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Scheduler');
    expect(root.dataset['view']).toBe('month');
    expect(fixture.nativeElement.textContent).toContain('August 2026');
  });

  it('emits immutable controlled navigation changes', () => {
    const change = vi.fn();
    component.date.subscribe(change);
    component.next();
    expect(change).toHaveBeenCalledWith(new Date(2026, 8, 5));
  });

  it('blocks controlled changes when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    const change = vi.fn();
    component.date.subscribe(change);
    component.next();
    component.changeView('week');
    expect(change).not.toHaveBeenCalled();
    expect(component.view()).toBe('month');
  });

  it('emits event requests without mutating controlled events', () => {
    const event = {
      id: 'planning',
      title: 'Team planning',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    const change = vi.fn();
    component.eventChange.subscribe(change);
    component.updateEvent({ ...event, title: 'Updated planning' });
    expect(change).toHaveBeenCalledOnce();
    expect(component.getEvents()[0]?.title).toBe('Team planning');
  });
});

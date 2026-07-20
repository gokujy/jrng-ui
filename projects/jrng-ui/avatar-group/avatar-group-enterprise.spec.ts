import { TestBed } from '@angular/core/testing';
import { JAvatarGroupComponent } from './avatar-group.component';

describe('JAvatarGroupComponent enterprise overflow', () => {
  it('limits visible avatars and exposes an accessible overflow popover', () => {
    const fixture = TestBed.createComponent(JAvatarGroupComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Ada' },
      { label: 'Lin' },
      { label: 'Grace' },
    ]);
    fixture.componentRef.setInput('maxVisible', 2);
    fixture.detectChanges();
    const overflow = fixture.nativeElement.querySelector('.j-avatar-group__overflow');
    expect(overflow).toBeTruthy();
    const trigger = overflow.querySelector('button');
    expect(trigger.getAttribute('aria-label')).toContain('1 more');
    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="listitem"]')).toHaveLength(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});

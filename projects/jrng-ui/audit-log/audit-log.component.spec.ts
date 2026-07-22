import { TestBed } from '@angular/core/testing';
import { JAuditLogComponent } from './audit-log.component';
describe('JAuditLogComponent', () => {
  it.each(['timeline', 'table', 'compact'] as const)('renders the %s layout', (layout) => {
    const f = TestBed.createComponent(JAuditLogComponent);
    f.componentRef.setInput('layout', layout);
    f.componentRef.setInput('items', [
      { id: 1, actor: 'A user', action: 'Updated', timestamp: '2026-01-01' },
    ]);
    f.detectChanges();
    expect(f.nativeElement.querySelector('section').getAttribute('data-j-layout')).toBe(layout);
    expect(f.nativeElement.textContent).toContain('Updated');
  });
});

import { Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JTemplatePortal } from 'jrng-ui/portal';
import { JPopoutComponent } from './popout.component';

@Component({
  imports: [JPopoutComponent],
  template: `
    <ng-template #content>Customer detail</ng-template>
    <j-popout #popout inline ariaLabel="Inline customer detail" />
  `,
})
class PopoutHostComponent {
  @ViewChild('content', { read: TemplateRef }) template!: TemplateRef<unknown>;
  @ViewChild('content', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('popout') popout!: JPopoutComponent;
}

describe('JPopoutComponent', () => {
  it('attaches, replaces, and detaches portals in an accessible inline surface', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [PopoutHostComponent],
    }).createComponent(PopoutHostComponent);
    fixture.detectChanges();
    const portal = new JTemplatePortal(
      fixture.componentInstance.template,
      fixture.componentInstance.container,
    );
    const ref = fixture.componentInstance.popout.attach(portal);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="region"]').getAttribute('aria-label')).toBe(
      'Inline customer detail',
    );
    expect(fixture.nativeElement.textContent).toContain('Customer detail');
    fixture.componentInstance.popout.detach();
    expect(ref?.isAttached).toBe(false);
  });
});

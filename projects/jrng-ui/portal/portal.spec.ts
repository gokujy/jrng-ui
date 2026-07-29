import { Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  JComponentPortal,
  JDomPortal,
  JPortalOutletDirective,
  JPortalRef,
  JPortalService,
  JTemplatePortal,
} from './portal';

@Component({ selector: 'j-portal-test-content', template: 'Dynamic customer toolbar' })
class PortalContentComponent {}

@Component({
  imports: [JPortalOutletDirective],
  template: `
    <ng-template #content>Customer detail</ng-template>
    <ng-container jPortalOutlet #outlet="jPortalOutlet" />
  `,
})
class PortalHostComponent {
  @ViewChild('content', { read: TemplateRef }) template!: TemplateRef<unknown>;
  @ViewChild('outlet') outlet!: JPortalOutletDirective;
  @ViewChild('content', { read: ViewContainerRef }) container!: ViewContainerRef;
}

describe('portal utilities', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [PortalHostComponent] }));

  it('attaches, replaces, detaches and destroys Angular content', () => {
    const fixture = TestBed.createComponent(PortalHostComponent);
    fixture.detectChanges();
    const templateRef = fixture.componentInstance.outlet.attach(
      new JTemplatePortal(
        fixture.componentInstance.template,
        fixture.componentInstance.container,
        {},
      ),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Customer detail');
    const componentRef = fixture.componentInstance.outlet.replace(
      new JComponentPortal(PortalContentComponent),
    );
    fixture.detectChanges();
    expect(componentRef.instance).toBeInstanceOf(PortalContentComponent);
    expect(fixture.nativeElement.textContent).toContain('Dynamic customer toolbar');
    fixture.componentInstance.outlet.detach();
    expect(templateRef.isAttached).toBe(false);
    expect(componentRef.isAttached).toBe(false);
  });

  it('prevents duplicate attachment and exposes the service', () => {
    const fixture = TestBed.createComponent(PortalHostComponent);
    fixture.detectChanges();
    const portal = new JTemplatePortal(
      fixture.componentInstance.template,
      fixture.componentInstance.container,
      {},
    );
    fixture.componentInstance.outlet.attach(portal);
    expect(() => fixture.componentInstance.outlet.attach(portal)).toThrow();
    expect(TestBed.inject(JPortalService)).toBeTruthy();
  });

  it('restores DOM portals and makes refs idempotent', () => {
    const parent = document.createElement('div');
    const node = document.createElement('span');
    parent.append(node);
    document.body.append(parent);
    const fixture = TestBed.createComponent(PortalHostComponent);
    fixture.detectChanges();
    const ref = fixture.componentInstance.outlet.attach(new JDomPortal(node));
    expect(parent.contains(node)).toBe(false);
    ref.detach();
    ref.detach();
    expect(parent.contains(node)).toBe(true);
    const callback = vi.fn();
    const plainRef = new JPortalRef(null, callback);
    plainRef.destroy();
    plainRef.destroy();
    expect(callback).toHaveBeenCalledOnce();
    parent.remove();
  });
});

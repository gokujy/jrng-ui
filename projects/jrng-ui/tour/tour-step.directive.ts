import { Directive, ElementRef, OnDestroy, effect, inject, input } from '@angular/core';

import { JTourService } from './tour.service';
import { JTourAlign, JTourSide } from './tour.types';

@Directive({
  selector: '[jTourStep]',
  standalone: true,
})
export class JTourStepDirective implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly tour = inject(JTourService);
  private registeredId = '';

  readonly stepId = input('', { alias: 'jTourStep' });
  readonly title = input('', { alias: 'tourTitle' });
  readonly description = input('', { alias: 'tourDescription' });
  readonly side = input<JTourSide | undefined>(undefined, { alias: 'tourSide' });
  readonly align = input<JTourAlign | undefined>(undefined, { alias: 'tourAlign' });
  readonly popoverClass = input('', { alias: 'tourPopoverClass' });

  private readonly syncStep = effect(() => {
    const id = this.stepId().trim();

    if (this.registeredId && this.registeredId !== id) {
      this.tour.unregisterStep(this.registeredId);
      this.registeredId = '';
    }

    if (!id) {
      return;
    }

    this.registeredId = id;
    this.tour.registerStep({
      id,
      element: this.elementRef.nativeElement,
      title: this.title(),
      description: this.description(),
      side: this.side(),
      align: this.align(),
      popoverClass: this.popoverClass(),
    });
  });

  ngOnDestroy(): void {
    if (this.registeredId) {
      this.tour.unregisterStep(this.registeredId);
    }
  }
}

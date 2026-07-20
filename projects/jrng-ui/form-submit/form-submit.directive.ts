import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  booleanAttribute,
  inject,
  input,
  output,
} from '@angular/core';
import { AbstractControl, FormGroupDirective, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { JLiveAnnouncerService } from 'jrng-ui/core';

export interface JFormSubmitEvent {
  readonly nativeEvent: SubmitEvent;
  readonly form: AbstractControl | null;
}

@Directive({
  selector: 'form[jFormSubmit]',
  host: {
    '[attr.aria-busy]': 'submitting() ? "true" : null',
    '[class.j-form-submitting]': 'submitting()',
    '(submit)': 'handleSubmit($event)',
  },
})
export class JFormSubmitDirective implements OnInit, OnDestroy {
  private readonly formDirective = inject(FormGroupDirective, { optional: true });
  private readonly host = inject<ElementRef<HTMLFormElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly announcer = inject(JLiveAnnouncerService);
  private serverResetSubscription?: Subscription;

  readonly submitting = input(false, { transform: booleanAttribute });
  readonly focusInvalid = input(true, { transform: booleanAttribute });
  readonly scrollInvalid = input(true, { transform: booleanAttribute });
  readonly announceInvalid = input(true, { transform: booleanAttribute });
  readonly resetServerErrorsOnChange = input(false, { transform: booleanAttribute });
  readonly invalidMessage = input('Please correct the first invalid field.');
  readonly validSubmit = output<JFormSubmitEvent>();
  readonly invalidSubmit = output<JFormSubmitEvent>();

  ngOnInit(): void {
    if (this.resetServerErrorsOnChange())
      this.serverResetSubscription = this.formDirective?.form.valueChanges.subscribe(() =>
        jClearServerErrors(this.formDirective?.form),
      );
  }
  ngOnDestroy(): void {
    this.serverResetSubscription?.unsubscribe();
  }

  handleSubmit(event: SubmitEvent): void {
    if (this.submitting()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const form = this.formDirective?.form ?? null;
    form?.markAllAsTouched();
    form?.updateValueAndValidity();
    if (form?.invalid || this.host.nativeElement.matches(':invalid')) {
      event.preventDefault();
      const payload = { nativeEvent: event, form };
      this.invalidSubmit.emit(payload);
      const invalid = this.findFirstInvalid();
      if (this.announceInvalid())
        this.announcer.announce(this.describeInvalid(invalid), 'assertive');
      if (invalid && this.browser) {
        if (this.scrollInvalid() && typeof invalid.scrollIntoView === 'function')
          invalid.scrollIntoView({
            behavior: prefersReducedMotion(this.document) ? 'auto' : 'smooth',
            block: 'center',
          });
        if (this.focusInvalid()) invalid.focus({ preventScroll: true });
      }
      return;
    }
    this.validSubmit.emit({ nativeEvent: event, form });
  }

  private findFirstInvalid(): HTMLElement | null {
    if (!this.browser) return null;
    return this.host.nativeElement.querySelector<HTMLElement>(
      ':is(input, select, textarea, button, [tabindex]):is(.ng-invalid, [aria-invalid="true"], :invalid):not([disabled])',
    );
  }

  private describeInvalid(element: HTMLElement | null): string {
    if (!element) return this.invalidMessage();
    const describedBy =
      element.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? [];
    const description = describedBy
      .map((id) => this.document.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    const labelId = element.getAttribute('aria-labelledby');
    const label = labelId
      ? this.document.getElementById(labelId)?.textContent?.trim()
      : this.document
          .querySelector<HTMLLabelElement>(`label[for="${cssEscape(element.id)}"]`)
          ?.textContent?.trim();
    return [label, description || this.invalidMessage()].filter(Boolean).join(': ');
  }
}

export function jClearServerErrors(
  control: AbstractControl | null | undefined,
  key = 'server',
): void {
  if (!control) return;
  const children = readChildren(control);
  for (const child of children) jClearServerErrors(child, key);
  if (!control.errors?.[key]) return;
  const errors: ValidationErrors = { ...control.errors };
  delete errors[key];
  control.setErrors(Object.keys(errors).length ? errors : null);
}

function readChildren(control: AbstractControl): AbstractControl[] {
  const controls = (
    control as unknown as { controls?: AbstractControl[] | Record<string, AbstractControl> }
  ).controls;
  return Array.isArray(controls) ? controls : controls ? Object.values(controls) : [];
}
function prefersReducedMotion(documentRef: Document): boolean {
  return documentRef.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && CSS.escape
    ? CSS.escape(value)
    : value.replace(/["\\]/g, '\\$&');
}

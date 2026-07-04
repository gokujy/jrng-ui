import { Directive, HostListener, input, output } from '@angular/core';

export type JKeyFilterPreset = 'int' | 'num' | 'alpha' | 'alphanum' | 'hex' | 'email';

const presetPatterns: Readonly<Record<JKeyFilterPreset, RegExp>> = {
  int: /^[0-9-]$/,
  num: /^[0-9.,-]$/,
  alpha: /^[A-Za-z]$/,
  alphanum: /^[A-Za-z0-9]$/,
  hex: /^[A-Fa-f0-9]$/,
  email: /^[A-Za-z0-9@._%+-]$/,
};

@Directive({
  selector: '[jKeyFilter]',
  standalone: true,
})
export class JKeyFilterDirective {
  readonly jKeyFilter = input<JKeyFilterPreset | RegExp>('alphanum');
  readonly rejected = output<KeyboardEvent>();

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) {
      return;
    }

    const filter = this.jKeyFilter();
    const pattern = typeof filter === 'string' ? presetPatterns[filter] : filter;

    if (pattern.test(event.key)) {
      return;
    }

    event.preventDefault();
    this.rejected.emit(event);
  }
}

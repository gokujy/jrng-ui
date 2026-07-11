import {
  Directive,
  OnChanges,
  OnDestroy,
  inject,
  input,
  output,
} from '@angular/core';
import {
  JKeyboardShortcutCleanup,
  JKeyboardShortcutsService,
} from './keyboard-shortcuts.service';

@Directive({
  selector: '[jHotkey]',
  exportAs: 'jHotkey',
})
export class JHotkeyDirective implements OnChanges, OnDestroy {
  private readonly shortcuts = inject(JKeyboardShortcutsService);
  private cleanup: JKeyboardShortcutCleanup | null = null;

  readonly jHotkey = input('');
  readonly jHotkeyDisabled = input(false);
  readonly jHotkeyAllowInEditable = input(false);
  readonly jHotkeyPressed = output<KeyboardEvent>();

  ngOnChanges(): void {
    this.register();
  }

  ngOnDestroy(): void {
    this.unregister();
  }

  private register(): void {
    this.unregister();
    const shortcut = this.jHotkey().trim();
    if (!shortcut || this.jHotkeyDisabled()) {
      return;
    }

    this.cleanup = this.shortcuts.register(
      shortcut,
      (event) => this.jHotkeyPressed.emit(event),
      {
        allowInEditable: this.jHotkeyAllowInEditable(),
        preventDefault: true,
      },
    );
  }

  private unregister(): void {
    this.cleanup?.();
    this.cleanup = null;
  }
}

import { Directive, inject, input, output } from '@angular/core';
import { JClipboardResult, JClipboardService } from './clipboard.service';

@Directive({
  selector: '[jCopyToClipboard]',
  host: {
    '(click)': 'copy()',
  },
  exportAs: 'jCopyToClipboard',
})
export class JCopyToClipboardDirective {
  private readonly clipboard = inject(JClipboardService);

  readonly jCopyToClipboard = input('');
  readonly jCopyDisabled = input(false);
  readonly jCopySuccess = output<JClipboardResult>();
  readonly jCopyError = output<JClipboardResult>();

  async copy(): Promise<JClipboardResult> {
    const text = this.jCopyToClipboard();
    if (this.jCopyDisabled()) {
      const result: JClipboardResult = { status: 'unavailable', text };
      this.jCopyError.emit(result);
      return result;
    }

    const result = await this.clipboard.copyText(text);
    if (result.status === 'success') {
      this.jCopySuccess.emit(result);
    } else {
      this.jCopyError.emit(result);
    }
    return result;
  }
}

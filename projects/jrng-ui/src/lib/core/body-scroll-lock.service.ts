import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JBodyScrollLockService {
  private readonly documentRef = inject(DOCUMENT);
  private lockCount = 0;
  private previousOverflow = '';

  lock(): void {
    this.lockCount += 1;

    if (this.lockCount > 1) {
      return;
    }

    this.previousOverflow = this.documentRef.body.style.overflow;
    this.documentRef.body.style.overflow = 'hidden';
  }

  unlock(): void {
    if (this.lockCount === 0) {
      return;
    }

    this.lockCount -= 1;

    if (this.lockCount === 0) {
      this.documentRef.body.style.overflow = this.previousOverflow;
      this.previousOverflow = '';
    }
  }

  clear(): void {
    this.lockCount = 0;
    this.documentRef.body.style.overflow = this.previousOverflow;
    this.previousOverflow = '';
  }
}

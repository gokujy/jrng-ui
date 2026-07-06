import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JZIndexManagerService {
  private current = 1000;

  next(base = 1000): number {
    this.current = Math.max(this.current + 1, base);
    return this.current;
  }

  reset(value = 1000): void {
    this.current = value;
  }
}

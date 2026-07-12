import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MockAuthService } from '../services/mock-auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(MockAuthService);
  return auth.isAuthenticated() || inject(Router).createUrlTree(['/login']);
};

import { InjectionToken, makeEnvironmentProviders } from '@angular/core';

export interface JrngLocale {
  readonly accept: string;
  readonly reject: string;
  readonly cancel: string;
  readonly close: string;
  readonly clear: string;
  readonly today: string;
  readonly choose: string;
  readonly upload: string;
  readonly remove: string;
  readonly emptyMessage: string;
  readonly noResultsFound: string;
  readonly selectAll: string;
  readonly unselectAll: string;
  readonly rowsPerPage: string;
  readonly nextPage: string;
  readonly previousPage: string;
  readonly firstPage: string;
  readonly lastPage: string;
  readonly search: string;
  readonly loading: string;
  readonly showPassword: string;
  readonly hidePassword: string;
  readonly passwordWeak: string;
  readonly passwordMedium: string;
  readonly passwordStrong: string;
}

export type JrngLocaleInput = Partial<JrngLocale>;

export const JRNG_DEFAULT_LOCALE: JrngLocale = {
  accept: 'Accept',
  reject: 'Reject',
  cancel: 'Cancel',
  close: 'Close',
  clear: 'Clear',
  today: 'Today',
  choose: 'Choose',
  upload: 'Upload',
  remove: 'Remove',
  emptyMessage: 'No records found.',
  noResultsFound: 'No results found.',
  selectAll: 'Select all',
  unselectAll: 'Unselect all',
  rowsPerPage: 'Rows per page',
  nextPage: 'Next page',
  previousPage: 'Previous page',
  firstPage: 'First page',
  lastPage: 'Last page',
  search: 'Search',
  loading: 'Loading',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  passwordWeak: 'Weak',
  passwordMedium: 'Medium',
  passwordStrong: 'Strong',
};

export const JRNG_LOCALE = new InjectionToken<JrngLocale>('JRNG_LOCALE', {
  providedIn: 'root',
  factory: () => JRNG_DEFAULT_LOCALE,
});

export function jMergeLocale(locale: JrngLocaleInput = {}): JrngLocale {
  return {
    ...JRNG_DEFAULT_LOCALE,
    ...locale,
  };
}

export function provideJrngLocale(locale: JrngLocaleInput = {}) {
  return makeEnvironmentProviders([
    {
      provide: JRNG_LOCALE,
      useValue: jMergeLocale(locale),
    },
  ]);
}

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
  /** Full weekday names, Sunday first. */
  readonly dayNames: readonly string[];
  /** Abbreviated weekday names, Sunday first. */
  readonly dayNamesShort: readonly string[];
  /** Minimal weekday names for calendar headers, Sunday first. */
  readonly dayNamesMin: readonly string[];
  /** Full month names, January first. */
  readonly monthNames: readonly string[];
  /** Abbreviated month names, January first. */
  readonly monthNamesShort: readonly string[];
  /** First day of the week: 0 = Sunday, 1 = Monday. */
  readonly firstDayOfWeek: number;
  readonly am: string;
  readonly pm: string;
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
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  firstDayOfWeek: 0,
  am: 'AM',
  pm: 'PM',
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

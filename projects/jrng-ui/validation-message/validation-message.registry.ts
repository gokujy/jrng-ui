import { InjectionToken, Provider } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

export type JValidationMessageFactory = (error: unknown, errors: ValidationErrors) => string;
export type JValidationMessageMap = Readonly<Record<string, string | JValidationMessageFactory>>;

export const J_DEFAULT_VALIDATION_MESSAGES: JValidationMessageMap = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  min: (error) => `Enter a value greater than or equal to ${read(error, 'min')}.`,
  max: (error) => `Enter a value less than or equal to ${read(error, 'max')}.`,
  minlength: (error) => `Enter at least ${read(error, 'requiredLength')} characters.`,
  maxlength: (error) => `Enter no more than ${read(error, 'requiredLength')} characters.`,
  pattern: 'Enter a value in the required format.',
  mismatch: 'The values do not match.',
  invalidDateRange: 'The date range is invalid.',
  server: (error) =>
    typeof error === 'string'
      ? error
      : String(read(error, 'message') ?? 'The server rejected this value.'),
  custom: (error) =>
    typeof error === 'string' ? error : String(read(error, 'message') ?? 'This value is invalid.'),
};

export const J_VALIDATION_MESSAGES = new InjectionToken<JValidationMessageMap>(
  'J_VALIDATION_MESSAGES',
  { factory: () => J_DEFAULT_VALIDATION_MESSAGES },
);

export function provideJValidationMessages(messages: JValidationMessageMap): Provider {
  return {
    provide: J_VALIDATION_MESSAGES,
    useFactory: () => ({ ...J_DEFAULT_VALIDATION_MESSAGES, ...messages }),
  };
}

function read(value: unknown, key: string): unknown {
  return typeof value === 'object' && value != null
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

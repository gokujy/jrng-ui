import { describe, expect, it } from 'vitest';
import { jLocales } from './locale-presets';
import { JRNG_DEFAULT_LOCALE, jMergeLocale } from './locale';

describe('locale', () => {
  it('default locale has every required public action and accessibility string', () => {
    for (const key of [
      'accept', 'cancel', 'close', 'clear', 'chooseFile', 'uploadFiles', 'dropFilesHere',
      'remove', 'retry', 'preview', 'download', 'search', 'loading', 'now', 'hour',
      'minute', 'second', 'period', 'nextPage', 'previousPage', 'selectAll', 'unselectAll',
    ] as const) {
      expect(JRNG_DEFAULT_LOCALE[key], key).toBeTruthy();
    }
  });
  it('default locale has complete calendar data', () => {
    expect(JRNG_DEFAULT_LOCALE.monthNames).toHaveLength(12);
    expect(JRNG_DEFAULT_LOCALE.dayNames).toHaveLength(7);
    expect(JRNG_DEFAULT_LOCALE.dayNamesShort).toHaveLength(7);
    expect(JRNG_DEFAULT_LOCALE.firstDayOfWeek).toBe(0);
  });

  it('jMergeLocale overlays a partial locale and falls back to English', () => {
    const es = jMergeLocale(jLocales['es']);
    expect(es.monthNames[0]).toBe('Enero');
    expect(es.today).toBe('Hoy');
    expect(es.firstDayOfWeek).toBe(1);
    // Not translated in the es preset -> falls back to the English default.
    expect(es.showPassword).toBe(JRNG_DEFAULT_LOCALE.showPassword);
  });

  it('every calendar-aware built-in locale provides complete calendar arrays', () => {
    for (const [code, locale] of Object.entries(jLocales)) {
      if (locale.monthNames) expect(locale.monthNames, code).toHaveLength(12);
      if (locale.dayNames) expect(locale.dayNames, code).toHaveLength(7);
      if (locale.dayNamesMin) expect(locale.dayNamesMin, code).toHaveLength(7);
    }
  });

  it('ships mergeable Hindi and Gujarati examples', () => {
    expect(jMergeLocale(jLocales['hi']).search).toBe('खोजें');
    expect(jMergeLocale(jLocales['gu']).search).toBe('શોધો');
  });
});

import { jResolveCssCustomProperties, jResolveVariantClasses } from './variant';

describe('variant utilities', () => {
  it('resolves semantic modifier classes', () => {
    expect(jResolveVariantClasses('j-card', { size: 'lg', elevated: true, hidden: false })).toEqual(
      ['j-card', 'j-card--size-lg', 'j-card--elevated'],
    );
  });

  it('resolves CSS custom properties', () => {
    expect(jResolveCssCustomProperties({ '--j-size': 2, '--j-empty': null })).toEqual({
      '--j-size': '2',
    });
  });
});

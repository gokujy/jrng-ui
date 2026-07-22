import { priorityComponentGuidance } from './priority-component-guidance';
import { publicItemIndex } from './public-item-index.data';

describe('priority component documentation', () => {
  it('provides every extended documentation section and an explicit status', () => {
    for (const [slug, guide] of Object.entries(priorityComponentGuidance)) {
      expect(guide.advancedExample).toBeTruthy();
      expect(guide.templates.length).toBeGreaterThan(0);
      expect(guide.validationStates.length).toBeGreaterThan(0);
      expect(guide.loadingDisabledStates.length).toBeGreaterThan(0);
      expect(guide.keyboardBehaviour.length).toBeGreaterThan(0);
      expect(guide.responsiveBehaviour).toBeTruthy();
      expect(guide.darkMode).toBeTruthy();
      expect(guide.composedExample).toBeTruthy();
      expect(guide.troubleshooting.length).toBeGreaterThan(0);
      expect(
        publicItemIndex.find((item) => item.documentationRoute.endsWith(`#${slug}`))
          ?.documentationStatus,
      ).toBe('Complete');
    }
  });
});

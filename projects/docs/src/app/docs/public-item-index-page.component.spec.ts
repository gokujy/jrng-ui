import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicItemIndexPageComponent } from './public-item-index-page.component';

describe('PublicItemIndexPageComponent', () => {
  it('filters by search text and category', async () => {
    await TestBed.configureTestingModule({
      imports: [PublicItemIndexPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PublicItemIndexPageComponent);
    const component = fixture.componentInstance;
    component.updateQuery({ target: { value: 'clipboard' } } as unknown as Event);
    expect(
      component
        .filteredItems()
        .every((item) =>
          [item.name, item.identifier, item.description, ...item.searchTerms]
            .join(' ')
            .toLowerCase()
            .includes('clipboard'),
        ),
    ).toBe(true);
    component.updateQuery({ target: { value: '' } } as unknown as Event);
    component.updateCategory({ target: { value: 'Core and Theming' } } as unknown as Event);
    expect(component.filteredItems().every((item) => item.category === 'Core and Theming')).toBe(
      true,
    );
  });
});

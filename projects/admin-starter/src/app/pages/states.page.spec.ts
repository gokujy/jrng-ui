import { TestBed } from '@angular/core/testing';
import { StatesPage } from './states.page';

describe('StatesPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatesPage] }).compileComponents();
  });

  it('renders the loading, skeleton, empty and error treatments', () => {
    const fixture = TestBed.createComponent(StatesPage);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('j-loader')).toBeTruthy();
    expect(host.querySelector('j-skeleton')).toBeTruthy();
    expect(host.querySelector('j-empty-state')).toBeTruthy();
    expect(host.querySelector('j-error-page')).toBeTruthy();
  });
});

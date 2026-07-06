# Changelog

## 0.0.6

### Breaking Changes

- Removed the legacy `clicked` and `jrPress` outputs from `j-button`.
- Use `onClick` for button activation.

Before:

```html
<j-button label="Save" (clicked)="save()"></j-button>
<j-button label="Save" (jrPress)="save()"></j-button>
```

After:

```html
<j-button label="Save" (onClick)="save()"></j-button>
```

### Changed

- Fixed duplicate clear icons for `j-input type="search"` by hiding native browser search cancel controls and keeping the JRNG clear button behavior.
- Polished `jRipple` with enable/disable input support, disabled host detection, reduced-motion handling, and CSS variables.
- Cleaned up component CSS variables and theme fallbacks across button, input, table, dialog, toast, drawer, skeleton, and related surfaces.
- Improved docs layout, navigation sections, component previews, and API tables.
- Added syntax-highlighted docs code blocks with copy feedback and language labels.
- Improved preview boxes with a softer grid canvas, border, radius, shadow, and responsive spacing.
- Expanded documentation for business utilities including metric cards, stat cards, status chips, page headers, and empty states.
- Expanded data table documentation for filtering, column management, export, state, sorting, pagination, selection, and table helper controls.
- Added optional Tour Guide support with `JTourService`, `jTourStep`, JRNG tour types, theme variables, and Driver.js loaded only when tours are used.

### Notes

- Tour Guide requires optional peer dependency `driver.js` in applications that use tours. Install it with `npm install driver.js`.
- No third-party UI-framework dependency is included.

# Inplace, Anchor, Affix, and Watermark

Phase 4 adds SSR-safe layout behaviors for customer details, forms, toolbars, summaries, and printable documents. The public entrypoints are `jrng-ui/inplace`, `jrng-ui/anchor`, `jrng-ui/affix`, and `jrng-ui/watermark`.

## Inplace

`j-inplace` changes between a display button and lazily created edit content. `active` supports local state or two-way controlled binding. `disabled` and `readonly` block activation; `loading` blocks duplicate save and cancellation; `error` exposes an application-controlled failure.

```html
<j-inplace
  [(active)]="editing"
  [saveHandler]="saveCustomer"
  (saved)="announceSaved()"
  (saveError)="reportError($event)"
>
  <ng-template jInplaceDisplay>Customer status: {{ customer.status }}</ng-template>
  <ng-template jInplaceContent>
    <j-select [(ngModel)]="draftStatus" [options]="statuses" />
  </ng-template>
  <ng-template jInplaceActions let-inplace>
    <j-button label="Save" (onClick)="inplace.save()" />
    <j-button label="Cancel" variant="outlined" (onClick)="inplace.cancel()" />
  </ng-template>
</j-inplace>
```

Inputs are `active`, `disabled`, `readonly`, `loading`, `autoFocus`, `error`, and `saveHandler`. Outputs are `activeChange`, `activated`, `deactivated`, `saveRequested`, `saved`, `cancelled`, and `saveError`. Public methods are `activate`, `deactivate`, `save`, and `cancel`. The three template directives expose the component plus active, loading, and error state.

The display uses a native button. Enter and Space activate it. The first available form control receives focus, and save or cancel restores focus to the recreated display button. Rejected promises keep the editor open with an alert. Input, Select, Date Picker, Textarea, or custom projected content retains its normal Angular Forms integration.

## Anchor and Scroll Spy

`j-anchor` accepts nested `JAnchorLink` records and tracks matching section ids. It supports vertical and horizontal layouts, a custom scroll container, fixed-header offset, smooth scrolling, URL fragment replacement, two-way `activeId`, disabled links, and explicit navigation.

```html
<j-anchor
  [links]="sections"
  [scrollContainer]="details"
  [offset]="72"
  [(activeId)]="activeSection"
  (navigated)="sectionOpened($event)"
/>
```

Inputs are `links`, `orientation`, `scrollContainer`, `offset`, `smooth`, `updateFragment`, `ariaLabel`, and `activeId`. Outputs are `activeIdChange`, `activeSectionChange`, and `navigated`. Public methods are `navigate(id, focus?)` and `refresh()`.

Arrow keys move between enabled links in the orientation axis; Home and End move to the bounds; Enter follows the native anchor. The active link exposes `aria-current`. `IntersectionObserver` uses the configured root and disconnects on destroy. Without observer support or during SSR, direct navigation and fragment state remain safe. Reduced-motion preferences switch smooth scrolling to immediate scrolling.

## Affix

`[jAffix]` fixes an existing element at the logical top or bottom of a viewport or custom scrolling element. It preserves the original space with a measured placeholder, supports an offset, boundary, disabled state, and z-index, and reports state through `affixedChange`.

```html
<div #customerList class="customer-list">
  <j-toolbar
    [jAffix]="'top'"
    [scrollContainer]="customerList"
    [boundary]="customerSummary"
    [offset]="64"
    (affixedChange)="toolbarAffixed.set($event)"
  />
  <section #customerSummary>...</section>
</div>
```

The public `recalculate()` method supports application-driven layout changes. Scroll uses a passive listener and animation-frame coalescing. Resize observation covers the affixed element, scroll container, and boundary. Destroy disconnects observers, removes listeners and the placeholder, cancels pending work, and restores the exact original inline style.

Affix does not add a focus stop or change document order. Sticky filters, table toolbars, form actions, and summary panels retain their existing keyboard and ARIA semantics. Logical inset positioning supports RTL.

## Watermark

`j-watermark` wraps interactive content with an `aria-hidden`, pointer-transparent, repeating SVG layer.

```html
<j-watermark
  [text]="['CONFIDENTIAL', customer.company]"
  [rotate]="-18"
  [opacity]="0.12"
  [horizontalGap]="80"
  [verticalGap]="64"
>
  <app-customer-summary />
</j-watermark>
```

Use `image` for a logo. Presentation inputs include `rotate`, `opacity`, `color`, `fontFamily`, `fontSize`, `fontWeight`, gaps, offsets, width, height, z-index, and `fullPage`. Values update reactively. Opacity is clamped between zero and one and text is XML escaped. Full-page mode follows the viewport; container mode follows projected content.

The layer has no output or public method because it does not own interaction. Print styles retain the watermark, while underlying controls remain usable. Cross-origin image printing remains subject to browser policy.

## Responsive, RTL, theming, and platform behavior

All spacing and alignment are logical for RTL. Anchor horizontal mode scrolls at narrow widths, Inplace actions wrap, Affix recalculates on resize, and Watermark tiles cover changing dimensions. Component styles use JRNG semantic surface, text, border, focus, primary, danger, radius, and spacing tokens across Default, Material, and Nexus presets in light, dark, system, and high-contrast modes.

Browser-only observers, scrolling, focus, history, and animation frames are guarded. SSR emits stable markup; hydration activates observers after view initialization. Observer-unavailable browsers retain safe manual behavior.

## Testing guidance

Test default rendering, inputs, outputs, public methods, controlled and local Inplace state, projected templates, Angular Forms controls, disabled/read-only/loading/error states, rejected and stale async work, keyboard focus and restoration, custom scroll containers, observer capability fallback and cleanup, Affix top/bottom/boundary/layout preservation, Watermark text escaping/image/dynamic/print modes, RTL, reduced motion, high contrast, SSR, and hydration.

## FAQ

**Does Affix replace CSS sticky?** Use CSS sticky for simple layouts. Affix is useful when a custom scroll root, explicit boundary, placeholder, output, and programmatic recalculation are needed.

**Can Anchor focus a heading?** Yes. Call `navigate(id, true)` for keyboard-driven workflows; ordinary pointer navigation leaves focus unchanged.

**Does Watermark secure a document?** No. It communicates classification and must be paired with application authorization.

**When is Inplace content created?** The edit view is created only after activation and destroyed on successful save or cancel.

## Changelog

- Added `j-inplace`, `j-anchor`, `[jAffix]`, and `j-watermark`.
- Added live component previews and an Affix guide preview.
- Added SSR guards, observer cleanup, reduced-motion scrolling, RTL layout, and print watermark support.

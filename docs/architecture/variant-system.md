# Variant system

`variant` controls visual presentation only. Core exports the canonical size, severity, density, orientation, shape, width, action-display, action-variant, surface-variant, field-variant, status-variant, and navigation-variant types.

Behavior uses specific properties such as `selectionMode`, `responsiveMode`, `filterDisplay`, `editMode`, `triggerMode`, and `overlayMode`. Independent states remain booleans with Angular boolean transforms. Mutually exclusive presentation booleans are not public APIs.

Components expose only values that change their rendering materially. The defaults are `md` size, `comfortable` density, `auto` width, and the component family’s canonical visual variant.

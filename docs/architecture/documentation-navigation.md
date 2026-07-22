# Documentation navigation

Component navigation is route-driven. A component slug selects the registry record, renders its Basic example, updates metadata, resets the content scroll container, focuses the component `h1`, announces the change, highlights and reveals the navigation item, and closes mobile navigation.

Deep links, refresh, and browser Back/Forward use the same route subscription. Reduced-motion preference changes scrolling to immediate. Only the content container scrolls, preventing double scrolling.

Example slugs identify a stable example within the selected component. Missing example slugs resolve to Basic; changing examples keeps preview and code tabs on the same source record.

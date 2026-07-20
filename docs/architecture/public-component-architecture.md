# Public component architecture

Public UI is exposed only through standalone `J…Component` declarations in modular `jrng-ui/*` secondary entrypoints. Selectors and library classes use the `j-` prefix. Root exports aggregate the same canonical declarations; aliases, duplicate source trees, preview helpers, and internal primitives are excluded.

Each public component owns one behavior or composition boundary. Generic primitives such as Card, Empty State, Skeleton, Popover, File Upload, and Transfer List are composed instead of cloned into domain-specific components. Stability is `stable`, `beta`, or `experimental` and is generated from verified source metadata.

Browser APIs are guarded by platform checks. Interactive components must clean up observers, document listeners, timers, and overlays. Public imports never depend on the documentation application.


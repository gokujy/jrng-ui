# Theme token architecture

Primitive tokens define palettes and scales; semantic tokens define foregrounds, surfaces, borders, focus, disabled opacity, backdrop, z-index, spacing, typography, radius, shadow, and motion. Components consume semantic `--j-*` tokens and scope classes with `.j-*`.

Light, dark, system, and high-contrast modes share the same semantic contract. Runtime switching changes tokens without recreating components. Logical properties support RTL. Reduced-motion media queries shorten or remove non-essential transitions.

Old token aliases and component hard-coded colors are not part of the 0.1.0 API.


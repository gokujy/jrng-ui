# Future CLI Architecture

The machine-readable registry is the stable groundwork for future tooling. Version 0.0.8 does not publish an executable CLI.

Proposed commands:

- `jrng-ui list` lists compatible public registry records.
- `jrng-ui add button` installs required peers and prints standalone Angular imports and style setup.
- `jrng-ui add data-grid` validates optional dependencies and generates a public-API-only starter example.
- `jrng-ui update` compares installed and registry versions and reports migration documentation.
- `jrng-ui doctor` validates Angular compatibility, styles, theme providers, optional peers, and unsupported deep imports.

Any future CLI must validate the registry schema, support dry runs, avoid overwriting application files without confirmation, and ship only after clean packed-consumer tests.

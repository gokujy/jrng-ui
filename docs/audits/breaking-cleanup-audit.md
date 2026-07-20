# Breaking cleanup audit

Verdict: **PASS**

Strict consumer compilation covers 129 final entrypoints. Removed selectors, entrypoints, class aliases, input aliases, output aliases, and old type values are not part of the v0.1.0 surface.

- Table state accepts the final versioned format only.
- Invalid or unsupported state is rejected non-fatally and restores defaults.
- Unknown fields are ignored and corrupt JSON never crashes rendering.
- The generated registry contains only the final public baseline.

# Backward compatibility audit

Verdict: **PASS**

Strict consumer compilation covers 143 entrypoints. The library suite compiles legacy fixtures for Button, form controls, Table compatibility declarations, overlay controls, File Upload, headers, Editor, and form integrations. Existing aliases and selectors remain exported.

- Versionless table state is treated as the supported legacy format.
- Versioned state rejects unsupported versions non-fatally through stateError.
- Unknown fields are ignored and corrupt JSON restores defaults.
- No unavoidable breaking change was identified.
- Deprecated compatibility declarations remain supported and are listed in generated registry metadata.

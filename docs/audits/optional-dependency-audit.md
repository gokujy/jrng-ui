# Optional dependency audit

Verdict: **PASS**

Chart.js remains an optional peer dependency. It is not a package dependency, root imports do not load it, and its feature entrypoint uses guarded dynamic loading. The Tour Guide is now JRNG-native and has no Driver.js dependency. Editor, export, preview, upload, screenshot, Excel, PDF, image-processing, cloud-storage, and router integrations are adapter-based or use Angular dependencies already required by the selected entrypoint.

Missing optional packages produce feature-scoped diagnostics. SSR does not eagerly import browser-only optional packages. Peer ranges and optional metadata are checked against the packed package by the enterprise and package-content gates.

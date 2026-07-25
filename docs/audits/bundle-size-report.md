# Bundle and tree-shaking report

Verdict: **PASS**

The package declares sideEffects: false and 129 independently compiled entrypoints. Sizes are production FESM artifacts; minification is measured with the repository esbuild version and compression is gzip level 9.

| Fixture | Raw | Minified | Gzip |
| --- | ---: | ---: | ---: |
| Button only | 25.0 KiB | 21.7 KiB | 3.6 KiB |
| Form controls | 112.1 KiB | 88.2 KiB | 16.8 KiB |
| Table | 274.7 KiB | 215.6 KiB | 39.9 KiB |
| Dialog | 30.7 KiB | 23.6 KiB | 4.9 KiB |
| Chart | 22.1 KiB | 15.3 KiB | 4.0 KiB |
| Editor | 42.6 KiB | 33.9 KiB | 6.1 KiB |
| File Upload | 34.5 KiB | 26.7 KiB | 5.3 KiB |
| Full library | 2283.0 KiB | 1806.0 KiB | 372.5 KiB |

Packed size and file count are validated by the separate package-content and npm pack gates so this generated report does not retain a stale snapshot. Chart.js remains an optional peer and is dynamically imported only by its feature entrypoint. Tour Guide is native JRNG UI. Core does not import overlays; Table does not import Chart.js.

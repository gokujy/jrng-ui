# Bundle and tree-shaking report

Verdict: **PASS**

The package declares sideEffects: false and 127 independently compiled entrypoints. Sizes are production FESM artifacts; minification is measured with the repository esbuild version and compression is gzip level 9.

| Fixture       |        Raw |   Minified |      Gzip |
| ------------- | ---------: | ---------: | --------: |
| Button only   |   24.9 KiB |   21.7 KiB |   3.6 KiB |
| Form controls |  112.0 KiB |   88.3 KiB |  16.8 KiB |
| Table         |  275.7 KiB |  216.5 KiB |  40.0 KiB |
| Dialog        |   30.7 KiB |   23.6 KiB |   4.9 KiB |
| Chart         |   22.1 KiB |   15.3 KiB |   4.0 KiB |
| Editor        |   44.8 KiB |   36.4 KiB |   6.3 KiB |
| File Upload   |   34.4 KiB |   26.7 KiB |   5.3 KiB |
| Full library  | 2285.5 KiB | 1817.8 KiB | 373.0 KiB |

Packed size and file count are validated by the separate package-content and npm pack gates so this generated report does not retain a stale snapshot. Chart.js remains an optional peer and is dynamically imported only by its feature entrypoint. Tour Guide is native JRNG UI. Core does not import overlays; Table does not import Chart.js.

# Bundle and tree-shaking report

Verdict: **PASS**

The package declares sideEffects: false and 129 independently compiled entrypoints. Sizes are production FESM artifacts; minification is measured with the repository esbuild version and compression is gzip level 9.

| Fixture       |        Raw |   Minified |      Gzip |
| ------------- | ---------: | ---------: | --------: |
| Button only   |   22.6 KiB |   19.8 KiB |   3.3 KiB |
| Form controls |  107.8 KiB |   85.0 KiB |  16.4 KiB |
| Table         |  212.3 KiB |  166.7 KiB |  30.7 KiB |
| Dialog        |   31.3 KiB |   24.2 KiB |   5.0 KiB |
| Chart         |   22.0 KiB |   15.3 KiB |   4.0 KiB |
| Editor        |   42.1 KiB |   33.9 KiB |   6.1 KiB |
| File Upload   |   34.2 KiB |   26.7 KiB |   5.3 KiB |
| Full library  | 2136.2 KiB | 1702.1 KiB | 353.3 KiB |

Packed size and file count are validated by the separate package-content and npm pack gates so this generated report does not retain a stale snapshot. Chart.js remains an optional peer and is dynamically imported only by its feature entrypoint. Tour Guide is native JRNG UI. Core does not import overlays; Table does not import Chart.js.

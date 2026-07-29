# Bundle and tree-shaking report

Verdict: **PASS**

The package declares sideEffects: false and 144 independently compiled entrypoints. Sizes are production FESM artifacts; minification is measured with the repository esbuild version and compression is gzip level 9.

| Fixture       |        Raw |   Minified |      Gzip |
| ------------- | ---------: | ---------: | --------: |
| Button only   |   25.3 KiB |   22.0 KiB |   3.6 KiB |
| Form controls |  120.2 KiB |   95.1 KiB |  18.0 KiB |
| Table         |  301.7 KiB |  234.2 KiB |  43.2 KiB |
| Dialog        |   30.3 KiB |   23.3 KiB |   4.9 KiB |
| Chart         |   22.3 KiB |   15.4 KiB |   4.0 KiB |
| Editor        |   45.3 KiB |   36.4 KiB |   6.3 KiB |
| File Upload   |   35.9 KiB |   27.9 KiB |   5.5 KiB |
| Full library  | 2788.8 KiB | 2179.5 KiB | 453.1 KiB |

Packed size and file count are validated by the separate package-content and npm pack gates so this generated report does not retain a stale snapshot. Chart.js remains an optional peer and is dynamically imported only by its feature entrypoint. Tour Guide is native JRNG UI. Core does not import overlays; Table does not import Chart.js.

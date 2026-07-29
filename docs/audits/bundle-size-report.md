# Bundle and tree-shaking report

Verdict: **PASS**

The package declares sideEffects: false and 145 independently compiled entrypoints. Sizes are production FESM artifacts; minification is measured with the repository esbuild version and compression is gzip level 9.

| Fixture       |        Raw |   Minified |      Gzip |
| ------------- | ---------: | ---------: | --------: |
| Button only   |   31.3 KiB |   27.1 KiB |   4.3 KiB |
| Form controls |  120.3 KiB |   95.2 KiB |  18.1 KiB |
| Table         |  302.1 KiB |  234.6 KiB |  43.3 KiB |
| Dialog        |   30.3 KiB |   23.3 KiB |   4.9 KiB |
| Chart         |   22.3 KiB |   15.4 KiB |   4.0 KiB |
| Editor        |   45.3 KiB |   36.4 KiB |   6.3 KiB |
| File Upload   |   35.9 KiB |   27.9 KiB |   5.5 KiB |
| Full library  | 2841.6 KiB | 2220.6 KiB | 462.3 KiB |

Packed size and file count are validated by the separate package-content and npm pack gates so this generated report does not retain a stale snapshot. Chart.js remains an optional peer and is dynamically imported only by its feature entrypoint. Tour Guide is native JRNG UI. Core does not import overlays; Table does not import Chart.js.

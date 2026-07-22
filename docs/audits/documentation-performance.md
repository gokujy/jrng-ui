# Documentation performance

Generated: jrng-ui 0.1.0

The component showcase is route-level lazy loaded. Angular deferred blocks split preview dependencies into additional chunks; optional chart and editor integrations remain outside the canonical root entrypoint.

| Metric                              |   Bytes |
| ----------------------------------- | ------: |
| JavaScript output                   | 2062265 |
| Initial named JavaScript            |  108482 |
| Component documentation route chunk |  139882 |
| JavaScript chunks                   |     221 |

The route chunk remains a documented optimization target because the showcase statically imports the preview component set within its lazy route.

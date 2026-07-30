# Documentation performance

Generated: jrng-ui 0.1.1

The component showcase is route-level lazy loaded. Angular deferred blocks split preview dependencies into additional chunks; optional chart and editor integrations remain outside the canonical root entrypoint.

| Metric                              |   Bytes |
| ----------------------------------- | ------: |
| JavaScript output                   | 3063294 |
| Initial named JavaScript            |  111638 |
| Component documentation route chunk |   20005 |
| JavaScript chunks                   |      10 |

The route chunk remains a documented optimization target because the showcase statically imports the preview component set within its lazy route.

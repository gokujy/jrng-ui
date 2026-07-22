# Shared internal architecture audit

Public components remain separate. Shared behavior is centralized in core overlay/focus/keyboard utilities, async-data controllers, table query/state primitives, file validators/adapters, semantic tokens, validation registry and browser services.

| Families                             | Shared primitive                                      | Status                                                       |
| ------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------ |
| Table / Data Grid                    | query serialization, filtering, sorting, state models | Shared                                                       |
| Select family                        | async controller and option contracts                 | Shared                                                       |
| Dialog / Popover                     | overlay, focus, z-index, dismissal                    | Shared core                                                  |
| File Upload                          | generic validation, queue, progress and adapters      | Shared contracts                                             |
| Cards / progress / menus / calendars | semantic tokens and core keyboard primitives          | Shared foundations; public components intentionally separate |

Internal primitives remain private in the Phase 6 v0.1.0 baseline.

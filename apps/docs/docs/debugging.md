---
title: Debugging
description: Add structured and redactable diagnostics to Sveltinia stores.
---

# Debugging

Enable structured diagnostics at the root and register the plugin:

```ts
const sveltinia = createSveltinia({
  debug: {
    enabled: true,
    redact: ['session.token'],
    logger(event) {
      telemetry.write(event)
    }
  }
}).use(createDebugPlugin())
```

## Debug events

`createDebugPlugin(defaults?)` reports mutation, action, persistence, and lifecycle events. Without a custom logger, events appear in collapsed browser-console groups. `redact` replaces old and new values for matching mutation paths.

A store can provide its own `debug` options in `defineStore`. Root, plugin, and store settings are merged when the store is created.

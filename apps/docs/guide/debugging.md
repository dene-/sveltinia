# Debugging

Enable diagnostics globally:

```ts
const pinia = createPinia({ debug: true }).use(createDebugPlugin())
```

Or override it at store level:

```ts
export const useAnalytics = defineStore('analytics', {
  state: () => ({ events: [] }),
  debug: false
})
```

Debug events are structured and can be forwarded to a logger:

```ts
const pinia = createPinia({
  debug: {
    enabled: true,
    redact: ['session.token'],
    logger(event) { telemetry.write(event) }
  }
}).use(createDebugPlugin())
```

The built-in logger groups direct mutations, object and function patches, actions, persistence writes/restores, and lifecycle events in the browser console.

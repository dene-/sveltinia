---
title: Action hooks
description: Observe synchronous and asynchronous Sveltinia actions.
---

# Action hooks

`$onAction(callback)` runs when an action starts and returns an unsubscribe function. Register completion and failure callbacks from the action context.

```ts
const stop = cart.$onAction(({ name, args, after, onError }) => {
  const started = performance.now()

  after(() => console.log(`${name} finished`, performance.now() - started))
  onError((error) => console.error(name, args, error))
})
```

## Action context

The context contains `name`, `args`, `store`, `after(callback)`, and `onError(callback)`. Async actions trigger hooks after their promise settles.

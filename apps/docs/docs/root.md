---
title: Create the root
description: Create and configure the Sveltinia root for an application.
---

# Create the root

Create one root for each application instance. Register persistence and debugging explicitly so unused features remain tree-shakeable.

```ts
import {
  createDebugPlugin,
  createPersistedState,
  createPinia
} from 'sveltinia'

export const pinia = createPinia({
  debug: import.meta.env.DEV
})
  .use(createDebugPlugin())
  .use(createPersistedState())
```

`createPinia(options?)` accepts initial `state`, global `debug` defaults, and global `persist` defaults. Calling `pinia.use(plugin)` registers a plugin for stores created afterward and returns the same root for chaining.

## Active root

If a store factory is called without an explicit root, Sveltinia uses the active root:

```ts
import { setActivePinia } from 'sveltinia'

setActivePinia(pinia)
const cart = useCartStore()
```

Passing the root directly is clearer in server code: `useCartStore(pinia)`.

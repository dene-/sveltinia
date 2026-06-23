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
  createSveltinia
} from 'sveltinia'

export const sveltinia = createSveltinia({
  debug: import.meta.env.DEV
})
  .use(createDebugPlugin())
  .use(createPersistedState())
```

`createSveltinia(options?)` accepts initial `state`, global `debug` defaults, and global `persist` defaults. Calling `sveltinia.use(plugin)` registers a plugin for stores created afterward and returns the same root for chaining.

## Active root

If a store factory is called without an explicit root, Sveltinia uses the active root:

```ts
import { setActiveSveltinia } from 'sveltinia'

setActiveSveltinia(sveltinia)
const cart = useCartStore()
```

Passing the root directly is clearer in server code: `useCartStore(sveltinia)`.

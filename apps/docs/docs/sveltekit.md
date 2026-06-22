---
title: SvelteKit SSR
description: Use request-scoped SvelteKit SSR state management with Sveltinia.
---

# SvelteKit SSR

Use one root per server request. Never keep a server-side root in module scope.

```ts
// src/lib/stores/adapter.ts
import { createSvelteKitPinia } from 'sveltinia/sveltekit'

export const stores = createSvelteKitPinia({
  debug: import.meta.env.DEV
})
```

## Serialize on the server

Create and serialize the root in server-side load code:

```ts
export async function load() {
  const pinia = stores.create()
  const cart = useCartStore(pinia)

  await cart.$restore()

  return {
    initialStoreState: stores.serialize(pinia)
  }
}
```

## Create the client root

Create the client root from page data before reading stores:

```ts
const pinia = stores.create(data.initialStoreState)
```

## Adapter methods

| Method | Behavior |
| --- | --- |
| `create(serialized?)` | Creates a root, installs first-party persistence/debug plugins, activates it, and optionally seeds state |
| `serialize(pinia)` | Returns a cloned plain state object |
| `hydrate(pinia, state)` | Clones incoming state into the root and patches stores that already exist |

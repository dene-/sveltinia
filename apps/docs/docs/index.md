---
title: Documentation
description: Complete Sveltinia guide and API reference for typed Svelte stores, persistence, debugging, and SvelteKit SSR.
head:
  - - link
    - rel: canonical
      href: https://dene-.github.io/sveltinia/docs/
---

# Sveltinia documentation

Typed, Pinia-inspired stores for Svelte and SvelteKit. This page covers the complete public API, from one local store to persisted state and request-safe SSR.

## Introduction

Sveltinia has three entry points:

| Import | Use it for |
| --- | --- |
| `sveltinia` | Store roots, store definitions, persistence, debugging, and public types |
| `sveltinia/svelte` | Svelte context and readable-store adapters |
| `sveltinia/sveltekit` | Request-scoped roots, serialization, and hydration |

An application creates a **Pinia root** and defines one or more store factories. Calling a factory returns one store instance per root and store ID.

## Installation

::: code-group

```sh [Yarn]
yarn add sveltinia
```

```sh [npm]
npm install sveltinia
```

:::

Sveltinia supports Svelte 4 and Svelte 5.

## Create the root

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

If a store factory is called without an explicit root, Sveltinia uses the active root:

```ts
import { setActivePinia } from 'sveltinia'

setActivePinia(pinia)
const cart = useCartStore()
```

Passing the root directly is clearer in server code: `useCartStore(pinia)`.

## Options Stores

An Options Store keeps state, derived values, and actions in named sections.

```ts
import { defineStore } from 'sveltinia'

type CartItem = { id: string; price: number }

export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] as CartItem[] }),

  getters: {
    total: (state) =>
      state.items.reduce((sum, item) => sum + item.price, 0)
  },

  actions: {
    add(item: CartItem) {
      this.items.push(item)
    },
    clear() {
      this.items = []
    }
  },

  persist: true
})
```

`defineStore(id, options)` returns a factory. The `id` must be unique within a root. `state` must return fresh data. Getters receive raw state and can use the store as `this`; actions use the store as `this` and may be synchronous or asynchronous.

## Setup Stores

A Setup Store uses small primitives instead of option groups. Return `state()` cells for reactive state, `computed()` cells for derived values, and functions for actions.

```ts
import { computed, defineStore, state } from 'sveltinia'

export const useCounterStore = defineStore('counter', () => {
  const count = state(0)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function reset() {
    count.value = 0
  }

  return { count, double, increment, reset }
})
```

Only returned values are public. Setup Stores must expose their own reset action; their built-in `$reset()` throws to prevent an ambiguous reset.

## Use in Svelte

`useStore()` converts a Sveltinia store to a standard Svelte readable store. Mutations trigger readable-store updates.

```svelte
<script lang="ts">
  import { useStore } from 'sveltinia/svelte'
  import { useCartStore } from '$lib/stores/cart'

  const cart = useStore(useCartStore())
</script>

<p>Total: {$cart.total}</p>
<button onclick={() => $cart.clear()}>Clear cart</button>
```

For context-based roots, call `providePinia(pinia)` in a parent component during initialization, then call `usePinia()` in descendants.

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import { providePinia } from 'sveltinia/svelte'
  import { pinia } from '$lib/stores/root'

  providePinia(pinia)
</script>
```

`toSvelteStore(store)` and `useStore(store)` are equivalent; the second name reads more naturally in components.

## State and patching

Store state is available both on the store and through `$state`:

```ts
cart.items.push(item)
console.log(cart.$state.items)
```

Use `$patch(object)` for a partial merge:

```ts
cart.$patch({ items: [] })
```

Use `$patch(fn)` to group several mutations into one patch notification:

```ts
cart.$patch((state) => {
  state.items = []
  state.bannerDismissed = true
})
```

Assigning `$state` also patches the current state. `$reset()` restores a fresh Options Store state.

## Subscriptions

`$subscribe(callback, options?)` observes mutations and returns an unsubscribe function.

```ts
const stop = cart.$subscribe((mutation, state) => {
  console.log(mutation.type, mutation.events, state)
})

stop()
```

Mutation types are `direct`, `patch object`, `patch function`, `hydrate`, and `restore`. A mutation includes the store ID, optional changed paths, old/new values, and an optional patch payload. Notifications are synchronous. `SubscriptionOptions` exposes `detached` and `flush` for API compatibility.

## Action hooks

`$onAction(callback)` runs when an action starts and returns an unsubscribe function. Register completion and failure callbacks from the action context.

```ts
const stop = cart.$onAction(({ name, args, after, onError }) => {
  const started = performance.now()

  after(() => console.log(`${name} finished`, performance.now() - started))
  onError((error) => console.error(name, args, error))
})
```

The context contains `name`, `args`, `store`, `after(callback)`, and `onError(callback)`. Async actions trigger hooks after their promise settles.

## Persistence

Persistence is disabled until a store opts in and the persistence plugin is installed. Browser storage is never accessed on the server.

```ts
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [], bannerDismissed: false }),
  persist: {
    key: 'app:cart',
    storage: 'localStorage',
    paths: ['items'],
    version: 2,
    migrate(state, fromVersion) {
      return fromVersion < 2 ? { items: state.lines ?? [] } : state
    }
  }
})
```

### Persistence options

| Option | Purpose |
| --- | --- |
| `enabled` | Explicitly enable or disable persistence |
| `key` | Storage key; defaults to `sveltinia:<store-id>` |
| `storage` | `localStorage`, `sessionStorage`, or a custom adapter |
| `paths` | Persist only selected dot-separated state paths |
| `version` | Version saved with the state envelope |
| `migrate` | Transform older state; may return a promise |
| `serializer` | Replace JSON `serialize` and `deserialize` |
| `beforeRestore` | Run before storage is read |
| `afterRestore` | Run after restoration finishes |

Custom adapters may be synchronous or asynchronous:

```ts
import type { StorageAdapter } from 'sveltinia'

const storage: StorageAdapter = {
  getItem: (key) => indexedDbRead(key),
  setItem: (key, value) => indexedDbWrite(key, value),
  removeItem: (key) => indexedDbDelete(key)
}
```

`browserStorage('localStorage' | 'sessionStorage')` returns the requested browser storage adapter, or `undefined` during SSR.

The plugin restores automatically when a store is created. Use `await store.$restore()` when timing must be deterministic. Use `await store.$persist()` to force a write.

## Debugging

Enable structured diagnostics at the root and register the plugin:

```ts
const pinia = createPinia({
  debug: {
    enabled: true,
    redact: ['session.token'],
    logger(event) {
      telemetry.write(event)
    }
  }
}).use(createDebugPlugin())
```

`createDebugPlugin(defaults?)` reports mutation, action, persistence, and lifecycle events. Without a custom logger, events appear in collapsed browser-console groups. `redact` replaces old and new values for matching mutation paths.

A store can provide its own `debug` options in `defineStore`. Root, plugin, and store settings are merged when the store is created.

## SvelteKit SSR

Use one root per server request. Never keep a server-side root in module scope.

```ts
// src/lib/stores/adapter.ts
import { createSvelteKitPinia } from 'sveltinia/sveltekit'

export const stores = createSvelteKitPinia({
  debug: import.meta.env.DEV
})
```

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

Create the client root from page data before reading stores:

```ts
const pinia = stores.create(data.initialStoreState)
```

The adapter exposes:

| Method | Behavior |
| --- | --- |
| `create(serialized?)` | Creates a root, installs first-party persistence/debug plugins, activates it, and optionally seeds state |
| `serialize(pinia)` | Returns a cloned plain state object |
| `hydrate(pinia, state)` | Clones incoming state into the root and patches stores that already exist |

## Plugins and lifecycle

A plugin receives `{ pinia, store, options }`. It may mutate the store directly or return properties to assign to it.

```ts
pinia.use(({ store }) => ({
  createdAt: Date.now(),
  label: `Store: ${store.$id}`
}))
```

`store.$dispose()` clears its subscriptions and unregisters it from the root. `pinia.dispose()` disposes every store and clears the root. Disposing is useful for tests, temporary application roots, and request cleanup.

`pinia.install(app?)` activates the root and calls `app.provide('sveltinia', pinia)` when the host app exposes `provide`.

## API reference

### Core functions

| Export | Signature | Returns |
| --- | --- | --- |
| `createPinia` | `(options?: PiniaOptions)` | A new isolated `Pinia` root |
| `defineStore` | `(id, options)` or `(id, setup, options?)` | A store factory accepting an optional root |
| `setActivePinia` | `(pinia?: Pinia)` | The assigned root or `undefined` |
| `getActivePinia` | `()` | The active root or `undefined` |
| `state` | `<T>(value: T)` | A mutable `SetupCell<T>` |
| `computed` | `<T>(fn: () => T)` | A read-only `ComputedCell<T>` |
| `createPersistedState` | `(defaults?: PersistOptions)` | A Sveltinia plugin |
| `browserStorage` | `(kind?)` | A `StorageAdapter` or `undefined` on the server |
| `createDebugPlugin` | `(defaults?: DebugOptions)` | A Sveltinia plugin |

### Svelte functions

| Export | Purpose |
| --- | --- |
| `PINIA_CONTEXT` | Shared Svelte context symbol |
| `providePinia(pinia)` | Activates the root, adds it to Svelte context, and returns it |
| `usePinia()` | Reads the root from Svelte context |
| `toSvelteStore(store)` | Wraps a store as `Readable<T>` |
| `useStore(store)` | Alias of `toSvelteStore` |

### SvelteKit function

`createSvelteKitPinia(options?)` returns the `create`, `serialize`, and `hydrate` adapter described in [SvelteKit SSR](#sveltekit-ssr).

### Store properties and methods

| Member | Purpose |
| --- | --- |
| `$id` | Store ID passed to `defineStore` |
| `$state` | Read or patch the raw state object |
| `$patch(object \| fn)` | Merge a partial object or group a mutation callback |
| `$reset()` | Restore Options Store state; Setup Stores provide their own reset |
| `$subscribe(callback, options?)` | Observe mutations and return an unsubscribe function |
| `$onAction(callback)` | Observe actions and return an unsubscribe function |
| `$persist()` | Write configured persisted state |
| `$restore()` | Read and merge configured persisted state |
| `$dispose()` | Remove listeners and unregister the store |

### Public types

`StateTree`, `MutationType`, `Mutation`, `SubscriptionOptions`, `Subscription`, `ActionContext`, `ActionSubscription`, `StorageAdapter`, `PersistOptions`, `DebugEvent`, `DebugOptions`, `PiniaOptions`, `DefineStoreOptions`, `SetupCell`, `ComputedCell`, `SetupStore`, `Store`, and `Pinia` are exported from `sveltinia`.

Use these types for adapters and extension points; ordinary stores are inferred from `defineStore`.

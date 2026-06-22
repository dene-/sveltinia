---
title: API reference
description: Complete Sveltinia core, Svelte, SvelteKit, store, and type API reference.
---

# API reference

## Core functions

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

## Svelte functions

| Export | Purpose |
| --- | --- |
| `PINIA_CONTEXT` | Shared Svelte context symbol |
| `providePinia(pinia)` | Activates the root, adds it to Svelte context, and returns it |
| `usePinia()` | Reads the root from Svelte context |
| `toSvelteStore(store)` | Wraps a store as `Readable<T>` |
| `useStore(store)` | Alias of `toSvelteStore` |

## SvelteKit function

`createSvelteKitPinia(options?)` returns the `create`, `serialize`, and `hydrate` adapter described in [SvelteKit SSR](/docs/sveltekit).

## Store properties and methods

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

## Public types

`StateTree`, `MutationType`, `Mutation`, `SubscriptionOptions`, `Subscription`, `ActionContext`, `ActionSubscription`, `StorageAdapter`, `PersistOptions`, `DebugEvent`, `DebugOptions`, `PiniaOptions`, `DefineStoreOptions`, `SetupCell`, `ComputedCell`, `SetupStore`, `Store`, and `Pinia` are exported from `sveltinia`.

Use these types for adapters and extension points; ordinary stores are inferred from `defineStore`.

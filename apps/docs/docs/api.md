---
title: API reference
description: Complete Sveltinia core, Svelte, SvelteKit, store, and type API reference.
---

# API reference

## Core functions

| Export | Signature | Returns |
| --- | --- | --- |
| `createSveltinia` | `(options?: SveltiniaOptions)` | A new isolated `Sveltinia` root |
| `defineStore` | `(id, options)` or `(id, setup, options?)` | A store factory accepting an optional root |
| `setActiveSveltinia` | `(sveltinia?: Sveltinia)` | Sets the active root |
| `getActiveSveltinia` | `()` | The active root or `undefined` |
| `state` | `<T>(value: T)` | A mutable `SetupCell<T>` |
| `computed` | `<T>(fn: () => T)` | A read-only `ComputedCell<T>` |
| `createPersistedState` | `(defaults?: PersistOptions)` | A Sveltinia plugin |
| `browserStorage` | `(kind?)` | A `StorageAdapter` or `undefined` on the server |
| `createDebugPlugin` | `(defaults?: DebugOptions)` | A Sveltinia plugin |

## Svelte functions

| Export | Purpose |
| --- | --- |
| `SVELTINIA_CONTEXT` | Shared Svelte context symbol |
| `provideSveltinia(sveltinia)` | Activates the root, adds it to Svelte context, and returns it |
| `useSveltinia()` | Reads the root from Svelte context |
| `toSvelteStore(store)` | Wraps a store as `Readable<T>` |
| `useStore(store)` | Alias of `toSvelteStore` |

## SvelteKit function

`createSvelteKitSveltinia(options?)` returns the `create`, `serialize`, and `hydrate` adapter described in [SvelteKit SSR](/docs/sveltekit).

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

`StateTree`, `MutationType`, `Mutation`, `Subscription`, `ActionContext`, `ActionSubscription`, `StorageAdapter`, `PersistOptions`, `DebugEvent`, `DebugOptions`, `SveltiniaOptions`, `DefineStoreOptions`, `SetupCell`, `ComputedCell`, `SetupStore`, `Store`, and `Sveltinia` are exported from `sveltinia`.

Use these types for adapters and extension points; ordinary stores are inferred from `defineStore`.

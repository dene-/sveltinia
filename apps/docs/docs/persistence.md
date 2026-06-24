---
title: Persistence
description: Build versioned persisted Svelte stores with browser or custom storage.
---

# Persistence

Persistence is disabled until a store opts in and the persistence plugin is installed. Browser storage is never accessed on the server.

```ts
import { browserStorage, defineStore } from 'sveltinia'

export const useCartStore = defineStore('cart', {
  state: () => ({ items: [], bannerDismissed: false }),
  persist: {
    key: 'app:cart',
    storage: browserStorage('localStorage'),
    paths: ['items'],
    version: 2,
    migrate(state, fromVersion) {
      return fromVersion < 2 ? { items: state.lines ?? [] } : state
    }
  }
})
```

## Persistence options

| Option | Purpose |
| --- | --- |
| `enabled` | Explicitly enable or disable persistence |
| `key` | Storage key; defaults to `sveltinia:<store-id>` |
| `storage` | `browserStorage('localStorage')`, `browserStorage('sessionStorage')`, or a custom adapter |
| `paths` | Persist only selected dot-separated state paths |
| `version` | Version saved with the state envelope |
| `migrate` | Transform older state; may return a promise |
| `serializer` | Replace JSON `serialize` and `deserialize` |
| `beforeRestore` | Run before storage is read |
| `afterRestore` | Run after restoration finishes |

## Custom storage

Custom adapters may be synchronous or asynchronous:

```ts
import type { StorageAdapter } from 'sveltinia'

const storage: StorageAdapter = {
  getItem: (key) => indexedDbRead(key),
  setItem: (key, value) => indexedDbWrite(key, value),
  removeItem: (key) => indexedDbDelete(key)
}
```

`browserStorage('localStorage' | 'sessionStorage')` returns the requested browser storage adapter, or `undefined` during SSR. This avoids typo-prone storage strings in store definitions.

## Custom serializer

The default serializer writes JSON. Use `serializer` when persisted data needs a different envelope format:

```ts
const base64Json = {
  serialize(value: unknown) {
    return btoa(JSON.stringify(value))
  },
  deserialize(value: string) {
    return JSON.parse(atob(value))
  }
}

export const useSessionStore = defineStore('session', {
  state: () => ({ token: '', userId: '' }),
  persist: {
    key: 'app:session',
    storage: browserStorage('sessionStorage'),
    serializer: base64Json
  }
})
```

Use `await store.$restore()` to read persisted state, `await store.$persist()` to force a write, and `await store.$removePersisted()` to delete the saved value. Set `lazy: false` when a store should start restoration as soon as it is created.

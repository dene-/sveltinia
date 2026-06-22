# Persistence

Persistence is disabled until a store opts in. On the server, browser storage is unavailable and Sveltinia performs no browser access.

```ts
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [], bannerDismissed: false }),
  persist: {
    enabled: true,
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

Custom adapters can return either values or promises:

```ts
const storage = {
  async getItem(key: string) { return await indexedDbRead(key) },
  async setItem(key: string, value: string) { await indexedDbWrite(key, value) }
}
```

Call `await store.$restore()` when an application needs deterministic restore timing, or rely on the automatic restore initiated when the store is created.

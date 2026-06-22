# Getting started

Install the package:

```bash
npm install sveltinia
```

Create one root per application instance. Register first-party plugins explicitly so persistence and diagnostics are tree-shakeable.

```ts
import { createPinia, createDebugPlugin, createPersistedState } from 'sveltinia'

export const pinia = createPinia({ debug: import.meta.env.DEV })
  .use(createDebugPlugin())
  .use(createPersistedState())
```

## Options Store

```ts
import { defineStore } from 'sveltinia'

export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] as Array<{ id: string; price: number }> }),
  getters: {
    total: (state) => state.items.reduce((sum, item) => sum + item.price, 0)
  },
  actions: {
    add(item: { id: string; price: number }) {
      this.items.push(item)
    }
  }
})
```

## Setup Store

`state()` declares persisted, subscribable state. `computed()` declares a getter. Returned functions are actions.

```ts
import { computed, defineStore, state } from 'sveltinia'

export const useCounterStore = defineStore('counter', () => {
  const count = state(0)
  const double = computed(() => count.value * 2)
  const increment = () => count.value++

  return { count, double, increment }
})
```

Private setup values are not exposed in `$state`, persistence, hydration, subscriptions, or debug events.

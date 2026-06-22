---
title: Options Stores
description: Define Sveltinia stores with state, getters, and actions.
---

# Options Stores

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

## Store factory

`defineStore(id, options)` returns a factory. The `id` must be unique within a root. `state` must return fresh data. Getters receive raw state and can use the store as `this`; actions use the store as `this` and may be synchronous or asynchronous.

---
title: Setup Stores
description: Compose Sveltinia stores with state cells, computed values, and functions.
---

# Setup Stores

A Setup Store uses small primitives instead of option groups. Return `state()` cells for reactive state, `computed()` cells for derived values, and functions for actions. Sveltinia binds those state cells to the same Svelte 5 `$state` runtime used by Options Stores.

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

## Public values

Only returned values are public. Setup Stores must expose their own reset action; their built-in `$reset()` throws to prevent an ambiguous reset.

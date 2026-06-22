---
title: Use in Svelte
description: Connect Sveltinia stores to Svelte components and context.
---

# Use in Svelte

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

## Context-based roots

Call `providePinia(pinia)` in a parent component during initialization, then call `usePinia()` in descendants.

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import { providePinia } from 'sveltinia/svelte'
  import { pinia } from '$lib/stores/root'

  providePinia(pinia)
</script>
```

`toSvelteStore(store)` and `useStore(store)` are equivalent; the second name reads more naturally in components.

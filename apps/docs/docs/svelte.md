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

Create the root in a normal module, provide it once near the top of the component tree, then read the same root in descendants.

```ts
// src/lib/stores/root.ts
import { createDebugPlugin, createPersistedState, createSveltinia } from 'sveltinia'

export const sveltinia = createSveltinia({
  debug: import.meta.env.DEV
})
  .use(createDebugPlugin())
  .use(createPersistedState())
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { provideSveltinia } from 'sveltinia/svelte'
  import { sveltinia } from '$lib/stores/root'

  provideSveltinia(sveltinia)
</script>

<slot />
```

Descendant components can then read the context root and pass it to store factories:

```svelte
<!-- CartSummary.svelte -->
<script lang="ts">
  import { useStore, useSveltinia } from 'sveltinia/svelte'
  import { useCartStore } from '$lib/stores/cart'

  const sveltinia = useSveltinia()
  const cart = useStore(useCartStore(sveltinia))
</script>

<p>Total: {$cart.total}</p>
```

`toSvelteStore(store)` and `useStore(store)` are equivalent; the second name reads more naturally in components.

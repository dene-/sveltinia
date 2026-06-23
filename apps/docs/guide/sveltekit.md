# SvelteKit tutorial

Create a SvelteKit adapter once and make a root per request. The adapter itself does not import SvelteKit, so it remains easy to test.

```ts
// src/lib/stores/root.ts
import { createSveltinia } from 'sveltinia/sveltekit'

export const stores = createSveltinia({ debug: import.meta.env.DEV })
```

In server-side load or request handling, create a root and serialize it into page data:

```ts
const sveltinia = stores.create()
const cart = useCartStore(sveltinia)
await cart.$restore()
return { initialStoreState: stores.serialize(sveltinia) }
```

On the client, recreate the root with that state before reading stores:

```ts
const sveltinia = stores.create(data.initialStoreState)
```

In components, convert a Sveltinia store into a Svelte readable store.

```svelte
<script lang="ts">
  import { useStore } from 'sveltinia/svelte'
  const cart = useStore(useCartStore(sveltinia))
</script>

<p>{$cart.total}</p>
<button onclick={() => $cart.clear()}>Clear</button>
```

Use one root for each SSR request. Never retain a server-side root in module scope.

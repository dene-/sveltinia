# SvelteKit tutorial

Create a SvelteKit adapter once and make a root per request. The adapter itself does not import SvelteKit, so it remains easy to test.

```ts
// src/lib/stores/root.ts
import { createSvelteKitPinia } from 'sveltinia/sveltekit'

export const stores = createSvelteKitPinia({ debug: import.meta.env.DEV })
```

In server-side load or request handling, create a root and serialize it into page data:

```ts
const pinia = stores.create()
const cart = useCartStore(pinia)
await cart.$restore()
return { initialStoreState: stores.serialize(pinia) }
```

On the client, recreate the root with that state before reading stores:

```ts
const pinia = stores.create(data.initialStoreState)
```

In components, convert a Sveltinia store into a Svelte readable store.

```svelte
<script lang="ts">
  import { useStore } from 'sveltinia/svelte'
  const cart = useStore(useCartStore(pinia))
</script>

<p>{$cart.total}</p>
<button onclick={() => $cart.clear()}>Clear</button>
```

Use one root for each SSR request. Never retain a server-side root in module scope.

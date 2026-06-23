# Sveltinia

Sveltinia-inspired stores for Svelte and SvelteKit, with Options Stores, Setup Stores, plugins, persistence, mutation subscriptions, action hooks, SSR state transfer, and opt-in debugging.

## Install

```bash
npm install sveltinia
# or: yarn add sveltinia
# or: pnpm add sveltinia
# or: bun add sveltinia
```

## Quick start

```ts
import { createSveltinia, defineStore } from 'sveltinia'

export const sveltinia = createSveltinia({ debug: import.meta.env.DEV })

export const useCounter = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: (state) => state.count * 2 },
  actions: { increment() { this.count++ } },
  persist: true
})
```

Install first-party plugins once per root:

```ts
import { createDebugPlugin, createPersistedState } from 'sveltinia'
sveltinia.use(createDebugPlugin()).use(createPersistedState())
```

Use the store in application code:

```ts
const counter = useCounter(sveltinia)
counter.increment()
console.log(counter.double)
```

In a Svelte component, adapt it to a Svelte readable store:

```svelte
<script lang="ts">
  import { useStore } from 'sveltinia/svelte'
  import { useCounter } from '$lib/stores/counter'
  const counter = useStore(useCounter())
</script>

<button onclick={() => $counter.increment()}>{$counter.count}</button>
```

See the documentation site under `apps/docs` for API details and a SvelteKit tutorial.

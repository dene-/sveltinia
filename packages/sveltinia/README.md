# Sveltinia

<p align="center">
  <img src="https://raw.githubusercontent.com/dene-/sveltinia/main/apps/docs/public/logo.svg" alt="Sveltinia" width="96" height="96">
</p>

<p align="center">
  <strong>Sveltinia stores for Svelte and SvelteKit.</strong><br>
  Typed stores, persistence, plugins, action hooks, mutation subscriptions, request-safe SSR.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/sveltinia"><img alt="npm" src="https://img.shields.io/npm/v/sveltinia?style=for-the-badge&labelColor=090c09&color=3f693a"></a>
  <img alt="package managers" src="https://img.shields.io/badge/npm%20%7C%20yarn%20%7C%20pnpm%20%7C%20bun-ready-3f693a?style=for-the-badge&labelColor=090c09">
  <a href="https://svelte.dev"><img alt="Svelte 5" src="https://img.shields.io/badge/Svelte-5-3f693a?style=for-the-badge&labelColor=090c09"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ready-3f693a?style=for-the-badge&labelColor=090c09"></a>
  <a href="https://dene-.github.io/sveltinia/"><img alt="docs" src="https://img.shields.io/badge/docs-live-3f693a?style=for-the-badge&labelColor=090c09"></a>
</p>

Sveltinia is a Svelte 5 state management library inspired by Pinia. It provides typed stores for Svelte and SvelteKit, persisted Svelte stores, action hooks, mutation subscriptions, plugins, and request-safe SvelteKit SSR state management.

Use it when you want a Pinia alternative for Svelte, familiar SvelteKit Pinia-style ergonomics, or a small store API without a framework-sized abstraction.

## Install

Install it with whichever package manager your project already uses:

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
  import { fromStore } from 'svelte/store'
  import { useCounter } from '$lib/stores/counter'

  const counter = fromStore(useStore(useCounter()))
</script>

<button onclick={() => counter.current.increment()}>{counter.current.count}</button>
```

## Docs

- [Documentation site](https://dene-.github.io/sveltinia/)
- [GitHub repository](https://github.com/dene-/sveltinia)

## License

MIT

## Contributor

Built and maintained by [dene-](https://github.com/dene-).

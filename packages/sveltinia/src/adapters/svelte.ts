import { readable, type Readable } from 'svelte/store'
import { createContext } from 'svelte'
import { setActiveSveltinia } from '../core.js'
import type { Sveltinia, Store } from '../internal/types.js'

const [getSveltiniaContext, setSveltiniaContext] = createContext<Sveltinia>()

export const provideSveltinia = (sveltinia: Sveltinia): Sveltinia => {
  setActiveSveltinia(sveltinia)
  setSveltiniaContext(sveltinia)
  return sveltinia
}

export const useSveltinia = (): Sveltinia => getSveltiniaContext()

// Module-level cache keyed by store identity. `useStore(sameStore)` returns
// the same readable across calls, avoiding duplicate subscriptions. Stores
// are stable per sveltinia, so a single module-level map is safe.
const storeCache = new WeakMap<Store, Readable<Store>>()

export function toSvelteStore<T extends Store>(store: T): Readable<T> {
  const cached = storeCache.get(store) as Readable<T> | undefined
  if (cached) return cached
  const readableStore = readable(store, (set) => store.$subscribe(() => set(store)))
  storeCache.set(store, readableStore as Readable<Store>)
  return readableStore
}

export const useStore = <T extends Store>(store: T): Readable<T> => toSvelteStore(store)

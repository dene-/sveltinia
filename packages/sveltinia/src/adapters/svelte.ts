import { readable, type Readable } from 'svelte/store'
import { getContext, setContext } from 'svelte'
import { setActiveSveltinia } from '../core.js'
import { SVELTINIA_PROVISION_KEY } from '../internal/constants.js'
import type { Sveltinia, Store } from '../internal/types.js'

// Private symbol derived from the provision key. Private (non-`for`) symbols
// isolate context between coexisting sveltinia versions in the same app;
// `provideSveltinia`/`useSveltinia` share it via this module.
export const SVELTINIA_CONTEXT = Symbol(SVELTINIA_PROVISION_KEY)

export const provideSveltinia = (sveltinia: Sveltinia): Sveltinia => {
  setActiveSveltinia(sveltinia)
  setContext(SVELTINIA_CONTEXT, sveltinia)
  return sveltinia
}

export const useSveltinia = (): Sveltinia => getContext<Sveltinia>(SVELTINIA_CONTEXT)

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

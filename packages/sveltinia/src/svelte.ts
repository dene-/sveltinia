import { readable, type Readable } from 'svelte/store'
import { getContext, setContext } from 'svelte'
import type { Pinia, Store } from './types.js'
import { setActivePinia } from './core.js'
export const PINIA_CONTEXT = Symbol.for('sveltinia')
export const providePinia = (pinia: Pinia) => { setActivePinia(pinia); setContext(PINIA_CONTEXT, pinia); return pinia }
export const usePinia = (): Pinia => getContext<Pinia>(PINIA_CONTEXT)
export function toSvelteStore<T extends Store>(store: T): Readable<T> {
  return readable(store, (set) => store.$subscribe(() => set(store)))
}
export const useStore = <T extends Store>(store: T): Readable<T> => toSvelteStore(store)

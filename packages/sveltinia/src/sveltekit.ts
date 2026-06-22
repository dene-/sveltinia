import { createPinia, setActivePinia } from './core.js'
import { clone } from './reactivity.js'
import { createPersistedState } from './persist.js'
import { createDebugPlugin } from './debug.js'
import type { Pinia, PiniaOptions } from './types.js'
export function createSvelteKitPinia(options: PiniaOptions = {}) {
  return {
    create(serialized?: Record<string, any>): Pinia { const pinia = createPinia({ ...options, state: serialized ?? options.state }); pinia.use(createDebugPlugin()); pinia.use(createPersistedState()); setActivePinia(pinia); return pinia },
    serialize(pinia: Pinia) { return clone(pinia.state) },
    hydrate(pinia: Pinia, state: Record<string, any>) { pinia.state = clone(state); for (const store of pinia._stores.values()) store.$patch(state[store.$id] ?? {}) }
  }
}

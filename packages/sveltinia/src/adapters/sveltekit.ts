import { createSveltinia as createRoot, setActiveSveltinia } from '../core.js'
import { clone } from '../internal/reactivity.js'
import { createPersistedState } from '../plugins/persist.js'
import { createDebugPlugin } from '../plugins/debug.js'
import type { Sveltinia, SveltiniaOptions, SveltiniaPlugin, StateTree } from '../internal/types.js'

export function createSveltinia(
  options: SveltiniaOptions = {},
  plugins: SveltiniaPlugin[] = [createDebugPlugin(), createPersistedState()],
) {
  return {
    create(serialized?: Record<string, StateTree>): Sveltinia {
      const sveltinia = createRoot({ ...options, state: serialized ?? options.state })
      for (const plugin of plugins) sveltinia.use(plugin)
      setActiveSveltinia(sveltinia)
      return sveltinia
    },
    serialize(sveltinia: Sveltinia): Record<string, StateTree> {
      return clone(sveltinia.state)
    },
    hydrate(sveltinia: Sveltinia, state: Record<string, StateTree>): void {
      sveltinia.state = clone(state)
      sveltinia.forEachStore((store) => store.$patch(state[store.$id] ?? {}))
    },
  }
}

export { createSveltinia as createSvelteKitSveltinia }

import { DEBUG_KIND, REDACTED } from '../internal/constants.js'
import { flagToObject } from '../internal/util.js'
import type {
  DebugEvent,
  DebugOptions,
  SveltiniaPluginContext,
} from '../internal/types.js'

export function createDebugPlugin(defaults: DebugOptions = {}) {
  return ({ sveltinia, store, options }: SveltiniaPluginContext) => {
    const root = flagToObject(sveltinia.option('debug'))
    const local = flagToObject((options as { debug?: boolean | DebugOptions }).debug)
    const config: DebugOptions & { enabled: boolean } = {
      ...defaults,
      ...root,
      ...local,
      enabled: local?.enabled ?? root?.enabled ?? defaults.enabled ?? false,
    }
    if (!config.enabled) return

    const logger = config.logger ?? consoleDebug
    const previousEmitter = store._emitDebug
    // Chain with any existing emitter so multiple debug plugins stack instead
    // of overwriting each other.
    store._emitDebug = (event: DebugEvent) => {
      previousEmitter?.(event)
      logger(redact(event, config.redact ?? []))
    }
    store._emitDebug({ kind: DEBUG_KIND.LIFECYCLE, storeId: store.$id, name: 'create' })
  }
}

function redact(event: DebugEvent, paths: string[]): DebugEvent {
  if (!paths.length || !event.mutation?.events) return event
  return {
    ...event,
    mutation: {
      ...event.mutation,
      events: event.mutation.events.map((e) =>
        paths.some((p) => e.path === p || e.path.startsWith(`${p}.`))
          ? { ...e, oldValue: REDACTED, newValue: REDACTED }
          : e,
      ),
    },
  }
}

function consoleDebug(event: DebugEvent): void {
  const label = `[sveltinia] ${event.storeId}${event.name ? `/${event.name}` : ''}`
  console.groupCollapsed?.(label)
  console.log(event)
  console.groupEnd?.()
}

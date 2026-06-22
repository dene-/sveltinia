import type { DebugEvent, DebugOptions, Pinia, Store } from './types.js'
const normalize = (v: boolean | DebugOptions | undefined): DebugOptions | undefined => v === true ? { enabled: true } : v === false ? undefined : v
export function createDebugPlugin(defaults: DebugOptions = {}) {
  return ({ pinia, store, options }: { pinia: Pinia; store: Store; options: any }) => {
    const root = normalize(pinia._options.debug); const local = normalize(options.debug)
    const config = { ...defaults, ...root, ...local, enabled: local?.enabled ?? root?.enabled ?? defaults.enabled }
    if (!config.enabled) return
    const logger = config.logger ?? consoleDebug
    store._emitDebug = (event: DebugEvent) => logger(redact(event, config.redact ?? []))
    store._emitDebug({ kind: 'lifecycle', storeId: store.$id, name: 'create' })
  }
}
function redact(event: DebugEvent, paths: string[]): DebugEvent {
  if (!paths.length || !event.mutation?.events) return event
  return { ...event, mutation: { ...event.mutation, events: event.mutation.events.map((e) => paths.some((p) => e.path === p || e.path.startsWith(`${p}.`)) ? { ...e, oldValue: '[redacted]', newValue: '[redacted]' } : e) } }
}
function consoleDebug(event: DebugEvent) {
  const label = `[sveltinia] ${event.storeId}${event.name ? `/${event.name}` : ''}`
  console.groupCollapsed?.(label)
  console.log(event)
  console.groupEnd?.()
}

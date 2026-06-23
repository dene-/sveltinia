# Core API

## `createSveltinia(options?)`

Creates an isolated store root. `state` seeds hydration state. `debug` and `persist` provide global defaults.

## `defineStore(id, options)`

Creates an Options Store factory. Options include `state`, `getters`, `actions`, `persist`, and `debug`.

## `defineStore(id, setup, options?)`

Creates a Setup Store factory. Return `state()` cells for state, `computed()` cells for getters, and functions for actions.

## Store methods

| Method | Purpose |
| --- | --- |
| `$state` | Read or patch the raw state object. |
| `$patch(object \| fn)` | Apply an object merge or grouped mutation callback. |
| `$reset()` | Restore Options Store state; Setup Stores must provide their own reset action. |
| `$subscribe(callback)` | Observe direct, patch, hydration, or restore mutations. |
| `$onAction(callback)` | Observe actions; register `after` and `onError` hooks. |
| `$persist()` | Write configured persisted state. |
| `$restore()` | Read and merge configured persisted state. |
| `$dispose()` | Remove listeners and unregister the store. |

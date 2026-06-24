import { noopDebugEmitter, type Clock, type DebugEmitter } from './util.js'
import type { ActionContext, ActionSubscription, DebuggableStore, Store } from './types.js'

type ActionFn = (...args: unknown[]) => unknown

export function instrumentAction(
  name: string,
  action: ActionFn,
  store: DebuggableStore & Record<PropertyKey, unknown>,
  storeId: string,
  actionSubscribers: Set<ActionSubscription>,
  clock: Clock,
): (...args: unknown[]) => unknown {
  return (...args: unknown[]): unknown => {
    const afterCallbacks: Array<(value: unknown) => void> = []
    const onErrorCallbacks: Array<(error: unknown) => void> = []
    const start = clock()
    const actionContext: ActionContext = {
      name,
      args,
      store: store as unknown as Store,
      after: (cb: (value: unknown) => void) => afterCallbacks.push(cb),
      onError: (cb: (error: unknown) => void) => onErrorCallbacks.push(cb),
    }
    actionSubscribers.forEach((cb) => cb(actionContext))

    const emitDebug: DebugEmitter = store._emitDebug ?? noopDebugEmitter

    const notifyActionSuccess = (value: unknown): unknown => {
      afterCallbacks.forEach((cb) => cb(value))
      emitDebug({
        kind: 'action',
        storeId,
        name,
        duration: clock() - start,
      })
      return value
    }

    const notifyActionError = (error: unknown): void => {
      onErrorCallbacks.forEach((cb) => cb(error))
      emitDebug({
        kind: 'action',
        storeId,
        name,
        duration: clock() - start,
        error,
      })
    }

    try {
      const result = action.apply(store, args)
      return result instanceof Promise
        ? result.then(notifyActionSuccess, (error: unknown) => {
            notifyActionError(error)
            throw error
          })
        : notifyActionSuccess(result)
    } catch (error) {
      notifyActionError(error)
      throw error
    }
  }
}

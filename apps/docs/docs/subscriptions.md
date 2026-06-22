---
title: Subscriptions
description: Observe Sveltinia store mutations with typed subscriptions.
---

# Subscriptions

`$subscribe(callback, options?)` observes mutations and returns an unsubscribe function.

```ts
const stop = cart.$subscribe((mutation, state) => {
  console.log(mutation.type, mutation.events, state)
})

stop()
```

## Mutation data

Mutation types are `direct`, `patch object`, `patch function`, `hydrate`, and `restore`. A mutation includes the store ID, optional changed paths, old/new values, and an optional patch payload.

Notifications are synchronous. `SubscriptionOptions` exposes `detached` and `flush` for API compatibility.

---
title: Plugins and lifecycle
description: Extend Sveltinia stores and manage their lifecycle.
---

# Plugins and lifecycle

A plugin receives `{ sveltinia, store, options }`. It may mutate the store directly or return properties to assign to it.

```ts
sveltinia.use(({ store }) => ({
  createdAt: Date.now(),
  label: `Store: ${store.$id}`
}))
```

## Dispose stores

`store.$dispose()` clears its subscriptions and unregisters it from the root. `sveltinia.dispose()` disposes every store and clears the root. Disposing is useful for tests, temporary application roots, and request cleanup.

## Install the root

`sveltinia.install(app?)` activates the root and calls `app.provide('sveltinia', sveltinia)` when the host app exposes `provide`.

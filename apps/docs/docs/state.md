---
title: State and patching
description: Read, patch, and reset Sveltinia store state.
---

# State and patching

Store state is available both on the store and through `$state`:

```ts
cart.items.push(item)
console.log(cart.$state.items)
```

## Object patches

Use `$patch(object)` for a partial merge:

```ts
cart.$patch({ items: [] })
```

## Function patches

Use `$patch(fn)` to group several mutations into one patch notification:

```ts
cart.$patch((state) => {
  state.items = []
  state.bannerDismissed = true
})
```

Assigning `$state` also patches the current state. `$reset()` restores a fresh Options Store state.

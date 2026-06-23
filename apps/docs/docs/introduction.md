---
title: Introduction
description: Understand Sveltinia package entry points and store model.
---

# Introduction

Sveltinia has three entry points:

| Import | Use it for |
| --- | --- |
| `sveltinia` | Store roots, store definitions, persistence, debugging, and public types |
| `sveltinia/svelte` | Svelte context and readable-store adapters |
| `sveltinia/sveltekit` | Request-scoped roots, serialization, and hydration |

An application creates a **Sveltinia root** and defines one or more store factories. Calling a factory returns one store instance per root and store ID.

Sveltinia targets Svelte 5 apps. Your store definition files can stay ordinary `.ts` files unless you want to use Svelte runes directly in your own app code.

## Next step

[Install Sveltinia](/docs/installation), then [create the root](/docs/root).

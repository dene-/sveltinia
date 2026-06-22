# Sveltinia design

Sveltinia is a TypeScript package that adapts Pinia's core store model to Svelte and SvelteKit. It exposes Pinia-style options and setup stores, an active root, plugins, state patching, actions, subscriptions, SSR state hydration, built-in persistence, and opt-in mutation diagnostics.

The core owns reactive state through a deep observable proxy. Store instances expose `$state`, `$patch`, `$subscribe`, `$onAction`, `$reset`, and `$dispose`. Options stores classify `state`, `getters`, and `actions`; setup stores classify writable `state()` cells as state, `computed()` cells as getters, and functions as actions. The Svelte adapter turns a store into a Svelte-compatible readable store and provides context helpers.

Persistence is configured globally or per store. Browser storage is never accessed on the server. A storage adapter can be synchronous or asynchronous, supports selective paths, versioning and migrations. Debugging is enabled globally or per store and logs direct mutations, patches, actions, hydration, persistence and disposal in structured console groups.

The repository contains package documentation, a VitePress documentation site, tutorials, tests, and a GitHub Pages workflow.

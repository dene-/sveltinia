# Sveltinia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a documented TypeScript package that brings Pinia-style stores, persistence, diagnostics and Svelte/SvelteKit integration to Svelte applications.

**Architecture:** A framework-neutral observable core creates store instances and plugin hooks. A thin Svelte entry point converts stores to Svelte readable stores and supplies context helpers. Persistence and debug behavior are first-party plugins installed by the root.

**Tech Stack:** TypeScript, Vitest, Svelte 5, VitePress, GitHub Actions.

---

### Task 1: Project skeleton and test harness

**Files:**
- Create: `package.json`, `packages/sveltinia/package.json`, `packages/sveltinia/vitest.config.ts`
- Test: `packages/sveltinia/test/core.test.ts`

- [ ] Write a failing Vitest import test for `createPinia` and `defineStore`.
- [ ] Run `npm test -- core.test.ts` and verify it fails because the entry point is missing.
- [ ] Create the package scripts and public entry point.
- [ ] Run the test and verify it passes.

### Task 2: Core store runtime

**Files:**
- Create: `packages/sveltinia/src/core.ts`, `packages/sveltinia/src/reactivity.ts`, `packages/sveltinia/src/types.ts`
- Test: `packages/sveltinia/test/core.test.ts`

- [ ] Add failing tests for state, getters, actions, patching, reset, subscriptions and action hooks.
- [ ] Run the focused tests and verify expected failures.
- [ ] Implement minimal observable store behavior and rerun tests.

### Task 3: Setup stores, persistence and debugging

**Files:**
- Create: `packages/sveltinia/src/persist.ts`, `packages/sveltinia/src/debug.ts`
- Test: `packages/sveltinia/test/advanced.test.ts`

- [ ] Add failing tests for setup cells, persisted restores, migration and debug events.
- [ ] Implement first-party plugins and verify all tests pass.

### Task 4: Svelte and SvelteKit adapter

**Files:**
- Create: `packages/sveltinia/src/svelte.ts`, `packages/sveltinia/src/sveltekit.ts`
- Test: `packages/sveltinia/test/svelte.test.ts`

- [ ] Add tests for store-to-readable conversion and serialized hydration state.
- [ ] Implement adapters without a direct SvelteKit dependency.
- [ ] Run all tests.

### Task 5: Public docs and deployment

**Files:**
- Create: `README.md`, `apps/docs/*`, `.github/workflows/deploy-docs.yml`

- [ ] Document installation, API, persistence, debugging, SSR and a tutorial.
- [ ] Build VitePress docs and validate package type checking.
- [ ] Commit implementation and documentation.

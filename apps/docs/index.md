---
layout: page
pageClass: landing-page
title: Svelte Pinia state management
description: Sveltinia is a typed Pinia alternative for Svelte and SvelteKit with persisted stores, action hooks, diagnostics, and request-safe SSR.
head:
  - - link
    - rel: canonical
      href: https://dene-.github.io/sveltinia/
  - - meta
    - property: og:title
      content: Sveltinia — Svelte state management with Pinia ergonomics
  - - meta
    - property: og:description
      content: Typed Svelte and SvelteKit stores with persistence, action hooks, diagnostics, and request-safe SSR.
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:url
      content: https://dene-.github.io/sveltinia/
  - - meta
    - name: twitter:card
      content: summary_large_image
---

<script setup lang="ts">
import { ref } from 'vue'

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'
const packageManager = ref<PackageManager>('npm')
const installCommands: Record<PackageManager, string> = {
  npm: 'npm install sveltinia',
  yarn: 'yarn add sveltinia',
  pnpm: 'pnpm add sveltinia',
  bun: 'bun add sveltinia'
}
</script>

<main class="landing">
  <section class="hero landing__inner" aria-labelledby="hero-title">
    <div>
      <h1 id="hero-title">Svelte state management, with the ergonomics of <em>Pinia.</em></h1>
      <p class="hero__lede">Sveltinia is a typed Pinia alternative for Svelte: familiar stores, predictable actions, persisted state, diagnostics, and request-safe SvelteKit SSR without a framework-sized abstraction.</p>
      <div class="hero__actions">
        <a class="button button--primary" href="./docs/">Read the docs →</a>
        <a class="button" href="https://github.com/dene-/sveltinia">View on GitHub</a>
      </div>
      <div class="package-install">
        <div class="package-install__tabs" role="tablist" aria-label="Package manager">
          <button role="tab" :aria-selected="packageManager === 'npm'" @click="packageManager = 'npm'">npm</button>
          <button role="tab" :aria-selected="packageManager === 'yarn'" @click="packageManager = 'yarn'">Yarn</button>
          <button role="tab" :aria-selected="packageManager === 'pnpm'" @click="packageManager = 'pnpm'">pnpm</button>
          <button role="tab" :aria-selected="packageManager === 'bun'" @click="packageManager = 'bun'">Bun</button>
        </div>
        <div class="package-install__command"><span>$</span><code>{{ installCommands[packageManager] }}</code></div>
      </div>
    </div>
    <div class="code-window" aria-label="Sveltinia Options Store example">
      <div class="code-window__bar" aria-hidden="true"><i></i><i></i><i></i></div>
      <pre v-pre><code><span class="muted">// stores/cart.ts</span>
<span class="accent">export const</span> useCart = defineStore('cart', {
  state: () =&gt; ({ items: [] }),
  getters: {
    total: (state) =&gt; state.items
      .reduce((sum, item) =&gt; sum + item.price, 0)
  },
  actions: {
    add(item) { this.items.push(item) }
  },
  persist: { paths: ['items'] }
})</code></pre>
    </div>
  </section>

  <section class="landing-section" aria-labelledby="built-for-svelte">
    <div class="landing__inner">
      <div class="section-head">
        <h2 id="built-for-svelte">State management that feels native in Svelte.</h2>
        <p>Use Options Stores when you want structure. Use Setup Stores when composition reads better. Both produce the same small, typed store API.</p>
      </div>
      <div class="feature-list">
        <article class="feature">
          <span class="feature__number">01</span>
          <h3>Two store styles</h3>
          <p>Choose structured state, getters, and actions or compose stores from <code>state()</code>, <code>computed()</code>, and ordinary functions.</p>
        </article>
        <article class="feature">
          <span class="feature__number">02</span>
          <h3>Persisted Svelte stores</h3>
          <p>Build persisted Svelte stores per store, select paths, migrate versions, and use synchronous or asynchronous storage adapters. Browser storage is never touched during SSR.</p>
        </article>
        <article class="feature">
          <span class="feature__number">03</span>
          <h3>Observable by default</h3>
          <p>Subscribe to mutations, observe actions with after/error hooks, and enable structured diagnostics with sensitive paths redacted.</p>
        </article>
        <article class="feature">
          <span class="feature__number">04</span>
          <h3>Svelte-native bridge</h3>
          <p>Expose any Sveltinia store as a standard readable store and consume it with familiar Svelte auto-subscription syntax.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="landing-section" aria-labelledby="ssr-title">
    <div class="landing__inner">
      <div class="section-head">
        <h2 id="ssr-title">SvelteKit SSR state management without shared server state.</h2>
        <p>The SvelteKit adapter makes the safe path explicit: create one Sveltinia root per request, serialize its state, then hydrate a fresh client root.</p>
      </div>
      <div class="ssr-flow">
        <article class="ssr-step"><strong>01 / CREATE</strong><h3>Request-scoped root</h3><p>Create an isolated store container inside server load or request handling.</p></article>
        <article class="ssr-step"><strong>02 / SERIALIZE</strong><h3>Plain state out</h3><p>Return a cloned state snapshot with page data—no store instances cross the boundary.</p></article>
        <article class="ssr-step"><strong>03 / HYDRATE</strong><h3>Fresh client root</h3><p>Recreate stores from the snapshot before components read them.</p></article>
      </div>
    </div>
  </section>

  <section class="landing-section final-cta" aria-labelledby="cta-title">
    <div class="landing__inner">
      <h2 id="cta-title">Small API. Complete state lifecycle.</h2>
      <p>Start with one store and add persistence, diagnostics, or SSR only when the application needs them.</p>
      <a class="button button--primary" href="./docs/api.html">API reference →</a>
    </div>
  </section>
</main>

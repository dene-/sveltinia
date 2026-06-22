# Sveltinia docs redesign

## Goal

Replace the default VitePress presentation with a polished, dark-first documentation site that remains fast, accessible, mobile-friendly, and easy to maintain.

## Information architecture

- `/` is an SEO-focused landing page for Sveltinia.
- `/docs/` is the complete documentation page, covering installation, Options Stores, Setup Stores, the core API, persistence, debugging, Svelte integration, and request-scoped SvelteKit SSR.
- Existing guide and API routes redirect to the relevant `/docs/` anchor where practical, preserving old links.

## Visual design

Use a near-black palette, high-contrast neutral text, and a restrained electric-lime accent. Large editorial typography and a code-window hero make the product feel polished without compromising documentation readability. Decorative effects are CSS-only: a subtle grid, soft glows, and thin borders. No image assets or new dependencies are required.

The landing page contains a concise hero, install command, product preview, core capability sections, an SSR explanation, and a final documentation call to action. The docs page uses a sticky desktop table of contents and a compact mobile navigation control.

## SEO

The landing page uses one descriptive H1, semantic section headings, canonical metadata, Open Graph metadata, and natural copy covering these phrases without keyword stuffing:

- Svelte Pinia
- SvelteKit Pinia
- Pinia alternative for Svelte
- Svelte state management
- persisted Svelte stores
- SvelteKit SSR state management

## Motion and accessibility

Use the browser View Transitions API through progressive enhancement for navigation. Scroll reveals use CSS view timelines where supported and content remains visible without support. All motion is disabled or reduced under `prefers-reduced-motion`. Navigation, contrast, landmarks, heading order, focus states, and code blocks remain keyboard- and screen-reader-friendly.

## Implementation

Keep VitePress and add the smallest custom theme needed for layout and styling. Reuse the existing Markdown content, consolidating it into `/docs/` and filling API gaps directly from the package's public exports and types. Avoid runtime animation libraries and additional packages.

## Verification

Run the VitePress build, Svelte/package checks already defined by the repository, and browser QA at desktop and mobile widths. Verify navigation, anchors, reduced motion, metadata, overflow, and that every existing documentation topic appears on `/docs/`.

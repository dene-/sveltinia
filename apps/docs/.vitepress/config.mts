import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Sveltinia',
  titleTemplate: ':title — Sveltinia',
  description: 'A typed Pinia alternative for Svelte with persisted stores and request-safe SvelteKit SSR state management.',
  base: process.env.GITHUB_ACTIONS ? '/sveltinia/' : '/',
  cleanUrls: true,
  appearance: 'dark',
  sitemap: { hostname: 'https://dene-.github.io/sveltinia/' },
  head: [
    ['meta', { name: 'theme-color', content: '#090c09' }],
    ['meta', { name: 'author', content: 'Sveltinia' }]
  ],
  themeConfig: {
    logo: { src: '/logo.svg', alt: 'Sveltinia' },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/' }
    ],
    sidebar: {
      '/docs/': [
        {
          text: 'Start here',
          items: [
            { text: 'Overview', link: '/docs/' },
            { text: 'Introduction', link: '/docs/introduction' },
            { text: 'Installation', link: '/docs/installation' },
            { text: 'Create the root', link: '/docs/root' }
          ]
        },
        {
          text: 'Stores',
          items: [
            { text: 'Options Stores', link: '/docs/options-stores' },
            { text: 'Setup Stores', link: '/docs/setup-stores' },
            { text: 'Use in Svelte', link: '/docs/svelte' },
            { text: 'State and patching', link: '/docs/state' },
            { text: 'Subscriptions', link: '/docs/subscriptions' },
            { text: 'Action hooks', link: '/docs/actions' }
          ]
        },
        {
          text: 'Production',
          items: [
            { text: 'Persistence', link: '/docs/persistence' },
            { text: 'Debugging', link: '/docs/debugging' },
            { text: 'SvelteKit SSR', link: '/docs/sveltekit' },
            { text: 'Plugins and lifecycle', link: '/docs/plugins' }
          ]
        },
        { text: 'API reference', link: '/docs/api' }
      ]
    },
    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'On this page' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dene-/sveltinia' }],
    footer: { message: 'Typed stores. Request-safe SSR. No runtime surprises.' }
  }
})

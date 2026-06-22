import { defineConfig } from 'vitepress'
export default defineConfig({
  title: 'Sveltinia',
  description: 'Pinia-inspired stores for Svelte and SvelteKit',
  base: process.env.GITHUB_ACTIONS ? '/sveltinia/' : '/',
  themeConfig: {
    nav: [{ text: 'Guide', link: '/guide/getting-started' }, { text: 'API', link: '/api/core' }],
    sidebar: [
      { text: 'Guide', items: [{ text: 'Getting Started', link: '/guide/getting-started' }, { text: 'SvelteKit Tutorial', link: '/guide/sveltekit' }, { text: 'Persistence', link: '/guide/persistence' }, { text: 'Debugging', link: '/guide/debugging' }] },
      { text: 'Reference', items: [{ text: 'Core API', link: '/api/core' }] }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/your-org/sveltinia' }]
  }
})

import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof document === 'undefined' || !document.startViewTransition) return

    document.addEventListener('click', (event) => {
      if (!(event instanceof MouseEvent) || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')
      if (!link || link.target || link.download || link.origin !== location.origin || link.hash || link.pathname === location.pathname) return

      event.preventDefault()
      event.stopImmediatePropagation()
      const href = link.href
      document.startViewTransition(() => router.go(href))
    }, true)
  }
}

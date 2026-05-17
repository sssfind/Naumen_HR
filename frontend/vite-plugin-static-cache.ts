import type { Plugin } from 'vite'

const CACHE_CONTROL = 'public, max-age=31536000, immutable'
const STATIC_RE = /\.(png|jpe?g|webp|gif|svg|ico|avif)(\?.*)?$/i

/** Долгий кеш для картинок в dev/preview (public/achievements и ассеты). */
export function staticAssetCacheHeaders(): Plugin {
  const apply = (middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void }) => {
    middlewares.use((req, res, next) => {
      const path = (req.url ?? '').split('?')[0]
      if (path.startsWith('/achievements/') || STATIC_RE.test(path)) {
        res.setHeader('Cache-Control', CACHE_CONTROL)
      }
      next()
    })
  }

  return {
    name: 'static-asset-cache-headers',
    configureServer(server) {
      apply(server.middlewares)
    },
    configurePreviewServer(server) {
      apply(server.middlewares)
    },
  }
}

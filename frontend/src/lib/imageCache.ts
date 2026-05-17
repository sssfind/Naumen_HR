const preloaded = new Set<string>()

/** Прогревает кеш браузера для URL картинок (повторные заходы — без задержки). */
export function preloadImages(urls: Iterable<string>) {
  for (const raw of urls) {
    const url = raw.trim()
    if (!url || preloaded.has(url)) continue
    preloaded.add(url)
    const img = new Image()
    img.decoding = 'async'
    img.src = url
  }
}

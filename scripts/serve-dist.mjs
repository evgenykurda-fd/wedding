/**
 * Крошечный статический сервер для проверки готовой сборки.
 * Нужен только чтобы посмотреть dist/ в браузере — в продакшене не участвует.
 *
 *   node scripts/serve-dist.mjs        → http://localhost:4173/invitation.html
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '../dist')
const PORT = Number(process.env.PORT || 4173)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.ics': 'text/calendar; charset=utf-8',
  '.svg': 'image/svg+xml',
}

createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  const wanted = url.pathname === '/' ? '/invitation.html' : url.pathname
  // normalize + префиксная проверка: наружу из dist/ выйти нельзя.
  const filePath = join(DIST, normalize(wanted).replace(/^(\.\.[/\\])+/, ''))

  if (!filePath.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden')
    return
  }

  try {
    const body = await readFile(filePath)
    res.writeHead(200, { 'content-type': TYPES[extname(filePath)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Не найдено. Сначала выполните: pnpm build:one')
  }
}).listen(PORT, () => {
  console.log(`dist/ отдаётся на http://localhost:${PORT}/invitation.html`)
})

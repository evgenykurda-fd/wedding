/**
 * Постсборка: превращает пререндер Nuxt в ДВА готовых файла.
 *
 *   dist/invitation.html — самодостаточная страница с <!doctype html>.
 *                          Открывается двойным кликом, заливается на любой
 *                          хостинг, отправляется файлом.
 *   dist/artifact.html   — то же содержимое фрагментом (без doctype/html/
 *                          head/body): в таком виде его принимает публикация
 *                          артефакта, которая сама оборачивает контент.
 *
 * Главная работа скрипта — не склейка, а ПРОВЕРКА. Файл обязан не иметь ни
 * одной внешней ссылки на подресурс: именно это условие делает его
 * работоспособным и под file://, и под строгим CSP. Если проверка падает —
 * падает вся сборка, потому что молча сломанное приглашение хуже отсутствующего.
 *
 * Запуск: node scripts/bundle.mjs  (или pnpm build:one)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, '.output/public/index.html')
const RUNTIME = join(ROOT, 'app/assets/invite.js')
const OUT_DIR = join(ROOT, 'dist')

/** Маркер из app/assets/invite.js — по нему видно, что скрипт на месте. */
const RUNTIME_MARKER = 'invite-runtime'

/** Теги, которые тянут подресурс. Ссылки <a href> сюда НЕ входят: это навигация. */
const SUBRESOURCE_TAGS = /<(link|script|img|source|iframe|video|audio|embed|object|use)\b([^>]*)>/gi
const URL_ATTR = /\b(?:src|srcset|href|data|xlink:href)\s*=\s*("([^"]*)"|'([^']*)')/i

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

/** Разрешены только встроенные значения: data:, «#…» и пустое. */
function isInlineUrl(url) {
  const value = url.trim()
  if (!value) return true
  if (value.startsWith('#')) return true
  if (value.startsWith('data:')) return true
  return false
}

/**
 * Вклеивает оставшиеся внешние стили в <style>.
 * Сейчас Nuxt инлайнит их сам (features.inlineStyles), но если настройка
 * когда-нибудь съедет, сборка не должна тихо начать тянуть CSS по сети.
 */
async function inlineStylesheets(html) {
  const links = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)]
  let result = html
  let inlined = 0

  for (const [tag] of links) {
    const href = tag.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i)
    const url = href?.[2] ?? href?.[3] ?? ''
    if (!url || isInlineUrl(url)) continue

    const filePath = join(ROOT, '.output/public', url.split('?')[0])
    if (!existsSync(filePath)) {
      fail(`Стиль ${url} подключён ссылкой, но файла ${filePath} нет — вклеить нечего.`)
    }

    const css = await readFile(filePath, 'utf8')
    result = result.replace(tag, `<style>${css}</style>`)
    inlined += 1
  }

  if (inlined) console.log(`  вклеено внешних стилей: ${inlined}`)
  return result
}

/** Если по какой-то причине скрипта нет — вставляем его перед </body>. */
async function ensureRuntime(html) {
  if (html.includes(RUNTIME_MARKER)) return html

  console.log('  скрипт интерактива в пререндере не найден — вставляю вручную')
  const code = await readFile(RUNTIME, 'utf8')

  if (code.includes('</script')) {
    fail('app/assets/invite.js содержит последовательность "</script" — она разорвёт тег.')
  }
  if (!html.includes('</body>')) {
    fail('В пререндере нет закрывающего </body> — некуда вставить скрипт.')
  }

  return html.replace('</body>', `<script>\n${code}\n</script></body>`)
}

/** Проверка, ради которой всё и затевалось. */
function assertSelfContained(html) {
  const problems = []

  for (const [tag, , attrs] of html.matchAll(SUBRESOURCE_TAGS)) {
    const match = attrs.match(URL_ATTR)
    if (!match) continue
    const url = match[2] ?? match[3] ?? ''
    if (isInlineUrl(url)) continue
    problems.push(`внешний подресурс: ${tag.slice(0, 120)}`)
  }

  // url() и @import ищем ТОЛЬКО внутри <style>: в JS полно имён вида
  // createObjectURL(blob), и они не имеют к подресурсам никакого отношения.
  for (const [, css] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const [, url] of css.matchAll(/url\(\s*("([^"]*)"|'([^']*)'|[^)'"]+)\s*\)/gi)) {
      const value = url.replace(/^['"]|['"]$/g, '')
      if (isInlineUrl(value)) continue
      problems.push(`url() в стилях ведёт наружу: ${value.slice(0, 100)}`)
    }

    for (const [statement] of css.matchAll(/@import[^;]+;/gi)) {
      problems.push(`не разрешённый @import: ${statement.slice(0, 100)}`)
    }
  }

  if (problems.length) {
    fail(
      `Страница не самодостаточна — она сломается под file:// и под CSP.\n  ` +
        problems.join('\n  '),
    )
  }
}

/**
 * Фрагмент для публикации артефакта: <title>, все <style> и всё содержимое
 * <body>. Собственные doctype/html/head/body добавлять нельзя — обёртку
 * ставит сама публикация. Инлайн-скрипты из <head> переносим в начало
 * фрагмента: конфиг должен быть в DOM раньше, чем его прочитает invite.js.
 */
function toArtifactFragment(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? ''
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]

  if (body === undefined) fail('Не нашёл <body> в пререндере — фрагмент собрать нельзя.')

  const title = head.match(/<title\b[^>]*>[\s\S]*?<\/title>/i)?.[0] ?? ''
  const styles = [...head.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map(([tag]) => tag)
  // Только инлайн-скрипты (без src) — внешних тут и не должно остаться.
  const headScripts = [...head.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi)].map(
    ([tag]) => tag,
  )

  return [title, ...styles, ...headScripts, body].filter(Boolean).join('\n')
}

const kb = (text) => `${(Buffer.byteLength(text, 'utf8') / 1024).toFixed(1)} КБ`

async function main() {
  if (!existsSync(SOURCE)) {
    fail(`Нет пререндера ${SOURCE}. Сначала выполните: pnpm generate`)
  }

  console.log('Постсборка приглашения:')

  let html = await readFile(SOURCE, 'utf8')
  html = await inlineStylesheets(html)
  html = await ensureRuntime(html)

  assertSelfContained(html)
  console.log('  проверка самодостаточности: внешних подресурсов нет')

  const fragment = toArtifactFragment(html)

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(join(OUT_DIR, 'invitation.html'), html, 'utf8')
  await writeFile(join(OUT_DIR, 'artifact.html'), fragment, 'utf8')

  console.log(`\n  dist/invitation.html — ${kb(html)} (отдельная страница)`)
  console.log(`  dist/artifact.html   — ${kb(fragment)} (фрагмент для публикации)`)
  console.log('\n✓ Готово.\n')
}

await main()

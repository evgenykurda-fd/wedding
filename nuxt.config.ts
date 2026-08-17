// Приглашение на свадьбу — статичная одностраничная сборка.
//
// Задача сборки нетипичная: на выходе нужен ОДИН самодостаточный HTML-файл без
// единого внешнего запроса. Он должен открываться двойным кликом (file://),
// публиковаться под строгим CSP и заливаться на любой хостинг. Поэтому Nuxt
// работает здесь только как система компонентов и пререндера:
//   - noScripts убирает клиентский бандл и resource hints;
//   - inlineStyles вклеивает CSS в <style>;
//   - вся интерактивность живёт в app/assets/invite.js и попадает в HTML
//     инлайн-тегом через useHead в app.vue.
// Финальную склейку и проверку «ноль внешних ссылок» делает scripts/bundle.mjs.
export default defineNuxtConfig({
  compatibilityDate: '2026-08-11',

  ssr: true,
  devtools: { enabled: false },

  features: {
    // 'production' — в dev гидратация остаётся, чтобы `nuxi dev` был удобным.
    noScripts: 'production',
    inlineStyles: true,
  },

  // Без клиентского JS payload-файл только мешает: его всё равно некому забрать.
  experimental: {
    payloadExtraction: false,
  },

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: false,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#faf7f2', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#16201a', media: '(prefers-color-scheme: dark)' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        // Инлайн-favicon: два обручальных кольца. Data-URI, чтобы не было запроса.
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cg fill='none' stroke='%236b7355' stroke-width='2.2'%3E%3Ccircle cx='12.5' cy='19' r='7.5'/%3E%3Ccircle cx='21' cy='19' r='7.5'/%3E%3C/g%3E%3Cpath d='M17 4l2.4 4.2h-4.8z' fill='%23b5754f'/%3E%3C/svg%3E",
        },
      ],
    },
  },
})

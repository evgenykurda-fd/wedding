<script setup lang="ts">
// Скрипт интерактива подключается как СТРОКА и вклеивается инлайн-тегом.
// Не через обычный клиентский бандл: features.noScripts выпиливает бандл
// целиком, а нам нужен рабочий счётчик и RSVP в одном файле без запросов.
import inviteScript from '~/assets/invite.js?raw'
import { WEDDING, weddingClientConfig } from '~/utils/wedding'

const title = `${WEDDING.groom} и ${WEDDING.bride} - свадьба ${WEDDING.date.human}`
const description =
  `${WEDDING.date.human}, ${WEDDING.date.weekday}. Роспись в ${WEDDING.venues.ceremony.time} - ` +
  `${WEDDING.venues.ceremony.name}. Празднование - ${WEDDING.venues.party.name}. Будем очень рады видеть вас.`

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogLocale: 'ru_RU',
  // og:image намеренно нет: он требует абсолютного URL, а домен ещё не выбран.
  // Как добавить — написано в README.
})

/**
 * Бутстрап. Должен выполниться ДО первой отрисовки, поэтому живёт в <head>
 * отдельно от основного скрипта, который стоит перед </body>:
 *   - has-js разрешает CSS прятать секции под анимацию появления;
 *   - is-sealed запирает прокрутку страницы под открыткой-заставкой.
 *
 * Таймер — страховка. Если основной скрипт по какой-то причине не доберётся
 * до открытки (класс env-ready), гость не должен остаться перед запертой
 * заставкой: через пять секунд убираем её сами.
 */
const bootstrap = `(function(){var r=document.documentElement;
r.classList.add('has-js','is-sealed');
setTimeout(function(){
if(r.classList.contains('env-ready'))return;
r.classList.remove('is-sealed');r.classList.add('is-entered');
var e=document.querySelector('[data-envelope]');
if(e)e.classList.add('is-leaving','is-done')},5000)})()`

useHead({
  script: [
    // Данные для инлайн-скрипта. JSON, а не глобальная переменная, — чтобы
    // конфиг жил в одном месте (app/utils/wedding.ts) и не дублировался в JS.
    {
      id: 'wedding-config',
      type: 'application/json',
      innerHTML: JSON.stringify(weddingClientConfig()),
      tagPosition: 'head',
    },
    {
      innerHTML: bootstrap,
      tagPosition: 'head',
    },
    {
      innerHTML: inviteScript,
      tagPosition: 'bodyClose',
    },
  ],
})
</script>

<template>
  <NuxtPage />
</template>

<style>
@import './assets/css/main.css';
</style>

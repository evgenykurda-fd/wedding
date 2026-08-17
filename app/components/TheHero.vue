<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'
</script>

<template>
  <!-- data-hero — точка отсчёта для липкой шапки, её отслеживает invite.js -->
  <header class="hero" data-hero>
    <SoftAura :strength="0.55" />

    <div class="wrap hero__inner">
      <p class="eyebrow hero__eyebrow" style="--d: 60ms">Приглашение на свадьбу</p>

      <WeddingRings class="hero__rings" style="--d: 140ms" />

      <h1 class="display hero__names" style="--d: 240ms">
        <span class="grad-text">{{ WEDDING.groom }}</span>
        <em class="hero__amp">&amp;</em>
        <span class="grad-text">{{ WEDDING.bride }}</span>
      </h1>

      <BotanicalDivider class="hero__divider" style="--d: 360ms" />

      <!-- Дата набрана так же, как на конверте: страница и конверт должны
           читаться одним почерком. -->
      <p class="hero__date display" style="--d: 440ms">
        {{ WEDDING.date.day }} {{ WEDDING.date.monthGenitive }} {{ WEDDING.date.year }}
      </p>
      <p class="hero__weekday" style="--d: 500ms">{{ WEDDING.date.weekday }}</p>

      <!--
        МЕСТО ПОД ФОТО ПАРЫ.
        Внешние картинки использовать нельзя — файл должен работать офлайн
        и под строгим CSP. Вставьте фото как data-URI:
          1) сожмите снимок до ~1200px по широкой стороне (иначе файл раздуется);
          2) base64 -i photo.jpg | pbcopy
          3) раскомментируйте строку ниже и вставьте результат после base64,
        <img class="hero__photo" src="data:image/jpeg;base64,ВСТАВЬТЕ_СЮДА" alt="Евгений и Карина" />
      -->

      <a class="hero__cue" href="#invite" style="--d: 620ms">
        <span class="sr-only">Пролистать к приглашению</span>
        <!-- Кружок и стрелка качаются одним элементом: если двигать только
             стрелку, она уезжает из центра кружка. -->
        <span class="hero__cue-dot" aria-hidden="true">
          <span class="hero__cue-ring" />
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </a>
    </div>
  </header>
</template>

<!--
  Появление hero завязано на классы <html>, поэтому блок без scoped:
  компилятор Vue режет селекторы вида «:global(html.x) .y» и переносит
  стиль на сам <html>. Имена классов уникальные — глобальность безопасна.
-->
<style>
/**
 * Hero въезжает по частям, но только после того, как гость открыл
 * открытку-заставку: класс is-entered ставит invite.js. Условие
 * html.has-js обязательно — при выключенном скрипте всё должно быть
 * видно сразу, иначе гость увидит пустой экран.
 */
html.has-js .hero__inner > * {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.8s ease var(--d, 0ms),
    transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) var(--d, 0ms);
}

html.is-entered .hero__inner > * {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  html.has-js .hero__inner > * {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>

<style scoped>
.hero {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100vh;
  min-height: 100svh;
  padding-block: clamp(2.5rem, 8vw, 4rem);
  overflow: hidden;
  text-align: center;
}

.hero__inner {
  position: relative;
  display: grid;
  justify-items: center;
  gap: clamp(1rem, 3.5vw, 1.5rem);
}

.hero__eyebrow {
  color: var(--sage-ink);
}

.hero__names {
  display: grid;
  justify-items: center;
  gap: 0.04em;
  font-size: clamp(2.6rem, 1.2rem + 9vw, 4.4rem);
  color: var(--ink);
}

.hero__amp {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.5em;
  color: var(--gold-ink);
  line-height: 1;
}

.hero__divider {
  margin-block: 0.25rem;
}

/* Дата: курсивная антиква терракотой — ровно как на конверте. */
.hero__date {
  padding-inline: 0.06em;
  font-style: italic;
  font-size: clamp(1.5rem, 1rem + 3.2vw, 2.25rem);
  letter-spacing: 0.02em;
  color: var(--accent-ink);
}

.hero__weekday {
  /* Подтягиваем к дате: gap сетки здесь слишком велик. */
  margin-top: -0.55rem;
  font-size: clamp(0.7rem, 2.6vw, 0.8rem);
  letter-spacing: 0.34em;
  text-indent: 0.34em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.hero__photo {
  width: min(100%, 22rem);
  border-radius: 999px;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}

.hero__cue {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-top: 0.5rem;
  color: var(--sage-ink);
  text-decoration: none;
}

.hero__cue-dot {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid color-mix(in srgb, var(--gold) 50%, transparent);
  border-radius: 50%;
  animation: hero-cue 2.6s ease-in-out infinite;
}

.hero__cue svg {
  position: relative;
  width: 22px;
  height: 22px;
}

/* Расходящееся кольцо — приглашение пролистать. */
.hero__cue-ring {
  position: absolute;
  inset: -1px;
  border: 1px solid color-mix(in srgb, var(--gold) 70%, transparent);
  border-radius: 50%;
  animation: halo 2.6s ease-out infinite;
}

@keyframes hero-cue {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__cue-dot,
  .hero__cue-ring {
    animation: none;
  }
}
</style>

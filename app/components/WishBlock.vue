<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'

/** Иконка просьбы: веточка с двумя листьями — один путь из трёх подпутей. */
const ICON =
  'M12 20.5V8M12 13.5C8.7 13.5 7 11.4 7 8.2c3.3 0 5 2.1 5 5.3zM12 16.5c3.3 0 5-2.1 5-5.3-3.3 0-5 2.1-5 5.3z'
</script>

<template>
  <article class="wish card" data-reveal>
    <div class="wish__head">
      <span class="wish__badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path
            :d="ICON"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <h3 class="wish__title">{{ WEDDING.wish.title }}</h3>
    </div>

    <p class="wish__text">{{ WEDDING.wish.text }}</p>

    <a
      class="btn wish__link"
      :href="WEDDING.wish.link.href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 20.5S4.5 14.9 4.5 10a4.2 4.2 0 0 1 7.5-2.6A4.2 4.2 0 0 1 19.5 10c0 4.9-7.5 10.5-7.5 10.5z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
      {{ WEDDING.wish.link.label }}
    </a>
  </article>
</template>

<style scoped>
/**
 * Единственная карточка секции — на тёплой подложке: так кнопка внизу
 * выглядит задуманной частью карточки, а не случайно приехавшей.
 */
.wish {
  max-width: 34rem;
  margin-inline: auto;
  padding: clamp(1.15rem, 4.5vw, 1.6rem);
  background: linear-gradient(
      155deg,
      color-mix(in srgb, var(--rose) 10%, var(--card)),
      color-mix(in srgb, var(--gold) 8%, var(--card))
    )
    padding-box,
    linear-gradient(140deg, var(--rose), var(--accent) 60%, var(--gold)) border-box;
}

.wish__head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

/* Кружок с иконкой — в розовом тоне карточки. */
.wish__badge {
  flex: none;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--rose) 20%, transparent);
  color: var(--rose-ink);
}

.wish__badge svg {
  width: 20px;
  height: 20px;
}

.wish__title {
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 1rem + 0.6vw, 1.35rem);
  font-weight: 400;
  color: var(--ink);
}

.wish__text {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  color: var(--ink-soft);
}

/**
 * Кнопка сбора — во всю ширину карточки и в своей, «тёплой» заливке:
 * это не рядовая ссылка вроде карт, и выглядеть она должна иначе.
 */
.wish__link {
  width: 100%;
  margin-top: 1.2rem;
  min-height: 50px;
  padding-inline: 1rem;
  border-color: transparent;
  background: linear-gradient(125deg, var(--rose), var(--accent) 62%, var(--gold));
  color: var(--on-sage);
  font-size: 0.92rem;
  font-weight: 600;
}

/* Базовая .btn перекрашивает текст при наведении — здесь это ни к чему. */
.wish__link:hover {
  color: var(--on-sage);
  box-shadow: 0 12px 26px -14px color-mix(in srgb, var(--accent-ink) 85%, transparent);
}

/* Сердце залито и тихо бьётся. */
.wish__link .btn__icon path {
  fill: currentColor;
  fill-opacity: 0.9;
}

.wish__link .btn__icon {
  animation: heart-beat 2.8s ease-in-out infinite;
}

@keyframes heart-beat {
  0%,
  100% {
    transform: scale(1);
  }
  18% {
    transform: scale(1.18);
  }
  32% {
    transform: scale(1);
  }
  46% {
    transform: scale(1.12);
  }
  60% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wish__link .btn__icon {
    animation: none;
  }
}
</style>

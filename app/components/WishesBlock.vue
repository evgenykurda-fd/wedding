<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'

/**
 * Иконки к просьбам по порядку: веточка с двумя листьями (о цветах) и
 * коробка с бантом (о подарках). Каждая — один путь из нескольких подпутей.
 */
const ICONS = [
  'M12 20.5V8M12 13.5C8.7 13.5 7 11.4 7 8.2c3.3 0 5 2.1 5 5.3zM12 16.5c3.3 0 5-2.1 5-5.3-3.3 0-5 2.1-5 5.3z',
  'M4.5 10h15v10h-15zM3.5 6h17v4h-17zM12 6v14M12 6C10.3 6 8.6 5.4 8.6 4.2c0-.9.8-1.2 1.4-.9C11 3.8 11.7 4.9 12 6zM12 6c1.7 0 3.4-.6 3.4-1.8 0-.9-.8-1.2-1.4-.9C13 3.8 12.3 4.9 12 6z',
]
</script>

<template>
  <!-- Одна колонка: во второй карточке нет кнопки, и рядом они смотрелись
       кривобоко — у одной низ занят, у другой пусто. -->
  <div class="wishes">
    <article
      v-for="(wish, index) in WEDDING.wishes"
      :key="wish.title"
      class="wishes__item card"
      :class="{ 'wishes__item--call': wish.link }"
      data-reveal
      :style="{ '--reveal-delay': `${index * 110}ms` }"
    >
      <div class="wishes__head">
        <span class="wishes__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              :d="ICONS[index % ICONS.length]"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <h3 class="wishes__title">{{ wish.title }}</h3>
      </div>

      <p class="wishes__text">{{ wish.text }}</p>

      <a
        v-if="wish.link"
        class="btn wishes__link"
        :href="wish.link.href"
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
        {{ wish.link.label }}
      </a>
    </article>
  </div>
</template>

<style scoped>
.wishes {
  display: grid;
  gap: clamp(0.75rem, 3vw, 1rem);
  max-width: 34rem;
  margin-inline: auto;
}

.wishes__item {
  padding: clamp(1.15rem, 4.5vw, 1.6rem);
}

/**
 * Просьба с призывом — на тёплой подложке. Так кнопка внизу выглядит
 * задуманной частью карточки, а не случайно приехавшей.
 */
.wishes__item--call {
  background: linear-gradient(
      155deg,
      color-mix(in srgb, var(--rose) 10%, var(--card)),
      color-mix(in srgb, var(--gold) 8%, var(--card))
    )
    padding-box,
    linear-gradient(140deg, var(--rose), var(--accent) 60%, var(--gold)) border-box;
}

.wishes__head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

/* Кружок с иконкой: у первой просьбы розовый, у второй зелёный. */
.wishes__badge {
  flex: none;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--sage) 16%, transparent);
  color: var(--sage-ink);
}

.wishes__item--call .wishes__badge {
  background: color-mix(in srgb, var(--rose) 20%, transparent);
  color: var(--rose-ink);
}

.wishes__badge svg {
  width: 20px;
  height: 20px;
}

.wishes__title {
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 1rem + 0.6vw, 1.35rem);
  font-weight: 400;
  color: var(--ink);
}

.wishes__text {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  color: var(--ink-soft);
}

/**
 * Кнопка сбора — во всю ширину карточки и в своей, «тёплой» заливке:
 * это не рядовая ссылка вроде карт, и выглядеть она должна иначе.
 */
.wishes__link {
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
.wishes__link:hover {
  color: var(--on-sage);
  box-shadow: 0 12px 26px -14px color-mix(in srgb, var(--accent-ink) 85%, transparent);
}

/* Сердце залито и тихо бьётся. */
.wishes__link .btn__icon path {
  fill: currentColor;
  fill-opacity: 0.9;
}

.wishes__link .btn__icon {
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
  .wishes__link .btn__icon {
    animation: none;
  }
}
</style>

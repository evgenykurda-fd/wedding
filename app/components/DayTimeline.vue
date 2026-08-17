<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'
</script>

<template>
  <div class="tl-wrap">
    <ol class="tl">
      <li
        v-for="(item, index) in WEDDING.timeline"
        :key="item.time + item.title"
        class="tl__item"
        :class="{ 'tl__item--accent': item.accent }"
        data-reveal="left"
        :style="{ '--reveal-delay': `${index * 70}ms` }"
      >
        <span class="tl__dot" aria-hidden="true" />
        <p class="tl__time">{{ item.time }}</p>
        <h3 class="tl__title">{{ item.title }}</h3>
        <p class="tl__place">{{ item.place }}</p>
        <p class="tl__note">{{ item.note }}</p>
      </li>
    </ol>

    <div class="tl-wrap__cta" data-reveal>
      <button type="button" class="btn" data-ics>
        <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3.25" y="5" width="17.5" height="15.75" rx="2.5" />
            <path d="M3.25 9.75h17.5M8 3.25V6M16 3.25V6M12 12.5v4.5M9.75 14.75h4.5" />
          </g>
        </svg>
        Добавить в календарь
      </button>
      <p class="tl-wrap__hint">Скачается файл события - откройте его, и день добавится в ваш календарь.</p>
    </div>
  </div>
</template>

<style scoped>
.tl {
  position: relative;
  margin: 0;
  padding: 0 0 0 2.15rem;
  list-style: none;
}

/* Вертикальная линия дня: от зелени утра к золоту вечера. */
.tl::before {
  content: '';
  position: absolute;
  top: 0.55rem;
  bottom: 0.55rem;
  left: 0.4rem;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(
    to bottom,
    transparent,
    color-mix(in srgb, var(--sage) 70%, transparent) 8%,
    color-mix(in srgb, var(--accent) 60%, transparent) 55%,
    color-mix(in srgb, var(--rose) 65%, transparent) 88%,
    transparent
  );
}

.tl__item {
  position: relative;
  padding-bottom: clamp(1.6rem, 5vw, 2.1rem);
}

.tl__item:last-child {
  padding-bottom: 0;
}

.tl__dot {
  position: absolute;
  top: 0.45rem;
  left: -1.95rem;
  width: 11px;
  height: 11px;
  border: 1.5px solid var(--sage);
  border-radius: 50%;
  background: var(--bg);
}

.tl__item--accent .tl__dot {
  border-color: var(--gold-ink);
  background: var(--grad-solid);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent);
}

/* Ключевые точки дня медленно пульсируют кольцом. */
.tl__item--accent .tl__dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  animation: halo 3s ease-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .tl__item--accent .tl__dot::after {
    animation: none;
  }
}

.tl__time {
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sage-ink);
}

.tl__item--accent .tl__time {
  color: var(--accent-ink);
}

.tl__title {
  margin-top: 0.15rem;
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 1rem + 0.9vw, 1.35rem);
  font-weight: 400;
  line-height: 1.25;
}


.tl__place {
  margin-top: 0.1rem;
  font-size: 0.9rem;
  color: var(--sage-ink);
}

.tl__note {
  margin-top: 0.35rem;
  font-size: 0.93rem;
  color: var(--ink-soft);
}

.tl-wrap__cta {
  margin-top: clamp(2rem, 6vw, 2.75rem);
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  text-align: center;
}

.tl-wrap__hint {
  font-size: 0.82rem;
  color: var(--ink-soft);
  max-width: 24rem;
}
</style>

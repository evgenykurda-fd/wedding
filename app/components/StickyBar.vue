<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'

/** Появляется, когда hero уехал за верх экрана. Класс is-on ставит invite.js. */
</script>

<template>
  <div class="bar" data-sticky-bar>
    <div class="wrap bar__inner">
      <p class="bar__brand">
        <!-- Те же кольца, что и на странице, только крошечные и без бликов. -->
        <svg class="bar__rings" viewBox="0 0 36 20" aria-hidden="true" focusable="false">
          <circle cx="13" cy="10" r="7.6" />
          <circle cx="23" cy="10" r="7.6" />
        </svg>

        <span class="bar__text">
          <span class="bar__names">
            {{ WEDDING.groom }}<em>&amp;</em>{{ WEDDING.bride }}
          </span>
          <span class="bar__date">
            {{ WEDDING.date.day }} {{ WEDDING.date.monthGenitive }} {{ WEDDING.date.year }}
          </span>
        </span>
      </p>

      <a class="bar__cta" href="#rsvp">
        Ответить
        <svg class="bar__cta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M6 10l6 6 6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </a>
    </div>

    <!-- Полоска прогресса: --progress считает invite.js при прокрутке. -->
    <span class="bar__progress" aria-hidden="true" />
  </div>
</template>

<style scoped>
.bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--bg) 95%, transparent),
    color-mix(in srgb, var(--bg) 84%, transparent)
  );
  backdrop-filter: blur(12px) saturate(1.2);
  transform: translateY(-100%);
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* Тёплая волосинка вместо простой рамки снизу. */
.bar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--grad-line);
  opacity: 0.7;
}

.bar.is-on {
  transform: none;
}

.bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 56px;
  padding-block: 0.45rem;
}

.bar__brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.bar__rings {
  flex: none;
  width: 32px;
  height: 18px;
  fill: none;
  stroke: var(--gold-ink);
  stroke-width: 1.7;
  opacity: 0.85;
}

/* Имена и дата в две строки: в одну полные имена на телефоне не помещаются. */
.bar__text {
  display: grid;
  gap: 0.05rem;
  min-width: 0;
}

.bar__names {
  font-family: var(--font-display);
  font-size: clamp(0.92rem, 3.4vw, 1.1rem);
  line-height: 1.15;
  letter-spacing: 0.03em;
  color: var(--ink);
  white-space: nowrap;
}

.bar__names em {
  padding-inline: 0.16em;
  font-style: italic;
  color: var(--gold-ink);
}

.bar__date {
  font-size: clamp(0.6rem, 2.2vw, 0.68rem);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-soft);
  white-space: nowrap;
}

.bar__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 40px;
  padding: 0.3rem 0.75rem 0.3rem 1.05rem;
  border-radius: 999px;
  background: var(--grad-solid);
  color: var(--on-sage);
  font-size: 0.86rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 6px 16px -10px color-mix(in srgb, var(--sage-ink) 90%, transparent);
  transition: box-shadow 0.25s ease, transform 0.18s ease;
}

.bar__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px color-mix(in srgb, var(--sage-ink) 90%, transparent);
}

.bar__cta-icon {
  width: 17px;
  height: 17px;
  opacity: 0.85;
  animation: bar-nudge 2.6s ease-in-out infinite;
}

.bar__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 2px;
  background: var(--grad-line);
  transform: scaleX(var(--progress, 0));
  transform-origin: left center;
}

/* Стрелка чуть подталкивает вниз — туда, куда ведёт кнопка. */
@keyframes bar-nudge {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bar,
  .bar__cta,
  .bar__cta-icon {
    transition: none;
    animation: none;
  }
}
</style>

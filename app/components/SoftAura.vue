<script setup lang="ts">
import { useId } from 'vue'

/**
 * Живой фон: три медленно дрейфующих цветных пятна и падающие листья.
 * Один компонент на конверт-заставку и на hero — чтобы фон был узнаваемо
 * одним и тем же и чтобы стили не дублировались в итоговом файле.
 *
 * Полностью декоративен: aria-hidden, pointer-events: none, никакого текста.
 */
withDefaults(
  defineProps<{
    /** Падающие листья. */
    leaves?: boolean
    /** Насыщенность цветных пятен. 0 — только листья, без пятен. */
    strength?: number
  }>(),
  { leaves: true, strength: 0.5 },
)

/** Тот же лист-капля, что в венке и разделителях. */
const LEAF = 'M0 0C2-7 11-13 19-12 17-4 9 2 0 0Z'

/** Компонент бывает на странице не один — ссылки url(#…) не должны пересекаться. */
const leafId = `leaf-${useId()}`

/**
 * Параметры листьев заданы руками, а не через random: пререндер обязан
 * давать одинаковый HTML при каждой сборке.
 * left — старт по горизонтали, sway — амплитуда покачивания в полёте.
 */
const FALLING = [
  { left: 7, size: 34, delay: 0, duration: 15, sway: 5, tint: 'sage', opacity: 0.62 },
  { left: 19, size: 24, delay: 3.5, duration: 19, sway: -4, tint: 'gold', opacity: 0.56 },
  { left: 33, size: 40, delay: 7, duration: 16, sway: 6, tint: 'sage', opacity: 0.5 },
  { left: 46, size: 22, delay: 1.5, duration: 21, sway: -6, tint: 'rose', opacity: 0.58 },
  { left: 58, size: 31, delay: 9.5, duration: 17, sway: 4, tint: 'gold', opacity: 0.58 },
  { left: 70, size: 26, delay: 5, duration: 20, sway: -5, tint: 'sage', opacity: 0.54 },
  { left: 83, size: 36, delay: 12, duration: 15, sway: 5, tint: 'rose', opacity: 0.56 },
  { left: 93, size: 24, delay: 2.5, duration: 22, sway: -3, tint: 'gold', opacity: 0.44 },
]
</script>

<template>
  <div class="aura" :style="{ '--strength': strength }" aria-hidden="true">
    <span class="aura__blob aura__blob--sage" />
    <span class="aura__blob aura__blob--rose" />
    <span class="aura__blob aura__blob--gold" />

    <span
      v-for="(leaf, index) in leaves ? FALLING : []"
      :key="index"
      class="aura__leaf"
      :class="`aura__leaf--${leaf.tint}`"
      :style="{
        left: `${leaf.left}%`,
        '--size': `${leaf.size}px`,
        '--leaf-sway': `${leaf.sway}vw`,
        '--leaf-opacity': leaf.opacity,
        animationDelay: `${leaf.delay}s`,
        animationDuration: `${leaf.duration}s`,
      }"
    >
      <svg viewBox="0 -13 20 16" focusable="false">
        <defs>
          <!-- Свой градиент на каждый лист: stop-color наследует цвет от
               своего же <svg>, поэтому оттенок берётся из класса листа. -->
          <linearGradient :id="`${leafId}-${index}`" x1="0" y1="1" x2="0.9" y2="0">
            <stop offset="0" stop-color="currentColor" stop-opacity="0.78" />
            <stop offset="0.55" stop-color="currentColor" stop-opacity="0.44" />
            <stop offset="1" stop-color="currentColor" stop-opacity="0.2" />
          </linearGradient>
        </defs>
        <path class="aura__leaf-body" :d="LEAF" :fill="`url(#${leafId}-${index})`" />
        <path class="aura__leaf-vein" d="M1.5-1C6-3.5 12-7.5 17.5-11" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.aura {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--grad-aura);
  pointer-events: none;
}

.aura__blob {
  position: absolute;
  width: 46vmax;
  height: 46vmax;
  border-radius: 50%;
  /* Размытие тяжёлое, но анимируется только transform: слой кэшируется
     и на телефоне не перерисовывается каждый кадр. */
  filter: blur(60px);
  opacity: var(--strength, 0.5);
  animation: drift 22s ease-in-out infinite alternate;
}

.aura__blob--sage {
  top: -14vmax;
  left: -12vmax;
  background: radial-gradient(circle, color-mix(in srgb, var(--sage) 55%, transparent), transparent 68%);
}

.aura__blob--rose {
  right: -16vmax;
  bottom: -12vmax;
  background: radial-gradient(circle, color-mix(in srgb, var(--rose) 52%, transparent), transparent 68%);
  animation-duration: 27s;
  animation-delay: -8s;
}

.aura__blob--gold {
  top: -18vmax;
  right: -10vmax;
  background: radial-gradient(circle, color-mix(in srgb, var(--gold) 48%, transparent), transparent 68%);
  animation-duration: 31s;
  animation-delay: -15s;
}

.aura__leaf {
  position: absolute;
  top: 0;
  width: var(--size, 16px);
  opacity: 0;
  animation-name: leaf-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.aura__leaf svg {
  width: 100%;
  height: auto;
  /* Мягкая тень: лист отделяется от фона и перестаёт быть плоской наклейкой. */
  filter: drop-shadow(0 2px 3px rgba(8, 14, 10, 0.3));
}

/* Пластина залита градиентом (см. разметку), контур обводит её по краю. */
.aura__leaf-body {
  stroke: currentColor;
  stroke-opacity: 0.5;
  stroke-width: 0.9;
  stroke-linejoin: round;
}

/* Прожилка вдоль листа — светлая, она и даёт ощущение изгиба. */
.aura__leaf-vein {
  fill: none;
  stroke: rgba(255, 250, 236, 0.5);
  stroke-width: 0.8;
  stroke-linecap: round;
}

.aura__leaf--sage {
  color: var(--sage);
}

.aura__leaf--gold {
  color: var(--gold-ink);
}

.aura__leaf--rose {
  color: var(--rose-ink);
}

@media (prefers-reduced-motion: reduce) {
  .aura__blob {
    animation: none;
  }

  /* Падающие листья — чистое движение, без них картинка не беднеет. */
  .aura__leaf {
    display: none;
  }
}
</style>

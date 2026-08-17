<script setup lang="ts">
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

/**
 * Параметры листьев заданы руками, а не через random: пререндер обязан
 * давать одинаковый HTML при каждой сборке.
 * left — старт по горизонтали, sway — амплитуда покачивания в полёте.
 */
const FALLING = [
  { left: 7, size: 20, delay: 0, duration: 15, sway: 5, tint: 'sage', opacity: 0.55 },
  { left: 19, size: 14, delay: 3.5, duration: 19, sway: -4, tint: 'gold', opacity: 0.5 },
  { left: 33, size: 23, delay: 7, duration: 16, sway: 6, tint: 'sage', opacity: 0.42 },
  { left: 46, size: 13, delay: 1.5, duration: 21, sway: -6, tint: 'rose', opacity: 0.45 },
  { left: 58, size: 18, delay: 9.5, duration: 17, sway: 4, tint: 'gold', opacity: 0.52 },
  { left: 70, size: 15, delay: 5, duration: 20, sway: -5, tint: 'sage', opacity: 0.48 },
  { left: 83, size: 21, delay: 12, duration: 15, sway: 5, tint: 'rose', opacity: 0.5 },
  { left: 93, size: 14, delay: 2.5, duration: 22, sway: -3, tint: 'gold', opacity: 0.44 },
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
        <path :d="LEAF" />
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
}

.aura__leaf path {
  fill: currentColor;
  fill-opacity: 0.5;
  stroke: currentColor;
  stroke-width: 1.1;
  stroke-linejoin: round;
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

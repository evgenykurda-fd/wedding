<script setup lang="ts">
/**
 * Разделитель секций: две зеркальные веточки и ромб посередине.
 * Правая половина — та же группа, отражённая через translate+scale,
 * поэтому листья описаны один раз.
 */

/** Лист-капля, растущий вверх-вправо от точки крепления. */
const LEAF = 'M0 0C2-7 11-13 19-12 17-4 9 2 0 0Z'

/** Точки крепления листьев на стебле; up — вверх или вниз от стебля. */
const leaves = [
  { x: 46, up: true },
  { x: 60, up: false },
  { x: 74, up: true },
  { x: 88, up: false },
  { x: 102, up: true },
  { x: 116, up: false },
]
</script>

<template>
  <svg class="bd" viewBox="0 0 300 44" aria-hidden="true" focusable="false">
    <g
      v-for="side in ['left', 'right']"
      :key="side"
      :transform="side === 'right' ? 'translate(300 0) scale(-1 1)' : undefined"
    >
      <path class="bd__stem" d="M24 22H134" />
      <path
        v-for="leaf in leaves"
        :key="leaf.x"
        class="bd__leaf"
        :d="LEAF"
        :transform="`translate(${leaf.x} 22)${leaf.up ? '' : ' scale(1 -1)'}`"
      />
    </g>
    <path class="bd__gem" d="M150 13 157 22 150 31 143 22Z" />
  </svg>
</template>

<style scoped>
.bd {
  width: clamp(190px, 52vw, 300px);
  height: auto;
  margin-inline: auto;
  color: var(--sage);
}

.bd__stem {
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
  stroke-linecap: round;
  opacity: 0.5;
}

/* Листья к краям выцветают — веточка выглядит нарисованной от центра. */
.bd__leaf {
  fill: currentColor;
  fill-opacity: 0.16;
  stroke: currentColor;
  stroke-width: 0.9;
  stroke-linejoin: round;
  opacity: 0.75;
}

.bd__leaf:nth-child(2),
.bd__leaf:nth-child(3) {
  opacity: 0.4;
}

.bd__gem {
  fill: color-mix(in srgb, var(--gold) 30%, transparent);
  stroke: var(--gold-ink);
  stroke-width: 1.1;
  stroke-linejoin: round;
  /* Центр ромба в координатах viewBox. Именно так, а не transform-box:
     fill-box — его не понимают старые Safari, и ромб уезжал бы в угол. */
  transform-origin: 150px 22px;
  animation: gem-breath 5.5s ease-in-out infinite;
}

/* Ромб в центре чуть дышит — единственная движущаяся деталь разделителя. */
@keyframes gem-breath {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.16);
    opacity: 0.72;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bd__gem {
    animation: none;
  }
}
</style>

<script setup lang="ts">
import { useId } from 'vue'

/**
 * Два переплетённых обручальных кольца — знак приглашения.
 *
 * Объём собран без картинок: широкая полоса кольца залита градиентом
 * «золото → тень → блик», по её внутренней и внешней граням идут тонкие
 * светлая и тёмная линии. Металл мерцает: короткие блики на полосе то
 * разгораются, то гаснут, а рядом вспыхивают редкие искры.
 *
 * useId обязателен: компонент стоит на странице в нескольких местах, а
 * ссылки url(#…) должны попадать каждая в свой градиент.
 */
const uid = useId()
const goldId = `rings-gold-${uid}`

const R = 26
const CY = 40
const LEFT = 46
const RIGHT = 74

const rad = (deg: number) => (deg * Math.PI) / 180

/** Точка на окружности кольца по углу; 0° — правая сторона, −90° — верх. */
function point(cx: number, angle: number) {
  return `${(cx + R * Math.cos(rad(angle))).toFixed(2)} ${(CY + R * Math.sin(rad(angle))).toFixed(2)}`
}

/** Дуга по кольцу — из неё сделаны и блики, и место переплетения. */
function arc(cx: number, from: number, to: number) {
  return `M${point(cx, from)}A${R} ${R} 0 0 1 ${point(cx, to)}`
}

/**
 * Дуга левого кольца поверх правого в верхней точке пересечения. Ниже
 * правое кольцо остаётся сверху — так они и выглядят продетыми друг в друга.
 */
const linkArc = (() => {
  const half = (RIGHT - LEFT) / 2
  const crossY = CY - Math.sqrt(R * R - half * half)
  const center = (Math.atan2(crossY - CY, half) * 180) / Math.PI
  return arc(LEFT, center - 20, center + 20)
})()

/**
 * Мерцающие блики. Углы подобраны так, чтобы свет падал сверху-слева:
 * длинный блик на верхней дуге и короткий отсвет на нижней.
 */
const glints = [
  { d: arc(LEFT, -168, -128), delay: '0s' },
  { d: arc(LEFT, 34, 58), delay: '-2.6s' },
  { d: arc(RIGHT, -142, -104), delay: '-1.3s' },
  { d: arc(RIGHT, 58, 82), delay: '-3.4s' },
]

/** Четырёхлучевая искра в единичных координатах — масштабируется на месте. */
const SPARKLE =
  'M0-1C.14-.34.34-.14 1 0 .34.14.14.34 0 1-.14.34-.34.14-1 0-.34-.14-.14-.34 0-1Z'

const sparkles = [
  { transform: `translate(${LEFT - 20} ${CY - 21}) scale(4.6)`, delay: '0s' },
  { transform: `translate(${RIGHT + 21} ${CY - 15}) scale(3.4)`, delay: '-1.7s' },
  { transform: `translate(60 ${CY + 24}) scale(2.8)`, delay: '-3.2s' },
]
</script>

<template>
  <div class="rings">
    <span class="rings__glow" aria-hidden="true" />

    <div class="rings__breath" aria-hidden="true">
      <svg class="rings__svg" viewBox="0 0 120 80" focusable="false">
        <defs>
          <!-- Металл: свет сверху слева, тень в середине, второй блик снизу. -->
          <linearGradient :id="goldId" x1="0" y1="0" x2="0.85" y2="1">
            <stop class="rings__stop--light" offset="0" />
            <stop class="rings__stop--gold" offset="0.34" />
            <stop class="rings__stop--shade" offset="0.58" />
            <stop class="rings__stop--sheen" offset="0.78" />
            <stop class="rings__stop--deep" offset="1" />
          </linearGradient>
        </defs>

        <g class="rings__pair">
          <!-- Кольца: полоса и две грани, дающие объём. -->
          <template v-for="cx in [LEFT, RIGHT]" :key="cx">
            <circle class="rings__band" :cx="cx" :cy="CY" :r="R" :stroke="`url(#${goldId})`" />
            <circle class="rings__edge rings__edge--in" :cx="cx" :cy="CY" :r="R - 2.1" />
            <circle class="rings__edge rings__edge--out" :cx="cx" :cy="CY" :r="R + 2.1" />
          </template>

          <!-- Перехлёст: кусок левого кольца поверх правого. -->
          <path class="rings__band" :d="linkArc" :stroke="`url(#${goldId})`" />

          <!-- Мерцание металла. -->
          <path
            v-for="glint in glints"
            :key="glint.d"
            class="rings__glint"
            :d="glint.d"
            :style="{ animationDelay: glint.delay }"
          />

          <path
            v-for="sparkle in sparkles"
            :key="sparkle.transform"
            class="rings__sparkle"
            :d="SPARKLE"
            :transform="sparkle.transform"
            :style="{ animationDelay: sparkle.delay }"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.rings {
  position: relative;
  display: grid;
  place-items: center;
  width: clamp(126px, 34vw, 168px);
  aspect-ratio: 3 / 2;
}

/**
 * Тёплое свечение под кольцами. Затухание растянуто на несколько остановок:
 * с одной резкой границей в тёмной теме был виден чёткий круг вместо света.
 */
.rings__glow {
  position: absolute;
  inset: -12%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--gold) 22%, transparent) 0%,
    color-mix(in srgb, var(--gold) 12%, transparent) 34%,
    color-mix(in srgb, var(--gold) 4%, transparent) 58%,
    transparent 78%
  );
  animation: rings-glow 5.5s ease-in-out infinite;
}

.rings__breath {
  position: absolute;
  inset: 0;
  animation: rings-breath 6s ease-in-out infinite;
}

.rings__svg {
  width: 100%;
  height: 100%;
  /* Ореол вокруг металла: свет, который кольца отбрасывают на бумагу. */
  filter: drop-shadow(0 1px 1px color-mix(in srgb, var(--ink) 30%, transparent))
    drop-shadow(0 0 7px color-mix(in srgb, var(--gold) 55%, transparent));
  animation: rings-sway 9s ease-in-out infinite alternate;
}

/* Цвета металла заданы явными hex: золото не должно менять оттенок
   вместе с тёмной темой страницы — оно золото и там, и там. */
.rings__stop--light {
  stop-color: #f9ecc8;
}

.rings__stop--gold {
  stop-color: #dcb771;
}

.rings__stop--shade {
  stop-color: #9a7331;
}

.rings__stop--sheen {
  stop-color: #f4dfa8;
}

.rings__stop--deep {
  stop-color: #a9813d;
}

.rings__band {
  fill: none;
  stroke-width: 5.4;
}

/* Тонкие грани полосы: изнутри светлая, снаружи тёмная — это и даёт объём. */
.rings__edge {
  fill: none;
  stroke-width: 0.9;
}

.rings__edge--in {
  stroke: rgba(255, 248, 226, 0.55);
}

.rings__edge--out {
  stroke: rgba(94, 68, 24, 0.45);
}

/* Блик на полосе: разгорается и гаснет на месте, никуда не едет. */
.rings__glint {
  fill: none;
  stroke: #fffaf0;
  stroke-width: 3.2;
  stroke-linecap: round;
  opacity: 0.12;
  animation: rings-glint 4.2s ease-in-out infinite;
}

/* Искра рядом с металлом — короткая вспышка. */
.rings__sparkle {
  fill: #fff6df;
  opacity: 0;
  animation: rings-sparkle 4.8s ease-in-out infinite;
}

@keyframes rings-glint {
  0%,
  100% {
    opacity: 0.1;
  }
  45% {
    opacity: 0.85;
  }
  70% {
    opacity: 0.25;
  }
}

/**
 * Только прозрачность. Масштаб тут задавать нельзя: CSS-трансформация
 * перебила бы атрибут transform, которым искра поставлена на место, и та
 * улетела бы в угол.
 */
@keyframes rings-sparkle {
  0%,
  72%,
  100% {
    opacity: 0;
  }
  82% {
    opacity: 0.95;
  }
  92% {
    opacity: 0.15;
  }
}

@keyframes rings-breath {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.035);
  }
}

@keyframes rings-sway {
  from {
    transform: rotate(-2.5deg);
  }
  to {
    transform: rotate(2.5deg);
  }
}

@keyframes rings-glow {
  0%,
  100% {
    opacity: 0.75;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rings__glow,
  .rings__breath,
  .rings__svg,
  .rings__glint,
  .rings__sparkle {
    animation: none;
  }

  .rings__sparkle {
    opacity: 0.6;
  }
}
</style>

<script setup lang="ts">
import { WEDDING, countdownUnits } from '~/utils/wedding'

/**
 * Обратный отсчёт до церемонии — четыре карточки.
 *
 * Значения считаются на момент СБОРКИ, чтобы страница никогда не показывала
 * прочерки; дальше их раз в секунду перезаписывает invite.js по data-атрибутам.
 */
const units = countdownUnits()
const days = units[0]!
const srText = `До свадьбы осталось ${days.value} ${days.label}.`
</script>

<template>
  <div class="cd">
    <!-- Цифры прячем от скринридеров: тикающий счётчик их только засоряет. -->
    <ol class="cd__grid" aria-hidden="true">
      <li
        v-for="(unit, index) in units"
        :key="unit.key"
        class="cd__cell card"
        data-reveal="zoom"
        :style="{ '--reveal-delay': `${index * 90}ms` }"
      >
        <span class="cd__value" :data-cd="unit.key">{{ unit.value }}</span>
        <span class="cd__label" :data-cd-label="unit.key">{{ unit.label }}</span>
      </li>
    </ol>

    <p class="sr-only" data-cd-sr>{{ srText }}</p>

    <p class="cd__note" data-reveal>
      Церемония — {{ WEDDING.date.human }} в {{ WEDDING.venues.ceremony.time }} по минскому времени.
    </p>
  </div>
</template>

<style scoped>
.cd__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(0.4rem, 2vw, 0.75rem);
  margin: 0;
  padding: 0;
  list-style: none;
}

.cd__cell {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.15rem;
  padding: clamp(0.85rem, 3.2vw, 1.25rem) 0.25rem clamp(0.7rem, 3vw, 1.1rem);
  overflow: hidden;
}

/* Цветная кромка сверху: у каждой ячейки свой оттенок. */
.cd__cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: 18%;
  right: 18%;
  height: 2px;
  border-radius: 0 0 2px 2px;
  background: var(--cell-tint, var(--sage));
}

.cd__cell:nth-child(2)::before {
  --cell-tint: var(--gold);
}

.cd__cell:nth-child(3)::before {
  --cell-tint: var(--accent);
}

.cd__cell:nth-child(4)::before {
  --cell-tint: var(--rose);
}

.cd__value {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 0.9rem + 4vw, 2.4rem);
  line-height: 1.1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

/* Класс ставит invite.js — только когда цифра действительно сменилась. */
.cd__value.is-tick {
  animation: tick 0.45s ease;
}

.cd__label {
  font-size: clamp(0.62rem, 0.5rem + 0.8vw, 0.75rem);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
  text-align: center;
}

.cd__note {
  margin-top: 1.1rem;
  text-align: center;
  font-size: 0.92rem;
  color: var(--ink-soft);
}
</style>

<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'

/**
 * Суперигра вечера. Вынесена из программы дня отдельным блоком: в списке
 * пунктов её пролистывали бы вместе со всем остальным, а тут не пропустишь.
 */
const facts = [
  { value: WEDDING.superGame.entry, label: WEDDING.superGame.entryNote },
  { value: WEDDING.superGame.prize, label: WEDDING.superGame.prizeNote },
]
</script>

<template>
  <div class="game card" data-reveal="zoom">
    <!-- Коробка с бантом: в суперигре разыгрывается приз, а не «звёздность». -->
    <span class="game__gift" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path
          d="M4.5 10h15v10h-15zM3.5 6h17v4h-17zM12 6v14M12 6C10.3 6 8.6 5.4 8.6 4.2c0-.9.8-1.2 1.4-.9C11 3.8 11.7 4.9 12 6zM12 6c1.7 0 3.4-.6 3.4-1.8 0-.9-.8-1.2-1.4-.9C13 3.8 12.3 4.9 12 6z"
        />
      </svg>
    </span>

    <p class="game__lead">{{ WEDDING.superGame.text }}</p>

    <dl class="game__facts">
      <div v-for="fact in facts" :key="fact.label" class="game__fact">
        <dt class="game__value display">{{ fact.value }}</dt>
        <dd class="game__label">{{ fact.label }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.game {
  display: grid;
  justify-items: center;
  gap: 1.1rem;
  max-width: 34rem;
  margin-inline: auto;
  padding: clamp(1.5rem, 5.5vw, 2.1rem) clamp(1.25rem, 5vw, 1.75rem);
  text-align: center;
  /* Своя, «золотая» заливка и рамка: блок должен выделяться среди карточек. */
  background: linear-gradient(
      150deg,
      color-mix(in srgb, var(--gold) 14%, var(--card)),
      color-mix(in srgb, var(--accent) 10%, var(--card))
    )
    padding-box,
    linear-gradient(140deg, var(--gold), var(--accent) 58%, var(--rose)) border-box;
}

.game__gift {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--gold) 22%, transparent);
}

.game__gift svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: var(--gold-ink);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  /* Единственное движение в блоке: коробку будто слегка потряхивают. */
  animation: gift-shake 4.2s ease-in-out infinite;
}

.game__lead {
  max-width: 27rem;
  color: var(--ink-soft);
}

.game__facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.75rem, 3vw, 1.25rem);
  width: 100%;
  margin: 0;
  padding-top: 1.1rem;
  border-top: 1px solid color-mix(in srgb, var(--gold) 35%, transparent);
}

.game__fact {
  display: grid;
  gap: 0.2rem;
}

.game__value {
  font-size: clamp(1.25rem, 1rem + 1.8vw, 1.7rem);
  color: var(--accent-ink);
}

.game__label {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

/* Короткое покачивание и пауза — как будто коробку встряхнули и поставили. */
@keyframes gift-shake {
  0%,
  62%,
  100% {
    transform: rotate(0deg);
  }
  68% {
    transform: rotate(-7deg);
  }
  76% {
    transform: rotate(6deg);
  }
  84% {
    transform: rotate(-4deg);
  }
  92% {
    transform: rotate(2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game__gift svg {
    animation: none;
  }
}
</style>

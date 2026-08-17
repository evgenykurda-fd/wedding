<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'

/** Время вынесено отдельно от текста: в вёрстке оно набрано антиквой. */
const rows = [
  { label: 'Туда', time: WEDDING.transfer.time, value: WEDDING.transfer.from },
  {
    label: 'В пути',
    time: WEDDING.transfer.duration,
    value: `${WEDDING.transfer.distance} до усадьбы`,
  },
  { label: 'Обратно', time: WEDDING.transfer.backTime, value: WEDDING.transfer.backTo },
]
</script>

<template>
  <div class="transfer card" data-reveal>
    <div class="transfer__head">
      <svg class="transfer__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3.5" y="4" width="17" height="12.5" rx="2.5" />
          <path d="M3.5 10.5h17M8.5 4v6.5M15.5 4v6.5" />
          <circle cx="7.5" cy="19" r="1.5" />
          <circle cx="16.5" cy="19" r="1.5" />
        </g>
      </svg>
      <h3 class="transfer__title display">Автобус для гостей</h3>
    </div>

    <dl class="transfer__rows">
      <div v-for="row in rows" :key="row.label" class="transfer__row">
        <dt>{{ row.label }}</dt>
        <dd>
          <b class="transfer__time">{{ row.time }}</b>
          <span>{{ row.value }}</span>
        </dd>
      </div>
    </dl>

    <p class="transfer__note">{{ WEDDING.transfer.note }}</p>
  </div>
</template>

<style scoped>
.transfer {
  padding: clamp(1.25rem, 5vw, 1.75rem);
}

.transfer__head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.transfer__icon {
  flex: none;
  box-sizing: content-box;
  width: 22px;
  height: 22px;
  padding: 7px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--sage) 15%, transparent);
  color: var(--sage-ink);
}

.transfer__title {
  font-size: clamp(1.15rem, 1rem + 1vw, 1.35rem);
  font-weight: 400;
}

.transfer__rows {
  margin: 1.1rem 0 0;
  display: grid;
  gap: 0.55rem;
}

.transfer__row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid var(--line);
}

.transfer__row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.transfer__row dt {
  flex: none;
  min-width: 8.5rem;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sage-ink);
}

.transfer__row dd {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.15rem 0.5rem;
  margin: 0;
  font-size: 0.95rem;
}

.transfer__time {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--accent-ink);
}

.transfer__note {
  margin-top: 1.1rem;
  font-size: 0.92rem;
  color: var(--ink-soft);
}
</style>

<script setup lang="ts">
import { googleMapUrl, yandexMapUrl, type Venue } from '~/utils/wedding'

/** Одна карточка на обе локации — отличаются только данными. */
const props = defineProps<{ venue: Venue }>()
</script>

<template>
  <article class="venue card" data-reveal>
    <header class="venue__head">
      <p class="eyebrow">{{ props.venue.kind }}</p>
      <p class="venue__time">{{ props.venue.time }}</p>
    </header>

    <h3 class="venue__name display">{{ props.venue.name }}</h3>
    <p class="venue__subtitle">{{ props.venue.subtitle }}</p>

    <p class="venue__about">{{ props.venue.about }}</p>

    <p class="venue__address">
      <svg class="venue__pin" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 21s6.5-6.1 6.5-11a6.5 6.5 0 1 0-13 0c0 4.9 6.5 11 6.5 11z" />
          <circle cx="12" cy="10" r="2.4" />
        </g>
      </svg>
      <span>{{ props.venue.address }}</span>
    </p>

    <div class="btn-row venue__actions">
      <a
        class="btn"
        :href="props.venue.mapUrl ?? yandexMapUrl(props.venue.mapQuery)"
        target="_blank"
        rel="noopener noreferrer"
      >
        Яндекс.Карты
      </a>
      <a class="btn" :href="googleMapUrl(props.venue.mapQuery)" target="_blank" rel="noopener noreferrer">
        Google Maps
      </a>
      <a class="btn" :href="props.venue.site" target="_blank" rel="noopener noreferrer">
        {{ props.venue.siteLabel }}
      </a>
    </div>
  </article>
</template>

<style scoped>
.venue {
  position: relative;
  padding: clamp(1.25rem, 5vw, 1.75rem);
  overflow: hidden;
}

/* Цветная полоса по левому краю карточки. */
.venue::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: linear-gradient(to bottom, var(--sage), var(--accent) 55%, var(--rose));
}

.venue__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.venue__time {
  padding: 0.05rem 0.6rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--gold) 16%, transparent);
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 1.1rem + 1.2vw, 1.6rem);
  color: var(--accent-ink);
  letter-spacing: 0.02em;
}

.venue__name {
  margin-top: 0.5rem;
  font-size: clamp(1.3rem, 1.1rem + 1.4vw, 1.6rem);
}

.venue__subtitle {
  margin-top: 0.15rem;
  font-size: 0.88rem;
  letter-spacing: 0.04em;
  color: var(--sage-ink);
}

.venue__about {
  margin-top: 0.9rem;
  font-size: 0.95rem;
  color: var(--ink-soft);
}

.venue__address {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--line);
  font-size: 0.92rem;
}

.venue__pin {
  flex: none;
  width: 18px;
  height: 18px;
  margin-top: 0.18rem;
  color: var(--sage);
}

.venue__actions {
  margin-top: 1.1rem;
}
</style>

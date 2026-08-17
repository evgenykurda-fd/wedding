<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'
</script>

<template>
  <div class="dress">
    <p class="dress__title display grad-text" data-reveal>{{ WEDDING.dressCode.title }}</p>
    <BotanicalDivider class="dress__divider" data-reveal="zoom" />
    <p class="dress__text" data-reveal>{{ WEDDING.dressCode.text }}</p>
  </div>
</template>

<style scoped>
.dress {
  display: grid;
  justify-items: center;
  gap: 0.9rem;
  max-width: 32rem;
  margin-inline: auto;
  text-align: center;
}

.dress__title {
  padding-inline: 0.06em;
  font-size: clamp(1.6rem, 1.2rem + 2.4vw, 2.1rem);
  letter-spacing: 0.01em;
}

.dress__divider {
  width: clamp(150px, 40vw, 220px);
}

.dress__text {
  color: var(--ink-soft);
}
</style>

<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'
</script>

<template>
  <div class="letter">
    <p class="letter__lead lead grad-text" data-reveal>
      Дорогие друзья и родные!
    </p>
    <p data-reveal style="--reveal-delay: 90ms">
      {{ WEDDING.date.human }} мы решили сказать друг другу «да» - и очень хотим,
      чтобы вы были рядом в этот день. Нам будет важен каждый, кто приедет:
      ваши улыбки, объятия и поздравления и есть тот самый праздник.
    </p>
    <!--
      Оба времени берём из данных: сбор — из общей константы, роспись — из
      карточки локации. Просьба назвать именно час, а не «приезжайте заранее»:
      иначе гость отсчитает «заранее» от времени сбора и приедет ещё раньше.
    -->
    <p data-reveal style="--reveal-delay: 180ms">
      Просим об одном: приезжайте к {{ WEDDING.gatherTime }} - церемония начнётся
      ровно в {{ WEDDING.venues.ceremony.time }}, и нам не хочется, чтобы кто-то её
      пропустил.
    </p>
    <p data-reveal style="--reveal-delay: 270ms">
      Ниже - всё, что нужно знать про день: во сколько собираемся, где роспись,
      как добраться до усадьбы и что надеть. Если что-то останется непонятным -
      просто напишите нам.
    </p>
    <p class="letter__sign" data-reveal style="--reveal-delay: 360ms">
      С любовью,<br />
      <span>{{ WEDDING.groom }} и {{ WEDDING.bride }}</span>
    </p>
  </div>
</template>

<style scoped>
.letter {
  display: grid;
  gap: 1.15rem;
  text-align: center;
  max-width: 34rem;
  margin-inline: auto;
}

.letter__lead {
  padding-inline: 0.06em;
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 1rem + 1.2vw, 1.5rem);
  color: var(--ink);
}

.letter__sign {
  margin-top: 0.5rem;
  color: var(--ink-soft);
  font-size: 0.95rem;
}

.letter__sign span {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.25rem;
  color: var(--accent-ink);
}
</style>

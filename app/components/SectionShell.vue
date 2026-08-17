<script setup lang="ts">
/** Общая обёртка секции: фон, отступы, заголовок и появление при скролле. */
withDefaults(
  defineProps<{
    id?: string
    eyebrow?: string
    title?: string
    /** soft — секция на слегка отличном фоне, чтобы страница дышала */
    tone?: 'plain' | 'soft'
    /** Разделитель-веточка над заголовком */
    divider?: boolean
  }>(),
  { tone: 'plain', divider: false },
)
</script>

<template>
  <section :id="id" class="sec" :class="{ 'sec--soft': tone === 'soft' }">
    <div class="wrap">
      <div v-if="divider" class="sec__divider" data-reveal="zoom">
        <BotanicalDivider />
      </div>
      <header v-if="eyebrow || title" class="sec__head" data-reveal>
        <p v-if="eyebrow" class="eyebrow sec__eyebrow">{{ eyebrow }}</p>
        <h2 v-if="title" class="display sec__title grad-text">{{ title }}</h2>
      </header>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.sec {
  position: relative;
  padding-block: clamp(3rem, 9vw, 5rem);
  /* Переход по ссылке «#rsvp» не должен упирать заголовок под липкую шапку. */
  scroll-margin-top: 60px;
}

/* Тонированная секция: тёплый градиент вместо плоского фона плюс
   золотая волосяная линия по верхней кромке. */
.sec--soft {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--rose) 7%, var(--bg-soft)),
    color-mix(in srgb, var(--sage) 8%, var(--bg-soft))
  );
}

.sec--soft::before,
.sec--soft::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--grad-line);
}

.sec--soft::before {
  top: 0;
}

.sec--soft::after {
  bottom: 0;
}

.sec__divider {
  margin-bottom: clamp(1.75rem, 6vw, 2.5rem);
}

.sec__head {
  text-align: center;
  margin-bottom: clamp(1.75rem, 6vw, 2.5rem);
}

/* Надзаголовок в тонких засечках-скобках. */
.sec__eyebrow::before,
.sec__eyebrow::after {
  content: '';
  display: inline-block;
  width: clamp(14px, 5vw, 26px);
  height: 1px;
  margin-bottom: 0.28em;
  background: color-mix(in srgb, var(--gold) 75%, transparent);
  vertical-align: middle;
}

.sec__eyebrow::before {
  margin-right: 0.7em;
}

.sec__eyebrow::after {
  margin-left: 0.7em;
}

.sec__title {
  margin-top: 0.5rem;
  font-size: clamp(1.55rem, 1.2rem + 2.4vw, 2.15rem);
  /* Запас справа: у курсивных градиентных заголовков иначе срезается хвост. */
  padding-inline: 0.06em;
}
</style>

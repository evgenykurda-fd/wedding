<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'
</script>

<template>
  <div>
    <!-- Заставка-открытка. Первой в разметке: она накрывает всю страницу. -->
    <EnvelopeIntro />

    <!-- Слой для лепестков-искр; их создаёт invite.js. -->
    <div class="sparks" data-sparks aria-hidden="true" />

    <StickyBar />
    <TheHero />

    <main>
      <SectionShell id="invite">
        <InviteLetter />
      </SectionShell>

      <SectionShell tone="soft" divider eyebrow="Обратный отсчёт" title="До встречи осталось">
        <CountdownBlock />
      </SectionShell>

      <!--
        Порядок секций — по тому, в каком гость задаёт вопросы:
        куда ехать → во сколько что → как добраться → что надеть →
        чем займёмся → о чём просим → и наконец ответ.
      -->
      <SectionShell eyebrow="Локации" title="Где всё будет">
        <div class="venues">
          <VenueCard :venue="WEDDING.venues.ceremony" />
          <VenueCard :venue="WEDDING.venues.party" />
        </div>
      </SectionShell>

      <SectionShell tone="soft" divider eyebrow="Расписание" title="Программа дня">
        <DayTimeline />
      </SectionShell>

      <SectionShell eyebrow="Трансфер" title="Как доберёмся">
        <TransferBlock />
      </SectionShell>

      <SectionShell tone="soft" divider eyebrow="Дресс-код">
        <DressCode />
      </SectionShell>

      <SectionShell eyebrow="Развлечения" title="Суперигра">
        <SuperGame />
      </SectionShell>

      <SectionShell tone="soft" divider eyebrow="Пожелания" title="Небольшая просьба">
        <WishBlock />
      </SectionShell>

      <SectionShell id="rsvp" eyebrow="Ответ" title="Будете с нами?">
        <RsvpBlock />
      </SectionShell>
    </main>

    <footer class="foot">
      <div class="wrap foot__inner">
        <WeddingRings data-reveal="zoom" />
        <p class="foot__names display grad-text" data-reveal>
          {{ WEDDING.groom }} и {{ WEDDING.bride }}
        </p>
        <p class="foot__date" data-reveal>{{ WEDDING.date.human }}</p>
        <BotanicalDivider class="foot__divider" data-reveal />
        <p class="foot__wait" data-reveal>Ждём вас!</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.venues {
  display: grid;
  gap: clamp(0.85rem, 3.5vw, 1.15rem);
}

.foot {
  position: relative;
  padding-block: clamp(3rem, 9vw, 4.5rem);
  text-align: center;
  /* Подвал уводим в тёплый градиент — страница заканчивается закатом. */
  background: linear-gradient(
    180deg,
    var(--bg),
    color-mix(in srgb, var(--rose) 9%, var(--bg)) 55%,
    color-mix(in srgb, var(--gold) 11%, var(--bg))
  );
}

/* Золотая волосяная линия вместо простой рамки. */
.foot::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--grad-line);
}

.foot__inner {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
}

.foot__names {
  margin-top: 0.4rem;
  padding-inline: 0.06em;
  font-size: clamp(1.5rem, 1.2rem + 2vw, 2rem);
}

.foot__date {
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.foot__divider {
  width: clamp(150px, 40vw, 220px);
  margin-top: 0.5rem;
}

.foot__wait {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.15rem;
  color: var(--sage-ink);
}
</style>

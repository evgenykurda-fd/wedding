<script setup lang="ts">
import { WEDDING, rsvpMessage, pluralRu, GUEST_PLURAL, MAX_GUESTS } from '~/utils/wedding'

/**
 * Ответ гостя без бэкенда.
 *
 * Страница ничего никуда не отправляет сама: она собирает текст, кладёт его
 * в буфер обмена и открывает чат в Telegram — отправляет уже гость. Имя из
 * поля не уходит ни в URL сайта, ни на сторонние сервисы.
 *
 * Текст ниже — состояние по умолчанию («Буду», без имени). Инлайн-скрипт
 * пересобирает его при вводе имени и переключении ответа.
 */
const defaultMessage = rsvpMessage('', 'yes')
const { contacts } = WEDDING

/**
 * Подсказка зависит от того, настроена ли прямая отправка. Проверяем на
 * сборке, а не в браузере: текст должен быть правдой уже в готовом файле.
 */
const direct = Boolean(WEDDING.rsvpBot.token && WEDDING.rsvpBot.chatId)

/** Пункты опроса с уточнениями: под каждым свой ряд вариантов. */
const drinksWithKinds = WEDDING.drinks.options.filter((option) => option.kinds)

/** «1 гость», «2 гостя», «5 гостей» — список числом и словом сразу понятнее. */
const guestOptions = Array.from({ length: MAX_GUESTS }, (_, index) => {
  const value = index + 1
  return { value, label: `${value} ${pluralRu(value, GUEST_PLURAL)}` }
})
</script>

<template>
  <div class="rsvp">
    <p class="rsvp__deadline" data-reveal>
      Пожалуйста, дайте знать до <strong>{{ WEDDING.rsvpDeadline }}</strong> - нам нужно назвать
      усадьбе точное число гостей.
    </p>

    <div class="rsvp__form card" data-reveal>
      <div class="rsvp__field">
        <label class="rsvp__label" for="rsvp-name">Как вас записать?</label>
        <input
          id="rsvp-name"
          data-rsvp-name
          class="rsvp__input"
          type="text"
          autocomplete="name"
          placeholder="Имя и фамилия"
        />
      </div>

      <div class="rsvp__field">
        <p class="rsvp__label" id="rsvp-answer-label">Ваш ответ</p>
        <div class="rsvp__answers" role="group" aria-labelledby="rsvp-answer-label">
          <button type="button" class="btn rsvp__answer" data-rsvp-answer="yes" aria-pressed="true">
            Буду
          </button>
          <button type="button" class="btn rsvp__answer" data-rsvp-answer="no" aria-pressed="false">
            Не смогу
          </button>
        </div>
      </div>

      <!-- Число гостей. Поле прячется, если выбрано «не смогу», — этим
           занимается invite.js. -->
      <div class="rsvp__field" data-rsvp-guests-field>
        <label class="rsvp__label" for="rsvp-guests">Сколько вас будет?</label>
        <select id="rsvp-guests" data-rsvp-guests class="rsvp__select">
          <option v-for="option in guestOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p class="rsvp__note">Считайте себя и всех, кто приедет с вами, - вместе с детьми.</p>
      </div>

      <!-- Опрос про напитки. Прячется вместе с числом гостей, если гость
           выбрал «не смогу». -->
      <div class="rsvp__field" data-rsvp-drinks-field>
        <p class="rsvp__label" id="rsvp-drinks-label">{{ WEDDING.drinks.title }}</p>
        <div class="rsvp__pills" role="group" aria-labelledby="rsvp-drinks-label">
          <button
            v-for="option in WEDDING.drinks.options"
            :key="option.id"
            type="button"
            class="btn rsvp__pill"
            :data-rsvp-drink="option.id"
            aria-pressed="false"
          >
            {{ option.label }}
          </button>
        </div>
        <p class="rsvp__note">{{ WEDDING.drinks.note }}</p>

        <!-- Уточнения. Каждое показывается, только если отмечен его пункт. -->
        <div
          v-for="option in drinksWithKinds"
          :key="option.id"
          class="rsvp__kinds is-off"
          :data-rsvp-sub="option.id"
        >
          <p class="rsvp__label" :id="`rsvp-kinds-${option.id}`">{{ option.kinds!.title }}</p>
          <div class="rsvp__pills" role="group" :aria-labelledby="`rsvp-kinds-${option.id}`">
            <button
              v-for="item in option.kinds!.items"
              :key="item"
              type="button"
              class="btn rsvp__pill"
              :data-rsvp-sub-option="option.id"
              aria-pressed="false"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </div>

      <div class="rsvp__field">
        <label class="rsvp__label" for="rsvp-note">Пожелания по блюдам</label>
        <textarea
          id="rsvp-note"
          data-rsvp-note
          class="rsvp__input rsvp__textarea"
          rows="2"
          placeholder="Аллергия, вегетарианство, детское меню - напишите здесь"
        />
      </div>

      <div class="rsvp__field">
        <p class="rsvp__label">Текст ответа</p>
        <p class="rsvp__preview" data-rsvp-preview>{{ defaultMessage }}</p>
      </div>

      <!-- Одна кнопка: копирует текст и открывает чат. Отправляет уже гость —
           страница сама ничего никуда не шлёт. -->
      <a
        class="btn btn--solid rsvp__send"
        data-rsvp-send="telegram"
        :href="contacts.telegram"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M21.3 4.3 2.9 11.4c-.9.3-.9 1.5.1 1.7l4.3 1.3 1.6 4.9c.3.8 1.3 1 1.9.4l2.3-2.2 4.3 3.2c.7.5 1.6.1 1.8-.7l3-14.4c.2-.9-.7-1.6-1.5-1.3z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path d="M7.3 14.4 18 7.2l-7.6 8.3-.3 3.3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
        </svg>
        Отправить ответ в Telegram
      </a>

      <button type="button" class="btn rsvp__copy" data-rsvp-copy>Скопировать текст</button>

      <p class="rsvp__done" data-rsvp-done>Ответ отправлен. Спасибо!</p>

      <!-- Ник вынесен из строки в ссылку: по нему можно сразу открыть чат. -->
      <p class="rsvp__hint">
        <template v-if="direct">
          Нажмите - и ответ придёт нам в Telegram, никуда переходить не нужно. Если что-то
          не сработает, текст скопируется, и его можно отправить вручную в
        </template>
        <template v-else>
          Текст ответа копируется сам - останется вставить его и отправить в
        </template>
        <a
          class="rsvp__nick"
          :href="contacts.telegram"
          target="_blank"
          rel="noopener noreferrer"
        >{{ contacts.telegramHuman }}</a>.
      </p>

      <div class="rsvp__phones">
        <p class="rsvp__phones-label">Если удобнее голосом:</p>
        <a
          v-for="phone in contacts.phones"
          :key="phone.tel"
          class="rsvp__phone"
          :href="`tel:${phone.tel}`"
        >
          <span class="rsvp__phone-name">{{ phone.name }}</span>
          <span class="rsvp__phone-number">{{ phone.human }}</span>
        </a>
      </div>
    </div>

    <p class="rsvp__toast" data-toast role="status" aria-live="polite" />
  </div>
</template>

<style scoped>
.rsvp {
  max-width: 34rem;
  margin-inline: auto;
}

.rsvp__deadline {
  text-align: center;
  color: var(--ink-soft);
  margin-bottom: clamp(1.25rem, 4vw, 1.75rem);
}

.rsvp__deadline strong {
  color: var(--accent-ink);
  font-weight: 600;
  white-space: nowrap;
}

.rsvp__form {
  position: relative;
  display: grid;
  gap: 1.15rem;
  padding: clamp(1.25rem, 5vw, 1.75rem);
  overflow: hidden;
}

/* Цветная кромка сверху — та же, что у разделителей секций. */
.rsvp__form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--sage), var(--gold) 50%, var(--rose));
}

.rsvp__field {
  display: grid;
  gap: 0.45rem;
}

/* Класс ставит invite.js, когда выбран ответ «не смогу». */
.rsvp__field.is-off {
  display: none;
}

.rsvp__label {
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--sage-ink);
}

.rsvp__input {
  width: 100%;
  min-height: 46px;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  background: var(--bg);
  font-size: 1rem;
}

.rsvp__input::placeholder {
  color: var(--ink-soft);
  opacity: 0.75;
}

/**
 * Список оставлен системным: свою стрелку пришлось бы рисовать картинкой с
 * фиксированным цветом, а системная сама подстраивается под тему устройства.
 */
.rsvp__select {
  width: 100%;
  min-height: 46px;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  background: var(--bg);
  font-size: 1rem;
}

.rsvp__note {
  font-size: 0.78rem;
  color: var(--ink-soft);
}

.rsvp__textarea {
  min-height: 68px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

/**
 * «Таблетки» опроса на сетке, а не на флексе: при переносе флекс растягивал
 * последний вариант на всю строку, и ряд выглядел кривым. Колонки сами
 * подстраиваются под ширину — две на телефоне, больше на широком экране.
 */
.rsvp__pills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  gap: 0.45rem;
}

.rsvp__pill {
  min-height: 42px;
  padding-inline: 0.75rem;
  font-size: 0.88rem;
}

/* Выбранное состояние берём из aria-pressed — как у ответа «буду». */
.rsvp__pill[aria-pressed='true'] {
  background: linear-gradient(
      color-mix(in srgb, var(--sage) 15%, var(--card)),
      color-mix(in srgb, var(--gold) 12%, var(--card))
    )
    padding-box,
    linear-gradient(135deg, var(--sage), var(--gold)) border-box;
  color: var(--sage-ink);
  font-weight: 600;
}

/* Уточнение к пункту опроса: появляется, когда пункт отмечен. Класс снимает invite.js. */
.rsvp__kinds {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.35rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--line);
}

.rsvp__kinds.is-off {
  display: none;
}

.rsvp__answers {
  display: flex;
  gap: 0.5rem;
}

.rsvp__answer {
  flex: 1;
}

/* Выбранный ответ подсвечиваем — состояние берём из aria-pressed,
   чтобы визуальное и доступное состояние не могли разойтись. */
.rsvp__answer[aria-pressed='true'] {
  background: linear-gradient(
      color-mix(in srgb, var(--sage) 15%, var(--card)),
      color-mix(in srgb, var(--gold) 12%, var(--card))
    )
    padding-box,
    linear-gradient(135deg, var(--sage), var(--gold)) border-box;
  color: var(--sage-ink);
  font-weight: 600;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--sage) 20%, transparent);
}

.rsvp__preview {
  padding: 0.75rem 0.9rem;
  border: 1px dashed color-mix(in srgb, var(--gold) 55%, var(--line-strong));
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--gold) 5%, var(--bg)),
    color-mix(in srgb, var(--rose) 6%, var(--bg))
  );
  font-size: 0.95rem;
  color: var(--ink);
  min-height: 3.2rem;
}

/* Единственное действие в форме — поэтому во всю ширину и крупнее обычных кнопок. */
.rsvp__send {
  width: 100%;
  min-height: 56px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.rsvp__send .btn__icon {
  width: 21px;
  height: 21px;
}

/* Запасной путь — спокойная кнопка под основной. */
.rsvp__copy {
  width: 100%;
  min-height: 44px;
  margin-top: -0.5rem;
  font-size: 0.86rem;
}

/* Появляется, когда ответ действительно ушёл: класс ставит invite.js. */
.rsvp__done {
  display: none;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--sage) 14%, transparent);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--sage-ink);
  text-align: center;
}

.rsvp__done.is-on {
  display: block;
}

.rsvp__hint {
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.rsvp__nick {
  font-weight: 600;
  color: var(--accent-ink);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--accent) 55%, transparent);
  text-underline-offset: 3px;
  white-space: nowrap;
}

/**
 * Телефоны колонкой: каждый — отдельная строка-ссылка.
 * Отрицательный отступ сверху съедает общий зазор сетки формы: подсказка и
 * телефоны — это один смысловой кусок, и разрывать их на всю высоту не нужно.
 */
.rsvp__phones {
  display: grid;
  gap: 0.05rem;
  margin-top: -0.85rem;
}

.rsvp__phones-label {
  margin-bottom: 0.1rem;
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.rsvp__phone {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  padding-block: 0.12rem;
  font-size: 0.88rem;
  text-decoration: none;
}

/* Одинаковая ширина имени выравнивает номера в столбик. */
.rsvp__phone-name {
  flex: none;
  min-width: 4.2rem;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sage-ink);
}

.rsvp__phone-number {
  font-variant-numeric: tabular-nums;
  color: var(--accent-ink);
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
}

.rsvp__toast {
  margin-top: 0.9rem;
  min-height: 1.4rem;
  text-align: center;
  font-size: 0.86rem;
  color: var(--sage-ink);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.rsvp__toast.is-on {
  opacity: 1;
  transform: none;
}
</style>

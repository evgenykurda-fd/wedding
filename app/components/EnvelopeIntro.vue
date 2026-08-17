<script setup lang="ts">
import { WEDDING } from '~/utils/wedding'

/**
 * Конверт-заставка на весь экран.
 *
 * Гость видит запечатанный конверт: треугольный клапан сверху, сургучная
 * печать в его вершине и мягко моргающее кольцо вокруг печати — это и есть
 * приглашение нажать. По нажатию печать отлетает, клапан откидывается
 * назад, и из конверта проявляется письмо с кнопкой входа.
 *
 * Как это устроено:
 *   - оверлей есть в разметке всегда, но CSS показывает его ТОЛЬКО под
 *     html.has-js: при заблокированном JS открыть конверт было бы нечем;
 *   - геометрия держится на одной переменной --flap: это и высота клапана,
 *     и вершина, в которой сходятся боковые швы, и координата печати —
 *     поэтому конверт остаётся собранным на любом соотношении сторон;
 *   - смену состояний (is-cracking → is-opened → is-leaving) делает
 *     invite.js, здесь только разметка и переходы.
 */

const CX = 50
const WAX_POINTS = 15

/**
 * Путь сургучной кляксы: круг радиуса r, у которого точки поочерёдно чуть
 * внутрь и чуть наружу, сглаженный квадратичными кривыми через середины
 * сегментов. Так печать выглядит оплавленной, а не циркульной.
 */
function waxBlob(r: number, wobble: number): string {
  const pts = Array.from({ length: WAX_POINTS }, (_, i) => {
    const angle = (i / WAX_POINTS) * Math.PI * 2
    const radius = r + (i % 2 ? wobble : -wobble)
    return [CX + radius * Math.cos(angle), CX + radius * Math.sin(angle)] as const
  })

  const mid = (a: readonly number[], b: readonly number[]) =>
    [(a[0]! + b[0]!) / 2, (a[1]! + b[1]!) / 2] as const
  const fx = (p: readonly number[]) => `${p[0]!.toFixed(2)} ${p[1]!.toFixed(2)}`

  let d = `M${fx(mid(pts[WAX_POINTS - 1]!, pts[0]!))}`
  for (let i = 0; i < WAX_POINTS; i++) {
    const next = pts[(i + 1) % WAX_POINTS]!
    d += `Q${fx(pts[i]!)} ${fx(mid(pts[i]!, next))}`
  }
  return `${d}Z`
}

const wax = waxBlob(41, 2.6)
const waxInner = waxBlob(31, 1.8)
</script>

<template>
  <div
    class="env"
    data-envelope
    role="dialog"
    aria-modal="true"
    :aria-label="`Приглашение на свадьбу ${WEDDING.groomGenitive} и ${WEDDING.brideGenitive}`"
  >
    <!--
      Цветные разводы по бумаге конверта и падающие листья.
      strength=0 — размытые пятна не нужны: под бумагой их всё равно не
      видно, а поверх они превратили бы конверт в мутное облако.
    -->
    <SoftAura :strength="0" />

    <!-- Три задних шва: сходятся в вершине клапана. -->
    <span class="env__seam env__seam--left" aria-hidden="true" />
    <span class="env__seam env__seam--right" aria-hidden="true" />
    <span class="env__seam env__seam--bottom" aria-hidden="true" />

    <!-- Письмо. Лежит под клапаном и проявляется, когда тот откинулся. -->
    <div class="env__letter">
      <span class="env__letter-frame" aria-hidden="true" />

      <p class="env__eyebrow eyebrow" style="--d: 140ms">Приглашение на свадьбу</p>

      <WeddingRings class="env__rings" style="--d: 220ms" />

      <p class="env__names display grad-text" style="--d: 300ms">
        {{ WEDDING.groom }}<em>&amp;</em>{{ WEDDING.bride }}
      </p>

      <p class="env__date" style="--d: 380ms">
        {{ WEDDING.date.day }}<i aria-hidden="true">·</i>{{ WEDDING.date.month
        }}<i aria-hidden="true">·</i>{{ WEDDING.date.year }}
      </p>

      <BotanicalDivider class="env__rule" style="--d: 450ms" />

      <p class="env__text" style="--d: 520ms">
        Дорогие друзья и родные! Мы женимся — и будем счастливы видеть вас в этот день рядом
        с нами.
      </p>

      <button type="button" class="btn btn--solid env__enter" data-envelope-enter style="--d: 620ms">
        Открыть приглашение
        <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M5 12h13M13 6.5 18.5 12 13 17.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- Клапан. Отдельная сцена, чтобы перспектива не задевала остальное. -->
    <div class="env__scene" aria-hidden="true">
      <span class="env__flap" />
    </div>

    <!--
      Всё, что напечатано на конверте под печатью: имена (тем же набором,
      что и внутри письма), дата и отсчёт. Одним блоком, а не тремя
      отдельными — иначе пришлось бы вручную складывать отступы.
    -->
    <div class="env__front" aria-hidden="true">
      <p class="env__from display grad-text">
        {{ WEDDING.groom }}<em>&amp;</em>{{ WEDDING.bride }}
      </p>

      <p class="env__stamp">
        <span class="env__stamp-rule" />
        <span class="env__stamp-date">{{ WEDDING.date.human }}</span>
        <span class="env__stamp-rule" />
      </p>

      <p class="env__weekday">{{ WEDDING.date.weekday }}</p>
    </div>

    <!-- Печать. Она же кнопка «открыть». -->
    <button type="button" class="env__seal" data-envelope-open>
      <span class="env__seal-ring" aria-hidden="true" />
      <span class="env__seal-halo" aria-hidden="true" />
      <svg class="env__seal-wax" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path class="env__wax-body" :d="wax" />
        <path class="env__wax-inner" :d="waxInner" />
        <path class="env__wax-gloss" d="M27 33c5-9 15-14 25-13" fill="none" stroke-linecap="round" />
      </svg>
      <span class="env__seal-mono" aria-hidden="true">
        {{ WEDDING.groom.charAt(0) }}<i>&amp;</i>{{ WEDDING.bride.charAt(0) }}
      </span>
      <span class="sr-only">Открыть конверт с приглашением</span>
    </button>

    <button type="button" class="env__skip" data-envelope-skip>Пропустить</button>
  </div>
</template>

<!--
  Правила ниже завязаны на классы <html>, которые ставит скрипт. Блок
  СПЕЦИАЛЬНО без scoped: компилятор Vue не умеет «:global(html.x) .y» —
  он выбрасывает вторую половину селектора, и стиль оверлея уезжает на
  сам <html>. Имена классов уникальные, так что глобальность безопасна.
-->
<style>
/* Конверт живёт только при работающем скрипте — иначе его нечем открыть. */
html.has-js .env {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  overflow: hidden;
  /* Бумага конверта. Отступов нет намеренно: клапан и швы считают
     координаты от края экрана. */
  background: linear-gradient(160deg, var(--card), color-mix(in srgb, var(--gold) 12%, var(--card)));
  transition: opacity 0.6s ease;
}

/* Сработало «пропустить» или анимация закончилась — оверлея больше нет. */
html.has-js .env.is-done {
  display: none;
}
</style>

<style scoped>
.env {
  /**
   * Вершина клапана — ровно середина экрана: там же лежит печать.
   * Именно проценты, а не vh: оверлей растянут на весь экран, и процент
   * считается от его высоты — без разницы между vh, svh и адресной строкой,
   * которая на телефоне то появляется, то уезжает.
   * От этой переменной зависят и швы, и позиция печати, и подписи.
   */
  --flap: 50%;
  /**
   * Глубина «галочки» клапана — от неё зависит, насколько острый угол.
   * Считается от ширины (чтобы угол держался около 120° на любом экране)
   * и подстраховывается высотой, иначе на низком окне клапан провалился бы
   * ниже своей вершины.
   */
  --flap-v: min(30vw, 26vh);
  /** Линия сгиба: высота, на которой у клапана начинаются скосы. */
  --flap-fold: calc(var(--flap) - var(--flap-v));
  --seal: clamp(128px, 34vw, 190px);

  display: none;
}

.env.is-leaving {
  opacity: 0;
  pointer-events: none;
}

/* ---------- бумага ---------- */

/**
 * Задние швы конверта: левый и правый идут от верхних углов к вершине
 * клапана, нижний — от неё к нижним углам. Оттенки разные не ради цвета:
 * именно на их стыках читаются линии сгиба. Тонкую тень по сгибу даёт
 * drop-shadow — он повторяет форму, обрезанную clip-path, в отличие от
 * box-shadow, который обвёл бы прямоугольник элемента.
 */
.env__seam {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.env__seam--left {
  clip-path: polygon(0 var(--flap-fold), 50% var(--flap), 0 100%);
  background: linear-gradient(100deg, color-mix(in srgb, var(--sage) 9%, transparent), transparent 70%);
  filter: drop-shadow(1px 0 2px color-mix(in srgb, var(--ink) 14%, transparent));
}

.env__seam--right {
  clip-path: polygon(100% var(--flap-fold), 50% var(--flap), 100% 100%);
  background: linear-gradient(260deg, color-mix(in srgb, var(--rose) 10%, transparent), transparent 70%);
  filter: drop-shadow(-1px 0 2px color-mix(in srgb, var(--ink) 14%, transparent));
}

.env__seam--bottom {
  clip-path: polygon(0 100%, 50% var(--flap), 100% 100%);
  background: linear-gradient(0deg, color-mix(in srgb, var(--gold) 11%, transparent), transparent 76%);
  filter: drop-shadow(0 -1px 3px color-mix(in srgb, var(--ink) 16%, transparent));
}

/* ---------- клапан ---------- */
.env__scene {
  position: absolute;
  inset: 0;
  z-index: 2;
  perspective: 1700px;
  /* Смотрим на сгиб сверху — так откидывание выглядит естественным. */
  perspective-origin: 50% 0;
  pointer-events: none;
}

.env__flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--flap);
  /* Не «галочка» во всю высоту, а настоящий клапан: ровный верх и
     неглубокий скос к вершине. Иначе на узком экране угол выходит острым. */
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - var(--flap-v)),
    50% 100%,
    0 calc(100% - var(--flap-v))
  );
  background: linear-gradient(
    172deg,
    color-mix(in srgb, var(--gold) 24%, var(--card)),
    color-mix(in srgb, var(--sage) 20%, var(--card))
  );
  transform-origin: top center;
  /* drop-shadow, а не box-shadow: тень должна повторять треугольник,
     обрезанный clip-path, а не рамку элемента. */
  filter: drop-shadow(0 12px 16px color-mix(in srgb, var(--ink) 18%, transparent));
  transition: transform 1.15s cubic-bezier(0.35, 0.02, 0.24, 1), opacity 0.5s ease;
}

.env.is-opened .env__flap {
  transform: rotateX(-168deg);
}

/* ---------- печать ---------- */
.env__seal {
  position: absolute;
  top: calc(var(--flap) - var(--seal) / 2);
  left: calc(50% - var(--seal) / 2);
  z-index: 3;
  display: grid;
  place-items: center;
  width: var(--seal);
  height: var(--seal);
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  filter: drop-shadow(0 10px 18px color-mix(in srgb, var(--accent-ink) 42%, transparent));
  transition: transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.45s ease 0.1s;
}

.env__seal:hover {
  transform: scale(1.04);
}

/**
 * Рамку вокруг печати не показываем: она круглая, а системная обводка
 * рисует прямоугольник. Для клавиатуры оставляем кольцо, но по форме печати.
 */
.env__seal:focus {
  outline: none;
}

.env__seal:focus-visible {
  outline: 2px solid var(--accent-ink);
  outline-offset: 10px;
  border-radius: 50%;
}

.env.is-cracking .env__seal {
  transform: translateY(34px) rotate(13deg) scale(0.8);
  opacity: 0;
  pointer-events: none;
}

.env__seal-wax {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.env__wax-body {
  fill: var(--accent);
  stroke: color-mix(in srgb, var(--accent-ink) 80%, var(--gold));
  stroke-width: 1.4;
}

.env__wax-inner {
  fill: none;
  stroke: color-mix(in srgb, var(--gold) 75%, var(--accent-ink));
  stroke-width: 1;
  stroke-dasharray: 1 4.5;
  stroke-linecap: round;
  opacity: 0.85;
}

.env__wax-gloss {
  stroke: color-mix(in srgb, var(--gold) 60%, transparent);
  stroke-width: 3.2;
  opacity: 0.55;
}

.env__seal-mono {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.05em;
  font-family: var(--font-display);
  font-size: calc(var(--seal) * 0.3);
  font-style: italic;
  line-height: 1;
  color: var(--on-sage);
  text-shadow: 0 1px 1px color-mix(in srgb, var(--accent-ink) 70%, transparent);
}

.env__seal-mono i {
  font-size: 0.75em;
  opacity: 0.85;
}

/**
 * Моргающее кольцо — единственная подсказка, что печать нажимается.
 * Вместо надписи: тише и не спорит с бумагой.
 */
.env__seal-ring {
  position: absolute;
  inset: calc(var(--seal) * -0.07);
  border: 1px solid color-mix(in srgb, var(--accent-ink) 55%, transparent);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  animation: seal-blink 2.9s ease-in-out infinite;
}

/* Кольцо, расходящееся в момент вскрытия. */
.env__seal-halo {
  position: absolute;
  inset: calc(var(--seal) * -0.05);
  border: 1px solid var(--gold);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
}

.env.is-cracking .env__seal-ring {
  animation: none;
}

.env.is-cracking .env__seal-halo {
  animation: halo 0.85s ease-out forwards;
}

@keyframes seal-blink {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.93);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.07);
  }
}

/* ---------- надписи на конверте ---------- */

/* Блок начинается сразу под печатью и тянется вниз по центру. */
.env__front {
  position: absolute;
  top: calc(var(--flap) + var(--seal) * 0.62);
  left: 0;
  right: 0;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: clamp(0.5rem, 2.5vw, 0.9rem);
  padding-inline: clamp(1.25rem, 6vw, 2rem);
  transition: opacity 0.4s ease;
}

.env.is-cracking .env__front {
  opacity: 0;
}

.env__from {
  padding-inline: 0.06em;
  font-size: clamp(1.6rem, 7vw, 2.6rem);
}

.env__from em {
  padding-inline: 0.14em;
  font-style: italic;
  font-size: 0.78em;
}

/* Дата под именами: курсивная антиква между двумя золотыми волосинками. */
.env__stamp {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 2.5vw, 0.85rem);
  width: 100%;
  max-width: 20rem;
}

.env__stamp-date {
  flex: none;
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1rem, 3.8vw, 1.25rem);
  letter-spacing: 0.06em;
  white-space: nowrap;
  color: var(--accent-ink);
}

.env__stamp-rule {
  flex: 1;
  height: 1px;
  background: var(--grad-line);
}

.env__weekday {
  margin-top: -0.25rem;
  font-size: clamp(0.62rem, 2.4vw, 0.72rem);
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.env.is-cracking .env__from {
  opacity: 0;
}

/* ---------- письмо ---------- */
.env__letter {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.6rem;
  /* Письмо занимает 80% экрана: лист, вынутый из конверта. Ограничения
     сверху нужны, чтобы на большом мониторе он не расползался. */
  width: min(80vw, 34rem);
  min-height: min(78svh, 40rem);
  padding: clamp(1.6rem, 6vw, 2.4rem) clamp(1.2rem, 5vw, 2rem);
  border-radius: var(--radius);
  text-align: center;
  background:
    radial-gradient(70% 50% at 50% 0%, color-mix(in srgb, var(--rose) 13%, transparent), transparent 70%),
    radial-gradient(60% 45% at 50% 100%, color-mix(in srgb, var(--sage) 15%, transparent), transparent 72%),
    linear-gradient(170deg, var(--bg), color-mix(in srgb, var(--gold) 7%, var(--bg)));
  box-shadow: 0 26px 55px -28px color-mix(in srgb, var(--ink) 55%, transparent);
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: opacity 0.75s ease, transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.env.is-opened .env__letter {
  opacity: 1;
  transform: none;
}

/* Тонкая золотая рамка внутри письма. */
.env__letter-frame {
  position: absolute;
  inset: clamp(0.45rem, 2.2vw, 0.65rem);
  border: 1px solid color-mix(in srgb, var(--gold) 42%, transparent);
  border-radius: calc(var(--radius) - 4px);
  pointer-events: none;
}

/* Содержимое письма проявляется по одному, пока клапан ещё едет. */
.env__letter > *:not(.env__letter-frame) {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease var(--d, 0ms), transform 0.55s ease var(--d, 0ms);
}

.env.is-opened .env__letter > *:not(.env__letter-frame) {
  opacity: 1;
  transform: none;
}

/* Селектор с запасом по специфичности: у WeddingRings своя ширина. */
.env__letter .env__rings {
  width: clamp(96px, 26vw, 132px);
}

/**
 * Тут сознательно НЕ flex: у надписи градиентная заливка по тексту
 * (.grad-text), а на флекс-контейнере background-clip: text ведёт себя
 * непредсказуемо в старых Safari. Обычная строка надёжнее.
 */
.env__names {
  font-size: clamp(1.7rem, 7vw, 2.5rem);
}

.env__names em {
  padding-inline: 0.12em;
  font-style: italic;
  font-size: 0.78em;
}

.env__date {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 3.4vw, 1.1rem);
  letter-spacing: 0.2em;
  color: var(--ink-soft);
}

.env__date i {
  font-style: normal;
  color: var(--gold-ink);
}

.env__rule {
  width: min(72%, 15rem);
  margin-block: 0.2rem;
}

.env__text {
  max-width: 17rem;
  font-size: clamp(0.8rem, 2.9vw, 0.9rem);
  line-height: 1.55;
  color: var(--ink-soft);
}

.env__enter {
  margin-top: 0.4rem;
  min-height: 44px;
  padding-inline: 1.1rem;
  font-size: 0.88rem;
}

/* ---------- «пропустить» ---------- */
.env__skip {
  position: absolute;
  bottom: clamp(0.9rem, 3vw, 1.4rem);
  left: 50%;
  z-index: 4;
  min-height: 34px;
  padding: 0.2rem 0.75rem;
  border: 0;
  border-radius: 999px;
  background: none;
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  color: var(--ink-soft);
  opacity: 0.7;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-strong);
  transform: translateX(-50%);
}

.env__skip:hover {
  opacity: 1;
  color: var(--sage-ink);
}

/* ------------------------------------------------------------
   «Меньше движения»: клапан и печать не летают, письмо просто
   появляется. Конверт остаётся, взаимодействие тоже.
   ------------------------------------------------------------ */
@media (prefers-reduced-motion: reduce) {
  .env__seal,
  .env__flap,
  .env__letter,
  .env__letter > * {
    transition-duration: 0.2s;
  }

  .env.is-opened .env__flap {
    transform: none;
    opacity: 0;
  }
}
</style>

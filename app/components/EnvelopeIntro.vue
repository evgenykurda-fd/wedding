<script setup lang="ts">
import { useId } from 'vue'
import { WEDDING } from '~/utils/wedding'

/**
 * Конверт-заставка.
 *
 * Гость видит запечатанный конверт: классическая геометрия — четыре грани
 * сходятся в одной точке, сверху клапан, в его вершине сургучная печать с
 * мягко моргающим кольцом. По нажатию печать растворяется на месте, затем
 * клапан откидывается назад, и из конверта поднимается письмо с кнопкой входа.
 *
 * Как это устроено:
 *   - оверлей есть в разметке всегда, но CSS показывает его ТОЛЬКО под
 *     html.has-js: при заблокированном JS открыть конверт было бы нечем;
 *   - конверт — отдельный объект с постоянными пропорциями, а не растянутая
 *     на весь экран выкройка: только так грани сходятся под естественными
 *     углами на любом устройстве;
 *   - вся геометрия держится на --tip: это и вершина клапана, и точка, где
 *     встречаются боковые грани, и координата печати;
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

/** Свой градиент на каждый экземпляр: ссылки url(#…) не должны пересекаться. */
const waxId = `wax-${useId()}`
</script>

<template>
  <div
    class="env"
    data-envelope
    role="dialog"
    aria-modal="true"
    :aria-label="`Приглашение на свадьбу ${WEDDING.groomGenitive} и ${WEDDING.brideGenitive}`"
  >
    <SoftAura :strength="0.45" />

    <div class="env__stage">
      <div class="env__paper" aria-hidden="true">
        <!-- Внутренность конверта: видна, когда клапан откинулся. -->
        <span class="env__inside" />

        <!-- Три передние грани: боковые и нижняя, все сходятся в вершине. -->
        <span class="env__facet env__facet--left" />
        <span class="env__facet env__facet--right" />
        <span class="env__facet env__facet--bottom" />

        <!-- Клапан. Отдельная сцена, чтобы перспектива не задевала остальное. -->
        <div class="env__scene">
          <span class="env__flap" />
        </div>

        <!--
          Линии сгибов. Рисуются отдельно, а не рождаются из стыка заливок:
          так все четыре диагонали одинаково заметны, а сами грани могут
          оставаться почти одного тона — иначе конверт распадается на резкие
          треугольники. preserveAspectRatio="none" растягивает сетку под
          конверт, а non-scaling-stroke держит линию в один пиксель.
        -->
        <svg class="env__folds" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path
            class="env__fold"
            vector-effect="non-scaling-stroke"
            d="M0 0 50 58 100 0M0 100 50 58 100 100"
          />
        </svg>

        <!-- Объём: свет в середине, тень по углам и «карман» под вершиной. -->
        <span class="env__depth" />
      </div>

      <!-- Печать. Она же кнопка «открыть». -->
      <button type="button" class="env__seal" data-envelope-open>
        <span class="env__seal-ring" aria-hidden="true" />
        <span class="env__seal-halo" aria-hidden="true" />
        <svg class="env__seal-wax" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            <!-- Свет падает сверху слева, к краям воск уходит в тень. -->
            <radialGradient :id="waxId" cx="34%" cy="28%" r="82%">
              <stop class="env__wax-stop--light" offset="0" />
              <stop class="env__wax-stop--mid" offset="0.55" />
              <stop class="env__wax-stop--deep" offset="1" />
            </radialGradient>
          </defs>
          <path class="env__wax-body" :d="wax" :fill="`url(#${waxId})`" />
          <path class="env__wax-inner" :d="waxInner" />
          <path class="env__wax-gloss" d="M27 33c5-9 15-14 25-13" fill="none" stroke-linecap="round" />
        </svg>
        <span class="env__seal-mono" aria-hidden="true">
          {{ WEDDING.groom.charAt(0) }}<i>&amp;</i>{{ WEDDING.bride.charAt(0) }}
        </span>
        <span class="sr-only">Открыть конверт с приглашением</span>
      </button>

      <!-- Подписи под конвертом: имена, дата, день недели. -->
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
    </div>

    <!-- Письмо. Поднимается из конверта, когда клапан откинулся. -->
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
        Дорогие друзья и родные! У нас свадьба, и мы будем счастливы видеть вас в этот день
        рядом с нами.
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
  background: var(--bg);
  transition: opacity 0.75s ease;
}

/* Сработало «пропустить» или анимация закончилась — оверлея больше нет. */
html.has-js .env.is-done {
  display: none;
}
</style>

<style scoped>
.env {
  /** Пропорции взяты у обычного почтового конверта. */
  --paper-w: min(86vw, 30rem);
  --paper-h: calc(var(--paper-w) / 1.45);
  /**
   * Вершина: точка, где сходятся все четыре грани и куда падает печать.
   * Чуть ниже середины — как на настоящем конверте.
   */
  --tip: 58%;
  --seal: calc(var(--paper-w) * 0.26);

  display: none;
}

.env.is-leaving {
  opacity: 0;
  pointer-events: none;
}

/* ---------- конверт ---------- */
.env__stage {
  position: relative;
  display: grid;
  justify-items: center;
  gap: clamp(1.1rem, 4vw, 1.6rem);
  transition: transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.7s ease;
}

/**
 * Когда письмо вышло, конверт отступает назад и притухает: иначе его края
 * торчат из-за листа двумя тёмными ушами и читаются как артефакт.
 */
.env.is-opened .env__stage {
  transform: translateY(5%) scale(0.94);
  opacity: 0.4;
}

.env.is-leaving .env__stage {
  opacity: 0;
}

.env__paper {
  position: relative;
  width: var(--paper-w);
  height: var(--paper-h);
  border-radius: clamp(8px, 2.5vw, 14px);
  overflow: hidden;
  /* Бумага конверта: тёплая, с лёгким уходом в золото по диагонали. */
  background: linear-gradient(155deg, var(--card), color-mix(in srgb, var(--gold) 14%, var(--card)));
  box-shadow: 0 30px 60px -34px rgba(8, 14, 10, 0.75), 0 4px 12px -6px rgba(8, 14, 10, 0.4);
}

/* Внутренность: под клапаном она темнее самой бумаги. */
.env__inside {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.14) 55%, transparent 78%);
}

/**
 * Грани конверта. У каждой свой ход света: плоскость без градиента читается
 * как аппликация, а не как сложенная бумага. Светлая линия по сгибу и мягкая
 * тень под ним — это drop-shadow, он повторяет форму, обрезанную clip-path.
 */
.env__facet {
  position: absolute;
  inset: 0;
}

.env__facet--left {
  clip-path: polygon(0 0, 50% var(--tip), 0 100%);
  background-image: linear-gradient(90deg, rgba(255, 248, 234, 0.06), rgba(0, 0, 0, 0.09) 92%),
    linear-gradient(120deg, color-mix(in srgb, var(--sage) 16%, transparent), transparent 70%);
  filter: drop-shadow(5px 0 12px rgba(8, 14, 10, 0.4));
}

.env__facet--right {
  clip-path: polygon(100% 0, 50% var(--tip), 100% 100%);
  background-image: linear-gradient(270deg, rgba(255, 248, 234, 0.06), rgba(0, 0, 0, 0.09) 92%),
    linear-gradient(240deg, color-mix(in srgb, var(--rose) 16%, transparent), transparent 70%);
  filter: drop-shadow(-5px 0 12px rgba(8, 14, 10, 0.4));
}

/* Нижняя грань лежит поверх боковых: она светлее, а тень падает вверх. */
.env__facet--bottom {
  clip-path: polygon(0 100%, 50% var(--tip), 100% 100%);
  background-color: rgba(255, 248, 234, 0.045);
  background-image: linear-gradient(180deg, rgba(255, 248, 234, 0.07), rgba(0, 0, 0, 0.1) 95%),
    linear-gradient(0deg, color-mix(in srgb, var(--gold) 14%, transparent), transparent 70%);
  filter: drop-shadow(0 -6px 14px rgba(8, 14, 10, 0.45));
}

/* ---------- клапан ---------- */
.env__scene {
  position: absolute;
  inset: 0;
  perspective: 1200px;
  /* Смотрим на сгиб сверху — так откидывание выглядит естественным. */
  perspective-origin: 50% 0;
  pointer-events: none;
}

.env__flap {
  position: absolute;
  inset: 0;
  /* Полный треугольник от верхних углов к вершине — как у почтового конверта. */
  clip-path: polygon(0 0, 100% 0, 50% var(--tip));
  background-color: rgba(0, 0, 0, 0.06);
  background-image: linear-gradient(180deg, rgba(255, 248, 234, 0.09), rgba(0, 0, 0, 0.08) 92%),
    linear-gradient(
      172deg,
      color-mix(in srgb, var(--gold) 22%, var(--card)),
      color-mix(in srgb, var(--sage) 20%, var(--card))
    );
  transform-origin: top center;
  filter: drop-shadow(0 10px 18px rgba(8, 14, 10, 0.45));
  /* Долгий ход с мягким входом и выходом: клапан должен откидываться, как
     бумага, а не отщёлкиваться. */
  transition: transform 1.7s cubic-bezier(0.3, 0.06, 0.2, 1);
}

.env.is-opened .env__flap {
  transform: rotateX(-172deg);
}

/* Линии сгибов: светлая волосинка по ребру и тёмная тень сразу под ней. */
.env__folds {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.env__fold {
  fill: none;
  stroke: rgba(255, 248, 234, 0.22);
  stroke-width: 1;
  filter: drop-shadow(0 1px 1px rgba(8, 14, 10, 0.55));
}

/**
 * Слой объёма поверх бумаги, но под печатью: свет собирается у вершины,
 * углы уходят в тень, под самой вершиной лежит «карман».
 */
.env__depth {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 50% var(--tip),
      rgba(8, 14, 10, 0.3),
      rgba(8, 14, 10, 0.1) 16%,
      transparent 34%
    ),
    radial-gradient(120% 90% at 50% 46%, transparent 42%, rgba(8, 14, 10, 0.4) 100%);
}

/* ---------- печать ---------- */
.env__seal {
  position: absolute;
  top: calc(var(--paper-h) * 0.58 - var(--seal) / 2);
  left: calc(50% - var(--seal) / 2);
  z-index: 2;
  display: grid;
  place-items: center;
  width: var(--seal);
  height: var(--seal);
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  /* Тень вне темы: на тёмном фоне светлый акцент давал бы ореол, а не тень. */
  filter: drop-shadow(0 8px 14px rgba(58, 28, 12, 0.45))
    drop-shadow(0 2px 3px rgba(58, 28, 12, 0.3));
  /* transform остался только для наведения; исчезновение ведёт opacity, и
     без задержки: воск должен начать таять в момент нажатия. Долгая
     ease-in-out — чтобы печать таяла на глазах, а не пропадала мгновенно. */
  transition: transform 0.75s cubic-bezier(0.32, 1.15, 0.6, 1), opacity 1.2s ease-in-out;
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

/**
 * Печать не улетает вниз, а растворяется на месте: падение читалось как
 * «что-то отвалилось», тогда как сургуч должен просто растаять. transform
 * гасим явно — иначе на мышке остался бы висеть scale от :hover.
 */
.env.is-cracking .env__seal {
  transform: none;
  opacity: 0;
  pointer-events: none;
}

.env__seal-wax {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/**
 * Цвета воска заданы явными hex и НЕ берутся из токенов темы. В тёмной теме
 * акцент светло-персиковый, и печать превращалась в бледную наклейку, тогда
 * как сургуч остаётся тёмно-терракотовым при любом освещении.
 */
.env__wax-stop--light {
  stop-color: #c9814f;
}

.env__wax-stop--mid {
  stop-color: #a95f37;
}

.env__wax-stop--deep {
  stop-color: #7d4223;
}

.env__wax-body {
  stroke: #6a3418;
  stroke-width: 1.4;
}

.env__wax-inner {
  fill: none;
  stroke: #f0cf9c;
  stroke-width: 1;
  stroke-dasharray: 1 4.5;
  stroke-linecap: round;
  opacity: 0.7;
}

.env__wax-gloss {
  stroke: #ffe2b5;
  stroke-width: 3.2;
  opacity: 0.4;
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
  /* Тёплый белый поверх воска — тоже вне темы, иначе в тёмной буквы
     оказывались тёмными на тёмном. */
  color: #fff6e8;
  text-shadow: 0 1px 1px rgba(88, 44, 20, 0.65);
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
  inset: calc(var(--seal) * -0.09);
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
  animation: halo 1.2s ease-out forwards;
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

/* ---------- подписи под конвертом ---------- */
.env__front {
  display: grid;
  justify-items: center;
  gap: clamp(0.4rem, 2vw, 0.7rem);
  padding-inline: clamp(1rem, 5vw, 2rem);
  transition: opacity 0.5s ease;
}

.env.is-cracking .env__front {
  opacity: 0;
}

.env__from {
  padding-inline: 0.06em;
  font-size: clamp(1.5rem, 6.5vw, 2.3rem);
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
  font-size: clamp(0.95rem, 3.6vw, 1.2rem);
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

/* ---------- письмо ---------- */
.env__letter {
  position: absolute;
  z-index: 4;
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
  box-shadow: 0 26px 55px -28px rgba(8, 14, 10, 0.7);
  opacity: 0;
  /* Стартует ниже и мельче — будто ещё лежит в конверте. */
  transform: translateY(14%) scale(0.9);
  transition: opacity 1.1s ease 0.35s, transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) 0.35s;
  pointer-events: none;
}

.env.is-opened .env__letter {
  opacity: 1;
  transform: none;
  pointer-events: auto;
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
  transform: translateY(12px);
  transition: opacity 0.7s ease calc(var(--d, 0ms) + 450ms),
    transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) calc(var(--d, 0ms) + 450ms);
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
  z-index: 5;
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
  .env__stage,
  .env__letter,
  .env__letter > * {
    transition-duration: 0.2s;
  }

  .env.is-opened .env__flap {
    transform: none;
    opacity: 0;
  }

  .env.is-opened .env__stage {
    transform: none;
  }
}
</style>

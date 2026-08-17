/* invite-runtime — по этому маркеру scripts/bundle.mjs проверяет, что скрипт
   реально попал в HTML, и вклеивает его сам, если нет. Не удалять. */

/**
 * Интерактив приглашения.
 *
 * Этот файл НЕ попадает в обычный клиентский бандл: Nuxt собран с
 * features.noScripts, чтобы на выходе получился один HTML-файл без внешних
 * запросов. Содержимое читается как строка в app/app.vue и вклеивается
 * инлайн-тегом перед </body>.
 *
 * Отсюда правила:
 *   - никаких import/export, только IIFE;
 *   - все данные приходят из JSON-блока #wedding-config
 *     (источник — app/utils/wedding.ts), здесь их дублировать нельзя;
 *   - каждый блок работает независимо: если разметки нет, он просто молчит;
 *   - никаких сетевых вызовов, ничего не отправляется наружу.
 */
;(function () {
  'use strict'

  var root = document.documentElement

  /**
   * Помечаем страницу как «скрипт жив». Только под этим классом CSS прячет
   * секции для анимации появления — иначе при заблокированном JS гость
   * увидел бы пустую страницу.
   */
  root.classList.add('has-js')

  var CFG = {}
  try {
    var cfgEl = document.getElementById('wedding-config')
    if (cfgEl) CFG = JSON.parse(cfgEl.textContent || '{}')
  } catch (err) {
    // Конфиг не разобрался — страница остаётся читаемой, просто без интерактива.
    CFG = {}
  }

  function forEach(list, fn) {
    Array.prototype.forEach.call(list, fn)
  }

  var prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ------------------------------------------------------------------
     Переключатель темы.

     По умолчанию страница светлая — как бумага приглашения, независимо от
     настроек телефона. Выбор гостя запоминается в localStorage, а применяет
     его бутстрап в <head>: до первой отрисовки, чтобы не мигало.
     ------------------------------------------------------------------ */
  var THEME_KEY = 'wedding-theme'

  function initTheme() {
    var toggles = document.querySelectorAll('[data-theme-toggle]')
    if (!toggles.length) return

    /** Тему всегда ставит бутстрап, так что читаем её прямо с <html>. */
    function isDark() {
      return root.getAttribute('data-theme') === 'dark'
    }

    function paint() {
      var dark = isDark()
      forEach(toggles, function (button) {
        button.classList.toggle('is-dark', dark)
        button.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему')
      })
    }

    forEach(toggles, function (button) {
      button.addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark'
        root.setAttribute('data-theme', next)
        try {
          localStorage.setItem(THEME_KEY, next)
        } catch (err) {
          // Приватный режим или file:// без хранилища — тема просто не запомнится.
        }
        paint()
      })
    })

    paint()
  }

  /* ------------------------------------------------------------------
     Открытка-заставка.

     Порядок состояний: is-cracking (печать отлетает) → is-opened
     (створки распахнулись, виден разворот) → is-leaving → is-done.
     Класс is-sealed на <html> держит страницу под открыткой
     непрокручиваемой; его ставит бутстрап-скрипт в <head>, а снимаем
     мы — иначе прокрутка осталась бы заблокированной навсегда.
     ------------------------------------------------------------------ */
  function initEnvelope() {
    function unlock() {
      root.classList.remove('is-sealed')
      // Под этим классом оживает hero: он ждал, пока откроют открытку.
      root.classList.add('is-entered')
    }

    var env = document.querySelector('[data-envelope]')
    if (!env) {
      unlock()
      return
    }

    var seal = env.querySelector('[data-envelope-open]')
    var enterButton = env.querySelector('[data-envelope-enter]')
    var skipButton = env.querySelector('[data-envelope-skip]')
    var timers = []
    var state = 'sealed'

    function later(fn, ms) {
      timers.push(setTimeout(fn, ms))
    }

    function focusSafely(el) {
      if (!el) return
      try {
        el.focus({ preventScroll: true })
      } catch (err) {
        el.focus()
      }
    }

    /** Раскрываем: печать отлетает, створки расходятся. */
    function open() {
      if (state !== 'sealed') return
      state = 'cracking'
      env.classList.add('is-cracking')

      later(function () {
        state = 'opened'
        env.classList.add('is-opened')
        focusSafely(enterButton)
      }, prefersReducedMotion ? 60 : 300)
    }

    /** Уходим со заставки на страницу. instant — без анимации. */
    function leave(instant) {
      if (state === 'leaving' || state === 'done') return
      state = 'leaving'
      forEach(timers, clearTimeout)
      timers = []
      unlock()

      if (instant || prefersReducedMotion) {
        env.classList.add('is-leaving', 'is-done')
        state = 'done'
        return
      }

      env.classList.add('is-leaving')
      later(function () {
        env.classList.add('is-done')
        state = 'done'
      }, 620)
    }

    // Конверт показываем всегда, даже если в ссылке есть якорь (#rsvp):
    // это первое, что видит гость, и пропускать его самовольно нельзя.
    // Кому нужно сразу к странице — есть кнопка «Пропустить» и Escape.

    if (seal) seal.addEventListener('click', open)
    if (skipButton) skipButton.addEventListener('click', function () {
      leave(true)
    })

    // Разворот открыт — дальше пускает и кнопка, и тап по любому месту.
    env.addEventListener('click', function (event) {
      if (state === 'sealed' && event.target === env) open()
      else if (state === 'opened') leave(false)
    })

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' && event.key !== 'Esc') return
      if (state === 'done') return
      leave(true)
    })

    // Фокус на печать при загрузке НЕ ставим: браузер считает такой фокус
    // «клавиатурным» и рисует вокруг печати рамку, хотя гость ничего не
    // нажимал. Печать и так первая в порядке табуляции.

    // Метка ставится ПОСЛЕДНЕЙ: страховочный таймер в <head> ждёт именно
    // её и снимет блокировку, если мы упали где-то выше.
    root.classList.add('env-ready')
  }

  /* ------------------------------------------------------------------
     Появление секций при скролле
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]')
    if (!items.length) return

    if (prefersReducedMotion || typeof window.IntersectionObserver !== 'function') {
      forEach(items, function (el) {
        el.classList.add('is-visible')
      })
      return
    }

    var observer = new IntersectionObserver(
      function (entries) {
        forEach(entries, function (entry) {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
    )

    forEach(items, function (el) {
      observer.observe(el)
    })
  }

  /* ------------------------------------------------------------------
     Липкая шапка: показываем, когда hero почти уехал за верх экрана,
     и заодно считаем прогресс прокрутки — по нему шапка рисует полоску.
     ------------------------------------------------------------------ */
  function initStickyBar() {
    var hero = document.querySelector('[data-hero]')
    var bar = document.querySelector('[data-sticky-bar]')
    if (!hero || !bar) return

    function update() {
      var scrolled = window.pageYOffset || root.scrollTop || 0
      bar.classList.toggle('is-on', scrolled > hero.offsetHeight * 0.72)

      var full = root.scrollHeight - window.innerHeight
      bar.style.setProperty('--progress', full > 0 ? String(Math.min(1, scrolled / full)) : '0')
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
  }

  /* ------------------------------------------------------------------
     Лепестки-искры: короткий салют из точки, где нажали.
     Элементы создаются здесь, поэтому их стили лежат в main.css —
     scoped-стили компонента на них бы не подействовали.
     ------------------------------------------------------------------ */
  var SPARK_TINTS = ['rose', 'gold', 'sage']
  var lastSpark = 0

  function sprinkle(origin) {
    if (prefersReducedMotion || !origin) return

    // Пауза между залпами: без неё частые нажатия наплодят сотни узлов.
    var now = Date.now()
    if (now - lastSpark < 700) return
    lastSpark = now

    var layer = document.querySelector('[data-sparks]')
    if (!layer) return

    var box = origin.getBoundingClientRect()
    var made = []

    for (var i = 0; i < 14; i++) {
      var spark = document.createElement('span')
      var angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.45
      var distance = 55 + Math.random() * 75

      spark.className = 'spark spark--' + SPARK_TINTS[i % SPARK_TINTS.length]
      spark.style.left = box.left + box.width / 2 + 'px'
      spark.style.top = box.top + box.height / 2 + 'px'
      spark.style.setProperty('--dx', Math.cos(angle) * distance + 'px')
      spark.style.setProperty('--dy', Math.sin(angle) * distance - 26 + 'px')
      spark.style.setProperty('--rot', Math.round(Math.random() * 540 - 270) + 'deg')
      spark.style.animationDelay = i * 14 + 'ms'

      layer.appendChild(spark)
      made.push(spark)
    }

    // Убираем именно свои элементы: рядом может идти ещё один салют.
    setTimeout(function () {
      forEach(made, function (spark) {
        if (spark.parentNode) spark.parentNode.removeChild(spark)
      })
    }, 1600)
  }

  /* ------------------------------------------------------------------
     Обратный отсчёт
     ------------------------------------------------------------------ */

  /** 1 день / 2 дня / 5 дней. Словоформы приходят из конфига. */
  function pluralRu(n, forms) {
    if (!forms || forms.length !== 3) return ''
    var abs = Math.abs(n) % 100
    var last = abs % 10
    if (abs > 10 && abs < 20) return forms[2]
    if (last > 1 && last < 5) return forms[1]
    if (last === 1) return forms[0]
    return forms[2]
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n)
  }

  function initCountdown() {
    if (!CFG.ceremonyISO) return

    var target = new Date(CFG.ceremonyISO).getTime()
    if (isNaN(target)) return

    var plural = CFG.plural || {}
    var srLine = document.querySelector('[data-cd-sr]')
    var keys = ['days', 'hours', 'minutes', 'seconds']

    // querySelectorAll, а не querySelector: отсчёт может стоять на странице
    // не в одном месте, и обновлять нужно все.
    var values = {}
    var labels = {}
    forEach(keys, function (key) {
      values[key] = document.querySelectorAll('[data-cd="' + key + '"]')
      labels[key] = document.querySelectorAll('[data-cd-label="' + key + '"]')
    })

    /**
     * Обновляем цифру и подпись. Класс is-tick даёт короткий «удар» —
     * ставим его только когда значение реально сменилось, иначе секунды
     * дёргались бы на каждом тике вхолостую.
     */
    function put(key, text, count) {
      forEach(values[key], function (value) {
        if (value.textContent === text) return
        value.textContent = text

        if (prefersReducedMotion) return
        value.classList.remove('is-tick')
        // Без принудительного пересчёта браузер не заметит смены класса
        // и не перезапустит анимацию.
        void value.offsetWidth
        value.classList.add('is-tick')
      })

      var word = pluralRu(count, plural[key])
      forEach(labels[key], function (label) {
        if (label.textContent !== word) label.textContent = word
      })
    }

    var timer = null

    function tick() {
      var diff = target - Date.now()
      if (diff < 0) diff = 0

      var days = Math.floor(diff / 86400000)
      var hours = Math.floor(diff / 3600000) % 24
      var minutes = Math.floor(diff / 60000) % 60
      var seconds = Math.floor(diff / 1000) % 60

      put('days', String(days), days)
      put('hours', pad2(hours), hours)
      put('minutes', pad2(minutes), minutes)
      put('seconds', pad2(seconds), seconds)

      if (srLine) {
        srLine.textContent = diff
          ? 'До свадьбы осталось ' + days + ' ' + pluralRu(days, plural.days) + '.'
          : 'Свадьба уже началась.'
      }

      // Дата прошла — обновлять больше нечего.
      if (!diff && timer) {
        clearInterval(timer)
        timer = null
      }
    }

    tick()
    timer = setInterval(tick, 1000)
  }

  /* ------------------------------------------------------------------
     Копирование в буфер
     ------------------------------------------------------------------ */

  /** Резервный путь: нужен для file:// и старых браузеров без Clipboard API. */
  function legacyCopy(text) {
    try {
      var area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', 'readonly')
      area.style.position = 'fixed'
      area.style.top = '-1000px'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      var ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch (err) {
      return false
    }
  }

  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).catch(function () {
        legacyCopy(text)
      })
      return
    }
    legacyCopy(text)
  }

  /* ------------------------------------------------------------------
     Короткие уведомления
     ------------------------------------------------------------------ */
  var toastTimer = null

  function say(text) {
    var toast = document.querySelector('[data-toast]')
    if (!toast) return
    toast.textContent = text
    toast.classList.add('is-on')
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-on')
    }, 3400)
  }

  /* ------------------------------------------------------------------
     RSVP.

     Два пути, и второй всегда наготове:
       1) если в конфиге заполнен бот — страница отправляет ответ сама
          запросом к Telegram (единственный сетевой вызов на всей странице);
       2) если бот не настроен или запрос не прошёл — текст кладётся в буфер
          обмена, и гость отправляет его сам, открыв чат.
     ------------------------------------------------------------------ */

  /**
   * Отправка ответа боту. Возвращает false, если отправлять нечем —
   * тогда вызывающий код идёт по запасному пути.
   */
  function sendToBot(message, done) {
    var bot = CFG.bot || {}
    if (!bot.token || !bot.chatId || typeof fetch !== 'function') return false

    fetch('https://api.telegram.org/bot' + bot.token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: bot.chatId, text: message }),
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        done(!!(data && data.ok))
      })
      .catch(function () {
        // Нет сети, заблокирован API, строгий CSP — неважно: есть запасной путь.
        done(false)
      })

    return true
  }

  function initRsvp() {
    var nameInput = document.querySelector('[data-rsvp-name]')
    var guestsSelect = document.querySelector('[data-rsvp-guests]')
    var guestsField = document.querySelector('[data-rsvp-guests-field]')
    var answerButtons = document.querySelectorAll('[data-rsvp-answer]')
    var preview = document.querySelector('[data-rsvp-preview]')
    var sendLink = document.querySelector('[data-rsvp-send]')
    var copyButton = document.querySelector('[data-rsvp-copy]')
    var doneLine = document.querySelector('[data-rsvp-done]')

    if (!answerButtons.length && !preview) return

    var texts = CFG.rsvpText || {}
    var answer = 'yes'

    function buildMessage() {
      var name = nameInput ? nameInput.value.trim() : ''
      var guests = guestsSelect ? parseInt(guestsSelect.value, 10) || 1 : 1

      var greeting = name
        ? String(texts.greetWithName || '').replace('{name}', name)
        : String(texts.greet || '')
      var body = answer === 'yes' ? texts.yes : texts.no
      // Число имеет смысл только при «буду» и только если гость не один.
      var tail = ''
      if (answer === 'yes' && guests > 1) {
        tail =
          ' ' +
          String(texts.count || '')
            .replace('{count}', String(guests))
            .replace('{word}', pluralRu(guests, (CFG.plural || {}).people))
      }

      return (greeting + ' ' + (body || '') + tail).trim()
    }

    function sync() {
      if (preview) preview.textContent = buildMessage()

      // Число гостей спрашиваем только у тех, кто едет.
      if (guestsField) guestsField.classList.toggle('is-off', answer !== 'yes')

      forEach(answerButtons, function (button) {
        var isActive = button.getAttribute('data-rsvp-answer') === answer
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
      })
    }

    forEach(answerButtons, function (button) {
      button.addEventListener('click', function () {
        var picked = button.getAttribute('data-rsvp-answer') === 'no' ? 'no' : 'yes'
        if (picked === 'yes') sprinkle(button)
        answer = picked
        sync()
      })
    })

    if (nameInput) nameInput.addEventListener('input', sync)
    if (guestsSelect) guestsSelect.addEventListener('change', sync)

    /**
     * Если прямая отправка не удалась, следующий клик по кнопке уже не
     * перехватываем: пусть работает как обычная ссылка и открывает чат.
     * Открывать чат сразу из обработчика ответа нельзя — окно, открытое
     * не по клику, браузер заблокирует.
     */
    var directBroken = false

    if (sendLink) {
      sendLink.addEventListener('click', function (event) {
        var message = buildMessage()

        if (directBroken) {
          copyText(message)
          say('Текст скопирован - вставьте его в чат и отправьте.')
          return
        }

        var sending = sendToBot(message, function (ok) {
          if (ok) {
            if (doneLine) doneLine.classList.add('is-on')
            say('Ответ отправлен. Спасибо!')
            return
          }

          directBroken = true
          copyText(message)
          say('Отправить не вышло - текст скопирован, нажмите ещё раз, чтобы открыть чат.')
        })

        if (sending) {
          // Отправляем сами — уходить со страницы не нужно.
          event.preventDefault()
          say('Отправляем ответ…')
          return
        }

        // Бот не настроен: Telegram не умеет принимать текст в ссылке на
        // личный чат, поэтому кладём его в буфер и не мешаем переходу.
        copyText(message)
        say('Текст ответа скопирован - вставьте его в чат и отправьте.')
      })
    }

    if (copyButton) {
      copyButton.addEventListener('click', function () {
        copyText(buildMessage())
        say('Скопировано.')
      })
    }

    sync()
  }

  /* ------------------------------------------------------------------
     Событие в календарь (.ics собирается прямо в браузере)
     ------------------------------------------------------------------ */

  function icsEscape(value) {
    return String(value)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n')
  }

  /** 2026-08-29T12:05:00.000Z -> 20260829T120500Z */
  function icsStamp(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  /**
   * Складывание длинных строк по RFC 5545: не больше ~75 байт на строку,
   * продолжение начинается с пробела. Считаем именно байты — кириллица в
   * UTF-8 занимает по два.
   */
  function icsFold(line) {
    var encoder = typeof TextEncoder === 'function' ? new TextEncoder() : null
    if (!encoder) return line

    var chars = Array.from(line)
    var parts = []
    var current = ''
    var bytes = 0

    for (var i = 0; i < chars.length; i++) {
      var size = encoder.encode(chars[i]).length
      // У строк-продолжений первый байт занимает ведущий пробел.
      var limit = parts.length ? 71 : 72
      if (bytes + size > limit) {
        parts.push(current)
        current = ''
        bytes = 0
      }
      current += chars[i]
      bytes += size
    }
    parts.push(current)

    return parts.join('\r\n ')
  }

  function initCalendar() {
    var button = document.querySelector('[data-ics]')
    if (!button || !CFG.ceremonyISO) return

    button.addEventListener('click', function () {
      var calendar = CFG.calendar || {}
      var start = new Date(CFG.ceremonyISO)
      var end = new Date(CFG.partyEndISO || CFG.ceremonyISO)
      var summary = calendar.summary || 'Свадьба'

      var lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//wedding-invitation//RU',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:wedding-' + icsStamp(start) + '@invitation.local',
        'DTSTAMP:' + icsStamp(new Date()),
        'DTSTART:' + icsStamp(start),
        'DTEND:' + icsStamp(end),
        'SUMMARY:' + icsEscape(summary),
        'LOCATION:' + icsEscape(calendar.location || ''),
        'DESCRIPTION:' + icsEscape(calendar.description || ''),
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:-P1D',
        'DESCRIPTION:' + icsEscape(summary),
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ]

      var body = lines.map(icsFold).join('\r\n') + '\r\n'
      var blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
      var url = URL.createObjectURL(blob)
      var link = document.createElement('a')

      link.href = url
      link.download = 'svadba-29-08-2026.ics'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(function () {
        URL.revokeObjectURL(url)
      }, 2000)

      say('Файл события скачан - откройте его, чтобы добавить в календарь.')
    })
  }

  /* ------------------------------------------------------------------
     Старт
     ------------------------------------------------------------------ */
  /**
   * Каждый блок поднимаем отдельно и в try/catch: страница под открыткой
   * заблокирована, и падение, скажем, отсчёта не должно оставить гостя
   * перед закрытой заставкой. Заставка идёт первой по той же причине.
   */
  function start() {
    var blocks = [
      initTheme,
      initEnvelope,
      initReveal,
      initStickyBar,
      initCountdown,
      initRsvp,
      initCalendar,
    ]

    forEach(blocks, function (init) {
      try {
        init()
      } catch (err) {
        // Молча: один неработающий блок лучше пустой страницы.
      }
    })
  }

  // Скрипт стоит перед </body>, но на всякий случай не полагаемся на это.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }
})()

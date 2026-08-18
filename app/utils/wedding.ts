// ЕДИНЫЙ ИСТОЧНИК ДАННЫХ приглашения.
//
// Всё, что может понадобиться поменять, лежит здесь. Компоненты только
// отображают эти данные, а часть полей уезжает в браузер JSON-блоком
// (см. app.vue → #wedding-config), чтобы invite.js не дублировал конфиг.

export interface Venue {
  /** Короткая подпись над названием: «Роспись», «Празднование» */
  kind: string
  /** Название места */
  name: string
  /** Уточнение: конкретный зал или тип места */
  subtitle: string
  /** Время, показываемое на карточке */
  time: string
  /** Адрес одной строкой */
  address: string
  /** 1–2 предложения о месте */
  about: string
  /** Официальный сайт места */
  site: string
  /** Подпись для ссылки на сайт */
  siteLabel: string
  /** Поисковый запрос для карт (по названию, а не по дому — так надёжнее) */
  mapQuery: string
  /**
   * Готовая ссылка на точку в Яндекс.Картах. Если задана, кнопка ведёт
   * именно на неё, а не на поиск по mapQuery: точная метка надёжнее.
   */
  mapUrl?: string
}

export interface TimelineItem {
  time: string
  title: string
  place: string
  note: string
  /** Ключевые точки дня выделяются визуально */
  accent?: boolean
}

/** Вариант «мне всё равно»: гасит остальные пункты в своей группе. */
export const ANY_KIND = 'Не важно'

export interface DrinkOption {
  id: string
  label: string
  /** Занимает всю строку: длинную подпись иначе рвёт на две. */
  wide?: boolean
  /** Уточнение: сорта или виды. Показывается, только если пункт отмечен. */
  kinds?: { title: string; items: readonly string[] }
}

export interface Wish {
  title: string
  text: string
  /** Необязательная ссылка под текстом просьбы */
  link?: { href: string; label: string }
}

/**
 * Русское склонение после числа: 1 день / 2 дня / 5 дней.
 * Используется при пререндере; в invite.js есть такая же четырёхстрочная
 * функция, а сами словоформы приходят из общего конфига — так что
 * расходиться могут только правила, но не слова.
 */
export function pluralRu(n: number, forms: readonly [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (last > 1 && last < 5) return forms[1]
  if (last === 1) return forms[0]
  return forms[2]
}

/** Поисковая ссылка на Яндекс.Карты. */
export function yandexMapUrl(query: string): string {
  return `https://yandex.by/maps/?text=${encodeURIComponent(query)}`
}

/** Поисковая ссылка на Google Maps. */
export function googleMapUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export const WEDDING = {
  groom: 'Евгений',
  bride: 'Карина',
  /** Родительный падеж — нужен там, где имя стоит после слова: «свадьба Евгения и Карины». */
  groomGenitive: 'Евгения',
  brideGenitive: 'Карины',
  monogram: 'Е & К',

  date: {
    day: '29',
    month: '08',
    /** Месяц в родительном падеже: «29 августа» на первом экране. */
    monthGenitive: 'августа',
    year: '2026',
    human: '29 августа 2026 года',
    weekday: 'суббота',
  },

  /**
   * Момент церемонии с ЖЁСТКИМ смещением Минска (+03:00).
   * Именно жёсткий offset, а не локальное время: иначе гость из другого
   * часового пояса увидел бы сдвинутый обратный отсчёт.
   */
  ceremonyISO: '2026-08-29T15:05:00+03:00',
  /** Ориентировочный конец праздника — нужен для события в календаре. */
  partyEndISO: '2026-08-29T23:00:00+03:00',

  rsvpDeadline: '20 августа',

  // ─────────────────────────────────────────────────────────────────────
  // ЗАМЕНИТЕ ЭТИ ТРИ СТРОКИ на свои контакты — это единственное, что
  // обязательно нужно поправить перед отправкой приглашения гостям.
  // ─────────────────────────────────────────────────────────────────────
  contacts: {
    /** Telegram, куда приходят ответы гостей */
    telegram: 'https://t.me/eugeny_kurda',
    /** Как показывать ник в тексте */
    telegramHuman: '@eugeny_kurda',
    /** Телефоны для звонка: tel — для ссылки, human — для показа. */
    phones: [
      { name: 'Женя', tel: '+375336028406', human: '+375 (33) 602-84-06' },
      { name: 'Карина', tel: '+375447817269', human: '+375 (44) 781-72-69' },
    ],
  },

  /** Автобус для гостей: туда от места росписи и обратно в Минск. */
  transfer: {
    from: 'от комплекса «Лошицкий»',
    /** Окно посадки: автобус стоит и ждёт гостей. */
    time: '15:40–16:00',
    distance: '~25 км',
    duration: '30–40 минут',
    /** Обратный рейс: время отправления из усадьбы и куда привезёт. */
    backTime: '00:00',
    backTo: 'для тех, кто уезжает',
    /** Ночёвка в усадьбе для тех, кто остаётся. */
    stay: 'Можно остаться с ночёвкой: в усадьбе есть места на 10-11 человек.',
    note: 'Трансфер подадут к выходу из зала после фотосессии. В полночь он увезёт в Минск, до площади Победы, всех, кто соберётся домой.',
  },

  venues: {
    ceremony: {
      kind: 'Роспись',
      name: 'Комплекс «Лошицкий»',
      subtitle: 'зал торжественных церемоний',
      time: '15:05',
      address: 'Минск, Лошицкий парк, проезд Чижевских',
      about:
        'Историко-культурный комплекс в сердце Лошицкого парка: старинные постройки, вековые деревья и больше ста гектаров зелени вокруг.',
      site: 'https://loshitski.by/',
      siteLabel: 'loshitski.by',
      mapQuery: 'комплекс Лошицкий Минск проезд Чижевских',
      mapUrl: 'https://yandex.by/maps/-/CTgKb8Py',
    } satisfies Venue,
    party: {
      kind: 'Празднование',
      name: 'Агроусадьба «Дворъ»',
      subtitle: 'банкет и вечер',
      time: '16:30',
      address: 'Минская обл., Смолевичский р-н, д. Задворье, ул. Озерная, 25Б',
      about:
        'Дом в эко-стиле на полуострове водохранилища: вода с трёх сторон, сосны и летняя терраса. Примерно 25 км от Минска.',
      site: 'https://dvorbel.by/',
      siteLabel: 'dvorbel.by',
      mapQuery: 'агроусадьба Дворъ Задворье Озерная 25Б',
    } satisfies Venue,
  },

  timeline: [
    {
      time: '14:40',
      title: 'Сбор гостей',
      place: 'комплекс «Лошицкий»',
      note: 'Приезжайте чуть заранее - успеем обняться до церемонии.',
    },
    {
      time: '15:05',
      title: 'Церемония росписи',
      place: 'зал торжественных церемоний',
      note: 'Главные пять минут дня. Очень просим не опаздывать.',
      accent: true,
    },
    {
      time: '15:40',
      title: 'Фотосессия',
      place: 'у комплекса «Лошицкий»',
      note: 'Общие кадры - будем звать всех.',
    },
    {
      time: '16:00',
      title: 'Переезд в усадьбу',
      place: 'д. Задворье, ~25 км',
      note: '30–40 минут в пути. Трансфер для гостей.',
    },
    {
      time: '16:30',
      title: 'Банкет',
      place: 'агроусадьба «Дворъ»',
      note: 'Ужин, тосты и самые тёплые слова.',
      accent: true,
    },
    {
      time: 'вечер',
      title: 'Танцы и торт',
      place: 'летняя терраса',
      note: 'Танцуем до последнего гостя.',
    },
    {
      time: '00:00',
      title: 'Трансфер домой',
      place: 'до площади Победы',
      note: 'Для тех, кто уезжает. Остальные остаются ночевать в усадьбе.',
    },
  ] satisfies TimelineItem[],

  /** Суперигра вечера. Вынесена из программы отдельным блоком: так заметнее. */
  superGame: {
    text: 'В разгар вечера устроим суперигру. Вход - 20 рублей, участие по желанию: весь банк достаётся победителю.',
    entry: '20 рублей',
    entryNote: 'вход, по желанию',
    prize: 'весь банк',
    prizeNote: 'забирает победитель',
  },

  dressCode: {
    title: 'Свободный стиль',
    text: 'Дресс-кода у нас нет - приходите в том, в чём вам красиво и удобно. Единственная просьба: выбирайте удобную обувь. Часть дня пройдёт в беседке, часть на улице.',
  },

  /**
   * ПРЯМАЯ ОТПРАВКА ОТВЕТА В TELEGRAM (необязательно).
   *
   * Значения берутся из .env (см. .env.example) и в репозиторий не попадают.
   * Пока они пустые, кнопка ответа работает по-старому: копирует текст и
   * открывает чат. Если заполнить — страница отправит ответ сама, а
   * копирование останется запасным путём.
   *
   * ВАЖНО: при сборке токен всё равно вклеивается в HTML-файл, который вы
   * разошлёте гостям, — прочитать его сможет любой, кто откроет исходник
   * страницы. .env защищает только от публичного репозитория. Заводите
   * ОТДЕЛЬНОГО бота под приглашение и после свадьбы отзывайте токен:
   * @BotFather → /revoke.
   */
  rsvpBot: {
    token: import.meta.env.VITE_RSVP_BOT_TOKEN ?? '',
    chatId: import.meta.env.VITE_RSVP_BOT_CHAT_ID ?? '',
  },

  /** Заготовки текста ответа. Собираются в rsvpMessage() и в invite.js. */
  rsvpText: {
    greetWithName: 'Привет! Это {name}.',
    greet: 'Привет!',
    yes: 'Буду на свадьбе 29 августа 🌿',
    no: 'К сожалению, не смогу приехать 29 августа. Обнимаю!',
    /**
     * Добавляется, только если гостей больше одного и ответ «буду».
     * {word} — склонение слова «человек» по числу.
     */
    count: 'Нас будет {count} {word}, включая меня.',
    /** Добавляется, если гость отметил напитки. */
    drinks: 'Напитки: {drinks}.',
    /** Добавляется, если гость написал пожелания по блюдам. */
    note: 'По блюдам: {note}',
  },

  /**
   * Опрос про напитки. Нужен, чтобы посчитать бар, поэтому варианты
   * намеренно крупные: подробности гость допишет в примечании.
   */
  drinks: {
    title: 'Что будете пить?',
    note: 'Можно выбрать несколько вариантов - так мы точнее рассчитаем бар.',
    /**
     * Тип задан явно: подварианты есть не у каждого пункта, и без общего
     * типа обращение к option.kinds стало бы ошибкой на объединении литералов.
     */
    options: [
      {
        id: 'strong',
        label: 'Крепкий алкоголь',
        wide: true,
        kinds: {
          title: 'Что именно?',
          items: ['Водка', 'Коньяк', 'Виски', 'Бренди', 'Ром', 'Джин', ANY_KIND],
        },
      },
      {
        id: 'wine',
        label: 'Вино',
        kinds: {
          title: 'Какое вино?',
          items: [
            'Красное сухое',
            'Красное полусладкое',
            'Белое сухое',
            'Белое полусладкое',
            ANY_KIND,
          ],
        },
      },
      { id: 'sparkling', label: 'Игристое' },
      /** «Не важно» и «Без алкоголя» гасят остальные пункты и друг друга. */
      { id: 'any', label: 'Не важно' },
      { id: 'soft', label: 'Без алкоголя' },
    ] as readonly DrinkOption[],
  },

  /**
   * Тип задан явно: у первой просьбы есть ссылка, у второй нет, и без общего
   * типа обращение к wish.link стало бы ошибкой на объединении литералов.
   */
  wishes: [
    {
      title: 'Вместо цветов',
      text: 'Не тратьтесь, пожалуйста, на букеты - они не доживут даже до конца вечера. Если хочется сделать в наш день что-то доброе, поддержите сбор по ссылке ниже: важна любая сумма, и для нас это будет самым дорогим подарком.',
      link: {
        href: 'https://www.instagram.com/artemka_help.korbal/',
        label: 'Страница сбора',
      },
    },
    {
      title: 'О подарках',
      text: 'Лучший подарок для нас - то, что вы будете рядом в этот день. Ничего сверх этого мы не ждём: приезжайте с хорошим настроением, а остальное решайте сами - любой вашей идее будем рады.',
    },
  ] as readonly Wish[],
} as const

/** Текст ответа гостя. Ничего не отправляет — только собирает строку. */
export function rsvpMessage(name: string, answer: 'yes' | 'no', guests = 1): string {
  const t = WEDDING.rsvpText
  const clean = name.trim()

  const greet = clean ? t.greetWithName.replace('{name}', clean) : t.greet
  const body = answer === 'yes' ? t.yes : t.no
  // Число имеет смысл только при «буду» и только если гость не один.
  const tail =
    answer === 'yes' && guests > 1
      ? ` ${t.count
          .replace('{count}', String(guests))
          .replace('{word}', pluralRu(guests, PEOPLE_PLURAL))}`
      : ''

  return `${greet} ${body}${tail}`
}

/** Сколько гостей можно указать в ответе. Больше усадьба всё равно уточнит лично. */
export const MAX_GUESTS = 8

/** Словоформы для списка: «1 гость», «2 гостя», «5 гостей». */
export const GUEST_PLURAL = ['гость', 'гостя', 'гостей'] as const

/** Словоформы для текста ответа: «3 человека», «5 человек». */
export const PEOPLE_PLURAL = ['человек', 'человека', 'человек'] as const

/** Словоформы для чисел отсчёта. Уезжают и в браузер — см. weddingClientConfig. */
export const COUNTDOWN_PLURAL = {
  days: ['день', 'дня', 'дней'],
  hours: ['час', 'часа', 'часов'],
  minutes: ['минута', 'минуты', 'минут'],
  seconds: ['секунда', 'секунды', 'секунд'],
} as const

export interface CountdownUnit {
  key: 'days' | 'hours' | 'minutes' | 'seconds'
  /** Готовая строка: дни без ведущего нуля, остальное — двумя цифрами. */
  value: string
  label: string
}

/**
 * Значения отсчёта на переданный момент. Считаются при пререндере, чтобы
 * страница никогда не показывала прочерки; дальше их раз в секунду
 * перезаписывает invite.js.
 */
export function countdownUnits(now: number = Date.now()): CountdownUnit[] {
  const diff = Math.max(0, new Date(WEDDING.ceremonyISO).getTime() - now)

  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor(diff / 3_600_000) % 24
  const minutes = Math.floor(diff / 60_000) % 60
  const seconds = Math.floor(diff / 1000) % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  return [
    { key: 'days', value: String(days), label: pluralRu(days, COUNTDOWN_PLURAL.days) },
    { key: 'hours', value: pad(hours), label: pluralRu(hours, COUNTDOWN_PLURAL.hours) },
    { key: 'minutes', value: pad(minutes), label: pluralRu(minutes, COUNTDOWN_PLURAL.minutes) },
    { key: 'seconds', value: pad(seconds), label: pluralRu(seconds, COUNTDOWN_PLURAL.seconds) },
  ]
}

/** Поля, которые уезжают в браузер для invite.js. Ничего личного сверх того, что и так на странице. */
export function weddingClientConfig() {
  return {
    ceremonyISO: WEDDING.ceremonyISO,
    partyEndISO: WEDDING.partyEndISO,
    groom: WEDDING.groom,
    bride: WEDDING.bride,
    rsvpText: WEDDING.rsvpText,
    /** Пустые поля — прямая отправка выключена, работает копирование. */
    bot: WEDDING.rsvpBot,
    plural: { ...COUNTDOWN_PLURAL, people: PEOPLE_PLURAL },
    calendar: {
      summary: `Свадьба ${WEDDING.groomGenitive} и ${WEDDING.brideGenitive}`,
      location: `${WEDDING.venues.ceremony.name}, ${WEDDING.venues.ceremony.address}`,
      description: `Церемония в 15:05 - ${WEDDING.venues.ceremony.name}. Празднование с 16:30 - ${WEDDING.venues.party.name}, ${WEDDING.venues.party.address}.`,
    },
  }
}

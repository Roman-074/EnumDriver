/* Prototype catalog: every screen of the spec (M1–M23) and every state worth showing.
   Each entry builds a fresh mock state and a navigation stack so it can be opened
   live in the device or rendered statically on the overview board. */
(function () {
  const ET = window.ET, D = ET.data;
  const C = (ET.catalog = []);
  ET.groups = [
    ['auth', 'Вход и регистрация', 'M1–M5'],
    ['order', 'Услуги и оформление', 'M6, M8, M10'],
    ['pay', 'Оплата', 'M14–M16'],
    ['orders', 'Заказы', 'M17–M18'],
    ['profile', 'Профиль', 'M19, M23'],
    ['common', 'Общие состояния', 'M0']
  ];
  const user = function (S) { ET.signIn(S, D.defaultUser.email); };
  /* no guest mode: every screen after M1–M5 is shown for a signed-in client */
  function add(g, id, label, fn) {
    C.push({ g: g, id: id, label: label, fn: g === 'auth' ? fn : function (S) { user(S); return fn(S); } });
  }
  const sample = function (S) { S.draft = D.sampleDraft(S.lang); };
  const by = function (lang, o) { return o[lang] || o.ru; };
  const M8 = ['m8', {}, { price: 'ready' }];
  function withOrder(S, patch) {
    user(S); sample(S);
    const o = ET.ensureOrder(S);
    Object.assign(o, patch || {});
    return o;
  }

  /* ---------- M1–M5 ---------- */
  add('auth', 'm1-first', 'M1 · Сплэш (первый запуск) → M2', function () { return { stack: [['m1']] }; });
  add('auth', 'm2', 'M2 · Вход по email', function () { return { stack: [['m2']] }; });
  add('auth', 'm2-format', 'M2 · Некорректный email', function () { return { stack: [['m2', {}, { email: 'm.shapiro@gmail', err: 'format' }]] }; });
  add('auth', 'm2-notfound', 'M2 · Аккаунт не найден → M5', function () { return { stack: [['m2', {}, { email: 'new.client@gmail.com', err: 'notfound' }]] }; });
  add('auth', 'm2-limit', 'M2 · Лимит отправок', function () { return { stack: [['m2', {}, { email: 'm.shapiro@gmail.com', err: 'limit' }]] }; });
  add('auth', 'm2-net', 'M2 · Нет сети / ошибка сервера', function () { return { stack: [['m2', {}, { email: 'm.shapiro@gmail.com', err: 'network' }]] }; });
  const m4 = function (L) { return { stack: [['m2', {}, { email: D.defaultUser.email }], ['m4', { email: D.defaultUser.email, mode: 'login' }, Object.assign({ frozen: true }, L)]] }; };
  add('auth', 'm4', 'M4 · Код из email, таймер', function () { return m4({ code: '4829', left: 47 }); });
  add('auth', 'm4-wrong', 'M4 · Неверный код', function () { return m4({ err: 'wrong', attempts: 1, left: 31 }); });
  add('auth', 'm4-expired', 'M4 · Код истёк', function () { return m4({ code: '381920', err: 'expired', left: 0 }); });
  add('auth', 'm4-locked', 'M4 · Превышен лимит попыток', function () { return m4({ err: 'locked', attempts: 3, left: 0 }); });
  add('auth', 'm4-resend', 'M4 · Можно отправить повторно', function () { return m4({ left: 0 }); });
  add('auth', 'm5', 'M5 · Регистрация', function () { return { stack: [['m2'], ['m5']] }; });
  add('auth', 'm5-errors', 'M5 · Ошибки заполнения', function () { return { stack: [['m2'], ['m5', {}, { email: 'anna@gmail', errs: { name: true, email: true, agree: true } }]] }; });
  add('auth', 'm5-exists', 'M5 · Email уже зарегистрирован', function (S) {
    return { stack: [['m2'], ['m5', {}, { name: by(S.lang, { ru: 'Михаил Шапиро', en: 'Michael Shapiro', he: 'מיכאל שפירא' }), email: D.defaultUser.email, agree: true, fail: 'exists' }]] };
  });
  add('auth', 'm5-send', 'M5 · Ошибка отправки кода', function (S) {
    return { stack: [['m2'], ['m5', {}, { name: by(S.lang, { ru: 'Анна Коган', en: 'Anna Kogan', he: 'אנה כוגן' }), email: 'anna.kogan@gmail.com', agree: true, fail: 'send' }]] };
  });

  /* ---------- M6, M8, M10 ---------- */
  add('order', 'm6', 'M6 · Услуги', function () { return { stack: [['m6', { state: 'ready' }]] }; });
  add('order', 'm6-loading', 'M6 · Загрузка справочника', function () { return { stack: [['m6', { state: 'loading' }, { frozen: true }]] }; });
  add('order', 'm6-error', 'M6 · Ошибка загрузки справочника', function () { return { stack: [['m6', { state: 'error' }]] }; });
  add('order', 'm8', 'M8 · Маршрут и цены', function (S) { sample(S); return { stack: [['m6'], M8] }; });
  add('order', 'm8-usd', 'M8 · Цены в долларах (валюта из профиля)', function (S) { sample(S); S.currency = 'USD'; return { stack: [['m6'], M8] }; });
  add('order', 'm8-loading', 'M8 · Пересчёт цены', function (S) { sample(S); return { stack: [['m6'], ['m8', {}, { price: 'loading', frozen: true }]] }; });
  add('order', 'm8-error', 'M8 · Ошибка расчёта цены', function (S) { sample(S); return { stack: [['m6'], ['m8', {}, { price: 'error' }]] }; });
  add('order', 'm8-same', 'M8 · Точки совпадают', function (S) { sample(S); S.draft.to = 'telaviv'; return { stack: [['m6'], ['m8']] }; });
  const m10 = function (S, L, field) { sample(S); return { stack: [['m6'], M8, ['m10', { field: field || 'from' }, L]] }; };
  add('order', 'm10', 'M10 · Поиск города — недавние', function (S) { return m10(S, {}); });
  add('order', 'm10-results', 'M10 · Поиск города — результаты', function (S) { return m10(S, { q: by(S.lang, { ru: 'тель', en: 'tel', he: 'תל' }) }, 'to'); });
  add('order', 'm10-loading', 'M10 · Поиск города — загрузка', function (S) { return m10(S, { q: by(S.lang, { ru: 'хайф', en: 'haif', he: 'חיפ' }), state: 'loading', frozen: true }, 'to'); });
  add('order', 'm10-empty', 'M10 · Города не найдены', function (S) { return m10(S, { q: by(S.lang, { ru: 'Кфар-Эц', en: 'Kfar Ets', he: 'כפר עץ' }) }); });
  add('order', 'm10-error', 'M10 · Нет подключения', function (S) { return m10(S, { q: by(S.lang, { ru: 'хайф', en: 'haif', he: 'חיפ' }), state: 'error' }); });

  /* ---------- M14–M16 ---------- */
  add('pay', 'm14-creating', 'M14 · Шторка: создание заказа', function (S) {
    sample(S); return { stack: [['m6'], M8], sheet: { name: 'payment', data: { phase: 'creating', frozen: true } } };
  });
  add('pay', 'm14', 'M14 · Шторка: переход к оплате 3DS', function (S) {
    const o = withOrder(S); return { stack: [['m6'], M8], sheet: { name: 'payment', data: { phase: 'ready', orderId: o.id } } };
  });
  add('pay', 'm14-error', 'M14 · Шторка: ссылка на оплату не получена', function (S) {
    const o = withOrder(S); return { stack: [['m6'], M8], sheet: { name: 'payment', data: { phase: 'error', orderId: o.id } } };
  });
  add('pay', 'm14-3ds', 'M14 · Внешний браузер (3DS)', function (S) {
    const o = withOrder(S);
    return { stack: [['m6'], M8], sheet: { name: 'browser', data: { kind: '3ds', orderId: o.id, outcome: 'success' } } };
  });
  add('pay', 'm15', 'M15 · Проверка статуса оплаты', function (S) { const o = withOrder(S); return { stack: [['m6'], M8, ['m15', { orderId: o.id, outcome: 'success' }, { frozen: true }]] }; });
  add('pay', 'm15-failed', 'M15 · Платёж отклонён', function (S) { const o = withOrder(S, { pay: 'unpaid' }); return { stack: [['m6'], M8, ['m15', { orderId: o.id }, { phase: 'failed' }]] }; });
  add('pay', 'm15-cancelled', 'M15 · 3DS отменён пользователем', function (S) { const o = withOrder(S, { pay: 'unpaid' }); return { stack: [['m6'], M8, ['m15', { orderId: o.id }, { phase: 'cancelled' }]] }; });
  add('pay', 'm16', 'M16 · Оплата прошла', function (S) {
    const o = withOrder(S, { pay: 'succeeded', status: 'awaiting_confirmation', paidAt: '19.10 · 14:22' });
    return { stack: [['m6'], ['m16', { orderId: o.id }]] };
  });
  /* ---------- M17–M18 ---------- */
  add('orders', 'm17', 'M17 · Активные заказы', function (S) { user(S); return { stack: [['m17']] }; });
  add('orders', 'm17-done', 'M17 · Завершённые', function (S) { user(S); return { stack: [['m17', { seg: 'done' }]] }; });
  add('orders', 'm17-more', 'M17 · Порционная загрузка истории', function (S) { user(S); return { stack: [['m17', { seg: 'done' }, { more: true, frozen: true }]] }; });
  add('orders', 'm17-empty', 'M17 · Пустой список', function (S) { ET.signIn(S, 'anna.kogan@gmail.com', by(S.lang, { ru: 'Анна Коган', en: 'Anna Kogan', he: 'אנה כוגן' }), true); return { stack: [['m17']] }; });
  add('orders', 'm17-loading', 'M17 · Загрузка', function (S) { user(S); return { stack: [['m17', { state: 'loading' }, { frozen: true }]] }; });
  add('orders', 'm17-error', 'M17 · Ошибка загрузки', function (S) { user(S); return { stack: [['m17', { state: 'error' }]] }; });
  [
    ['ET-10428', 'Ожидает оплаты / не оплачено'], ['ET-10446', 'Ожидает подтверждения'], ['ET-10419', 'Подтверждён'],
    ['ET-10431', 'Водитель назначен'], ['ET-10322', 'Отклонён · возврат в процессе'], ['ET-10344', 'Отменён · возвращено'], ['ET-10388', 'Завершён']
  ].forEach(function (x) {
    add('orders', 'm18-' + x[0].slice(3), 'M18 · ' + x[1], function (S) { user(S); return { stack: [['m17'], ['m18', { orderId: x[0] }]] }; });
  });

  /* ---------- M19 (reduced) · M23 ---------- */
  add('profile', 'm19', 'M19 · Профиль', function (S) { user(S); return { stack: [['m19']] }; });
  add('profile', 'm20', 'M20 · Язык (как в таксометре)', function () { return { stack: [['m19'], ['m20']] }; });
  add('profile', 'cur', 'Валюта (как в таксометре)', function () { return { stack: [['m19'], ['cur']] }; });
  add('profile', 'm23', 'M23 · Удаление аккаунта', function (S) { user(S); return { stack: [['m19'], ['m23']] }; });
  add('profile', 'm23-confirm', 'M23 · Подтверждение удаления', function (S) { user(S); return { stack: [['m19'], ['m23']], sheet: { name: 'deleteConfirm' } }; });
  add('profile', 'm23-blocked', 'M23 · Блокировка: активный заказ', function (S) { user(S); return { stack: [['m19'], ['m23']], sheet: { name: 'deleteBlocked', data: { id: 'ET-10431' } } }; });
  add('profile', 'm23-error', 'M23 · Ошибка удаления', function (S) { user(S); return { stack: [['m19'], ['m23']], sheet: { name: 'deleteError' } }; });
  add('profile', 'm23-done', 'M23 · Аккаунт удалён → M2', function (S) { user(S); S.orders = []; return { stack: [['m19'], ['m23']], sheet: { name: 'deleteDone' } }; });

  /* ---------- M0 common ---------- */
  add('common', 'offline-m6', 'Нет сети · главный экран', function (S) { S.net = 'offline'; return { stack: [['m6', { state: 'ready' }]] }; });
  add('common', 'offline-m8', 'Нет сети · оформление', function (S) { S.net = 'offline'; sample(S); return { stack: [['m6'], ['m8', {}, { price: 'error' }]] }; });

  /* build a state for an entry */
  ET.buildEntry = function (entry, lang) {
    const S = ET.newState(lang);
    const r = entry.fn(S) || {};
    return { S: S, stack: r.stack, sheet: r.sheet };
  };
  ET.findEntry = function (id) { return C.find(function (e) { return e.id === id; }); };
})();

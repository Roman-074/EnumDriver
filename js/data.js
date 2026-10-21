/* EMUN TAXI — local mock data (no backend). Everything a real API would return lives here:
   served points, car classes, fixed tariffs, order history, accounts. */
(function () {
  const ET = (window.ET = window.ET || {});
  const D = (ET.data = {});

  /* Fixed "now" so the demo is deterministic. Wall-clock time in Israel (Asia/Jerusalem). */
  D.NOW = { date: '2026-10-19', time: '14:20' };
  D.MIN_LEAD_MIN = 180;        // earliest pickup: now + 3 h
  D.HORIZON_DAYS = 60;         // bookable window
  D.NIGHT = { from: 21 * 60, to: 6 * 60 }; // night tariff 21:00–06:00 (assumption, see README)
  D.NIGHT_K = 1.25;

  /* ---------- served points ---------- */
  // type: city | airport | port | resort ; region keys are translated in i18n (reg.*)
  const pts = [
    ['tlv', 'airport', 'center', 32.0055, 34.8854, ['Аэропорт Бен-Гурион', 'Ben Gurion Airport', 'נמל התעופה בן גוריון'], 'TLV'],
    ['telaviv', 'city', 'telaviv', 32.0853, 34.7818, ['Тель-Авив', 'Tel Aviv', 'תל אביב']],
    ['jerusalem', 'city', 'jerusalem', 31.7683, 35.2137, ['Иерусалим', 'Jerusalem', 'ירושלים']],
    ['haifa', 'city', 'haifa', 32.794, 34.9896, ['Хайфа', 'Haifa', 'חיפה']],
    ['ashdodport', 'port', 'south', 31.8167, 34.64, ['Порт Ашдод', 'Ashdod Port', 'נמל אשדוד']],
    ['haifaport', 'port', 'haifa', 32.82, 35.0, ['Порт Хайфы', 'Haifa Port', 'נמל חיפה']],
    ['etm', 'airport', 'south', 29.7239, 35.0114, ['Аэропорт Рамон', 'Ramon Airport', 'נמל התעופה רמון'], 'ETM'],
    ['netanya', 'city', 'center', 32.3215, 34.8532, ['Нетания', 'Netanya', 'נתניה']],
    ['herzliya', 'city', 'telaviv', 32.1624, 34.8447, ['Герцлия', 'Herzliya', 'הרצליה']],
    ['rishon', 'city', 'center', 31.973, 34.7925, ['Ришон-ле-Цион', 'Rishon LeZion', 'ראשון לציון']],
    ['petahtikva', 'city', 'center', 32.084, 34.8878, ['Петах-Тиква', 'Petah Tikva', 'פתח תקווה']],
    ['ramatgan', 'city', 'telaviv', 32.0684, 34.8248, ['Рамат-Ган', 'Ramat Gan', 'רמת גן']],
    ['raanana', 'city', 'center', 32.1848, 34.8713, ['Раанана', "Ra'anana", 'רעננה']],
    ['modiin', 'city', 'center', 31.899, 35.01, ['Модиин', "Modi'in", 'מודיעין']],
    ['ashdod', 'city', 'south', 31.8014, 34.6435, ['Ашдод', 'Ashdod', 'אשדוד']],
    ['ashkelon', 'city', 'south', 31.6688, 34.5743, ['Ашкелон', 'Ashkelon', 'אשקלון']],
    ['beersheva', 'city', 'south', 31.252, 34.7915, ['Беэр-Шева', "Be'er Sheva", 'באר שבע']],
    ['eilat', 'city', 'south', 29.5577, 34.9519, ['Эйлат', 'Eilat', 'אילת']],
    ['eilatport', 'port', 'south', 29.545, 34.95, ['Порт Эйлат', 'Eilat Port', 'נמל אילת'], null, false],
    ['einbokek', 'resort', 'south', 31.2, 35.362, ['Эйн-Бокек, Мёртвое море', 'Ein Bokek, Dead Sea', 'עין בוקק, ים המלח']],
    ['caesarea', 'city', 'haifa', 32.5, 34.9, ['Кейсария', 'Caesarea', 'קיסריה']],
    ['nazareth', 'city', 'north', 32.6996, 35.3035, ['Назарет', 'Nazareth', 'נצרת']],
    ['tiberias', 'city', 'north', 32.7959, 35.53, ['Тверия', 'Tiberias', 'טבריה']],
    ['akko', 'city', 'north', 32.9281, 35.082, ['Акко', 'Acre (Akko)', 'עכו']],
    ['nahariya', 'city', 'north', 33.0058, 35.094, ['Нагария', 'Nahariya', 'נהריה']]
  ];
  D.places = {};
  D.placeOrder = [];
  pts.forEach(function (p) {
    D.places[p[0]] = {
      id: p[0], type: p[1], region: p[2], lat: p[3], lon: p[4],
      name: { ru: p[5][0], en: p[5][1], he: p[5][2] }, code: p[6] || null,
      available: p[7] !== false
    };
    D.placeOrder.push(p[0]);
  });
  D.recentSeed = ['telaviv', 'tlv', 'jerusalem']; // M10 «Недавние» history, as in the taxi meter

  D.placeName = function (id, lang) { const p = D.places[id]; return p ? p.name[lang] || p.name.en : ''; };

  /* ---------- car classes (demo passenger / luggage capacities) ---------- */
  D.classes = [
    { id: 'eco', icon: 'car', k: 1, passengers: 4, luggage: 3 },
    { id: 'business', icon: 'carLux', k: 1.45, passengers: 3, luggage: 3 },
    { id: 'minivan', icon: 'van', k: 1.75, passengers: 7, luggage: 7 },
    { id: 'minibus', icon: 'bus', k: 2.6, passengers: 16, luggage: 16 }
  ];
  D.cls = function (id) { return D.classes.find(function (c) { return c.id === id; }); };

  /* ---------- fixed tariffs ----------
     The real system stores a fixed price per served-point pair and class (spec §7).
     Here the table is generated once from distance only to have plausible numbers. */
  function hav(a, b) {
    const R = 6371, r = Math.PI / 180;
    const dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r;
    const x = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  const r10 = function (n) { return Math.round(n / 10) * 10; };
  D.isNight = function (time) {
    if (!time) return false;
    const m = D.toMin(time);
    return m >= D.NIGHT.from || m < D.NIGHT.to;
  };
  D.basePrice = function (from, to) {
    const km = hav(D.places[from], D.places[to]) * 1.25;
    return Math.max(140, 110 + km * 3.1);
  };
  D.price = function (draft, clsId) {
    const { from, to, time } = draft;
    if (!from || !to || from === to) return null;
    let p = D.basePrice(from, to) * D.cls(clsId).k;
    if (D.isNight(time)) p *= D.NIGHT_K;
    return r10(p);
  };

  /* ---------- date/time helpers (all values are Israel wall-clock) ---------- */
  D.toMin = function (t) { const a = t.split(':'); return +a[0] * 60 + +a[1]; };
  D.fromMin = function (m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  D.parseDate = function (s) { const a = s.split('-'); return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2])); };
  D.isoDate = function (d) { return d.toISOString().slice(0, 10); };
  D.addDays = function (s, n) { const d = D.parseDate(s); d.setUTCDate(d.getUTCDate() + n); return D.isoDate(d); };
  D.earliest = function () { // first bookable slot (15-min grid)
    const m = D.toMin(D.NOW.time) + D.MIN_LEAD_MIN;
    const r = Math.ceil(m / 15) * 15;
    return r >= 1440 ? { date: D.addDays(D.NOW.date, 1), min: r - 1440 } : { date: D.NOW.date, min: r };
  };
  D.lastDate = function () { return D.addDays(D.NOW.date, D.HORIZON_DAYS); };

  /* ---------- currencies (as in the taxi meter: Dollar, Euro, Shekel) ----------
     Fixed prices are in ILS; other currencies are converted with these mock rates. */
  D.currencies = [
    { id: 'USD', sign: '$', rate: 3.7, key: 'cur.dollar' },
    { id: 'EUR', sign: '€', rate: 4.0, key: 'cur.euro' },
    { id: 'ILS', sign: '₪', rate: 1, key: 'cur.shekel' }
  ];
  D.currency = function (id) { return D.currencies.find(function (x) { return x.id === id; }) || D.currencies[2]; };

  /* ---------- draft ---------- */
  let draftSeq = 1;
  D.defaultRoute = { from: 'telaviv', to: 'tlv' }; // M8 always opens with a route
  D.newDraft = function () {
    const e = D.earliest();
    return { id: 'd' + draftSeq++, from: D.defaultRoute.from, to: D.defaultRoute.to, date: e.date, time: D.fromMin(e.min), cls: 'eco', orderId: null };
  };
  D.sampleDraft = function (lang) {
    return Object.assign(D.newDraft(), { date: '2026-10-23', time: '09:30' });
  };
  /* user-entered text in mock data may be stored per language */
  D.txt = function (v, lang) { return v && typeof v === 'object' ? v[lang] || v.en : v || ''; };

  /* ---------- accounts ---------- */
  D.registered = ['m.shapiro@gmail.com', 'anna.levin@gmail.com', 'david.k@outlook.com'];
  D.defaultUser = { name: { ru: 'Михаил Шапиро', en: 'Michael Shapiro', he: 'מיכאל שפירא' }, email: 'm.shapiro@gmail.com' };
  D.nameFromEmail = function (email) {
    if (email === D.defaultUser.email) return D.defaultUser.name;
    return email.split('@')[0].split(/[._-]+/).filter(Boolean).map(function (w) { return w[0].toUpperCase() + w.slice(1); }).join(' ');
  };
  D.emailOk = function (e) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e.trim()); };

  /* ---------- drivers ---------- */
  D.drivers = {
    cohen: { name: { ru: 'Давид Коэн', en: 'David Cohen', he: 'דוד כהן' }, car: { ru: 'Toyota Camry · белая', en: 'Toyota Camry · white', he: 'טויוטה קאמרי · לבנה' }, plate: '12-345-67', phone: '+972 50-123-4567', initials: { ru: 'ДК', en: 'DC', he: 'דכ' } },
    levi: { name: { ru: 'Йоси Леви', en: 'Yossi Levi', he: 'יוסי לוי' }, car: { ru: 'Hyundai Staria · серый', en: 'Hyundai Staria · grey', he: 'יונדאי סטאריה · אפורה' }, plate: '81-602-34', phone: '+972 52-765-4321', initials: { ru: 'ЙЛ', en: 'YL', he: 'יל' } },
    mizrahi: { name: { ru: 'Амир Мизрахи', en: 'Amir Mizrahi', he: 'אמיר מזרחי' }, car: { ru: 'Škoda Superb · чёрная', en: 'Škoda Superb · black', he: 'סקודה סופרב · שחורה' }, plate: '34-871-90', phone: '+972 54-210-7788', initials: { ru: 'АМ', en: 'AM', he: 'אמ' } }
  };

  /* ---------- orders ----------
     status (execution): awaiting_payment · awaiting_confirmation · confirmed · driver_assigned · completed · cancelled · rejected
     pay (payment):      pending · succeeded · failed · unpaid · refund_pending · refunded */
  function o(id, from, to, date, time, cls, price, status, pay, extra) {
    return Object.assign({ id: id, from: from, to: to, date: date, time: time, cls: cls, price: price, status: status, pay: pay, driver: null, paidAt: null, createdAt: null }, extra || {});
  }
  D.seedOrders = function () {
    return [
      o('ET-10446', 'netanya', 'tlv', '2026-10-21', '05:40', 'eco', 230, 'awaiting_confirmation', 'succeeded', { paidAt: '19.10 · 11:05', createdAt: '2026-10-19 11:04' }),
      o('ET-10431', 'jerusalem', 'tlv', '2026-10-20', '18:00', 'business', 360, 'driver_assigned', 'succeeded', { driver: 'mizrahi', paidAt: '17.10 · 20:41', createdAt: '2026-10-17 20:38' }),
      o('ET-10428', 'haifa', 'tlv', '2026-10-26', '04:30', 'minivan', 640, 'awaiting_payment', 'unpaid', { createdAt: '2026-10-17 09:18' }),
      o('ET-10419', 'tlv', 'jerusalem', '2026-10-22', '23:10', 'eco', 330, 'confirmed', 'succeeded', { paidAt: '16.10 · 09:30' })
    ];
  };
  D.seedHistory = function () {
    return [
      o('ET-10388', 'tlv', 'telaviv', '2026-10-12', '22:15', 'eco', 200, 'completed', 'succeeded', { driver: 'cohen', paidAt: '10.10 · 13:02' }),
      o('ET-10344', 'eilat', 'etm', '2026-10-08', '10:00', 'minivan', 230, 'cancelled', 'refunded', { paidAt: '05.10 · 18:44', reason: 'operator' }),
      o('ET-10322', 'telaviv', 'jerusalem', '2026-10-04', '08:30', 'business', 390, 'rejected', 'refund_pending', { paidAt: '03.10 · 21:17', reason: 'nocar' }),
      o('ET-10301', 'tlv', 'haifa', '2026-09-28', '16:40', 'eco', 400, 'completed', 'succeeded', { driver: 'levi', paidAt: '27.09 · 12:00' }),
      o('ET-10287', 'ashdodport', 'jerusalem', '2026-09-21', '07:00', 'minibus', 980, 'completed', 'succeeded', { driver: 'levi', paidAt: '19.09 · 09:15' })
    ];
  };
  /* older history pages for "load more" */
  D.historyPage = function (page) {
    const sets = [
      [['ET-10254', 'telaviv', 'tlv', '2026-09-14', '04:50', 'eco', 220], ['ET-10231', 'tlv', 'netanya', '2026-09-09', '13:20', 'eco', 230], ['ET-10219', 'herzliya', 'jerusalem', '2026-09-02', '19:00', 'business', 450], ['ET-10197', 'tlv', 'einbokek', '2026-08-27', '11:30', 'minivan', 910], ['ET-10176', 'einbokek', 'tlv', '2026-08-30', '15:00', 'minivan', 910]],
      [['ET-10142', 'haifaport', 'nazareth', '2026-08-15', '09:45', 'eco', 220], ['ET-10120', 'tlv', 'rishon', '2026-08-03', '02:10', 'eco', 200], ['ET-10098', 'jerusalem', 'tlv', '2026-07-24', '06:00', 'eco', 260]]
    ];
    return (sets[page] || []).map(function (a) { return o(a[0], a[1], a[2], a[3], a[4], a[5], a[6], 'completed', 'succeeded', { driver: 'cohen' }); });
  };
  D.ACTIVE = { awaiting_payment: 1, awaiting_confirmation: 1, confirmed: 1, driver_assigned: 1 };
  D.isActive = function (o) { return !!D.ACTIVE[o.status]; };
  /* lifecycle used by the demo "refresh" on a freshly paid order (operator actions) */
  D.nextStatus = { awaiting_confirmation: 'confirmed', confirmed: 'driver_assigned', driver_assigned: 'completed' };

})();

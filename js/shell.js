/* Prototype shell (not part of the app): screen catalog, scenarios, language / network /
   failure switches, device sizes, overview board. On a real phone (≤600px) the shell is
   hidden and the app runs full-screen with safe-area insets. */
(function () {
  const ET = window.ET, app = ET.app, I = ET.icon;
  const LS = {
    get: function (k) { try { return localStorage.getItem('emun.proto.' + k); } catch (_) { return null; } },
    set: function (k, v) { try { localStorage.setItem('emun.proto.' + k, v); } catch (_) {} }
  };
  const SIZES = [['360x800', '360 × 800 · компактный Android'], ['390x844', '390 × 844 · как в Figma'], ['412x915', '412 × 915 · крупный Android']];
  const NAMES = {
    m1: 'M1 · Стартовый экран', m2: 'M2 · Вход по email', m4: 'M4 · Подтверждение email',
    m5: 'M5 · Регистрация', m6: 'M6 · Главный экран услуг', m8: 'M8 · Оформление трансфера', m9: 'M9 · Дата и время',
    m10: 'M10 · Поиск города или места', m14: 'M14 · Переход к оплате 3DS', m15: 'M15 · Проверка статуса оплаты',
    m16: 'M16 · Результат оформления', m17: 'M17 · Заказы', m18: 'M18 · Карточка заказа', m19: 'M19 · Профиль', m20: 'M20 · Выбор языка', cur: 'Валюта',
    m23: 'M23 · Удаление аккаунта'
  };
  const FLAGS = [
    ['priceError', 'Ошибка расчёта цены', 'M8'],
    ['linkError', 'Ссылка на оплату не получена', 'M14'],
    ['orderMissing', 'Оплачено, но заказ не создан', 'M16'],
    ['dirError', 'Ошибка справочника при повторе', 'M6'],
    ['deleteError', 'Ошибка удаления аккаунта', 'M23']
  ];
  const SCEN = [
    ['m1-first', 'Первый запуск', 'Сплэш → вход'],
    ['m8', 'Оформление и оплата', 'M8 → M14 → M16'],
    ['m17', 'Заказы и статусы', 'M17 → M18']
  ];
  const st = {
    lang: (location.search.match(/[?&]lang=(ru|en|he)/) || [])[1] || LS.get('lang') || 'ru',
    size: LS.get('size') || '390x844',
    mode: 'device',
    current: null
  };
  // A phone shows only the app (full screen, safe areas) with a small edge handle for the panel.
  // A narrow desktop window — e.g. the browser pane inside the Claude app — keeps the device
  // frame and opens the panel as a drawer. ?sys=1 forces the phone layout (screenshots).
  const forcePhone = /[?&]sys=1/.test(location.search);
  const mobile = forcePhone || window.matchMedia('(max-width: 600px) and (pointer: coarse)').matches;
  const $ = function (s) { return document.querySelector(s); };

  function panel() {
    const groups = ET.groups.map(function (g) {
      const items = ET.catalog.filter(function (e) { return e.g === g[0]; });
      return '<details class="cat-g"' + (g[0] === 'auth' || g[0] === 'order' ? ' open' : '') + '><summary><span>' + g[1] + '</span><em>' + g[2] + ' · ' + items.length + '</em></summary>' +
        items.map(function (e) { return '<button class="cat-i" data-entry="' + e.id + '">' + e.label + '</button>'; }).join('') + '</details>';
    }).join('');
    return '<div class="sp-head">' + ET.ui.brandMark('sm') + '<div><div class="sp-t">EMUN TAXI · прототип</div><div class="sp-s">Android · ТЗ по экранам v3.6 · ' + Object.keys(NAMES).length + ' экранов</div></div>' +
      '<button class="sp-close" data-drawer-close aria-label="Закрыть панель">' + I('x') + '</button></div>' +
      '<div class="sp-sec"><div class="seg2" role="tablist"><button data-mode="device" class="on">' + I('card') + 'Устройство</button><button data-mode="overview">' + I('grid') + 'Все экраны</button></div></div>' +
      '<div class="sp-sec"><div class="sp-l">Язык приложения</div><div class="seg3" id="langSeg">' +
      [['he', 'עברית'], ['ru', 'Русский'], ['en', 'English']].map(function (l) { return '<button data-lang="' + l[0] + '"' + (l[0] === st.lang ? ' class="on"' : '') + '>' + l[1] + '</button>'; }).join('') + '</div>' +
      '<div class="sp-hint">В продукте по умолчанию иврит (RTL). Прототип открывается на русском для согласования.</div></div>' +
      '<div class="sp-sec sp-size"><div class="sp-l">Размер экрана</div><select id="sizeSel">' +
      SIZES.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === st.size ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="sp-sec"><div class="sp-l">Сценарии</div><div class="scen">' +
      SCEN.map(function (s) { return '<button data-entry="' + s[0] + '"><b>' + s[1] + '</b><span>' + s[2] + '</span></button>'; }).join('') + '</div></div>' +
      '<div class="sp-sec"><div class="sp-l">Сеть и сбои <span>для демонстрации</span></div>' +
      '<label class="tg"><input type="checkbox" id="netT"><span>Нет интернета</span><em>везде</em></label>' +
      FLAGS.map(function (f) { return '<label class="tg"><input type="checkbox" data-flag="' + f[0] + '"><span>' + f[1] + '</span><em>' + f[2] + '</em></label>'; }).join('') +
      '</div>' +
      '<div class="sp-sec"><div class="sp-l">Экраны и состояния <span>' + ET.catalog.length + '</span></div>' + groups + '</div>' +
      '<div class="sp-sec"><div class="sp-l">Тестовые данные</div><ul class="sp-data">' +
      '<li><b>m.shapiro@gmail.com</b> — существующий аккаунт с историей. Любой корректный email тоже войдёт.</li>' +
      '<li>Email со словом <b>new</b> — «аккаунт не найден», <b>limit</b> — лимит отправок, <b>fail</b> (регистрация) — ошибка отправки.</li>' +
      '<li>Код: любые 6 цифр. <b>000000</b> — неверный, <b>111111</b> — истёк, <b>222222</b> — уже использован.</li>' +
      '<li>На странице 3DS можно выбрать ответ банка: успех, отказ, нет ответа. «Отменить» = отмена 3DS.</li>' +
      '<li>«Обновить» в карточке нового заказа двигает его по статусам оператора.</li>' +
      '<li>Esc — системная кнопка «Назад».</li></ul></div>';
  }

  function stageBar() {
    return '<button class="sb-menu" data-drawer aria-label="Экраны и состояния">' + I('menu') + 'Экраны</button>' +
      '<div class="sb-l"><span class="sb-scr" id="scrName">—</span><span class="sb-st" id="stName"></span></div>' +
      '<div class="sb-r"><button id="backBtn" title="Системная «Назад» (Esc)">' + I('back') + 'Назад</button><button id="restartBtn" title="Открыть состояние заново">' + I('refresh') + 'Заново</button></div>';
  }

  function sizeWH() { const p = st.size.split('x'); return [+p[0], +p[1]]; }

  function applySize() {
    const wh = sizeWH();
    const dev = $('.device');
    dev.style.setProperty('--dw', wh[0] + 'px');
    dev.style.setProperty('--dh', wh[1] + 'px');
    fit();
  }
  function fit() {
    if (mobile) return;
    const wrap = $('.device-wrap'), dev = $('.device');
    const wh = sizeWH(), W = wh[0] + 24, H = wh[1] + 24;
    const aw = wrap.clientWidth - 24, ah = wrap.clientHeight - 24;
    const s = Math.min(1, aw / W, ah / H);
    dev.style.transform = 'scale(' + s + ')';
    dev.style.margin = (-(H - H * s) / 2) + 'px ' + (-(W - W * s) / 2) + 'px';
  }

  function openEntry(id) {
    const e = ET.findEntry(id) || ET.findEntry('m1-first');
    const b = ET.buildEntry(e, st.lang);
    app.start(b.S, b.stack, b.sheet);
    st.current = e.id;
    closeDrawer();
    try { history.replaceState(null, '', '#' + e.id); } catch (_) {}
    document.querySelectorAll('.cat-i').forEach(function (el) { el.classList.toggle('on', el.dataset.entry === e.id); });
    const cur = document.querySelector('.cat-i.on');
    if (cur) { cur.closest('details').open = true; }
    $('#stName') && ($('#stName').textContent = e.label.replace(/^M\d+ · /, ''));
    syncFlags();
    if (st.mode !== 'device') setMode('device');
  }

  function syncFlags() {
    if (!app.S) return;
    const n = $('#netT'); if (n) n.checked = app.S.net === 'offline';
    document.querySelectorAll('[data-flag]').forEach(function (el) { el.checked = !!app.S.flags[el.dataset.flag]; });
  }

  /* the panel as a drawer in narrow windows and on phones */
  function openDrawer() { document.body.classList.add('drawer-open'); }
  function closeDrawer() { document.body.classList.remove('drawer-open'); }

  function setMode(m) {
    st.mode = m;
    closeDrawer();
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === m); });
    document.body.classList.toggle('mode-board', m === 'overview');
    if (m === 'overview') renderBoard();
    else fit();
  }

  function renderBoard() {
    const wh = sizeWH(), sc = 0.5, dir = st.lang === 'he' ? 'rtl' : 'ltr';
    const board = $('.board');
    board.innerHTML = '<div class="bd-head"><button class="bd-menu" data-drawer>' + I('menu') + 'Экраны</button><h1>Все экраны и состояния</h1><p>' + ET.catalog.length + ' состояний · ' + Object.keys(NAMES).length + ' экранов ТЗ · язык: ' + { ru: 'русский', en: 'английский', he: 'иврит (RTL)' }[st.lang] + '. Нажмите на экран, чтобы открыть его интерактивно.</p></div>' +
      ET.groups.map(function (g) {
        const items = ET.catalog.filter(function (e) { return e.g === g[0]; });
        return '<section class="bd-group"><h2>' + g[1] + ' <span>' + g[2] + '</span></h2><div class="bd-grid">' + items.map(function (e) {
          let r;
          try {
            const b = ET.buildEntry(e, st.lang);
            const top = b.stack[b.stack.length - 1];
            r = ET.staticHTML(b.S, { id: top[0], P: top[1], L: top[2] }, b.sheet);
          } catch (err) { console.error('board', e.id, err); r = { html: '<div class="bd-err">' + err.message + '</div>', light: false }; }
          // div (not button): the static screen inside contains its own <button>s
          return '<div class="bd-item" role="button" tabindex="0" data-entry="' + e.id + '"><div class="bd-phone" style="width:' + wh[0] * sc + 'px;height:' + wh[1] * sc + 'px">' +
            '<div class="bd-scale" style="width:' + wh[0] + 'px;height:' + wh[1] + 'px;transform:scale(' + sc + ')" inert><div class="app' + (r.light ? ' sys-light' : '') + '" dir="' + dir + '" lang="' + st.lang + '">' + r.html + '</div></div></div>' +
            '<div class="bd-cap">' + e.label + '</div></div>';
        }).join('') + '</div></section>';
      }).join('');
  }

  function bind() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-drawer-close]')) { closeDrawer(); return; }
      if (e.target.closest('[data-drawer]')) { document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer(); return; }
      const en = e.target.closest('[data-entry]');
      if (en && en.closest('#app')) return;
      if (en) { openEntry(en.dataset.entry); return; }
      const m = e.target.closest('[data-mode]');
      if (m) { setMode(m.dataset.mode); return; }
      const l = e.target.closest('[data-lang]');
      if (l) { setLang(l.dataset.lang); return; }
    });
    $('#sizeSel').addEventListener('change', function (e) { st.size = e.target.value; LS.set('size', st.size); applySize(); if (st.mode === 'overview') renderBoard(); });
    $('#netT').addEventListener('change', function (e) {
      app.S.net = e.target.checked ? 'offline' : 'online';
      app.stack.forEach(function (en) { app.renderEntry(en); });
    });
    document.querySelectorAll('[data-flag]').forEach(function (el) {
      el.addEventListener('change', function () { app.S.flags[el.dataset.flag] = el.checked; });
    });
    $('#backBtn').addEventListener('click', function () { app.back(); });
    $('#restartBtn').addEventListener('click', function () { openEntry(st.current); });
    window.addEventListener('resize', fit);
    // Esc closes the drawer first; otherwise it is the app's system «Назад»
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) { closeDrawer(); e.stopImmediatePropagation(); }
    }, true);
  }

  function setLang(lang) {
    if (app.S && app.S.lang !== lang) app.setLang(lang); // → ET.onLang
    else ET.onLang(lang);
  }
  ET.onLang = function (lang) {
    st.lang = lang; LS.set('lang', lang);
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === lang); });
    if (st.mode === 'overview') renderBoard();
  };
  ET.onNavigate = function (id) {
    const n = $('#scrName'); if (n) n.textContent = NAMES[id] || id;
    syncFlags();
  };

  function start() {
    const root = $('#app');
    // ?sys=1 keeps the simulated Android status/gesture bars on a narrow viewport;
    // ?w=360&h=800 pins the app to an exact size (used for automated screenshots)
    if (mobile) {
      document.body.classList.add('is-mobile');
      if (!/[?&]sys=1/.test(location.search)) root.classList.add('no-chrome');
      const qw = location.search.match(/[?&]w=(\d+)/), qh = location.search.match(/[?&]h=(\d+)/);
      if (qw && qh) $('.device').style.cssText = 'right:auto;bottom:auto;width:' + qw[1] + 'px;height:' + qh[1] + 'px';
    }
    $('.shell-panel').innerHTML = panel();
    $('.stage-bar').innerHTML = stageBar();
    document.body.insertAdjacentHTML('beforeend', '<div class="drawer-scrim" data-drawer-close></div>' +
      (forcePhone ? '' : '<button class="m-handle" data-drawer aria-label="Экраны и состояния">' + I('grid') + '</button>'));
    bind();
    app.init(root);
    applySize();
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === 'overview') { openEntry('m1-first'); setMode('overview'); }
    else openEntry(ET.findEntry(h) ? h : 'm1-first');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

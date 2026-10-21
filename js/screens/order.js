/* M6 services · M8 single transfer screen · M10 place search */
(function () {
  const ET = window.ET, D = ET.data, ui = ET.ui, I = ET.icon, esc = ET.esc;
  const app = ET.app;
  const S = ET.Screens;

  /* ================= M6 · Services (tab root) ================= */
  const SVC = [['courier', 'box'], ['tours', 'map'], ['driver', 'wheel']];
  S.m6 = {
    title: 'M6', tab: 'services',
    init: function (P, S0) { return { state: P.state || (S0.flags.dirLoaded ? 'ready' : 'loading') }; },
    render: function (c) {
      const S0 = c.S, L = c.L;
      const appbar = ui.appbar(c, {
        root: true, back: false,
        title: c.t('m6.title')
      });
      let body;
      if (L.state === 'loading') {
        body = '<div class="sk-card" style="border-radius:30px;padding:20px;display:flex;flex-direction:column;gap:14px">' +
          ui.sk('46px', 46, 14) + ui.sk('52%', 24) + ui.sk('86%', 13) + ui.sk('100%', 40, 12, 'margin-top:6px') + '</div>' +
          '<div style="margin:24px 4px 12px">' + ui.sk('120px', 13) + '</div>' +
          '<div class="sk-card" style="display:flex;flex-direction:column;gap:18px">' +
          [0, 1, 2].map(function () { return '<div style="display:flex;gap:13px;align-items:center">' + ui.sk('40px', 40, 12) + '<div style="flex:1;display:flex;flex-direction:column;gap:7px">' + ui.sk('46%', 14) + ui.sk('70%', 11) + '</div></div>'; }).join('') + '</div>';
      } else if (L.state === 'error') {
        body = ui.statebox({ icon: 'alert', kind: 'danger', title: c.t('m6.errT'), sub: c.t('m6.errS'), actions: ui.btn(c.t('common.retry'), { kind: 'sec', act: 'retry', icon: 'refresh', cls: 'w-auto' }) });
      } else {
        body = '<button class="svc-hero" data-act="transfer">' +
          '<span class="sh-top"><span class="badge">' + I('car') + '</span></span>' +
          '<span class="sh-name" style="display:block">' + c.t('svc.transfer') + '</span>' +
          '<span class="sh-cta"><span>' + c.t('m6.transferCta') + '</span><span class="sh-go">' + I('arrow') + '</span></span></button>' +
          // only transfers are bookable in this release; the other services are shown disabled
          ui.secLabel(c.t('m6.other')) +
          ui.list(SVC.map(function (s) {
            return ui.row({
              act: 'noop', disabled: true, icon: s[1], tone: 'neutral', cls: 'wrap dim',
              title: c.t('svc.' + s[0]), end: ui.tag(c.t('m6.naTag'), 'amber')
            });
          }));
      }
      return ui.page({ appbar: appbar, banner: ui.offline(c), body: body, tabbar: ui.tabbar(c, 'services') });
    },
    onEnter: function (c) {
      if (c.L.state === 'loading' && !c.L.frozen) c.later(function () { S.m6.load(c); }, 700);
    },
    load: function (c) {
      if (c.S.flags.dirError || c.S.net === 'offline') { c.S.flags.dirError = false; c.L.state = 'error'; }
      else { c.L.state = 'ready'; c.S.flags.dirLoaded = true; }
      c.update();
    },
    actions: {
      transfer: function () { app.push('m8'); },
      retry: function (c) { c.L.state = 'loading'; c.update(); c.later(function () { S.m6.load(c); }, 800); }
    }
  };

  /* ================= M8 · Single transfer screen ================= */
  function sig(d) { return [d.from, d.to, d.time].join('|'); }
  function routeReady(d) { return d.from && d.to && d.from !== d.to; }
  /* day / night tariff mark, drawn like the taxi meter's sun / moon price-card badges */
  ET.dayNight = function (time, cls) {
    const night = D.isNight(time);
    return '<span class="dnm ' + (night ? 'night' : 'day') + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + I(night ? 'moon' : 'sun') + '</span>';
  };

  S.m8 = {
    title: 'M8',
    init: function (P, S0) { return { price: null, spun: false, sig: sig(S0.draft) }; },
    render: function (c) {
      const d = c.S.draft, L = c.L;
      const same = d.from && d.to && d.from === d.to;
      const rrow = function (field) {
        const v = d[field];
        return '<button class="rrow" data-act="pick" data-arg="' + field + '"><div class="rinfo"><span class="rlabel">' + c.t('m8.' + field) + '</span>' +
          '<span class="rplace">' + ui.place(c, v) + '</span></div></button>';
      };
      const route = '<div class="route' + (same ? ' warn' : '') + '"><div class="rrows">' + rrow('from') + rrow('to') + '</div>' +
        '<button class="swap' + (L.spun ? ' spun' : '') + '" data-act="swap" aria-label="' + c.t('a11y.swap') + '">' + I('swap') + '</button></div>' +
        (same ? '<div style="margin-top:10px">' + ui.warn(c.t('m8.same'), 'alert') + '</div>' : '');

      const e = D.earliest();
      const when = '<div class="list pick pickup">' + ui.row({
        static: true, icon: 'calendar',
        title: '<input type="datetime-local" data-pickup value="' + d.date + 'T' + d.time + '" min="' + e.date + 'T' + D.fromMin(e.min) + '" max="' + D.lastDate() + 'T23:45" step="900" required aria-label="' + c.t('m8.when') + '">',
        sub: c.t('m8.when'),
        end: ET.dayNight(d.time)
      }) + '</div>';

      // only what defines the price: route, pickup date & time, tariff (the price sits on the button)
      const body = route + when +
        '<div class="seclabel"><span class="t">' + c.t('m8.transport') + '</span>' + ET.region(c, 'pstate', 'span') + '</div>' +
        ET.region(c, 'tiles');

      return ui.page({
        appbar: ui.appbar(c, { title: c.t('m8.title') }),
        banner: ui.offline(c),
        body: body,
        foot: ET.region(c, 'foot')
      });
    },
    regions: {
      pstate: function (c) {
        const L = c.L;
        if (L.price === 'loading') return '<span class="h" style="display:flex;align-items:center;gap:7px">' + ui.spinner('brand') + c.t('m8.calc') + '</span>';
        return '';
      },
      tiles: function (c) {
        const d = c.S.draft, L = c.L, ok = routeReady(d);
        let html = '<div class="tiles" data-sk="tiles">' + D.classes.map(function (cl) {
          const on = d.cls === cl.id;
          const capacity = esc(c.t('m8.capacity', { p: cl.passengers, b: cl.luggage }));
          let bottom;
          if (!ok) bottom = '<span class="t-ph">—</span>'; // same pickup and destination
          else if (L.price === 'loading' || L.price == null) bottom = '<span class="t-price">' + ui.sk('74px', 26, 8) + '</span>';
          else if (L.price === 'error') bottom = '<span class="t-ph">—</span>';
          else bottom = '<span class="t-price">' + ui.money(c, D.price(d, cl.id)) + '</span>';
          return '<button class="tile' + (on ? ' on' : '') + '" data-act="cls" data-arg="' + cl.id + '" aria-pressed="' + on + '">' +
            '<span class="t-top"><span class="t-ic">' + I(cl.icon) + '</span>' +
            '<span class="t-capacity" role="img" aria-label="' + capacity + '" title="' + capacity + '">' +
            '<span aria-hidden="true">' + I('person') + cl.passengers + '</span>' +
            '<span aria-hidden="true">' + I('luggage') + cl.luggage + '</span></span></span>' +
            '<span class="t-name">' + c.t('cls.' + cl.id) + '</span>' + bottom + '</button>';
        }).join('') + '</div>';
        if (ok && L.price === 'error') {
          html += ui.warn(c.t(c.S.net === 'offline' ? 'm8.priceOffline' : 'm8.priceErr') + '<div class="wc-actions">' + ui.btn(c.t('common.retry'), { kind: 'link', act: 'reprice', icon: 'refresh' }) + '</div>', 'alertCircle', 'err');
        }
        return html;
      },
      foot: function (c) {
        const d = c.S.draft, L = c.L, ok = routeReady(d);
        const price = ok ? D.price(d, d.cls) : null;
        const can = ok && L.price === 'ready' && c.S.net !== 'offline';
        // a hint only explains why the button is disabled
        let hint = null, warn = false;
        if (!ok) hint = [I('alert'), c.t('m8.hintSame')], warn = true;
        else if (L.price === 'loading' || L.price == null) hint = [ui.spinner(), c.t('m8.calc')];
        else if (L.price === 'error') hint = [I('alertCircle'), c.t('m8.hintErr')], warn = true;
        return (hint ? '<div class="foot-hint' + (warn ? ' warn' : '') + '">' + hint[0] + '<span>' + hint[1] + '</span></div>' : '') +
          ui.btn(c.t('m8.order') + (can && price ? ' · ' + ui.price(c, price) : ''), { act: 'order', disabled: !can });
      }
    },
    reprice: function (c, ms) {
      const d = c.S.draft, L = c.L;
      L.sig = sig(d);
      if (!routeReady(d)) { L.price = null; c.update(); return; }
      L.price = 'loading'; c.update();
      c.later(function () {
        L.price = c.S.net === 'offline' || c.S.flags.priceError ? 'error' : 'ready';
        c.S.flags.priceError = false;
        c.update();
      }, ms || 650);
    },
    after: function (c, el) {
      const input = el.querySelector('[data-pickup]');
      input.addEventListener('change', function () {
        const d = c.S.draft;
        if (!input.checkValidity()) { input.value = d.date + 'T' + d.time; return; }
        const parts = input.value.split('T');
        d.date = parts[0]; d.time = parts[1];
        S.m8.reprice(c);
      });
    },
    onEnter: function (c) {
      const L = c.L, d = c.S.draft;
      if (L.price == null && routeReady(d) && !L.frozen) S.m8.reprice(c);
    },
    onResume: function (c) {
      if (sig(c.S.draft) !== c.L.sig) S.m8.reprice(c);
      else c.update();
    },
    actions: {
      pick: function (c, field) { app.push('m10', { field: field }); },
      swap: function (c) {
        const d = c.S.draft, t = d.from; d.from = d.to; d.to = t;
        c.L.spun = !c.L.spun;
        S.m8.reprice(c, 500);
      },
      cls: function (c, id) { c.S.draft.cls = id; c.update(); },
      reprice: function (c) { S.m8.reprice(c); },
      order: function () { ET.openPayment(); }
    }
  };

  /* ================= M10 · City / place search ================= *
   * 1:1 with the taxi meter's CityScreen (EmunTaxiPrices features/city/compose/CityScreen.kt):
   * EmunScreenHeader «Откуда/Куда», search field «Поиск…», «Недавние» history card, plain name
   * rows with the insert arrow, «Города не найдены» / network state boxes, spinner while searching.
   * Points that are not served are simply not listed (spec M10 allows hiding them). */
  function norm(s) { return s.toLowerCase().replace(/ё/g, 'е').replace(/[-\s'’,.()]/g, ''); }
  function match(p, q) {
    const n = norm(q);
    return ['ru', 'en', 'he'].some(function (l) { return norm(p.name[l]).indexOf(n) >= 0; }) || (p.code && p.code.toLowerCase().indexOf(q.toLowerCase()) === 0);
  }
  function cityRows(c, ids) {
    return ids.map(function (id) {
      return '<button class="tm-city" data-act="pick" data-arg="' + id + '"><span class="tm-cname">' + ui.place(c, id) + '</span>' + I('insert', 'tm-ins') + '</button>';
    }).join('');
  }
  function stateBox(icon, tone, text) {
    return '<div class="tm-state"><span class="tm-sbadge ' + tone + '">' + I(icon) + '</span><div class="tm-stitle">' + text + '</div></div>';
  }

  S.m10 = {
    title: 'M10',
    pageClass: 'tm',
    init: function (P) { return { q: P.q || '', state: P.state || 'ready' }; }, // ready | loading | error
    render: function (c) {
      const field = c.P.field || 'from';
      return ui.tmHeader(c, c.t(field === 'from' ? 'tm.from' : 'tm.to')) +
        '<div class="tm-searchwrap"><label class="tm-search">' + I('searchF', 'tm-sic') +
        '<input data-bind="q" value="' + esc(c.L.q) + '" placeholder="' + c.t('tm.search') + '" autocomplete="off" spellcheck="false" enterkeyhint="search" aria-label="' + c.t('tm.search') + '">' +
        '<button class="tm-clear" data-act="clear" aria-label="' + c.t('a11y.clear') + '"' + (c.L.q ? '' : ' hidden') + '>' + I('clearF') + '</button></label></div>' +
        '<div class="scroll" data-sk="main">' + ET.region(c, 'results') + '</div>';
    },
    regions: {
      results: function (c) {
        const L = c.L, q = L.q.trim();
        if (L.state === 'loading') return '<div class="tm-loading">' + ui.spinner('lg brand') + '</div>';
        if (L.state === 'error') return stateBox('wifiOffF', 'danger', c.t('tm.netErr'));
        if (!q) {
          const recent = (c.S.recent || []).filter(function (id) { return D.places[id]; });
          return recent.length ? '<div class="tm-label">' + c.t('tm.recent') + '</div><div class="tm-card">' + cityRows(c, recent) + '</div>' : '';
        }
        const ids = D.placeOrder.filter(function (id) { return D.places[id].available && match(D.places[id], q); });
        if (!ids.length) return stateBox('searchOffF', '', c.t('tm.notFound'));
        return '<div class="tm-card" style="margin-top:16px">' + cityRows(c, ids) + '</div>';
      }
    },
    after: function (c, el) {
      if (!c.live || c.L._focused) return;
      c.L._focused = true;
      const inp = el.querySelector('[data-bind="q"]');
      setTimeout(function () { if (inp && inp.isConnected) inp.focus({ preventScroll: true }); }, 360);
    },
    onEnter: function (c) {
      if (c.L.state === 'loading' && !c.L.frozen) S.m10.search(c);
    },
    /* like the app: a short server search with a spinner, then results / nothing found / error */
    search: function (c) {
      const L = c.L;
      clearTimeout(L.timer);
      if (!L.q.trim()) { L.state = 'ready'; c.patch('results'); return; }
      L.state = 'loading'; c.patch('results');
      L.timer = c.later(function () {
        L.state = c.S.flags.dirError || c.S.net === 'offline' ? 'error' : 'ready';
        c.S.flags.dirError = false;
        c.patch('results');
      }, 350);
    },
    onInput: function (c, key, v, el) {
      el.parentNode.querySelector('.tm-clear').hidden = !v;
      S.m10.search(c);
      const sc = c.entry.el.querySelector('.scroll'); if (sc) sc.scrollTop = 0;
    },
    actions: {
      pick: function (c, id) {
        c.S.draft[c.P.field || 'from'] = id;
        c.S.recent = [id].concat((c.S.recent || []).filter(function (x) { return x !== id; })).slice(0, 5);
        app.pop();
      },
      clear: function (c) {
        clearTimeout(c.L.timer);
        c.L.q = ''; c.L.state = 'ready'; c.update();
        const inp = c.entry.el.querySelector('[data-bind="q"]'); if (inp) inp.focus();
      }
    }
  };
})();

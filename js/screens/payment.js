/* M14 hand-off to 3DS · M15 payment status check · M16 booking result */
(function () {
  const ET = window.ET, D = ET.data, ui = ET.ui, I = ET.icon;
  const app = ET.app;
  const S = ET.Screens;

  /* create the order from the draft once (idempotent: same draft → same order) */
  function ensureOrder(S0) {
    const d = S0.draft;
    let o = d.orderId && ET.findOrder(S0, d.orderId);
    if (o) return o;
    o = {
      id: 'ET-' + S0.seq++, from: d.from, to: d.to, date: d.date, time: d.time, cls: d.cls,
      price: D.price(d, d.cls), status: 'awaiting_payment', pay: 'unpaid', driver: null, paidAt: null,
      createdAt: D.NOW.date + ' ' + D.NOW.time, live: true
    };
    S0.orders.unshift(o);
    d.orderId = o.id;
    return o;
  }
  ET.ensureOrder = ensureOrder;

  /* ================= M14 · Go to 3DS payment ================= */
  S.m14 = {
    title: 'M14',
    init: function (P, S0) {
      return { phase: P.phase || (P.orderId ? 'link' : 'creating'), orderId: P.orderId || null, busy: false };
    },
    render: function (c) {
      const L = c.L, o = L.orderId && ET.findOrder(c.S, L.orderId);
      let body, foot = '';
      if (L.phase === 'creating' || L.phase === 'link') {
        body = ui.hero({ inner: '<span class="ring"></span>', kind: 'wait', title: c.t(L.phase === 'creating' ? 'm14.creating' : 'm14.gettingLink'), sub: c.t('m14.creatingSub') });
      } else if (L.phase === 'error') {
        body = ui.statebox({ icon: 'alert', kind: 'danger', flat: true, title: c.t('m14.errT'), sub: c.t('m14.errS', { id: '<b class="ref">' + (o ? o.id : '') + '</b>' }) });
        foot = ui.btn(c.t('common.retry'), { act: 'retry', icon: 'refresh', loading: L.busy });
      } else {
        // only what is needed to confirm the payment: amount, trip, where the card is entered
        body = '<div class="pay-card"><span class="ptag">' + c.t('m14.toPay') + '</span>' +
          '<div class="pval">' + ui.money(c, o.price, 'pay-sum') + '</div>' +
          '<div class="pay-trip">' + ui.routeLine(c, o.from, o.to) + '</div></div>' +
          ui.note(c.t('m14.secure'), 'shield');
        foot = ui.btn(c.t('m14.pay'), { act: 'pay', icon: 'external', loading: L.busy, loadingLabel: c.t('m14.opening') });
      }
      return ui.page({ appbar: ui.appbar(c, { title: c.t('m14.title') }), body: body, foot: foot, scrollCls: L.phase === 'ready' ? '' : 'center' });
    },
    onEnter: function (c) {
      if (c.L.frozen) return;
      if (c.L.phase === 'creating' || c.L.phase === 'link') S.m14.prepare(c);
    },
    prepare: function (c) {
      const L = c.L;
      if (!L.orderId) L.orderId = ensureOrder(c.S).id;
      c.later(function () {
        if (c.S.flags.linkError || c.S.net === 'offline') { c.S.flags.linkError = false; L.phase = 'error'; }
        else L.phase = 'ready';
        L.busy = false;
        c.update();
      }, 1200);
    },
    actions: {
      retry: function (c) { c.L.phase = 'link'; c.update(); S.m14.prepare(c); },
      pay: function (c) {
        if (c.L.busy) return; // double tap guard — no second order / charge
        c.L.busy = true; c.update();
        c.later(function () { c.L.busy = false; c.update(); app.open('browser', { kind: '3ds', orderId: c.L.orderId, outcome: c.S.flags.payOutcome || 'success' }); }, 700);
      }
    }
  };

  /* returning from the external browser → M15 */
  ET.returnFromPayment = function (orderId, outcome) {
    const top = app.top();
    if (top && top.id === 'm14') app.replace('m15', { orderId: orderId, outcome: outcome });
    else app.push('m15', { orderId: orderId, outcome: outcome });
  };

  /* ================= M15 · Payment status check ================= */
  S.m15 = {
    title: 'M15',
    init: function (P) { return { phase: P.phase || 'checking', slow: !!P.slow, busy: false }; },
    render: function (c) {
      const L = c.L, o = ET.findOrder(c.S, c.P.orderId);
      let hero, foot = '';
      if (L.phase === 'checking') {
        hero = ui.hero({ inner: '<span class="ring"></span>', kind: 'wait', title: c.t('m15.checkT'), sub: c.t('m15.checkS') });
        if (L.slow) {
          hero += ui.warn(c.t('m15.slow'), 'clock');
          foot = ui.btn(c.t('m15.recheck'), { kind: 'sec', act: 'recheck', icon: 'refresh', loading: L.busy, loadingLabel: c.t('m15.checkT') });
        }
      } else {
        const failed = L.phase === 'failed';
        hero = ui.hero({ icon: failed ? 'x' : 'card', kind: failed ? 'err' : 'amber', title: c.t(failed ? 'm15.failT' : 'm15.cancelT'), sub: c.t(failed ? 'm15.failS' : 'm15.cancelS', { id: '<b class="ref">' + o.id + '</b>' }) });
        foot = ui.btn(c.t('m15.payAgain', { p: ui.price(c, o.price) }), { act: 'again', icon: 'refresh' }) + ui.btn(c.t('m15.openOrder'), { kind: 'sec', act: 'open' });
      }
      const card = '<div class="card"><div class="kv"><span class="k">' + c.t('m16.number') + '</span><span class="v ref">' + o.id + '</span></div>' +
        '<div class="kv"><span class="k">' + c.t('m14.total') + '</span><span class="v">' + ui.price(c, o.price) + '</span></div>' +
        '<div class="kv"><span class="k">' + c.t('m16.payment') + '</span><span class="v">' + (L.phase === 'checking' ? ui.tag(c.t('pay.pending'), '', 'hourglass') : ui.payTag(c, o)) + '</span></div></div>';
      return ui.page({ appbar: ui.appbar(c, { title: c.t('m15.title'), back: L.phase !== 'checking' }), body: hero + card, foot: foot });
    },
    onEnter: function (c) {
      if (c.L.phase !== 'checking' || c.L.frozen) return;
      c.later(function () { S.m15.resolve(c, c.P.outcome || 'success'); }, 1600);
    },
    resolve: function (c, outcome) {
      const o = ET.findOrder(c.S, c.P.orderId), L = c.L;
      L.busy = false;
      if (outcome === 'unknown') { L.slow = true; c.update(); return; }
      if (outcome === 'success') {
        o.pay = 'succeeded'; o.status = 'awaiting_confirmation'; o.paidAt = '19.10 · ' + D.NOW.time;
        c.S.draft = D.newDraft();
        app.replace('m16', { orderId: o.id, recovery: !!c.S.flags.orderMissing });
        return;
      }
      o.pay = outcome === 'failed' ? 'failed' : 'unpaid';
      L.phase = outcome === 'failed' ? 'failed' : 'cancelled';
      c.update();
    },
    onBack: function (c) {
      if (c.L.phase === 'checking') { app.toast(c.t('m15.wait'), 'hourglass'); return false; }
    },
    actions: {
      recheck: function (c) { c.L.busy = true; c.update(); c.later(function () { S.m15.resolve(c, 'success'); }, 1300); },
      again: function (c) { app.replace('m14', { orderId: c.P.orderId }); },
      open: function (c) { app.reset([['m17'], ['m18', { orderId: c.P.orderId }]], 'fade'); }
    }
  };

  /* ================= M16 · Booking result ================= */
  S.m16 = {
    title: 'M16',
    init: function (P) { return { recovery: !!P.recovery, busy: false }; },
    render: function (c) {
      const L = c.L, o = ET.findOrder(c.S, c.P.orderId);
      let body, foot;
      if (L.recovery) {
        body = ui.hero({ icon: 'alert', kind: 'amber', title: c.t('m16.recT'), sub: c.t('m16.recS', { p: ui.price(c, o.price) }) }) +
          '<div class="card"><div class="kv"><span class="k">' + c.t('m16.payRef') + '</span><span class="v ref">PAY-88231-4417</span></div>' +
          '<div class="kv"><span class="k">' + c.t('m14.total') + '</span><span class="v">' + ui.price(c, o.price) + '</span></div></div>';
        foot = ui.btn(c.t('m15.recheck'), { act: 'recheck', icon: 'refresh', loading: L.busy, loadingLabel: c.t('m15.checkT') }) +
          ui.btn(c.t('m16.home'), { kind: 'sec', act: 'home' });
      } else {
        body = ui.hero({ icon: 'check', title: c.t('m16.okT'), sub: c.t('m16.okS') }) +
          '<div class="card"><div class="kv"><span class="k">' + c.t('m16.number') + '</span><span class="v ref">' + o.id + '</span></div>' +
          '<div class="kv"><span class="k">' + c.t('m14.total') + '</span><span class="v">' + ui.price(c, o.price) + '</span></div></div>';
        foot = ui.btn(c.t('m15.openOrder'), { act: 'open' }) + ui.btn(c.t('m16.home'), { kind: 'sec', act: 'home' });
      }
      return ui.page({ appbar: ui.appbar(c, { title: '', close: true, backAct: 'home' }), body: body, foot: foot });
    },
    onBack: function (c) { app.reset([['m6']], 'fade'); return false; },
    actions: {
      open: function (c) { app.reset([['m17'], ['m18', { orderId: c.P.orderId }]], 'fade'); },
      home: function () { app.reset([['m6']], 'fade'); },
      recheck: function (c) {
        c.L.busy = true; c.update();
        c.later(function () { c.S.flags.orderMissing = false; c.L.recovery = false; c.L.busy = false; c.update(); app.toast(c.t('m16.found'), 'check'); }, 1300);
      }
    }
  };
})();

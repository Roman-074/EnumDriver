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

  /* ================= M14 · Payment bottom sheet ================= */
  ET.openPayment = function (orderId) {
    if (app.ovs.some(function (o) { return o.name === 'payment'; })) return;
    app.open('payment', { phase: orderId ? 'link' : 'creating', orderId: orderId || null });
  };
  const payment = ET.Sheets.payment = {
    center: false,
    render: function (c) {
      const L = c.D, phase = L.phase || (L.orderId ? 'link' : 'creating');
      const o = L.orderId && ET.findOrder(c.S, L.orderId);
      let body, foot = '';
      if (phase === 'creating' || phase === 'link') {
        body = '<div class="payment-state" role="status"><span class="ring"></span><div class="sh-title">' +
          c.t(phase === 'creating' ? 'm14.creating' : 'm14.gettingLink') + '</div><div class="sh-sub">' + c.t('m14.creatingSub') + '</div></div>';
      } else if (phase === 'error') {
        body = '<div class="payment-state"><div class="okcircle err">' + I('alert') + '</div><div class="sh-title">' +
          c.t('m14.errT') + '</div><div class="sh-sub">' + c.t('m14.errS', { id: '<b class="ref">' + (o ? o.id : '') + '</b>' }) + '</div></div>';
        foot = ui.btn(c.t('common.retry'), { act: 'retry', icon: 'refresh', loading: L.busy }) +
          ui.btn(c.t('m15.orders'), { kind: 'sec', act: 'orders' });
      } else {
        body = '<div class="pay-card"><span class="ptag">' + c.t('m14.toPay') + '</span>' +
          '<div class="pval">' + ui.money(c, o.price, 'pay-sum') + '</div>' +
          '<div class="pay-trip">' + ui.routeLine(c, o.from, o.to) + '</div></div>' +
          ui.note(c.t('m14.secure'), 'shield');
        foot = ui.btn(c.t('m14.pay'), { act: 'pay', icon: 'external', loading: L.busy, loadingLabel: c.t('m14.opening') });
      }
      return '<div class="payment-sheet" role="dialog" aria-modal="true" aria-label="' + c.t('m14.title') + '"><div class="payment-head">' +
        '<div class="sh-title">' + c.t('m14.title') + '</div>' + ui.iconBtn('x', { act: 'closeSheet', label: c.t('a11y.close') }) +
        '</div>' + body + (foot ? '<div class="sh-actions">' + foot + '</div>' : '') + '</div>';
    },
    onOpen: function (c) {
      const L = c.D;
      L.phase = L.phase || (L.orderId ? 'link' : 'creating');
      if (!L.frozen && (L.phase === 'creating' || L.phase === 'link')) payment.prepare(c);
    },
    prepare: function (c) {
      const L = c.D;
      if (!L.orderId) L.orderId = ensureOrder(c.S).id;
      c.later(function () {
        if (c.S.flags.linkError || c.S.net === 'offline') { c.S.flags.linkError = false; L.phase = 'error'; }
        else L.phase = 'ready';
        L.busy = false;
        c.update();
      }, 1200);
    },
    actions: {
      orders: function (c) { c.close(); app.reset([['m17']], 'fade'); },
      retry: function (c) {
        if (c.D.phase !== 'error') return;
        c.D.phase = 'link'; c.update(); payment.prepare(c);
      },
      pay: function (c) {
        if (c.D.busy || c.D.phase !== 'ready') return;
        c.D.busy = true; c.update();
        c.later(function () {
          const orderId = c.D.orderId;
          c.close();
          app.open('browser', { kind: '3ds', orderId: orderId, outcome: c.S.flags.payOutcome || 'success' });
        }, 700);
      }
    }
  };

  /* returning from the external browser → M15 */
  ET.returnFromPayment = function (orderId, outcome) {
    const top = app.top();
    if (top && top.id === 'm15') app.replace('m15', { orderId: orderId, outcome: outcome });
    else app.push('m15', { orderId: orderId, outcome: outcome });
  };

  /* ================= M15 · Payment status check ================= */
  S.m15 = {
    title: 'M15',
    init: function (P) { return { phase: P.phase || 'checking' }; },
    render: function (c) {
      const L = c.L, o = ET.findOrder(c.S, c.P.orderId);
      let hero, foot = '';
      if (L.phase === 'checking') {
        hero = ui.hero({ inner: '<span class="ring"></span>', kind: 'wait', title: c.t('m15.checkT'), sub: c.t('m15.checkS') });
      } else {
        const failed = L.phase === 'failed';
        hero = ui.hero({ icon: failed ? 'x' : 'card', kind: failed ? 'err' : 'amber', title: c.t(failed ? 'm15.failT' : 'm15.cancelT'), sub: c.t(failed ? 'm15.failS' : 'm15.cancelS', { id: '<b class="ref">' + o.id + '</b>' }) });
        foot = ui.btn(c.t('m15.orders'), { act: 'orders', icon: 'receipt' });
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
      if (outcome === 'success') {
        o.pay = 'succeeded'; o.status = 'awaiting_confirmation'; o.paidAt = '19.10 · ' + D.NOW.time;
        if (c.S.draft.orderId === o.id) c.S.draft = D.newDraft();
        app.replace('m16', { orderId: o.id });
        return;
      }
      o.pay = 'unpaid';
      o.status = 'awaiting_payment';
      L.phase = outcome === 'failed' ? 'failed' : 'cancelled';
      c.update();
    },
    onBack: function (c) {
      if (c.L.phase === 'checking') { app.toast(c.t('m15.wait'), 'hourglass'); return false; }
    },
    actions: {
      orders: function () { app.reset([['m17']], 'fade'); }
    }
  };

  /* ================= M16 · Payment result ================= */
  S.m16 = {
    title: 'M16',
    render: function (c) {
      const o = ET.findOrder(c.S, c.P.orderId);
      const body = ui.hero({ icon: 'check', title: c.t('m16.okT'), sub: c.t('m16.okS') }) +
        '<div class="card"><div class="kv"><span class="k">' + c.t('m16.number') + '</span><span class="v ref">' + o.id + '</span></div>' +
        '<div class="kv"><span class="k">' + c.t('m14.total') + '</span><span class="v">' + ui.price(c, o.price) + '</span></div></div>';
      const foot = ui.btn(c.t('m15.openOrder'), { act: 'open' }) + ui.btn(c.t('m16.home'), { kind: 'sec', act: 'home' });
      return ui.page({ appbar: ui.appbar(c, { title: '', close: true, backAct: 'home' }), body: body, foot: foot });
    },
    onBack: function () { app.reset([['m6']], 'fade'); return false; },
    actions: {
      open: function (c) { app.reset([['m17'], ['m18', { orderId: c.P.orderId }]], 'fade'); },
      home: function () { app.reset([['m6']], 'fade'); }
    }
  };
})();

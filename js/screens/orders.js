/* M17 orders list (tab root) · M18 order card */
(function () {
  const ET = window.ET, D = ET.data, ui = ET.ui, I = ET.icon;
  const app = ET.app;
  const S = ET.Screens;

  /* order card: number, route, statuses, date/time, price, payment for unpaid orders */
  function ocard(c, o) {
    const tags = ui.statusTag(c, o) + ui.payTag(c, o);
    return '<article class="ocard"><button class="oc-open" data-act="open" data-arg="' + o.id + '">' +
      '<span class="oc-top">' +
      '<span class="oc-main"><span class="oc-id ref" style="display:block">' + o.id + '</span>' +
      '<span class="oc-route" style="display:block">' + ui.routeLine(c, o.from, o.to) + '</span></span></span>' +
      '<span class="tags" style="margin-top:10px;justify-content:flex-start">' + tags + '</span>' +
      '<span class="oc-bot"><span class="oc-when">' + I('calendar') + ui.when(c, o.date, o.time) + '</span>' + ui.money(c, o.price, 'oc-price') + '</span></button>' +
      (o.status === 'awaiting_payment' ? '<div class="oc-actions">' + ui.btn(c.t('m18.payNow', { p: ui.price(c, o.price) }), { act: 'pay', arg: o.id, icon: 'card' }) + '</div>' : '') + '</article>';
  }

  /* ================= M17 · Orders ================= */
  S.m17 = {
    title: 'M17', tab: 'orders',
    init: function (P) { return { seg: P.seg || 'active', state: P.state || 'ready', more: false, refreshing: false }; },
    render: function (c) {
      const L = c.L, S0 = c.S;
      const active = S0.orders.filter(D.isActive).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
      const done = S0.orders.filter(function (o) { return !D.isActive(o); }).concat(S0.history);
      const seg = '<div class="seg-wrap"><div class="segment" role="tablist">' +
        '<button class="seg' + (L.seg === 'active' ? ' on' : '') + '" role="tab" data-act="seg" data-arg="active">' + c.t('m17.active') + (active.length ? '<span class="cnt">' + active.length + '</span>' : '') + '</button>' +
        '<button class="seg' + (L.seg === 'done' ? ' on' : '') + '" role="tab" data-act="seg" data-arg="done">' + c.t('m17.done') + '</button></div></div>';
      let body;
      if (L.state === 'loading') {
        body = [0, 1, 2].map(function () {
          return '<div class="sk-card" style="margin-bottom:10px;display:flex;flex-direction:column;gap:12px"><div style="display:flex;gap:12px;align-items:center">' + ui.sk('40px', 40, 12) +
            '<div style="flex:1;display:flex;flex-direction:column;gap:7px">' + ui.sk('38%', 11) + ui.sk('76%', 15) + '</div></div>' + ui.sk('46%', 24, 12) + ui.sk('100%', 1, 0) + '<div style="display:flex;justify-content:space-between">' + ui.sk('40%', 13) + ui.sk('54px', 18) + '</div></div>';
        }).join('');
      } else if (L.state === 'error') {
        body = ui.statebox({ icon: 'alert', kind: 'danger', title: c.t('m17.errT'), sub: c.t('m17.errS'), actions: ui.btn(c.t('m17.refresh'), { kind: 'sec', act: 'refresh', icon: 'refresh', cls: 'w-auto', loading: L.refreshing }) });
      } else {
        const list = L.seg === 'active' ? active : done;
        if (!list.length) {
          body = (L.seg === 'active'
            ? ui.statebox({ icon: 'receipt', kind: 'brand', title: c.t('m17.emptyT'), sub: c.t('m17.emptyS'), actions: ui.btn(c.t('m17.newTransfer'), { act: 'newTransfer', icon: 'car', cls: 'w-auto' }) })
            : ui.statebox({ icon: 'flag', title: c.t('m17.emptyDoneT'), sub: c.t('m17.emptyDoneS') }));
        } else {
          body = list.map(function (o) { return ocard(c, o); }).join('');
          if (L.seg === 'done') {
            const hasMore = D.historyPage(S0.historyPage).length > 0;
            body += '<div class="list-end">' + (L.more ? ui.spinner('brand') + c.t('m17.loadingMore') : hasMore ? ui.btn(c.t('m17.showMore'), { kind: 'link', act: 'more' }) : c.t('m17.allLoaded')) + '</div>';
          }
        }
      }
      return ui.page({
        appbar: ui.appbar(c, { root: true, back: false, title: c.t('m17.title'), end: ui.iconBtn('refresh', { act: 'refresh', label: c.t('m17.refresh'), disabled: L.refreshing || L.state === 'loading', cls: L.refreshing ? 'spinning' : '' }) }),
        banner: ui.offline(c),
        body: (L.state === 'ready' ? seg : seg) + body,
        tabbar: ui.tabbar(c, 'orders')
      });
    },
    onEnter: function (c) {
      if (c.L.frozen) return;
      if (c.L.state === 'loading') c.later(function () { c.L.state = c.S.flags.ordersError ? 'error' : 'ready'; c.S.flags.ordersError = false; c.update(); }, 900);
      else if (c.L.state === 'ready') S.m17.refresh(c, true); // status is refreshed on open (spec §7)
    },
    refresh: function (c, silent) {
      const L = c.L;
      L.refreshing = true; c.update();
      c.later(function () {
        L.refreshing = false;
        if (c.S.net === 'offline') { if (!silent) app.toast(c.t('net.offline'), 'wifiOff'); c.update(); return; }
        if (L.state === 'error') L.state = 'ready';
        c.update();
        if (!silent) app.toast(c.t('m17.refreshed'), 'check');
      }, 800);
    },
    loadMore: function (c) {
      const L = c.L, S0 = c.S;
      if (L.more || !D.historyPage(S0.historyPage).length) return;
      L.more = true; c.update();
      c.later(function () {
        S0.history = S0.history.concat(D.historyPage(S0.historyPage)); S0.historyPage++;
        L.more = false; c.update();
      }, 1000);
    },
    onScroll: function (c, el) {
      if (c.L.seg === 'done' && el.scrollTop + el.clientHeight > el.scrollHeight - 80) S.m17.loadMore(c);
    },
    actions: {
      seg: function (c, s) { c.L.seg = s; c.update(); const sc = c.entry.el.querySelector('.scroll'); if (sc) sc.scrollTop = 0; },
      open: function (c, id) { app.push('m18', { orderId: id }); },
      pay: function (c, id) { ET.openPayment(id); },
      refresh: function (c) { S.m17.refresh(c); },
      more: function (c) { S.m17.loadMore(c); },
      newTransfer: function () { app.reset([['m6'], ['m8']], 'push'); }
    }
  };

  /* ================= M18 · Order card ================= */
  /* ================= M18 · Order card (minimal) =================
     One screen with only what the client needs: status, trip, price and payment,
     the driver once assigned, payment for an unpaid order, and a support call. */
  const ST_ICON = {
    awaiting_payment: ['amber', 'card'], awaiting_confirmation: ['', 'hourglass'], confirmed: ['', 'check'],
    driver_assigned: ['', 'car'], completed: ['neutral', 'flag'], cancelled: ['danger', 'ban'], rejected: ['danger', 'ban']
  };
  function kv(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }

  S.m18 = {
    title: 'M18',
    init: function () { return { refreshing: false }; },
    render: function (c) {
      const o = ET.findOrder(c.S, c.P.orderId), L = c.L;
      if (!o) return ui.page({ appbar: ui.appbar(c, { title: c.t('m18.titleShort') }), body: ui.statebox({ icon: 'search', title: c.t('m18.notFound') }) });
      const si = ST_ICON[o.status];
      const status = '<div class="st-hero"><div class="sh-row"><span class="lava ' + si[0] + '">' + I(si[1]) + '</span>' +
        '<div class="sh-txt"><div class="sh-t">' + c.t('m18.st.' + o.status) + '</div></div></div></div>';

      let note = '';
      if (o.pay === 'refund_pending') note = ui.warn(c.t('m18.refundPending', { p: ui.price(c, o.price) }), 'undo');
      else if (o.pay === 'refunded') note = ui.warn(c.t('m18.refunded', { p: ui.price(c, o.price) }), 'check', 'info');
      const details = '<div class="card od"><div class="od-route">' + ui.routeLine(c, o.from, o.to) + '</div>' +
        kv(c.t('m18.when'), ui.when(c, o.date, o.time)) +
        kv(c.t('m18.cls'), c.t('cls.' + o.cls)) +
        kv(c.t('m14.total'), ui.price(c, o.price)) +
        kv(c.t('m16.payment'), ui.payTag(c, o)) +
        (note ? '<div style="margin-top:6px">' + note + '</div>' : '') + '</div>';

      let drv = '';
      if (o.driver) {
        const dr = D.drivers[o.driver];
        drv = '<div class="card"><div class="drv">' +
          '<div class="dm"><div class="dn">' + dr.name[c.lang] + '</div><div class="dc">' + dr.car[c.lang] + '</div><span class="plate">' + dr.plate + '</span></div></div></div>';
      }

      const foot = (o.status === 'awaiting_payment' ? ui.btn(c.t('m18.payNow', { p: ui.price(c, o.price) }), { act: 'pay', icon: 'external' }) : '') +
        ui.btn(c.t('m18.callSupport'), { kind: 'sec', act: 'support', icon: 'phone' });
      return ui.page({
        appbar: ui.appbar(c, { title: c.t('m18.title', { id: '<span class="ref">' + o.id + '</span>' }), end: ui.iconBtn('refresh', { act: 'refresh', label: c.t('m17.refresh'), disabled: L.refreshing, cls: L.refreshing ? 'spinning' : '' }) }),
        banner: ui.offline(c),
        body: status + details + drv,
        foot: foot
      });
    },
    actions: {
      refresh: function (c) {
        const L = c.L, o = ET.findOrder(c.S, c.P.orderId);
        L.refreshing = true; c.update();
        c.later(function () {
          L.refreshing = false;
          if (c.S.net === 'offline') { c.update(); app.toast(c.t('net.offline'), 'wifiOff'); return; }
          // demo: an order created in this session moves along the operator flow on each refresh
          if (o.live && D.nextStatus[o.status] && o.pay === 'succeeded') {
            o.status = D.nextStatus[o.status];
            if (o.status === 'driver_assigned') o.driver = 'cohen';
            c.update(); app.toast(c.t('m18.newStatus', { s: c.t('st.' + o.status) }), 'check');
          } else { c.update(); app.toast(c.t('m18.upToDate'), 'check'); }
        }, 900);
      },
      pay: function (c) { ET.openPayment(c.P.orderId); },
      support: function (c) { app.toast(c.t('m18.supportDemo'), 'phone'); }
    }
  };
})();

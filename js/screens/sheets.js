/* Bottom sheets (Emun Drive .sheet pattern) + external-browser simulation (Custom Tab) */
(function () {
  const ET = window.ET, D = ET.data, ui = ET.ui, I = ET.icon;
  const app = ET.app;
  const SH = ET.Sheets;

  function head(icon, kind, title, sub) {
    return '<div class="okcircle ' + (kind || '') + '">' + I(icon) + '</div><div class="sh-title">' + title + '</div>' + (sub ? '<div class="sh-sub">' + sub + '</div>' : '');
  }
  const acts = function (h) { return '<div class="sh-actions">' + h + '</div>'; };

  /* M23 · confirm → (blocked | error | done) */
  SH.deleteConfirm = {
    render: function (c) {
      return head('trash', 'err', c.t('sh.del.t'), c.t('sh.del.s')) +
        acts(ui.btn(c.t('sh.del.go'), { act: 'go', cls: 'danger', loading: c.D.busy, loadingLabel: c.t('sh.del.busy') }) + ui.btn(c.t('common.cancel'), { kind: 'ghost', act: 'closeSheet', disabled: c.D.busy }));
    },
    actions: {
      go: function (c) {
        c.D.busy = true; c.update();
        c.later(function () {
          c.close();
          const active = c.S.orders.filter(D.isActive);
          if (c.S.net === 'offline' || c.S.flags.deleteError) { c.S.flags.deleteError = false; app.open('deleteError'); }
          else if (active.length) app.open('deleteBlocked', { id: active[0].id, n: active.length });
          else app.open('deleteDone');
        }, 1100);
      }
    }
  };
  SH.deleteBlocked = {
    render: function (c) {
      return head('alert', 'amber', c.t('sh.blk.t'), c.t('sh.blk.s', { id: '<b class="ref">' + c.D.id + '</b>' })) +
        acts(ui.btn(c.t('sh.blk.orders'), { act: 'orders', icon: 'receipt' }) + ui.btn(c.t('common.ok'), { kind: 'ghost', act: 'closeSheet' }));
    },
    actions: { orders: function (c) { c.close(); app.reset([['m17']], 'fade'); } }
  };
  SH.deleteError = {
    render: function (c) {
      return head('alertCircle', 'err', c.t('sh.derr.t'), c.t('sh.derr.s')) +
        acts(ui.btn(c.t('common.retry'), { act: 'retry', icon: 'refresh' }) + ui.btn(c.t('common.cancel'), { kind: 'ghost', act: 'closeSheet' }));
    },
    actions: { retry: function (c) { c.close(); app.open('deleteConfirm'); } }
  };
  SH.deleteDone = {
    blocking: true,
    render: function (c) {
      return head('check', '', c.t('sh.done.t'), c.t('sh.done.s')) + acts(ui.btn(c.t('common.ok'), { act: 'ok' }));
    },
    actions: { ok: function (c) { c.close(); ET.signOut(c.S); app.reset([['m2']], 'fade'); } }
  };

  /* External browser (Chrome Custom Tab). kind: '3ds' payment confirmation · 'doc' legal document.
     This is only a stand-in for the third-party page so the flow can be walked end to end. */
  /* m.shapiro@gmail.com → m•••@gmail.com */
  ET.maskEmail = function (e) { const p = String(e).split('@'); return p[0].charAt(0) + '•••@' + (p[1] || ''); };

  SH.browser = {
    full: true,
    onBack: function (c) { SH.browser.actions.close(c); },
    render: function (c) {
      const k = c.D.kind;
      const host = k === '3ds' ? 'pay.gateway.test/3ds' : 'emun.taxi/legal/' + c.D.doc;
      const title = k === '3ds' ? c.t('br.payTitle') : c.t('doc.' + c.D.doc);
      let page;
      if (k === '3ds') {
        const o = ET.findOrder(c.S, c.D.orderId);
        if (c.D.busy) page = ui.hero({ inner: '<span class="ring"></span>', kind: 'wait', title: c.t('br.processing') });
        else page = '<div class="x-head"><span class="lava">' + I('shield') + '</span><div><div class="x-t">' + c.t('br.confirmT') + '</div>' +
          '<div class="x-s">' + c.t('br.confirmS', { email: '<b class="ref">' + ET.maskEmail((c.S.session || D.defaultUser).email) + '</b>' }) + '</div></div></div>' +
          '<div class="card"><div class="kv"><span class="k">' + c.t('m14.total') + '</span><span class="v">' + ui.price(c, o.price) + '</span></div></div>' +
          '<label class="tf x-code"><span class="tf-label">' + c.t('br.sms') + '</span><span class="tf-box">' + I('lock') +
          '<input value="482913" inputmode="numeric" dir="ltr" aria-label="' + c.t('br.sms') + '"></span></label>' +
          '<div class="x-actions">' + ui.btn(c.t('br.confirm'), { act: 'confirm' }) + ui.btn(c.t('br.cancel'), { kind: 'link', act: 'cancel' }) + '</div>' +
          '<div class="x-test"><span class="x-tl">' + c.t('br.test') + '</span><div class="segment">' +
          ['success', 'failed'].map(function (r) { return '<button class="seg' + (c.D.outcome === r ? ' on' : '') + '" data-act="outcome" data-arg="' + r + '">' + c.t('br.r.' + r) + '</button>'; }).join('') +
          '</div></div>';
      } else {
        page = '<div class="x-head"><span class="lava">' + I('file') + '</span><div><div class="x-t">' + title + '</div><div class="x-s">' + c.t('br.docRev') + '</div></div></div>' +
          '<div class="card x-doc">' + [1, 2, 3].map(function (i) { return '<div class="x-h3">' + i + '.</div><div class="x-lines"><span></span><span></span><span></span><span></span></div>'; }).join('') + '</div>';
      }
      return '<div class="ctab"><button class="iconbtn" data-act="close" aria-label="' + c.t('a11y.close') + '">' + I('x') + '</button><div class="ct"><div class="ct1">' + title + '</div>' +
        '<div class="ct2">' + I('lock') + '<span>' + host + '</span></div></div></div>' +
        '<div class="ext"><div class="x-label">' + ui.tag(c.t('br.label'), '', 'external') + '</div>' + page + '</div>';
    },
    actions: {
      outcome: function (c, r) { c.D.outcome = r; c.update(); },
      confirm: function (c) {
        c.D.busy = true; c.update();
        c.later(function () { c.close(); ET.returnFromPayment(c.D.orderId, c.D.outcome || 'success'); }, 1100);
      },
      cancel: function (c) { c.close(); ET.returnFromPayment(c.D.orderId, 'cancelled'); },
      close: function (c) {
        c.close();
        if (c.D.kind === '3ds') ET.returnFromPayment(c.D.orderId, 'cancelled');
      }
    }
  };
})();

/* EMUN TAXI — reusable UI building blocks.
   Each helper returns markup made of Emun Drive classes (emun-modern.css) plus the few
   app-level additions in app.css. Screens compose these instead of duplicating markup. */
(function () {
  const ET = (window.ET = window.ET || {});
  const D = ET.data;
  const I = ET.icon;
  const esc = (ET.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  });
  const LOCALE = { ru: 'ru-RU', en: 'en-GB', he: 'he-IL' };

  const ui = (ET.ui = {});

  ui.attrs = function (o) {
    o = o || {};
    let s = '';
    if (o.act) s += ' data-act="' + o.act + '"';
    if (o.arg != null) s += ' data-arg="' + esc(o.arg) + '"';
    if (o.p) s += " data-p='" + esc(JSON.stringify(o.p)) + "'";
    if (o.id) s += ' id="' + o.id + '"';
    if (o.disabled) s += ' disabled'; // native state only, so screens can toggle .disabled live
    if (o.label) s += ' aria-label="' + esc(o.label) + '"';
    return s;
  };

  /* ---------- page skeleton ---------- */
  ui.page = function (o) {
    return (o.appbar || '') +
      (o.banner || '') +
      '<div class="scroll' + (o.scrollCls ? ' ' + o.scrollCls : '') + '" data-sk="main">' + (o.body || '') + '</div>' +
      (o.foot ? '<div class="foot">' + o.foot + '</div>' : '') +
      (o.tabbar || '');
  };

  ui.appbar = function (c, o) {
    const back = o.back === false ? '' :
      '<button class="iconbtn" ' + ui.attrs({ act: o.backAct || 'back', label: c.t('a11y.back') }) + '>' + I(o.close ? 'x' : 'back') + '</button>';
    return '<header class="appbar' + (o.root ? ' root' : '') + '">' + back +
      '<div class="ab-title">' + (o.kicker ? '<span class="kick">' + o.kicker + '</span>' : '') +
      '<h1 class="h1' + (o.root ? '' : ' sm') + '">' + o.title + '</h1></div>' +
      (o.end ? '<div class="ab-end">' + o.end + '</div>' : '') + '</header>';
  };

  ui.iconBtn = function (icon, o) {
    o = o || {};
    return '<button class="iconbtn' + (o.cls ? ' ' + o.cls : '') + '"' + ui.attrs(o) + '>' + I(icon) +
      (o.text ? '<span class="ib-text">' + o.text + '</span>' : '') + '</button>';
  };

  /* ---------- buttons ---------- */
  const KIND = { primary: 'btn-primary', soft: 'btn-soft', sec: 'btn-sec block', ghost: 'btn-ghost', link: 'btn-link', danger: 'btn-sec block danger' };
  ui.btn = function (label, o) {
    o = o || {};
    const cls = KIND[o.kind || 'primary'] + (o.loading ? ' is-loading' : '') + (o.cls ? ' ' + o.cls : '');
    const inner = o.loading ? '<span class="spin"></span><span>' + (o.loadingLabel || label) + '</span>'
      : (o.icon ? I(o.icon) : '') + '<span>' + label + '</span>' + (o.trail || '');
    return '<button class="' + cls + '"' + ui.attrs(Object.assign({}, o, { disabled: o.disabled || o.loading })) + '>' + inner + '</button>';
  };

  /* ---------- text field ---------- */
  ui.field = function (c, o) {
    const val = o.value != null ? o.value : '';
    const err = o.error ? ' err' : '';
    return '<label class="tf' + err + (o.cls ? ' ' + o.cls : '') + '">' +
      (o.label ? '<span class="tf-label">' + o.label + (o.optional ? ' <span class="tf-opt">· ' + c.t('common.optional') + '</span>' : '') + '</span>' : '') +
      '<span class="tf-box">' + (o.icon ? I(o.icon) : '') +
      '<input type="text" data-bind="' + o.bind + '" value="' + esc(val) + '"' +
      (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') +
      (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') +
      (o.autocomplete ? ' autocomplete="' + o.autocomplete + '"' : ' autocomplete="off"') +
      (o.dir ? ' dir="' + o.dir + '"' : '') +
      (o.enter ? ' data-enter="' + o.enter + '" enterkeyhint="go"' : '') +
      (o.maxlength ? ' maxlength="' + o.maxlength + '"' : '') +
      (o.disabled ? ' disabled' : '') +
      ' spellcheck="false" autocapitalize="' + (o.capitalize || 'off') + '">' +
      (o.trail || '') + '</span>' +
      (o.error ? '<span class="tf-help">' + I('alertCircle') + '<span>' + o.error + '</span></span>' :
        o.help ? '<span class="tf-help">' + o.help + '</span>' : '') +
      '</label>';
  };

  ui.checkbox = function (on, o) {
    return '<button class="cb-row' + (o.error ? ' err' : '') + '"' + ui.attrs(o) + ' role="checkbox" aria-checked="' + !!on + '">' +
      '<span class="cbox' + (on ? ' on' : '') + '">' + I('check') + '</span><span class="cb-text">' + o.text + '</span></button>';
  };

  /* ---------- tags, banners, notes ---------- */
  ui.tag = function (text, kind, icon) {
    return '<span class="tag' + (kind ? ' ' + kind : '') + '">' + (icon ? I(icon) : '') + text + '</span>';
  };
  ui.banner = function (kind, icon, text, end) {
    return '<div class="banner ' + kind + '">' + I(icon) + '<span class="b-text">' + text + '</span>' + (end || '') + '</div>';
  };
  ui.warn = function (text, icon, kind) {
    return '<div class="warn-card' + (kind ? ' ' + kind : '') + '">' + I(icon || 'alert') + '<div>' + text + '</div></div>';
  };
  ui.note = function (text, icon) {
    return '<div class="note">' + I(icon || 'info') + '<span>' + text + '</span></div>';
  };
  ui.offline = function (c) {
    return c.S.net === 'offline' ? '<div class="pg-banner">' + ui.banner('err', 'wifiOff', c.t('net.offline')) + '</div>' : '';
  };

  /* ---------- lists ---------- */
  ui.list = function (rows, cls) { return '<div class="list' + (cls ? ' ' + cls : '') + '">' + rows.join('') + '</div>'; };
  ui.row = function (o) {
    const tag = o.static ? 'div' : 'button';
    const lava = o.icon ? '<span class="lava' + (o.tone ? ' ' + o.tone : '') + '">' + (o.iconHtml || I(o.icon)) + '</span>' :
      o.letter ? '<span class="lava' + (o.tone ? ' ' + o.tone : '') + '">' + o.letter + '</span>' : '';
    const end = o.end != null ? o.end : (o.static ? '' : '<span class="chev">' + I('chev') + '</span>');
    return '<' + tag + ' class="lrow' + (o.cls ? ' ' + o.cls : '') + '"' + ui.attrs(o) + '>' +
      '<span class="lleft">' + lava + '<span class="lmain"><span class="ltitle">' + o.title + '</span>' +
      (o.sub ? '<span class="lsub">' + o.sub + '</span>' : '') + '</span></span>' +
      '<span class="lend">' + end + '</span></' + tag + '>';
  };
  ui.secLabel = function (t, h) {
    return '<div class="seclabel"><span class="t">' + t + '</span>' + (h ? '<span class="h">' + h + '</span>' : '') + '</div>';
  };

  /* ---------- empty / error / result states ---------- */
  ui.statebox = function (o) {
    return '<div class="statebox' + (o.flat ? ' flat' : '') + '"><div class="state-ic ' + (o.kind || '') + '">' + I(o.icon) + '</div>' +
      '<div class="st">' + o.title + '</div>' + (o.sub ? '<div class="ss">' + o.sub + '</div>' : '') +
      (o.actions ? '<div class="sb-actions">' + o.actions + '</div>' : '') + '</div>';
  };
  ui.hero = function (o) { // centred result block (M15/M16/M23)
    return '<div class="hero"><div class="okcircle ' + (o.kind || '') + '">' + (o.inner || I(o.icon)) + '</div>' +
      '<div class="hero-t">' + o.title + '</div>' + (o.sub ? '<div class="hero-s">' + o.sub + '</div>' : '') + '</div>';
  };

  /* ---------- skeleton / spinner ---------- */
  ui.sk = function (w, h, r, extra) {
    return '<span class="sk" style="width:' + w + ';height:' + h + 'px;border-radius:' + (r == null ? 8 : r) + 'px;' + (extra || '') + '"></span>';
  };
  ui.spinner = function (cls) { return '<span class="spin' + (cls ? ' ' + cls : '') + '"></span>'; };

  /* ---------- money / dates ---------- */
  /* prices are stored in ILS (spec §7) and shown in the currency picked in the profile */
  ui.amount = function (c, n) { return Math.round(n / D.currency(c.S.currency).rate); };
  ui.money = function (c, n, cls) {
    return '<span class="money' + (cls ? ' ' + cls : '') + '"><span class="cur">' + D.currency(c.S.currency).sign + '</span><span class="num">' + ui.amount(c, n) + '</span></span>';
  };
  ui.price = function (c, n) { return D.currency(c.S.currency).sign + '\u00a0' + ui.amount(c, n); };
  const cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  ui.fmtDate = function (c, iso, long) {
    if (!iso) return '';
    const f = new Intl.DateTimeFormat(LOCALE[c.lang], long ? { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' } : { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    return cap(f.format(D.parseDate(iso)));
  };
  ui.fmtDayMonth = function (c, iso) {
    return new Intl.DateTimeFormat(LOCALE[c.lang], { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(D.parseDate(iso));
  };
  ui.fmtMonth = function (c, y, m) {
    return cap(new Intl.DateTimeFormat(LOCALE[c.lang], { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m, 1))));
  };
  ui.weekdays = function (c, sundayFirst) {
    const f = new Intl.DateTimeFormat(LOCALE[c.lang], { weekday: c.lang === 'he' ? 'narrow' : 'short', timeZone: 'UTC' });
    const out = [];
    for (let i = 0; i < 7; i++) out.push(cap(f.format(new Date(Date.UTC(2026, 9, (sundayFirst ? 18 : 19) + i))).replace('.', '')));
    return out;
  };
  ui.when = function (c, date, time) {
    return ui.fmtDate(c, date) + ' · ' + time;
  };

  ui.place = function (c, id) { return esc(D.placeName(id, c.lang)); };
  ui.routeLine = function (c, from, to) {
    return '<span class="rline"><bdi>' + ui.place(c, from) + '</bdi>' + I('arrow', 'rarrow') + '<bdi>' + ui.place(c, to) + '</bdi></span>';
  };

  /* ---------- order statuses ---------- */
  const ST = {
    awaiting_payment: ['amber', 'card'], awaiting_confirmation: ['amber', 'hourglass'], confirmed: ['brand', 'check'],
    driver_assigned: ['brand', 'car'], completed: ['', 'flag'], cancelled: ['danger', 'ban'], rejected: ['danger', 'ban']
  };
  const PAY = {
    pending: ['', 'hourglass'], succeeded: ['brand', 'check'], failed: ['danger', 'x'], unpaid: ['amber', 'card'],
    refund_pending: ['amber', 'undo'], refunded: ['', 'undo']
  };
  ui.statusTag = function (c, o) { const s = ST[o.status]; return ui.tag(c.t('st.' + o.status), s[0], s[1]); };
  ui.payTag = function (c, o) { const s = PAY[o.pay]; return ui.tag(c.t('pay.' + o.pay), s[0], s[1]); };

  /* ---------- bottom navigation ---------- */
  ui.tabbar = function (c, active) {
    const tabs = [['services', 'grid'], ['orders', 'receipt'], ['profile', 'userCircle']];
    return '<nav class="tabbar">' + tabs.map(function (tb) {
      const on = tb[0] === active;
      return '<button class="tab' + (on ? ' on' : '') + '" data-act="tab" data-arg="' + tb[0] + '"' + (on ? ' aria-current="page"' : '') + '>' +
        '<span class="ind">' + I(tb[1]) + '</span><span>' + c.t('tab.' + tb[0]) + '</span></button>';
    }).join('') + '</nav>';
  };

  /* ---------- taxi-meter screens, ported 1:1 from EmunTaxiPrices Compose ----------
     EmunScreenHeader (filled arrow back, 27px title) and the 75dp MenuScreen row */
  ui.tmHeader = function (c, title) {
    return '<header class="tm-head"><button class="tm-back" data-act="back" aria-label="' + c.t('a11y.back') + '">' + I('arrowBackF') + '</button>' +
      '<h1 class="tm-title">' + title + '</h1></header>';
  };
  ui.tmMenuRow = function (o) {
    return '<button class="tm-mrow' + (o.cls ? ' ' + o.cls : '') + '"' + ui.attrs(o) + '><span class="tm-mic">' + I(o.icon) + '</span>' +
      '<span class="tm-mlabel">' + o.label + '</span>' + I('mChev', 'tm-mchev') + '</button>';
  };
  ui.tmPickRow = function (o) {
    return '<button class="tm-prow' + (o.on ? ' on' : '') + (o.cls ? ' ' + o.cls : '') + '"' + ui.attrs(o) + ' aria-pressed="' + !!o.on + '"><span class="tm-pav">' + o.avatar + '</span>' +
      '<span class="tm-pname">' + o.name + '</span>' + (o.on ? I('checkF', 'tm-pcheck') : '') + '</button>';
  };

  ui.brandMark = function (size) {
    return '<span class="brandmark' + (size ? ' ' + size : '') + '">' + I('route') + '</span>';
  };
})();

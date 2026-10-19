/* M1–M5: splash/session check, auth entry, email sign-in, email code, registration */
(function () {
  const ET = window.ET, D = ET.data, ui = ET.ui, I = ET.icon, esc = ET.esc;
  const app = ET.app;
  const S = ET.Screens;

  /* after a successful M4: straight to services */
  function finishAuth(c, isNew) {
    app.reset([['m6']], 'fade');
    if (isNew) app.toast(c.t('m4.welcomeNew'), 'check');
  }

  /* ================= M1 · Splash / session check ================= */
  S.m1 = {
    title: 'M1',
    pageClass: function (c) { return 'dark' + (c.L.frozen || !c.live ? ' frozen' : ''); },
    statusLight: true,
    render: function (c) {
      return '<div class="splash">' + ui.brandMark('lg') + '<div class="wordmark">EMUN TAXI</div></div>' +
        '<div class="splash-foot"><div class="progress" role="progressbar" aria-label="' + c.t('m1.checking') + '"><div class="fillp"></div></div></div>';
    },
    onEnter: function (c) {
      if (!c.L.frozen) c.later(function () { app.reset([[c.S.session ? 'm6' : 'm2']], 'fade'); }, 1600);
    },
    onBack: function () { return false; }
  };

  /* ================= M2 · Sign in by email / register =================
     The former M3 email step lives here: email field, «Получить код» and all its states
     (format, account not found → M5, send limit, no network). */
  S.m2 = {
    title: 'M2',
    init: function (P) { return { email: P.email || '', err: P.err || null, busy: false }; },
    render: function (c) {
      const L = c.L;
      const fieldErr = L.err === 'format' ? c.t('err.emailFormat') : null;
      return '<div class="scroll" data-sk="main"><div class="auth-hero">' + ui.brandMark('lg') + '<h1 class="h1">' + c.t('m2.title') + '</h1></div>' +
        '<div class="form">' + ui.field(c, { label: c.t('f.email'), bind: 'email', value: L.email, icon: 'mail', placeholder: 'name@example.com', inputmode: 'email', autocomplete: 'email', dir: 'ltr', enter: 'submit', error: fieldErr, help: c.t('m3.lead') }) +
        ET.region(c, 'msg') + '</div></div>' +
        '<div class="foot">' +
        ui.btn(c.t('m3.getCode'), { act: 'submit', disabled: !L.email.trim(), loading: L.busy, loadingLabel: c.t('m3.sending') }) +
        ui.btn(c.t('m2.register'), { kind: 'sec', act: 'register' }) + '</div>';
    },
    regions: {
      msg: function (c) {
        const L = c.L;
        if (L.err === 'notfound') return ui.warn(c.t('m3.notFound', { email: '<b class="ref">' + esc(L.email.trim()) + '</b>' }) +
          '<div class="wc-actions">' + ui.btn(c.t('m3.createAcc'), { kind: 'link', act: 'register' }) + ui.btn(c.t('m3.changeEmail'), { kind: 'link', act: 'focusEmail' }) + '</div>', 'userCircle', 'info');
        if (L.err === 'limit') return ui.warn(c.t('m3.limit'), 'clock');
        if (L.err === 'network') return ui.warn(c.t('err.network'), 'wifiOff', 'err');
        if (L.err === 'server') return ui.warn(c.t('err.server'), 'alertCircle', 'err');
        return '';
      }
    },
    onInput: function (c, key, v, el) {
      if (c.L.err) { c.L.err = null; c.update(); return; }
      const b = el.closest('.page').querySelector('[data-act="submit"]');
      if (b) b.disabled = !v.trim();
    },
    actions: {
      submit: function (c) {
        const L = c.L, email = L.email.trim();
        if (!email) return;
        if (!D.emailOk(email)) { L.err = 'format'; c.update(); return; }
        L.busy = true; L.err = null; c.update();
        c.later(function () {
          L.busy = false;
          if (c.S.net === 'offline') L.err = 'network';
          else if (/limit/i.test(email)) L.err = 'limit';
          else if (/new/i.test(email)) L.err = 'notfound';
          c.update();
          if (!L.err) app.push('m4', { email: email.toLowerCase(), mode: 'login' });
        }, 900);
      },
      register: function (c) { app.push('m5', { email: c.L.err === 'notfound' ? c.L.email.trim() : '' }); },
      focusEmail: function (c) {
        c.L.err = null; c.update();
        const el = c.entry.el.querySelector('[data-bind="email"]'); if (el) { el.focus(); el.select(); }
      }
    }
  };

  /* ================= M4 · Email confirmation code ================= */
  const CODE_ERR = { '000000': 'wrong', '111111': 'expired', '222222': 'used' };
  const DEAD = { expired: 1, used: 1, locked: 1 }; // a new code is needed, confirm stays disabled
  S.m4 = {
    title: 'M4',
    init: function (P) { return { code: '', err: null, busy: false, left: P.left != null ? P.left : 59, attempts: 0 }; },
    render: function (c) {
      const L = c.L, ok = L.code.length === 6 && !DEAD[L.err];
      return ui.page({
        appbar: ui.appbar(c, { title: c.t('m4.title') }),
        body: '<p class="lead">' + c.t('m4.lead', { email: '<b class="ref">' + esc(c.P.email) + '</b>' }) + ' ' +
          ui.btn(c.t('m4.change'), { kind: 'link', cls: 'inline', act: 'back' }) + '</p>' +
          '<div class="form">' + ET.region(c, 'otp') + ET.region(c, 'resend') + '</div>' +
          '<div class="note" style="margin-top:6px">' + I('info') + '<span>' + c.t('m4.spam') + '</span></div>',
        foot: ui.btn(c.t('m4.confirm'), { act: 'verify', disabled: !ok, loading: L.busy, loadingLabel: c.t('m4.checking') })
      });
    },
    regions: {
      otp: function (c) {
        const L = c.L, locked = L.err === 'locked';
        let cells = '';
        for (let i = 0; i < 6; i++) {
          cells += '<span class="cell' + (i === L.code.length ? ' cur' : '') + '">' + (L.code[i] || '') + '</span>';
        }
        const msg = L.err ? '<span class="tf-help" style="color:#B4282D">' + I('alertCircle') + '<span>' +
          c.t('m4.err.' + L.err, { n: 3 - L.attempts }) + '</span></span>' : '';
        return '<div class="tf' + (L.err ? ' err' : '') + '"><span class="tf-label">' + c.t('m4.codeLabel') + '</span>' +
          '<div class="otp' + (L.err ? ' err' : '') + (locked ? ' dis' : '') + '"><input data-bind="code" value="' + L.code + '" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="' + c.t('m4.codeLabel') + '"' + (locked ? ' disabled' : '') + ' data-enter="verify">' + cells + '</div>' + msg + '</div>';
      },
      resend: function (c) {
        const L = c.L;
        if (L.left > 0) return '<div class="resend">' + I('clock') + '<span>' + c.t('m4.resendIn', { t: '<b>0:' + String(L.left).padStart(2, '0') + '</b>' }) + '</span></div>';
        return '<div class="resend">' + ui.btn(c.t('m4.resend'), { kind: 'link', act: 'resend', icon: 'refresh' }) + '</div>';
      }
    },
    after: function (c, el) {
      if (!c.live || c.L.err === 'locked') return;
      const inp = el.querySelector('[data-bind="code"]');
      if (inp && document.activeElement !== inp && !c.L._focused) { c.L._focused = true; setTimeout(function () { inp.focus({ preventScroll: true }); }, 360); }
    },
    onEnter: function (c) { S.m4.tick(c); },
    tick: function (c) {
      if (c.L.frozen) return;
      c.later(function () {
        if (c.L.left > 0) { c.L.left--; c.patch('resend'); S.m4.tick(c); }
      }, 1000);
    },
    onInput: function (c, key, v, el) {
      const clean = v.replace(/\D/g, '').slice(0, 6);
      c.L.code = clean;
      if (c.L.err && c.L.err !== 'locked') c.L.err = null;
      c.patch('otp');
      const b = c.entry.el.querySelector('[data-act="verify"]');
      if (b) b.disabled = clean.length !== 6 || !!DEAD[c.L.err];
    },
    actions: {
      verify: function (c) {
        const L = c.L;
        if (L.code.length !== 6 || L.busy) return;
        L.busy = true; c.update();
        c.later(function () {
          L.busy = false;
          const e = CODE_ERR[L.code];
          if (e === 'wrong') { L.attempts++; L.err = L.attempts >= 3 ? 'locked' : 'wrong'; L.code = ''; if (L.err === 'locked') L.left = 0; c.update(); return; }
          if (e) { L.err = e; c.update(); return; }
          const isNew = c.P.mode === 'register';
          ET.signIn(c.S, c.P.email, c.P.name, isNew);
          finishAuth(c, isNew);
        }, 900);
      },
      resend: function (c) {
        Object.assign(c.L, { left: 59, code: '', err: null, attempts: 0 });
        c.update(); S.m4.tick(c);
        app.toast(c.t('m4.sent'), 'mail');
      }
    }
  };

  /* ================= M5 · Registration ================= */
  S.m5 = {
    title: 'M5',
    init: function (P) { return { name: '', email: P.email || '', agree: false, errs: {}, busy: false, fail: null }; },
    render: function (c) {
      const L = c.L, e = L.errs;
      return ui.page({
        appbar: ui.appbar(c, { title: c.t('m5.title') }),
        body: '<p class="lead">' + c.t('m5.lead') + '</p>' +
          '<div class="form">' +
          ui.field(c, { label: c.t('f.name'), bind: 'name', value: L.name, icon: 'user', placeholder: c.t('f.namePh'), autocomplete: 'name', capitalize: 'words', error: e.name ? c.t('err.nameReq') : null }) +
          ui.field(c, { label: c.t('f.email'), bind: 'email', value: L.email, icon: 'mail', placeholder: 'name@example.com', inputmode: 'email', autocomplete: 'email', dir: 'ltr', error: e.email ? c.t('err.emailFormat') : null, help: c.t('m5.emailHelp') }) +
          '<div class="cb-row' + (e.agree ? ' err' : '') + '" role="checkbox" tabindex="0" aria-checked="' + L.agree + '" data-act="agree">' +
          '<span class="cbox' + (L.agree ? ' on' : '') + '">' + I('check') + '</span><span class="cb-text">' +
          c.t('m5.agree', { terms: '<span class="lnk" role="link" data-act="doc" data-arg="terms">' + c.t('doc.terms') + '</span>', privacy: '<span class="lnk" role="link" data-act="doc" data-arg="privacy">' + c.t('doc.privacyShort') + '</span>' }) +
          '</span></div>' +
          (e.agree ? '<span class="tf-help" style="color:#B4282D;margin-top:-10px">' + I('alertCircle') + '<span>' + c.t('err.agreeReq') + '</span></span>' : '') +
          ET.region(c, 'msg') + '</div>',
        foot: ui.btn(c.t('m5.create'), { act: 'submit', loading: L.busy, loadingLabel: c.t('m3.sending') }) +
          ui.btn(c.t('m5.haveAcc'), { kind: 'link', act: 'toLogin' })
      });
    },
    regions: {
      msg: function (c) {
        if (c.L.fail === 'exists') return ui.warn(c.t('m5.exists') + '<div class="wc-actions">' + ui.btn(c.t('m2.signIn'), { kind: 'link', act: 'toLogin' }) + '</div>', 'userCircle', 'info');
        if (c.L.fail === 'send') return ui.warn(c.t('m5.sendFail'), 'alertCircle', 'err');
        return '';
      }
    },
    onInput: function (c, key) {
      if (c.L.errs[key] || c.L.fail) { c.L.errs[key] = false; c.L.fail = null; c.update(); }
    },
    actions: {
      agree: function (c) { c.L.agree = !c.L.agree; c.L.errs.agree = false; c.update(); },
      doc: function (c, arg) { app.open('browser', { kind: 'doc', doc: arg }); },
      toLogin: function (c) {
        const prev = app.stack[app.stack.length - 2];
        if (prev && prev.id === 'm2') { prev.L.email = c.L.email.trim() || prev.L.email; prev.L.err = null; app.pop(); }
        else app.reset([['m2', { email: c.L.email.trim() }]], 'fade');
      },
      submit: function (c) {
        const L = c.L, email = L.email.trim();
        L.errs = { name: !L.name.trim(), email: !D.emailOk(email), agree: !L.agree };
        L.fail = null;
        if (L.errs.name || L.errs.email || L.errs.agree) { c.update(); return; }
        L.busy = true; c.update();
        c.later(function () {
          L.busy = false;
          if (D.registered.indexOf(email.toLowerCase()) >= 0) L.fail = 'exists';
          else if (/fail/i.test(email) || c.S.net === 'offline') L.fail = 'send';
          c.update();
          if (!L.fail) app.push('m4', { email: email.toLowerCase(), mode: 'register', name: L.name.trim() });
        }, 900);
      }
    }
  };

  ET.finishAuth = finishAuth;
})();

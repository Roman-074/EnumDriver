/* M19 profile (tab root) · M20 language · currency · M23 account deletion.
   The «Язык» / «Валюта» menu rows and both pickers repeat the taxi meter 1:1
   (EmunTaxiPrices features/menu/MenuScreen.kt, language/ and currency/ LanguageScreen /
   CurrencyScreen): a tap selects and returns, no save button. */
(function () {
  const ET = window.ET, D = ET.data, ui = ET.ui, I = ET.icon, esc = ET.esc;
  const app = ET.app;
  const S = ET.Screens;
  // same order and avatars as the taxi meter's LanguageRoute
  const LANGS = [['ru', 'Русский', 'Ru'], ['he', 'עברית', 'ע'], ['en', 'English', 'En']];

  function initials(name) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }

  /* ================= M19 · Profile ================= */
  S.m19 = {
    title: 'M19', tab: 'profile',
    render: function (c) {
      const u = c.S.session || D.defaultUser, name = D.txt(u.name, c.lang);
      return ui.page({
        appbar: ui.appbar(c, { root: true, back: false, title: c.t('m19.title') }),
        body: '<div class="me"><span class="ava">' + esc(initials(name)) + '</span><div class="mm"><div class="mn">' + esc(name) + '</div>' +
          '<div class="mail">' + esc(u.email) + '</div>' + ui.tag(c.t('m19.verified'), 'brand', 'check') + '</div></div>' +
          '<div class="tm-card tm-menu">' +
          ui.tmMenuRow({ act: 'go', arg: 'm20', icon: 'mLang', label: c.t('tm.language') }) +
          ui.tmMenuRow({ act: 'go', arg: 'cur', icon: 'mCur', label: c.t('tm.currency') }) +
          '</div>' +
          '<div class="tm-card tm-menu">' +
          ui.tmMenuRow({ act: 'go', arg: 'm23', icon: 'mTrash', label: c.t('m23.title'), cls: 'danger' }) +
          '</div>' +
          '<div class="ver">EMUN TAXI · ' + c.t('m19.version') + ' 1.0.0 (1)</div>',
        tabbar: ui.tabbar(c, 'profile')
      });
    }
  };

  /* ================= M20 · Language ================= */
  S.m20 = {
    title: 'M20',
    pageClass: 'tm',
    render: function (c) {
      return ui.tmHeader(c, c.t('tm.language')) +
        '<div class="scroll" data-sk="main"><div class="tm-card">' +
        LANGS.map(function (l) {
          return ui.tmPickRow({ act: 'sel', arg: l[0], on: l[0] === c.lang, avatar: '<span dir="auto">' + l[2] + '</span>', name: '<span dir="auto">' + l[1] + '</span>' });
        }).join('') + '</div></div>';
    },
    actions: {
      sel: function (c, lang) {
        if (lang !== c.S.lang) app.setLang(lang);
        app.pop();
      }
    }
  };

  /* ================= Currency (as in the taxi meter) ================= */
  S.cur = {
    title: 'CUR',
    pageClass: 'tm',
    render: function (c) {
      return ui.tmHeader(c, c.t('tm.currency')) +
        '<div class="scroll" data-sk="main"><div class="tm-card">' +
        D.currencies.map(function (cu) {
          return ui.tmPickRow({ act: 'sel', arg: cu.id, on: cu.id === c.S.currency, avatar: cu.sign, name: c.t(cu.key), cls: 'cur-row' });
        }).join('') + '</div></div>';
    },
    actions: {
      sel: function (c, id) { c.S.currency = id; app.pop(); }
    }
  };

  /* ================= M23 · Delete account ================= */
  S.m23 = {
    title: 'M23',
    render: function (c) {
      return ui.page({
        appbar: ui.appbar(c, { title: c.t('m23.screen') }),
        body: ui.hero({ icon: 'trash', kind: 'err', title: c.t('m23.q'), sub: c.t('m23.sub') }) +
          '<div class="card"><div class="cons">' +
          ['c1', 'c2', 'c3', 'c4'].map(function (k) { return '<div class="c">' + I(k === 'c4' ? 'info' : 'x') + '<span>' + c.t('m23.' + k) + '</span></div>'; }).join('') +
          '</div></div>',
        foot: ui.btn(c.t('m23.title'), { kind: 'danger', act: 'sheet', arg: 'deleteConfirm', icon: 'trash' }) + ui.btn(c.t('common.cancel'), { act: 'back' })
      });
    }
  };
})();

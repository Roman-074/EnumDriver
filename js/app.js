/* EMUN TAXI — prototype core (M0 · общая основа): app state, navigation stack with
   Android-style transitions, bottom sheets / external-browser overlays, snackbar,
   input binding, language + RTL switching. No backend: screens call mock data. */
(function () {
  const ET = (window.ET = window.ET || {});
  const D = ET.data;
  ET.Screens = ET.Screens || {};
  ET.Sheets = ET.Sheets || {};
  const noop = function () {};
  const ANIM = 320;

  /* ---------- state ---------- */
  ET.newState = function (lang) {
    return {
      lang: lang || 'ru', net: 'online', session: null, draft: D.newDraft(),
      currency: 'ILS',             // display currency picked in the profile (as in the taxi meter)
      recent: D.recentSeed.slice(), // M10 «Недавние»
      orders: [], history: [], historyPage: 0,
      flags: {},         // demo switches (payOutcome, linkError, priceError, …)
      seq: 10452         // next order number (ET-10452 …)
    };
  };
  /* M4 success → session + restored profile/history (existing account) */
  ET.signIn = function (S, email, name, isNew) {
    S.session = { name: name || D.nameFromEmail(email), email: email };
    if (!isNew) { S.orders = D.seedOrders(); S.history = D.seedHistory(); S.historyPage = 0; }
    else { S.orders = []; S.history = []; }
  };
  ET.signOut = function (S) {
    S.session = null; S.orders = []; S.history = []; S.draft = D.newDraft();
  };
  ET.findOrder = function (S, id) {
    return S.orders.find(function (o) { return o.id === id; }) || S.history.find(function (o) { return o.id === id; });
  };

  /* ---------- context passed to screens ---------- */
  function ctxFor(entry, S, live) {
    const c = {
      S: S, L: entry.L, P: entry.P, id: entry.id, entry: entry, lang: S.lang, rtl: S.lang === 'he', live: live,
      t: function (k, v) { return ET.t(S.lang, k, v); }
    };
    c.update = live ? function () { app.renderEntry(entry); } : noop;
    c.patch = live ? function (r) { app.patch(entry, r); } : noop;
    c.later = live ? function (fn, ms) {
      const h = setTimeout(function () { if (entry.alive) fn(); }, ms);
      entry.timers.push(h); return h;
    } : noop;
    return c;
  }
  ET.region = function (c, name, tag) {
    const scr = ET.Screens[c.id] || ET.Sheets[c.id];
    return '<' + (tag || 'div') + ' class="region" data-region="' + name + '">' + scr.regions[name](c) + '</' + (tag || 'div') + '>';
  };

  function newEntry(id, P, L, S) {
    const scr = ET.Screens[id];
    if (!scr) throw new Error('No screen ' + id);
    return { id: id, P: P || {}, L: Object.assign(scr.init ? scr.init(P || {}, S) : {}, L || {}), el: null, timers: [], alive: true };
  }
  function pageClass(scr, c) { return 'page' + (scr.pageClass ? ' ' + (typeof scr.pageClass === 'function' ? scr.pageClass(c) : scr.pageClass) : ''); }

  /* status bar + gesture pill rendered inside the app (edge-to-edge, like Android) */
  ET.sysbars = function () {
    return '<div class="sys status" aria-hidden="true"><span class="sys-time">' + D.NOW.time + '</span><span class="sys-r">' +
      ET.sysIcon('wifi') + ET.sysIcon('signal') + ET.sysIcon('battery') + '</span></div>' +
      '<div class="sys navpill" aria-hidden="true"><span></span></div>';
  };

  /* ---------- static render (overview board) ---------- */
  ET.staticHTML = function (S, entryDef, sheet) {
    const e = newEntry(entryDef.id, entryDef.P, entryDef.L, S);
    const scr = ET.Screens[e.id];
    const c = ctxFor(e, S, false);
    let html = '<div class="viewport"><section class="' + pageClass(scr, c) + '">' + scr.render(c) + '</section></div><div class="overlays">';
    if (sheet) {
      const sh = ET.Sheets[sheet.name];
      const sc = sheetCtx(sh, sheet.name, sheet.data || {}, S, null, false);
      html += overlayHTML(sh, sc, true);
    }
    html += '</div>';
    const light = statusLight(scr, c, sheet && ET.Sheets[sheet.name].full ? ET.Sheets[sheet.name] : null);
    return { html: html + ET.sysbars(), light: light };
  };

  function statusLight(scr, c, fullOv) {
    if (fullOv) return !!fullOv.statusLight;
    return typeof scr.statusLight === 'function' ? scr.statusLight(c) : !!scr.statusLight;
  }

  /* ---------- sheets ---------- */
  function sheetCtx(sh, name, data, S, ov, live) {
    const c = { S: S, D: data, id: name, lang: S.lang, rtl: S.lang === 'he', live: live, L: data, t: function (k, v) { return ET.t(S.lang, k, v); } };
    c.close = live ? function () { app.closeOverlay(ov); } : noop;
    c.update = live ? function () { app.renderOverlay(ov); } : noop;
    c.later = live ? function (fn, ms) { const h = setTimeout(function () { if (ov.alive) fn(); }, ms); ov.timers.push(h); return h; } : noop;
    return c;
  }
  function overlayHTML(sh, sc, open) {
    if (sh.full) return '<div class="ov full' + (open ? ' open' : '') + '"><div class="ov-page">' + sh.render(sc) + '</div></div>';
    return '<div class="ov' + (open ? ' open' : '') + '"><div class="scrim"' + (sh.blocking ? '' : ' data-act="closeSheet"') + '></div>' +
      '<div class="sheet' + (sh.center === false ? '' : ' center') + '"><div class="handle"></div>' + sh.render(sc) + '</div></div>';
  }

  /* ---------- live engine ---------- */
  const app = (ET.app = {
    S: null, stack: [], ovs: [], root: null, vp: null, ovl: null,

    init: function (root) {
      app.root = root;
      root.innerHTML = '<div class="viewport"></div><div class="overlays"></div><div class="snack" role="status" aria-live="polite"></div>' + ET.sysbars();
      app.vp = root.querySelector('.viewport');
      app.ovl = root.querySelector('.overlays');
      app.snackEl = root.querySelector('.snack');

      root.addEventListener('click', function (e) {
        const el = e.target.closest('[data-act]');
        if (!el || !root.contains(el)) return;
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
        e.preventDefault();
        app.dispatch(el.dataset.act, el.dataset.arg, el);
      });
      root.addEventListener('input', function (e) {
        const el = e.target, key = el.dataset && el.dataset.bind;
        if (!key) return;
        const entry = app.top(); const scr = ET.Screens[entry.id];
        const c = ctxFor(entry, app.S, true);
        const v = el.value;
        if (key.indexOf('draft.') === 0) app.S.draft[key.slice(6)] = v; else entry.L[key] = v;
        if (scr.onInput) scr.onInput(c, key, v, el);
      });
      root.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) {
          e.preventDefault(); app.dispatch(e.target.dataset.enter, null, e.target);
        }
      });
      root.addEventListener('scroll', function (e) {
        const el = e.target;
        if (!el.classList || !el.classList.contains('scroll')) return;
        app.syncScroll(el);
        const entry = app.top();
        if (entry && entry.el && entry.el.contains(el)) {
          const scr = ET.Screens[entry.id];
          if (scr.onScroll) scr.onScroll(ctxFor(entry, app.S, true), el);
        }
      }, true);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !(e.target.closest && e.target.closest('.shell-panel'))) app.back();
      });
      window.addEventListener('popstate', function () { app.back(); });
    },

    top: function () { return app.stack[app.stack.length - 1]; },
    ctx: function (entry) { return ctxFor(entry || app.top(), app.S, true); },

    dispatch: function (act, arg, el) {
      let p = null;
      if (el && el.dataset && el.dataset.p) { try { p = JSON.parse(el.dataset.p); } catch (_) {} }
      const ov = app.ovs[app.ovs.length - 1];
      if (ov && ov.el.contains(el)) {
        const sh = ET.Sheets[ov.name];
        if (sh.actions && sh.actions[act]) return sh.actions[act](ov.ctx, arg, el, p);
      }
      const entry = app.top(), scr = entry && ET.Screens[entry.id];
      if (scr && scr.actions && scr.actions[act]) return scr.actions[act](app.ctx(entry), arg, el, p);
      if (ET.actions[act]) return ET.actions[act](app.ctx(entry), arg, el, p);
      console.warn('Unhandled action', act);
    },

    /* --- rendering --- */
    renderEntry: function (entry) {
      if (!entry.el) return;
      const scr = ET.Screens[entry.id];
      const c = ctxFor(entry, app.S, true);
      const keep = saveUI(entry.el);
      entry.el.innerHTML = scr.render(c);
      restoreUI(entry.el, keep);
      const sc = entry.el.querySelector('.scroll');
      if (sc) app.syncScroll(sc);
      if (scr.after) scr.after(c, entry.el);
    },
    patch: function (entry, region) {
      if (!entry.el) return;
      const host = entry.el.querySelector('[data-region="' + region + '"]');
      if (!host) return app.renderEntry(entry);
      const keep = saveUI(host);
      host.innerHTML = ET.Screens[entry.id].regions[region](ctxFor(entry, app.S, true));
      restoreUI(host, keep);
    },
    syncScroll: function (el) {
      const page = el.closest('.page');
      if (!page) return;
      page.classList.toggle('scrolled', el.scrollTop > 2);
      page.classList.toggle('more-below', el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    },
    mount: function (entry) {
      const scr = ET.Screens[entry.id];
      const el = document.createElement('section');
      el.className = pageClass(scr, ctxFor(entry, app.S, true));
      entry.el = el;
      app.vp.appendChild(el);
      app.renderEntry(entry);
    },
    enter: function (entry) {
      const scr = ET.Screens[entry.id];
      if (scr.onEnter) scr.onEnter(ctxFor(entry, app.S, true));
    },
    kill: function (entry) {
      entry.alive = false;
      entry.timers.forEach(clearTimeout);
      const scr = ET.Screens[entry.id];
      if (scr.onLeave) scr.onLeave(ctxFor(entry, app.S, true));
    },
    chrome: function () {
      const top = app.top(); if (!top) return;
      const full = app.ovs.filter(function (o) { return ET.Sheets[o.name].full; }).pop();
      const light = statusLight(ET.Screens[top.id], app.ctx(top), full ? ET.Sheets[full.name] : null);
      app.root.classList.toggle('sys-light', light);
      if (ET.onNavigate) ET.onNavigate(top.id);
    },

    /* --- navigation --- */
    push: function (id, P, L) {
      const prev = app.top();
      const e = newEntry(id, P, L, app.S);
      app.stack.push(e);
      app.mount(e);
      e.el.classList.add('noanim', 'from-end');
      void e.el.offsetWidth;
      e.el.classList.remove('noanim', 'from-end');
      if (prev) {
        prev.el.classList.add('to-start');
        setTimeout(function () { if (prev.el && app.top() !== prev) { prev.el.classList.add('hidden'); } }, ANIM);
      }
      try { history.pushState({ et: app.stack.length }, ''); } catch (_) {}
      app.enter(e);
      app.chrome();
      return e;
    },
    pop: function (n) {
      n = n || 1;
      if (app.stack.length <= 1) return false;
      while (n-- > 0 && app.stack.length > 1) {
        const top = app.stack.pop();
        app.kill(top);
        const el = top.el;
        if (n === 0) {
          el.classList.add('from-end');
          setTimeout(function () { el.remove(); }, ANIM);
        } else el.remove();
      }
      const prev = app.top();
      prev.el.classList.remove('hidden');
      void prev.el.offsetWidth;
      prev.el.classList.remove('to-start');
      const scr = ET.Screens[prev.id];
      if (scr.onResume) scr.onResume(app.ctx(prev)); else app.renderEntry(prev);
      app.chrome();
      return true;
    },
    replace: function (id, P, L) {
      const old = app.top();
      app.stack.pop();
      const e = newEntry(id, P, L, app.S);
      app.stack.push(e);
      app.mount(e);
      e.el.classList.add('noanim', 'from-end');
      void e.el.offsetWidth;
      e.el.classList.remove('noanim', 'from-end');
      app.kill(old);
      old.el.classList.add('to-start');
      setTimeout(function () { old.el.remove(); }, ANIM);
      app.enter(e);
      app.chrome();
      return e;
    },
    /* defs: [[id, P, L], …] — last one is visible */
    reset: function (defs, mode) {
      const old = app.stack;
      app.stack = [];
      old.forEach(function (e) { app.kill(e); });
      const oldEls = old.map(function (e) { return e.el; });
      defs.forEach(function (d, i) {
        const e = newEntry(d[0], d[1], d[2], app.S);
        app.stack.push(e);
        app.mount(e);
        if (i < defs.length - 1) e.el.classList.add('hidden', 'to-start', 'noanim');
      });
      const top = app.top();
      if (mode === 'push') {
        top.el.classList.add('noanim', 'from-end'); void top.el.offsetWidth; top.el.classList.remove('noanim', 'from-end');
        oldEls.forEach(function (el) { el.classList.add('to-start'); setTimeout(function () { el.remove(); }, ANIM); });
      } else if (mode === 'fade') {
        top.el.classList.add('noanim', 'fade-in'); void top.el.offsetWidth; top.el.classList.remove('noanim', 'fade-in');
        oldEls.forEach(function (el) { setTimeout(function () { el.remove(); }, 200); });
      } else {
        oldEls.forEach(function (el) { el.remove(); });
      }
      app.stack.slice(0, -1).forEach(function (e) { setTimeout(function () { e.el && e.el.classList.remove('noanim'); }, 30); });
      app.stack.forEach(function (e) { app.enter(e); });
      app.chrome();
    },
    tab: function (name) {
      const roots = { services: 'm6', orders: 'm17', profile: 'm19' };
      const top = app.top();
      if (top && top.id === roots[name] && app.stack.length === 1) {
        const sc = top.el.querySelector('.scroll'); if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      app.reset([[roots[name]]], 'fade');
    },
    back: function () {
      const ov = app.ovs[app.ovs.length - 1];
      if (ov) {
        const sh = ET.Sheets[ov.name];
        if (sh.onBack) sh.onBack(ov.ctx); else if (!sh.blocking) app.closeOverlay(ov);
        return;
      }
      const top = app.top(); if (!top) return;
      const scr = ET.Screens[top.id];
      if (scr.onBack && scr.onBack(app.ctx(top)) === false) return;
      if (app.pop()) return;
      if (top.id === 'm17' || top.id === 'm19') app.tab('services');
    },

    /* --- overlays --- */
    open: function (name, data) {
      const sh = ET.Sheets[name];
      const ov = { name: name, data: data || {}, timers: [], alive: true, el: null };
      ov.ctx = sheetCtx(sh, name, ov.data, app.S, ov, true);
      const wrap = document.createElement('div');
      wrap.innerHTML = overlayHTML(sh, ov.ctx, false);
      ov.el = wrap.firstChild;
      app.ovl.appendChild(ov.el);
      app.ovs.push(ov);
      void ov.el.offsetWidth;
      ov.el.classList.add('open');
      if (sh.onOpen) sh.onOpen(ov.ctx);
      app.chrome();
      return ov;
    },
    renderOverlay: function (ov) {
      const sh = ET.Sheets[ov.name];
      const host = ov.el.querySelector(sh.full ? '.ov-page' : '.sheet');
      host.innerHTML = (sh.full ? '' : '<div class="handle"></div>') + sh.render(ov.ctx);
    },
    closeOverlay: function (ov, instant) {
      ov = ov || app.ovs[app.ovs.length - 1];
      if (!ov) return;
      ov.alive = false; ov.timers.forEach(clearTimeout);
      app.ovs = app.ovs.filter(function (o) { return o !== ov; });
      ov.el.classList.remove('open');
      const el = ov.el;
      if (instant) el.remove(); else setTimeout(function () { el.remove(); }, ANIM);
      app.chrome();
    },
    closeAll: function () { app.ovs.slice().forEach(function (o) { app.closeOverlay(o, true); }); },

    toast: function (text, icon) {
      const el = app.snackEl;
      el.innerHTML = (icon ? ET.icon(icon) : '') + '<span>' + text + '</span>';
      el.classList.toggle('above-tabs', !!(app.top() && app.top().el.querySelector('.tabbar')));
      el.classList.add('show');
      clearTimeout(app._snackT);
      app._snackT = setTimeout(function () { el.classList.remove('show'); }, 2600);
    },

    /* --- language / whole-app rerender --- */
    applyDir: function () {
      app.root.setAttribute('dir', app.S.lang === 'he' ? 'rtl' : 'ltr');
      app.root.setAttribute('lang', app.S.lang);
    },
    setLang: function (lang) {
      app.S.lang = lang;
      app.applyDir();
      app.stack.forEach(function (e) { app.renderEntry(e); });
      app.ovs.forEach(function (o) { o.ctx.lang = lang; o.ctx.rtl = lang === 'he'; app.renderOverlay(o); });
      if (ET.onLang) ET.onLang(lang);
    },

    /* --- start / jump (used by the prototype shell) --- */
    start: function (S, defs, overlay) {
      app.closeAll();
      app.S = S;
      app.applyDir();
      app.reset(defs, 'none');
      if (overlay) app.open(overlay.name, overlay.data);
    }
  });

  /* ---------- UI state preservation across re-renders ---------- */
  function saveUI(root) {
    const st = { sk: {} };
    root.querySelectorAll('[data-sk]').forEach(function (el) { st.sk[el.dataset.sk] = [el.scrollTop, el.scrollLeft]; });
    const a = document.activeElement;
    if (a && root.contains(a) && a.dataset && a.dataset.bind) {
      st.focus = a.dataset.bind;
      try { st.sel = [a.selectionStart, a.selectionEnd]; } catch (_) {}
    }
    return st;
  }
  function restoreUI(root, st) {
    root.querySelectorAll('[data-sk]').forEach(function (el) {
      const v = st.sk[el.dataset.sk];
      if (v) { el.scrollTop = v[0]; el.scrollLeft = v[1]; }
    });
    if (st.focus) {
      const el = root.querySelector('[data-bind="' + st.focus + '"]');
      if (el) { el.focus({ preventScroll: true }); try { if (st.sel) el.setSelectionRange(st.sel[0], st.sel[1]); } catch (_) {} }
    }
  }

  /* ---------- global actions (available on every screen) ---------- */
  ET.actions = {
    back: function () { app.back(); },
    go: function (c, arg, el, p) { app.push(arg, p || {}); },
    tab: function (c, arg) { app.tab(arg); },
    closeSheet: function () { app.closeOverlay(); },
    sheet: function (c, arg, el, p) { app.open(arg, p || {}); },
    noop: noop
  };
})();

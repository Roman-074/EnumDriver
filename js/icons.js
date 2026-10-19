/* EMUN TAXI — inline SVG icon set.
   Same rules as the Emun Drive design system: 24×24 grid, 2px stroke, round caps/joins
   (glyphs menu/swap/route/clock/person/luggage/sun/moon/edit/info/check/search/x are the
   exact ones used in figma-export/modern). Directional glyphs get class "flip" so they
   mirror in RTL (Hebrew). */
(function () {
  const ET = (window.ET = window.ET || {});

  const P = {
    menu: '<path d="M4 6h16M7 12h13M10 18h10"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    chevDown: '<path d="M6 9l6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    swap: '<path d="M8 4l-3 3M8 4l3 3M8 4v16M16 20l3-3M16 20l-3-3M16 20V4"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
    luggage: '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M9 8V6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
    moon: '<path d="M12 3c.13 0 .26 0 .39 0a7.5 7.5 0 0 0 7.92 12.45A9 9 0 1 1 12 3z"/>',
    edit: '<path d="M4 20h4l10.5-10.5a2 2 0 0 0-4-4L4 16v4"/><path d="M13.5 6.5l4 4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    alertCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4.5M12 16h.01"/>',
    wifiOff: '<path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.7M19 12.9a10 10 0 0 0-2.4-1.7M2 8.8a15 15 0 0 1 4.3-2.7M22 8.8A15 15 0 0 0 10.6 5M12 20h.01"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5l8.5 6 8.5-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    userCircle: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.2 18.4a7 7 0 0 1 11.6 0"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    headset: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><path d="M4 15a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zM20 15a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2zM18 19a3 3 0 0 1-3 3h-2"/>',
    chat: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.6-4.3A8.5 8.5 0 1 1 20.5 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
    phone: '<path d="M5 4h3.5l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5L15 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    logout: '<path d="M10 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4M15 16l4-4-4-4M19 12H9"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4.5h6V7"/>',
    plane: '<path d="M10.5 3.5c.8-.8 2.2-.8 3 0v6l7 4.5v2l-7-2v4l2.5 2v1.5L12 20.5l-4 1V20l2.5-2v-4l-7 2v-2l7-4.5z"/>',
    building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M3 21h18M8 7h4M8 11h4M8 15h4"/>',
    anchor: '<circle cx="12" cy="5.5" r="2.5"/><path d="M12 8v13M4 13a8 8 0 0 0 16 0M2.5 13h3M18.5 13h3M9 11.5h6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    car: '<path d="M5 17H3.5v-5l2-5.5A1.5 1.5 0 0 1 6.9 5.5h10.2a1.5 1.5 0 0 1 1.4 1L20.5 12v5H19M9 17h6M3.5 12h17"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    carLux: '<path d="M5 17H3.5v-4.2c0-.5.2-1 .6-1.3L7 9l2-3h6l2 3 2.9 2.5c.4.3.6.8.6 1.3V17H19M9 17h6M7 9h10"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    van: '<path d="M5 17H3V7.5A1.5 1.5 0 0 1 4.5 6h10.3l5.2 5.2V17h-1M9 17h6M3 11.5h17M13 6v5.5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    bus: '<rect x="4" y="3" width="16" height="15" rx="2.5"/><path d="M4 10.5h16M7 18v2.5M17 18v2.5M8 14.5h.01M16 14.5h.01M9 6.5h6"/>',
    box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
    map: '<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 14.5V21M9.6 11.3L3.4 9.8M14.4 11.3l6.2-1.5"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    door: '<path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21M3 21h18M15 12h.01"/>',
    hash: '<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15l-5-5L5 19"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',

    /* taxi-meter glyphs, copied from EmunTaxiPrices: Material filled icons used by its Compose
       screens, res/drawable/ic_insert_arrow, and features/menu/assets/MenuIcons (20-unit grid) */
    arrowBackF: { fill: 1, d: '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>' },
    searchF: { fill: 1, d: '<path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>' },
    clearF: { fill: 1, d: '<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>' },
    searchOffF: { fill: 1, d: '<path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 0 0 9.5 3C6.08 3 3.28 5.64 3.03 9h2.02C5.3 6.75 7.18 5 9.5 5 11.99 5 14 7.01 14 9.5S11.99 14 9.5 14c-.17 0-.33-.03-.5-.05v2.02c.17.02.33.03.5.03 1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/><path d="M6.47 10.82 4 13.29l-2.47-2.47-.71.71L3.29 14 .82 16.47l.71.71L4 14.71l2.47 2.47.71-.71L4.71 14l2.47-2.47z"/>' },
    wifiOffF: { fill: 1, d: '<path d="M22.99 9 24 7.99C20.6 4.59 16.03 2.9 11.5 3l2.35 2.35c3.31.36 6.51 1.81 9.14 3.65zM18.99 13 20 11.99c-1.42-1.42-3.13-2.47-4.97-3.12l2.61 2.61c.47.15.93.33 1.35.52zM2 3.05 5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24A9.684 9.684 0 0 0 5 13v.01L6.99 15a7.042 7.042 0 0 1 4.92-2.06L18.98 20l1.27-1.26L3.29 1.79 2 3.05zM9 17l3 3 3-3a4.237 4.237 0 0 0-6 0z"/>' },
    checkF: { fill: 1, d: '<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>' },
    insert: { sw: 2.4, d: '<path d="M18 18 7 7M7 14V7h7"/>' },
    mLang: { vb: '0 0 20 20', sw: 1.75, d: '<path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"/><path d="M2.5 10H17.5M10 2.5C11.7635 4.60127 12.7302 7.25677 12.7302 10C12.7302 12.7432 11.7635 15.3987 10 17.5C8.2365 15.3987 7.26984 12.7432 7.26984 10C7.26984 7.25677 8.2365 4.60127 10 2.5Z"/>' },
    mCur: { vb: '0 0 20 20', sw: 1.75, d: '<path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"/><path d="M12.0833 7.91667C11.8921 7.53078 11.5942 7.20788 11.2249 6.9863C10.8556 6.76473 10.4305 6.65379 10 6.66667C8.83333 6.66667 7.91667 7.41667 7.91667 8.33333C7.91667 9.25 8.83333 10 10 10C11.1667 10 12.0833 10.75 12.0833 11.6667C12.0833 12.5833 11.1667 13.3333 10 13.3333C9.56953 13.3462 9.14441 13.2353 8.77511 13.0137C8.40582 12.7921 8.10788 12.4692 7.91667 12.0833M10 5.41667V6.25M10 13.75V14.5833"/>' },
    mTrash: { vb: '0 0 20 20', sw: 1.75, d: '<path d="M3.33 5.83h13.34M8.33 9.17v5M11.67 9.17v5M5 5.83l.83 10a1.67 1.67 0 0 0 1.67 1.67h5a1.67 1.67 0 0 0 1.67-1.67l.83-10M7.5 5.83V3.33h5v2.5"/>' },
    mChev: { vb: '0 0 20 20', sw: 1.66667, d: '<path d="M7.5 5L12.5 10L7.5 15"/>' }
  };

  /* Android status-bar glyphs (filled, Material-like) */
  const SYS = {
    wifi: '<path class="f" d="M12 20.5L1.4 8.2A15.6 15.6 0 0 1 12 4a15.6 15.6 0 0 1 10.6 4.2z"/>',
    signal: '<path class="f" d="M21 3v18H3z"/>',
    battery: '<rect class="f" x="7" y="3.5" width="10" height="18" rx="1.8"/><rect class="f" x="9.5" y="2" width="5" height="2" rx=".6"/>'
  };

  const FLIP = { back: 1, chev: 1, arrow: 1, arrowBackF: 1, insert: 1, mChev: 1 };

  ET.icon = function (name, cls) {
    const def = P[name];
    if (!def) { console.warn('icon missing', name); return ''; }
    const o = typeof def === 'string' ? { d: def } : def;
    const c = 'ic' + (o.fill ? ' fill' : '') + (FLIP[name] ? ' flip' : '') + (cls ? ' ' + cls : '');
    return '<svg class="' + c + '" viewBox="' + (o.vb || '0 0 24 24') + '"' + (o.sw ? ' style="stroke-width:' + o.sw + '"' : '') + ' aria-hidden="true">' + o.d + '</svg>';
  };
  ET.sysIcon = function (name) {
    return '<svg class="sys-ic" viewBox="0 0 24 24" aria-hidden="true">' + SYS[name] + '</svg>';
  };
  ET.iconNames = Object.keys(P);
})();

/* ==========================================================================
   TEAM JBYangC — 全站行为脚本 / Site behaviour
   --------------------------------------------------------------------------
   职责 / Responsibilities
     1. 尽早定好主题（白天 / 黑夜 / 跟随系统），避免闪白
     2. 注入导航与页脚（各页面只需一行占位，避免重复维护）
     3. 中英双语切换，并把选择记进 localStorage
     4. 滚动揭示动画、数字滚动、滚动进度条
     5. 视频进入视口才加载播放，离开即暂停（省流量、省 GPU）
     6. 素材库灯箱
   ========================================================================== */

/* --------------------------------------------------------------------------
   第 0 步，最先执行：把主题写到 <html> 上。
   本脚本在 <head> 之后的 body 末尾同步加载，此时页面还没首绘，
   所以能避免黑夜模式下先闪一下白屏。逻辑与 applyTheme 保持一致。
   -------------------------------------------------------------------------- */
(function () {
  var actual = 'dark';
  var mode = 'auto';
  try {
    mode = localStorage.getItem('jb-theme') || 'auto';
    if (mode === 'light' || mode === 'dark') {
      actual = mode;
    } else {
      mode = 'auto';
      actual = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
  } catch (e) { /* 隐私模式：按深色渲染 */ }
  document.documentElement.setAttribute('data-theme', actual);
  document.documentElement.setAttribute('data-theme-mode', mode);
})();

(function () {
  'use strict';

  /* ========================================================================
     0. 图标库 / Icon library（内联 SVG，无外部依赖）
     ======================================================================== */
  var I = {
    arrow:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    zoom:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg>',
    close:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    info:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
    users:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    target:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>',
    shield:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    heart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    play:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>',
    film:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5"/></svg>',
    image:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>',
    shirt:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3l4 2 4-2 5 3-2 5-2-1v10H7V10L5 11 3 6l5-3z"/></svg>',
    chat:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/></svg>',
    headset:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="13" width="4" height="6" rx="1.6"/><rect x="18" y="13" width="4" height="6" rx="1.6"/><path d="M20 19v1a3 3 0 0 1-3 3h-2"/></svg>',
    steam:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="15" cy="9.5" r="2.6"/><path d="M3.4 10.6l5.2 2.2M9 20.4l2.6-3.9"/></svg>',
    mail:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>',
    trophy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v6a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 20h6M12 15v5"/></svg>',
    flag:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V4M4 4h11l-1.6 4L15 12H4"/></svg>',
    spark:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6L12 3z"/></svg>',
    clock:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    grid:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    globe:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 6 3.9 9S14.6 18.4 12 21c-2.6-2.6-3.9-6-3.9-9S9.4 5.6 12 3z"/></svg>',
    pen:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    /* 关注 / 频道 */
    bell:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    video:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="14" height="14" rx="2.5"/><path d="M16 10.5l6-3.5v10l-6-3.5z"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1.8 1.8 0 0 1-1.8 1.8H5A1.8 1.8 0 0 1 3.2 19V7.8A1.8 1.8 0 0 1 5 6h5"/></svg>',
    /* 外观三态图标：跟随系统 / 白天 / 黑夜 */
    auto:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 21h7M12 17v4"/></svg>',
    sun:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.4v2.2M12 19.4v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.4 19.6L6 18M18 6l1.6-1.6"/></svg>',
    moon:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>'
  };

  /* ========================================================================
     1. 工具 / Helpers
     ======================================================================== */
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var LANG_KEY = 'jb-lang';

  /* 读取已保存语言；首次访问跟随浏览器，中文环境默认中文 */
  function initialLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === 'cn' || saved === 'en') return saved;
    } catch (e) { /* 隐私模式下忽略 */ }
    var nav = (navigator.language || 'zh').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'cn' : 'en';
  }

  var lang = initialLang();

  /* 取双语对象的当前语言值，自动回退到中文再回退到空串 */
  function pick(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.cn || obj.en || '';
  }
  window.JB_pick = pick;
  window.JB_lang = function () { return lang; };

  /* ========================================================================
     1b. 主题 / Theme
     ------------------------------------------------------------------------
     三态循环：跟随系统 → 深色 → 浅色 → 跟随系统。
     首次访问（没有存储值）跟随系统，之后记住用户的选择。
     ======================================================================== */
  var THEME_KEY = 'jb-theme';
  var THEMES = ['auto', 'dark', 'light'];
  var theme = 'auto';

  function readTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      if (t === 'dark' || t === 'light' || t === 'auto') return t;
    } catch (e) { /* 隐私模式下忽略 */ }
    return 'auto';
  }
  theme = readTheme();

  function systemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }

  /* 实际生效的外观（auto 时取系统值） */
  function resolvedTheme() {
    return theme === 'auto' ? systemTheme() : theme;
  }

  function applyTheme(next) {
    theme = THEMES.indexOf(next) >= 0 ? next : 'auto';
    var actual = resolvedTheme();

    document.documentElement.setAttribute('data-theme', actual);
    document.documentElement.setAttribute('data-theme-mode', theme);

    /* 移动端浏览器地址栏跟着变色 */
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', actual === 'light' ? '#f7f9fd' : '#05070d');

    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* 忽略 */ }

    /* 图标与提示文字按"当前模式"显示 */
    $$('.theme-btn').forEach(function (b) {
      b.setAttribute('data-mode', theme);
      b.setAttribute('aria-label', pick({
        cn: '外观：' + themeLabelCn(theme) + '（点击切换）',
        en: 'Appearance: ' + themeLabelEn(theme) + ' (click to cycle)'
      }));
      b.setAttribute('title', b.getAttribute('aria-label'));
    });
    $$('[data-i18n-theme]').forEach(function (el) {
      var v = pick({
        cn: '外观：' + themeLabelCn(theme),
        en: 'Appearance: ' + themeLabelEn(theme)
      });
      if (v) el.textContent = v;
    });
  }
  window.JB_applyTheme = applyTheme;
  window.JB_theme = function () { return theme; };

  function themeLabelCn(t) {
    return t === 'auto' ? '跟随系统' : (t === 'light' ? '白天模式' : '黑夜模式');
  }
  function themeLabelEn(t) {
    return t === 'auto' ? 'System' : (t === 'light' ? 'Light' : 'Dark');
  }

  function cycleTheme() {
    applyTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);
  }

  /* 用户选了 auto 时，系统外观变化要实时跟随 */
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onSystemChange = function () { if (theme === 'auto') applyTheme('auto'); };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  /* ------------------------------------------------------------------------
     1c. 配色预设 / Accent presets
     ------------------------------------------------------------------------
     与明暗主题正交：data-theme 管底色和文字，data-accent 只管强调色。
     四套循环：青蓝（默认）→ 竞技红 → 荧光绿 → 霓虹紫。
     默认青色不写属性，直接沿用 :root，避免多一层覆盖。
     ======================================================================== */
  var ACCENT_KEY = 'jb-accent';
  var ACCENTS = ['cyan', 'crimson', 'lime', 'violet'];
  var accent = 'cyan';

  function readAccent() {
    try {
      var a = localStorage.getItem(ACCENT_KEY);
      if (ACCENTS.indexOf(a) >= 0) return a;
    } catch (e) { /* 隐私模式下忽略 */ }
    return 'cyan';
  }
  accent = readAccent();

  function accentLabelCn(t) {
    return { cyan: '青蓝', crimson: '竞技红', lime: '荧光绿', violet: '霓虹紫' }[t] || t;
  }
  function accentLabelEn(t) {
    return { cyan: 'Cyan', crimson: 'Crimson', lime: 'Lime', violet: 'Violet' }[t] || t;
  }

  function applyAccent(next) {
    accent = ACCENTS.indexOf(next) >= 0 ? next : 'cyan';

    if (accent === 'cyan') document.documentElement.removeAttribute('data-accent');
    else document.documentElement.setAttribute('data-accent', accent);

    try { localStorage.setItem(ACCENT_KEY, accent); } catch (e) { /* 忽略 */ }

    $$('.accent-btn').forEach(function (b) {
      b.setAttribute('data-accent-now', accent);
      b.setAttribute('aria-label', pick({
        cn: '配色：' + accentLabelCn(accent) + '（点击切换）',
        en: 'Palette: ' + accentLabelEn(accent) + ' (click to cycle)'
      }));
      b.setAttribute('title', b.getAttribute('aria-label'));
    });
    $$('[data-i18n-accent]').forEach(function (el) {
      var v = pick({
        cn: '配色：' + accentLabelCn(accent),
        en: 'Palette：' + accentLabelEn(accent)
      });
      if (v) el.textContent = v;
    });
  }
  window.JB_applyAccent = applyAccent;
  window.JB_accent = function () { return accent; };

  function cycleAccent() {
    applyAccent(ACCENTS[(ACCENTS.indexOf(accent) + 1) % ACCENTS.length]);
  }

  /* ========================================================================
     2. 语言切换 / Language switching
     ======================================================================== */
  function applyLang(next) {
    lang = next;
    document.documentElement.lang = (next === 'cn') ? 'zh-CN' : 'en';
    document.documentElement.setAttribute('data-lang', next);

    try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* 忽略 */ }

    /* 纯文本节点 */
    $$('[data-i18n]').forEach(function (el) {
      var v = pick(window.JB_I18N && window.JB_I18N[el.getAttribute('data-i18n')]);
      if (v) el.textContent = v;
    });

    /* 属性类：placeholder / aria-label / title / alt */
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(function (attr) {
      $$('[data-i18n-' + attr + ']').forEach(function (el) {
        var v = pick(window.JB_I18N && window.JB_I18N[el.getAttribute('data-i18n-' + attr)]);
        if (v) el.setAttribute(attr, v);
      });
    });

    /* 语言胶囊滑块 */
    $$('.lang').forEach(function (box) {
      box.setAttribute('data-lang', next);
      $$('.lang__btn', box).forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-l') === next);
        b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === next));
      });
    });

    /* 主题按钮的提示文字也要跟着换语言 */
    applyTheme(theme);

    /* 允许各页面注册自己的重绘回调 */
    (window.JB_onLang || []).forEach(function (fn) {
      try { fn(next); } catch (e) { /* 单个回调出错不影响其他 */ }
    });

    document.dispatchEvent(new CustomEvent('jb:lang', { detail: { lang: next } }));
  }
  window.JB_applyLang = applyLang;

  /* ========================================================================
     3. 注入导航 / Inject navigation
     ======================================================================== */
  var NAV_ITEMS = [
    { href: 'index.html',   key: 'nav.home',     cn: '首页',     en: 'Home' },
    { href: 'about.html',   key: 'nav.about',    cn: '战队介绍', en: 'About' },
    { href: 'players.html', key: 'nav.players',  cn: '选手阵容', en: 'Roster' },
    { href: 'matches.html', key: 'nav.matches',  cn: '赛事记录', en: 'Matches' },
    { href: 'media.html',   key: 'nav.media',    cn: '素材库',   en: 'Media' },
    { href: 'follow.html',  key: 'nav.follow',   cn: '关注我们', en: 'Follow' }
  ];

  /* 当前页面文件名，用于高亮 */
  function currentPage() {
    var p = location.pathname.split('/').pop();
    return (!p || p === '') ? 'index.html' : p;
  }

  function buildNav() {
    var host = $('#site-nav');
    if (!host) return;
    var here = currentPage();
    var S = window.JB.SITE;

    var links = NAV_ITEMS.map(function (it) {
      var on = it.href === here ? ' is-active' : '';
      return '<a class="nav__link' + on + '" href="' + it.href + '"' +
             ' data-i18n="' + it.key + '">' + (lang === 'cn' ? it.cn : it.en) + '</a>';
    }).join('');

    var drawerLinks = NAV_ITEMS.map(function (it) {
      var on = it.href === here ? ' is-active' : '';
      return '<a class="drawer__link' + on + '" href="' + it.href + '"' +
             ' data-i18n="' + it.key + '">' + (lang === 'cn' ? it.cn : it.en) + '</a>';
    }).join('');

    host.className = 'nav';
    host.innerHTML =
      '<div class="nav__inner">' +
        '<a class="brand" href="index.html">' +
          '<span class="brand__mark"><img src="' + window.JB.CREST.color + '" alt="TEAM JBYangC crest" data-img-fallback></span>' +
          '<span class="brand__text">' +
            '<span class="brand__name">' + S.fullName + '</span>' +
            '<span class="brand__sub">' + S.game + ' · ' + S.founded + '</span>' +
          '</span>' +
        '</a>' +
        '<nav class="nav__menu" aria-label="Main navigation">' + links + '</nav>' +
        '<div class="nav__actions">' +
          '<div class="lang" data-lang="' + lang + '" role="group" aria-label="Language">' +
            '<span class="lang__pill" aria-hidden="true"></span>' +
            '<button class="lang__btn' + (lang === 'cn' ? ' is-on' : '') + '" data-l="cn" type="button" aria-pressed="' + (lang === 'cn') + '">CN</button>' +
            '<button class="lang__btn' + (lang === 'en' ? ' is-on' : '') + '" data-l="en" type="button" aria-pressed="' + (lang === 'en') + '">EN</button>' +
          '</div>' +
          '<button class="accent-btn" type="button" aria-label="Palette" data-accent-now="' + accent + '">' +
            '<span class="accent-btn__dot" aria-hidden="true"></span>' +
          '</button>' +
          '<button class="theme-btn" type="button" aria-label="Appearance">' +
            '<span class="theme-btn__glyph">' + I.auto + I.sun + I.moon + '</span>' +
          '</button>' +
          '<button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-drawer">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
        '<span class="nav__progress" aria-hidden="true"></span>' +
      '</div>';

    /* 抽屉单独挂到 body，避免被 nav 的层叠上下文裁切 */
    var drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.id = 'site-drawer';
    drawer.innerHTML =
      drawerLinks +
      /* 移动端把语言、配色与主题放进抽屉，避免顶栏挤成一团 */
      '<div class="drawer__actions">' +
        '<div class="lang" data-lang="' + lang + '" role="group" aria-label="Language">' +
          '<span class="lang__pill" aria-hidden="true"></span>' +
          '<button class="lang__btn' + (lang === 'cn' ? ' is-on' : '') + '" data-l="cn" type="button" aria-pressed="' + (lang === 'cn') + '">CN</button>' +
          '<button class="lang__btn' + (lang === 'en' ? ' is-on' : '') + '" data-l="en" type="button" aria-pressed="' + (lang === 'en') + '">EN</button>' +
        '</div>' +
        '<button class="theme-row accent-row" type="button" data-i18n-accent>Palette</button>' +
        '<button class="theme-row" type="button" data-i18n-theme>Appearance</button>' +
      '</div>';
    document.body.appendChild(drawer);

    /* 用事件委托绑定语言/主题：这两类按钮在语言切换时会重新渲染，
       委托不需要在每次重绘后重新挂载。 */
    host.addEventListener('click', function (e) {
      var langBtn = e.target.closest && e.target.closest('.lang__btn');
      if (langBtn) { applyLang(langBtn.getAttribute('data-l')); return; }
      var accentBtn = e.target.closest && e.target.closest('.accent-btn');
      if (accentBtn) { cycleAccent(); return; }
      var themeBtn = e.target.closest && e.target.closest('.theme-btn');
      if (themeBtn) cycleTheme();
    });
    drawer.addEventListener('click', function (e) {
      var langBtn = e.target.closest && e.target.closest('.lang__btn');
      if (langBtn) { applyLang(langBtn.getAttribute('data-l')); return; }
      /* accent-row 同时带 theme-row 类以复用样式，所以必须先判断 */
      var accentRow = e.target.closest && e.target.closest('.accent-row');
      if (accentRow) { cycleAccent(); return; }
      var themeRow = e.target.closest && e.target.closest('.theme-row');
      if (themeRow) cycleTheme();
    });

    /* 汉堡菜单 */
    var burger = $('.burger', host);
    /* 记录打开抽屉前的焦点，关闭时归还，否则键盘/读屏用户会丢失位置 */
    var drawerReturnFocus = null;

    function closeDrawer() {
      drawer.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      if (drawerReturnFocus && drawerReturnFocus.focus) drawerReturnFocus.focus();
      drawerReturnFocus = null;
    }

    burger.addEventListener('click', function () {
      var open = !drawer.classList.contains('is-open');
      if (!open) { closeDrawer(); return; }
      drawerReturnFocus = document.activeElement;
      drawer.classList.add('is-open');
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      /* 抽屉在 DOM 末尾，不主动移焦的话 Tab 会走到页面主体而不是抽屉里 */
      var firstLink = $('.drawer__link', drawer);
      if (firstLink) firstLink.focus();
    });
    /* 点击抽屉里的链接后自动收起 */
    $$('.drawer__link', drawer).forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
    /* Esc 关闭 / Tab 焦点陷阱 */
    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') trapTab(drawer, e);
    });

    /* 滚动状态：毛玻璃 + 进度条 */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || document.documentElement.scrollTop;
        host.classList.toggle('is-stuck', y > 12);
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, y / max) : 0;
        var bar = $('.nav__progress', host);
        if (bar) bar.style.setProperty('--progress', p.toFixed(4));
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ========================================================================
     4. 注入页脚 / Inject footer
     ======================================================================== */
  function buildFooter() {
    var host = $('#site-footer');
    if (!host) return;
    var S = window.JB.SITE;
    var year = new Date().getFullYear();

    var navLinks = NAV_ITEMS.map(function (it) {
      return '<a class="footer__link" href="' + it.href + '" data-i18n="' + it.key + '">' +
             (lang === 'cn' ? it.cn : it.en) + '</a>';
    }).join('');

    /* 页脚只展示已填写的联系方式，避免出现空白项 */
    var filled = window.JB.CONTACT.filter(function (c) { return c.value || c.href; });
    var contactLinks = filled.length
      ? filled.map(function (c) {
          var text = pick(c.label) + ' · ' + pick(c.value);
          return c.href
            ? '<a class="footer__link" href="' + c.href + '" target="_blank" rel="noopener">' + text + '</a>'
            : '<span class="footer__link">' + text + '</span>';
        }).join('')
      : '<a class="footer__link" href="follow.html" data-i18n="footer.contactPending">关注我们的频道</a>';

    host.className = 'footer';
    host.innerHTML =
      '<div class="shell">' +
        '<div class="footer__top">' +
          '<div>' +
            '<div class="footer__brand">' +
              '<img src="' + window.JB.CREST.simpleCutout + '" alt="TEAM JBYangC crest" data-img-fallback>' +
              '<span>' +
                '<span class="footer__brand-name">' + S.fullName + '</span><br>' +
                '<span class="footer__brand-sub">' + S.game + ' · ' + S.founded + '</span>' +
              '</span>' +
            '</div>' +
            '<p class="footer__desc" data-i18n="footer.desc"></p>' +
          '</div>' +
          '<div>' +
            '<div class="footer__h" data-i18n="footer.nav">Navigation</div>' +
            '<div class="footer__links">' + navLinks + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="footer__h" data-i18n="footer.contact">Contact</div>' +
            '<div class="footer__links">' + contactLinks + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<span>© ' + year + ' ' + S.fullName + ' · <span data-i18n="footer.rights"></span></span>' +
          '<span data-i18n="footer.disclaimer"></span>' +
        '</div>' +
      '</div>';
  }

  /* ========================================================================
     5. 滚动揭示 / Scroll reveal
     ======================================================================== */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    /* 页面脚本在每次语言切换后都会再调一次，这里只做增量：
       已经挂过观察器的元素跳过，避免重复创建观察器。 */
    var fresh = items.filter(function (el) { return el.getAttribute('data-reveal-bound') !== '1'; });
    if (!fresh.length) return;

    /* 没有 IntersectionObserver 就全部直接显示 */
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);          // 只播一次，避免来回抖动
        /* 播完清掉 will-change，释放合成层 */
        setTimeout(function () {
          en.target.style.willChange = 'auto';
        }, 1200);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    fresh.forEach(function (el) {
      el.setAttribute('data-reveal-bound', '1');
      io.observe(el);
    });

    /* 自动错峰：同一容器内的 .reveal 依次延迟 */
    $$('[data-stagger]').forEach(function (wrap) {
      var step = parseInt(wrap.getAttribute('data-stagger'), 10) || 80;
      $$('.reveal', wrap).forEach(function (el, i) {
        if (!el.style.getPropertyValue('--d')) {
          el.style.setProperty('--d', (i * step) + 'ms');
        }
      });
    });

    /* 安全网：.reveal 的初始状态是 opacity:0，一旦观察器出于任何原因没回调，
       内容就会一直看不见（表现得像"整页空白"）。这里兜一道，
       只对视口内仍处于隐藏状态的元素强制显示，不影响下方内容的入场动画。 */
    setTimeout(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      fresh.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        if (typeof el.getBoundingClientRect !== 'function') { el.classList.add('is-in'); return; }
        var r = el.getBoundingClientRect();
        if (r && r.top < vh && r.bottom > 0) {
          el.classList.add('is-in');
          el.style.willChange = 'auto';
        }
      });
    }, 2500);
  }

  /* ========================================================================
     6. 数字滚动 / Count-up numbers
     ======================================================================== */
  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    function run(el) {
      var to = parseFloat(el.getAttribute('data-count')) || 0;
      var dur = parseInt(el.getAttribute('data-count-dur'), 10) || 1400;
      var t0 = null;

      /* 缓出曲线，末段自然收住 */
      function ease(t) { return 1 - Math.pow(1 - t, 3); }

      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var v = Math.round(to * ease(p));
        el.textContent = String(v);
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = String(to);
      }
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) {
      nums.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { el.textContent = '0'; io.observe(el); });
  }

  /* ========================================================================
     7. 跑马灯无缝循环 / Seamless marquee
     ======================================================================== */
  function initMarquee() {
    $$('.marquee').forEach(function (m) {
      var track = $('.marquee__track', m);
      if (!track || track.getAttribute('data-cloned') === '1') return;
      track.innerHTML = track.innerHTML + track.innerHTML;   // 复制一份实现无缝
      track.setAttribute('data-cloned', '1');
    });
  }

  /* ========================================================================
     8. 视频懒加载 / Lazy video
     ------------------------------------------------------------------------
     preload="none"，进入视口才 play；离开视口立刻 pause。
     没有自动播放权限时静默失败，用户仍可手动点击播放。
     ======================================================================== */
  function initVideos() {
    var vids = $$('video[data-lazy]');
    if (!vids.length) return;

    function load(v) {
      if (v.getAttribute('data-loaded') === '1') return;
      v.setAttribute('data-loaded', '1');
      v.preload = 'auto';
      try { v.load(); } catch (e) { /* 忽略 */ }
    }

    function tryPlay(v) {
      var p = v.play();
      if (p && typeof p.catch === 'function') p.catch(function () { /* 需用户手势，忽略 */ });
    }

    if (!('IntersectionObserver' in window)) {
      vids.forEach(function (v) { load(v); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          load(v);
          /* 只自动播放静音视频；有声视频交给用户点击 */
          if (v.hasAttribute('data-autoplay')) tryPlay(v);
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.28 });

    vids.forEach(function (v) { io.observe(v); });
  }

  /* ========================================================================
     9. 图片兜底 / Image fallback
     ------------------------------------------------------------------------
     分两层：
       1) 通用委托监听 —— 任何图片最终加载失败时隐藏它，不留破图图标；
       2) 由渲染器逐个挂上的 .jb-chain —— 按候选列表依次降级
          （选手照片 → 备选照片 → 印花 → 首字母占位）。
     捕获阶段监听可以覆盖页面脚本动态插入的图片。
     ======================================================================== */
  function applyImageFallback(img) {
    /* 没有真实 src 的图片不算失败：这类元素是先占位、稍后由脚本赋值的，
       误判会把它们永久隐藏，之后即使赋上有效地址也看不见。 */
    if (!hasRealSrc(img)) return;
    img.classList.add('is-broken');
    img.style.display = 'none';
    var holder = img.closest ? img.closest('[data-fallback-holder]') : null;
    if (holder) holder.classList.add('show-fallback');
    /* 素材库的图片格：给外框打标记，由 CSS 显示"素材未加载" */
    var frame = img.closest ? img.closest('.shot__frame') : null;
    if (frame) frame.classList.add('is-broken');
    /* 记一笔，页面末尾会汇总提示，避免用户以为是网站坏了 */
    assetFailures += 1;
    scheduleAssetNotice();
  }

  /** 图片是否已经有一个可用的地址（空 src 或缺失 src 都算没有） */
  function hasRealSrc(img) {
    var s = img.getAttribute ? img.getAttribute('src') : (img.src || '');
    return !!(s && String(s).replace(/\s/g, '') !== '');
  }

  /** 解除一次降级/隐藏留下的一切痕迹，用于换成有效地址后复原显示 */
  function resetImage(img) {
    if (!img) return;
    img.style.display = '';
    if (img.classList) img.classList.remove('is-broken');
    var holder = img.closest ? img.closest('[data-fallback-holder]') : null;
    if (holder && holder.classList) holder.classList.remove('show-fallback');
    var frame = img.closest ? img.closest('.shot__frame') : null;
    if (frame && frame.classList) frame.classList.remove('is-broken');
  }

  /* 素材缺失汇总提示 ------------------------------------------------------
     只统计站点内部的素材；只要有一张图读不到，就在页面底部浮出一条提示，
     告诉你把素材复制到哪里。全部正常时不会出现，不留任何多余 UI。 */
  var assetFailures = 0;
  var assetNoticeTimer = null;

  function scheduleAssetNotice() {
    if (assetNoticeTimer) return;
    /* 等首屏的图片都报完错再统计，避免刚打开就闪提示 */
    assetNoticeTimer = setTimeout(showAssetNotice, 1800);
  }

  function showAssetNotice() {
    if (assetFailures === 0) return;
    var old = document.getElementById('jb-asset-notice');
    if (old) old.remove();

    var box = document.createElement('div');
    box.id = 'jb-asset-notice';
    box.className = 'asset-notice';
    box.innerHTML =
      '<button class="asset-notice__close" type="button" aria-label="Close">' + I.close + '</button>' +
      '<div class="asset-notice__title" data-i18n="notice.title"></div>' +
      '<p class="asset-notice__text" data-i18n="notice.text"></p>' +
      '<div class="asset-notice__tree">' +
        'site\\<br>' +
        '&nbsp;&nbsp;├─ index.html<br>' +
        '&nbsp;&nbsp;└─ assets\\media\\' +
      '</div>' +
      '<a class="asset-notice__btn" href="test.html" data-i18n="notice.check"></a>';

    /* 文案走通用 i18n 表，切换语言时能同步 */
    window.JB_I18N = window.JB_I18N || {};
    Object.assign(window.JB_I18N, {
      'notice.title': { cn: '有素材没有读到', en: 'Some assets could not be loaded' },
      'notice.text': {
        cn: '页面能正常打开，但缺少素材文件。请把 TEAM JBYangC 里对应的文件夹复制到站点目录下，保持原来的文件名和文件夹名不变：',
        en: 'The page opened fine, but asset files are missing. Copy the matching folders from TEAM JBYangC into the site directory, keeping the original file and folder names:'
      },
      'notice.check': { cn: '打开素材自检页，看是哪些文件 →', en: 'Open the asset check page to see which files →' }
    });
    applyLang(lang);

    box.querySelector('.asset-notice__close').addEventListener('click', function () { box.remove(); });

    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('is-in'); });
  }

  function initImageFallback() {
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG') return;
      applyImageFallback(img);
    }, true);

    /* 脚本运行前就已经加载失败、事件已错过的图片。
       注意：没有 src（或 src 为空）的占位图片天然满足 complete 且
       naturalWidth 为 0，但它们并不是失败 —— 必须排除，
       否则会在脚本赋值之前就被隐藏，之后再也显示不出来。 */
    $$('img').forEach(function (img) {
      if (!hasRealSrc(img)) return;
      if (img.complete && img.naturalWidth === 0) {
        img.dispatchEvent(new Event('error', { bubbles: true }));
      }
    });
  }

  /* 让一张图片按候选列表依次降级。
     列表中每一项都失败后，才走通用兜底（隐藏图片，露出占位内容）。 */
  function chainImage(img, list) {
    if (!img) return;
    var i = 0;
    img.classList.add('jb-chain');
    img.addEventListener('error', function () {
      i += 1;
      if (i < list.length) {
        /* 捕获阶段的通用兜底可能已经把这张图隐藏了，
           换成下一个候选地址前先复原，否则换了地址也看不见。 */
        resetImage(img);
        img.src = list[i];
        return;
      }
      img.classList.remove('jb-chain');   // 交回通用兜底处理
      applyImageFallback(img);
    });
  }

  /* ========================================================================
     10. 灯箱 / Lightbox
     ------------------------------------------------------------------------
     用事件委托，所以页面脚本在初始化之后动态插入的图片也能用；
     任何 <img data-lightbox> 或 <img data-lightbox="url"> 都可点击放大。
     ======================================================================== */
  var lightbox = null;

  function ensureLightbox() {
    if (lightbox) return lightbox;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close">' + I.close + '</button>' +
      '<img class="lightbox__img" alt="">' +
      '<div class="lightbox__cap"></div>';
    document.body.appendChild(box);
    lightbox = { box: box, img: $('.lightbox__img', box), cap: $('.lightbox__cap', box), last: null };
    return lightbox;
  }

  function openLightbox(src, cap) {
    var lb = ensureLightbox();
    lb.last = document.activeElement;
    lb.img.src = src;
    lb.img.alt = cap || '';
    lb.cap.textContent = cap || '';
    lb.box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', lb.box).focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.box.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lightbox.last && lightbox.last.focus) lightbox.last.focus();
  }

  function initLightbox() {
    /* 委托监听不依赖初始化时机：即使本页此刻还没有可放大的图片，
       注册也照常进行，之后动态插入的图片一样可用。 */
    ensureLightbox();

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-lightbox]') : null;
      if (!t) return;
      e.preventDefault();
      var src = t.getAttribute('data-lightbox');
      if (!src || src === 'true') src = t.currentSrc || t.src;
      var cap = t.getAttribute('data-lightbox-cap') || t.alt || '';
      openLightbox(src, cap);
    });

    var lb = lightbox;
    $('.lightbox__close', lb.box).addEventListener('click', closeLightbox);
    lb.box.addEventListener('click', function (e) { if (e.target === lb.box) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.box.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'Tab') trapTab(lb.box, e);
    });
  }

  /* ========================================================================
     11b. 控制台彩蛋 / Console easter egg
     ------------------------------------------------------------------------
     只有打开开发者工具才看得见，不占页面空间、不参与渲染、零性能开销。
     娱乐向战队，给好奇的人留一个入口。
     ======================================================================== */
  function consoleEgg() {
    /* verify.js 在 Node 沙箱里逐页执行本脚本，不静音的话每次都会刷一遍 */
    if (window.__JB_TEST__) return;
    if (typeof console === 'undefined' || !console.log) return;

    var mark = 'background:linear-gradient(115deg,#22d3ee,#6366f1);color:#04121a;' +
               'font-weight:700;padding:3px 9px;border-radius:4px';
    var dim = 'color:#6b7a9c';
    var hot = 'color:#22d3ee;font-weight:600';

    console.log(
      '%c TEAM JBYangC %c  2024.11 —\n\n' +
      '  并肩开黑的普通玩家。\n\n' +
      '  你在翻控制台，说明有点耐心。这站也确实没有任何埋点、\n' +
      '  没有第三方请求，素材全在本地。放心看。\n\n' +
      '  列出全部队员：%cjb()%c\n' +
      '  想来看看我们：follow.html\n',
      mark, dim, hot, dim
    );

    /* 控制台里输入 jb() 列出在册队员 —— 纯 ES5，不影响任何东西 */
    try {
      window.jb = function () {
        var roster = (window.JB && window.JB.ROSTER) || [];
        var i, p, handle, role, num, lines = [];
        for (i = 0; i < roster.length; i++) {
          p = roster[i];
          handle = String(p.handle || p.id || '');
          while (handle.length < 11) handle += ' ';
          role = (p.role && (p.role.cn || p.role)) || '';
          num = (i + 1) < 10 ? ' ' + (i + 1) : String(i + 1);
          lines.push('  ' + num + '. ' + handle + role);
        }
        console.log('%c在册队员 %c' + roster.length + ' 人\n\n' + lines.join('\n'), mark, dim);
        return '共 ' + roster.length + ' 人';
      };
    } catch (e) { /* 忽略：彩蛋挂了不该影响站点 */ }
  }

  /* ========================================================================
     11. 通用渲染器 / Shared renderers
     ------------------------------------------------------------------------
     供各页面复用，避免同一段 HTML 在多处重复维护。
     ======================================================================== */

  /* 返回选手卡片的照片区内容（照片 → 印花 → 首字母占位，逐级回退） */
  function playerMediaHTML(p) {
    if (p.photos && p.photos.length) {
      return { html: '<img src="' + p.photos[0] + '" alt="' + p.handle + '"' +
                     ' data-img-chain="' + encodeURIComponent(JSON.stringify(p.photos)) + '"' +
                     ' loading="lazy" decoding="async">',
               contain: false };
    }
    if (p.sticker) {
      var chain = [p.sticker];
      if (p.stickerT) chain.push(p.stickerT);
      return { html: '<img src="' + p.sticker + '" alt="' + p.handle + ' sticker"' +
                     ' data-img-chain="' + encodeURIComponent(JSON.stringify(chain)) + '"' +
                     ' loading="lazy" decoding="async">',
               contain: true };
    }
    return { html: '<span class="player__initial">' + p.handle.charAt(0).toUpperCase() + '</span>',
             contain: false };
  }

  /* 渲染完成后，给所有带 data-img-chain 的图片挂上降级链 */
  function initImageChains() {
    $$('img[data-img-chain]').forEach(function (img) {
      if (img.getAttribute('data-chain-bound') === '1') return;
      var list;
      try { list = JSON.parse(decodeURIComponent(img.getAttribute('data-img-chain'))); }
      catch (e) { list = null; }
      if (!list || !list.length) return;
      img.setAttribute('data-chain-bound', '1');
      chainImage(img, list);
    });
  }

  /* 选手详情页地址。
     全站只有一张 player.html 模板，靠 ?id= 参数渲染对应选手，
     这样加人、改名都只改 data.js，不需要新建文件。
     放在 players/ 子目录里时用 data-detail-base 覆盖前缀。 */
  function playerHref(p) {
    var host = document.querySelector('[data-detail-base]');
    /* host 存在但该属性为空时也要能回退，避免拼出 null?id=... */
    var base = (host && host.getAttribute('data-detail-base')) || 'player.html';
    return base + '?id=' + encodeURIComponent(p.id);
  }

  /* 渲染一张选手卡 */
  function playerCardHTML(p) {
    var m = playerMediaHTML(p);
    var roleText = pick(p.role);
    var alias = pick(p.alias);
    var badge = p.captain
      ? '<span class="player__cap" title="IGL">C</span>'
      : '';

    return '' +
      '<a class="player reveal reveal--scale" href="' + playerHref(p) + '"' +
      ' data-role="' + p.roleKey + '"' +
      ' style="--p-a:' + p.accent[0] + '">' +
        '<span class="player__wash" aria-hidden="true"></span>' +
        '<span class="player__photo' + (m.contain ? ' player__photo--contain' : '') + '" data-fallback-holder>' +
          '<span class="player__role-tag">' + roleText + '</span>' +
          badge +
          m.html +
        '</span>' +
        '<span class="player__body">' +
          '<span class="player__id">' + p.handle + '</span>' +
          (alias ? '<span class="player__alias">' + alias + '</span>' : '') +
          '<span class="player__meta">' +
            '<span>' + roleText + '</span>' +
            '<span class="player__arrow" aria-hidden="true">' + I.arrow + '</span>' +
          '</span>' +
        '</span>' +
      '</a>';
  }

  /* ========================================================================
     12. 标签页图标 / Favicon
     ------------------------------------------------------------------------
     从数据层注入，这样修改素材根目录时图标路径会一起跟着变，
     不需要逐个 HTML 文件改 <link rel="icon">。
     ======================================================================== */
  function applyFavicon() {
    var href = window.JB.SITE && window.JB.SITE.favicon;
    if (!href) return;
    var link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  /* ========================================================================
     13. 启动 / Bootstrap
     ======================================================================== */
  function boot() {
    /* 数据层缺失时给出明确提示，而不是白屏 */
    if (!window.JB) {
      console.error('[JBYangC] data.js 未加载，页面无法渲染。请确认 assets/js/data.js 路径正确。');
      return;
    }

    /* 全站通用文案 */
    window.JB_I18N = window.JB_I18N || {};
    Object.assign(window.JB_I18N, {
      'nav.home':     { cn: '首页',     en: 'Home' },
      'nav.about':    { cn: '战队介绍', en: 'About' },
      'nav.players':  { cn: '选手阵容', en: 'Roster' },
      'nav.matches':  { cn: '赛事记录', en: 'Matches' },
      'nav.media':    { cn: '素材库',   en: 'Media' },
      'nav.follow':   { cn: '关注我们', en: 'Follow' },
      'footer.nav':   { cn: '站内导航', en: 'Navigation' },
      'footer.contact': { cn: '联系我们', en: 'Contact' },
      'footer.rights':  { cn: '保留所有权利', en: 'All rights reserved' },
      'footer.disclaimer': {
        cn: '本站为战队自建展示页面，与Valve及Counter-Strike 2官方无隶属关系。',
        en: 'A fan-built team page, not affiliated with Valve or Counter-Strike 2.'
      },
      'footer.contactPending': { cn: '关注我们的频道', en: 'Follow our channel' },
      'footer.desc': {
        cn: '一支成立于 2024 年 11 月的 CS 娱乐向战队。我们记录对局、留存片段，也欢迎所有同好。',
        en: 'A casual CS team founded in November 2024. We record our games, keep the clips, and welcome anyone who enjoys the game.'
      }
    });

    /* 顺序有讲究：先注入结构，再应用语言，最后挂观察器 */
    applyFavicon();
    buildNav();
    buildFooter();
    applyLang(lang);
    /* 导航已构建，此时才能更新配色按钮的 aria-label */
    applyAccent(accent);

    initReveal();
    initCounters();
    initMarquee();
    initVideos();
    initImageFallback();
    initLightbox();
    consoleEgg();

    /* 页面首帧淡入，避免样式未就绪时的闪动 */
    document.body.classList.add('is-ready');
    document.documentElement.classList.remove('no-js');
  }

  /* ------------------------------------------------------------------------
     关键：JB_UI 必须挂在模块作用域，而不是在 boot() 内部
     ------------------------------------------------------------------------
     main.js 与各页面的行内脚本都是 <body> 末尾的同步脚本。
     解析期间 document.readyState 始终是 'loading'，因此 boot() 会被推迟到
     DOMContentLoaded 才执行；而页面的行内脚本紧接着 main.js 就运行了。

     如果 JB_UI 在 boot() 里赋值，页面脚本读到的就是 undefined，
     第一处 JB_UI.xxx 立刻抛 TypeError，
     结果是导航、页脚、选手卡、素材格等全部动态内容都不渲染。

     所以这里在模块作用域就把工具挂出去，boot() 只负责 DOM 初始化。
     ------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------
     共享小工具 / Shared helpers
     ------------------------------------------------------------------------ */

  /** HTML 转义：任何拼接进 innerHTML 的字符串都必须经过这里。
      follow / matches / media / player 四个页面原先各抄了一份逐字节相同的实现，
      现在统一到这里，改一处即可。 */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** 焦点陷阱：把 Tab / Shift+Tab 限制在容器内部循环。
      没有它的话，键盘用户可以 Tab 到模态框背后的内容上，
      而容器上又声明了 aria-modal="true"，语义与实际行为会互相矛盾。 */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]),' +
                  ' select:not([disabled]), textarea:not([disabled]),' +
                  ' [tabindex]:not([tabindex="-1"])';

  function trapTab(container, e) {
    var f = container.querySelectorAll(FOCUSABLE);
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    var active = document.activeElement;
    var inside = container.contains ? container.contains(active) : true;
    if (e.shiftKey) {
      if (active === first || !inside) { e.preventDefault(); last.focus(); }
    } else if (active === last || !inside) {
      e.preventDefault(); first.focus();
    }
  }

  window.JB_UI = {
    icon: I,
    esc: esc,
    playerCardHTML: playerCardHTML,
    playerMediaHTML: playerMediaHTML,
    playerHref: playerHref,
    pick: pick,
    reveal: initReveal,
    openLightbox: openLightbox,
    chainImage: chainImage,
    resetImage: resetImage,
    initImageChains: initImageChains,
    /* 重新渲染视频后必须再调一次：被替换掉的 <video> 节点
       已经不在观察器里，不重新挂的话不会再加载与自动播放。 */
    reobserveVideos: initVideos
  };

  /* 脚本位于 body 末尾，所需元素此时都已解析完成，直接同步初始化。
     这样页面脚本运行时，导航与页脚已经注入完毕。 */
  if (document.body || document.readyState !== 'loading') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();

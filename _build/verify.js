/* 验收（用完即删）
   1. 语法
   2. 每个素材引用是否指向真实文件（扩展名改动后最关键的一项）
   3. 各页面渲染与元素数量
*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 相对本文件定位站点目录，这样在 Windows 本地和 CI 的 Linux runner 上都能跑
const SITE = path.resolve(__dirname, '..', 'site');

function makeClassList() {
  const s = new Set();
  return { add: (...c) => c.forEach(x => s.add(x)), remove: (...c) => c.forEach(x => s.delete(x)),
    toggle: (c, f) => { const on = f === undefined ? !s.has(c) : !!f; if (on) s.add(c); else s.delete(c); return on; },
    contains: (c) => s.has(c) };
}
function makeEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(), id: '', className: '', _attrs: {}, _html: '',
    textContent: '', hidden: false, children: [], style: { _p: {}, setProperty(k, v) { this._p[k] = v; }, getPropertyValue(k) { return this._p[k] || ''; }, cssText: '' },
    offsetWidth: 100, src: '', href: '', alt: '',
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    setAttribute(k, v) { this._attrs[k] = String(v); }, getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; },
    removeAttribute(k) { delete this._attrs[k]; }, appendChild(c) { this.children.push(c); return c; },
    insertAdjacentHTML() {}, remove() {}, focus() {}, closest() { return null; },
    querySelector() { return makeEl('div'); }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { top: 10, bottom: 200, left: 0, right: 100 }; }
  };
  el.classList = makeClassList();
  Object.defineProperty(el, 'innerHTML', { get() { return this._html; }, set(v) { this._html = String(v); } });
  return el;
}
function buildContext(file, search) {
  const reg = new Map();
  const getById = (id) => { if (!reg.has(id)) { const e = makeEl('div'); e.id = id; reg.set(id, e); } return reg.get(id); };
  const documentEl = makeEl('html'), bodyEl = makeEl('body'), headEl = makeEl('head');
  const documentShim = { readyState: 'loading', documentElement: documentEl, body: bodyEl, head: headEl, title: '',
    getElementById: getById,
    querySelector: (s) => (typeof s === 'string' && s.charAt(0) === '#') ? getById(s.slice(1)) : null,
    querySelectorAll: () => [], createElement: (t) => makeEl(t),
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } };
  const store = {};
  const sandbox = {
    /* 让 main.js 的控制台彩蛋在测试环境里静音，否则每页都会刷一遍 */
    __JB_TEST__: true,
    scrollY: 0, innerHeight: 800, addEventListener() {}, removeEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    dispatchEvent() { return true; }, document: documentShim,
    location: { pathname: '/D:/LittleProject/JBYangC/site/' + file, search: search || '', hash: '', protocol: 'file:', href: '' },
    navigator: { language: 'zh-CN' },
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    IntersectionObserver: class { constructor() {} observe() {} unobserve() {} disconnect() {} },
    requestAnimationFrame: (cb) => { cb(0); return 1; }, setTimeout, clearTimeout,
    CustomEvent: class { constructor(t, o) { this.type = t; this.detail = (o || {}).detail; } },
    Event: class { constructor(t, o) { this.type = t; this.bubbles = !!(o || {}).bubbles; } },
    console, window: null, globalThis: null, self: null,
    encodeURI, decodeURI, encodeURIComponent, decodeURIComponent,
    JSON, Math, Date, String, Number, Array, Object, RegExp, parseFloat, parseInt
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.self = sandbox;
  return { ctx: vm.createContext(sandbox), getById, sandbox };
}
const parseOnly = (l, s) => { try { new vm.Script(s, { filename: l }); return null; } catch (e) { return e.message; } };
const lastInline = (f) => {
  const h = fs.readFileSync(f, 'utf8');
  const b = [...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  return b[b.length - 1] || '';
};

let fail = 0;
const say = (ok, msg) => { if (!ok) fail++; console.log('  ' + (ok ? '✓' : '✗') + ' ' + msg); };
const ALL = ['index.html', 'about.html', 'players.html', 'player.html', 'matches.html', 'media.html', 'follow.html'];

console.log('===== 1. 语法 =====');
['assets/js/data.js', 'assets/js/main.js'].forEach(f =>
  { const e = parseOnly(f, fs.readFileSync(path.join(SITE, f), 'utf8')); say(!e, f + (e ? ' -> ' + e : '')); });
ALL.forEach(p => { const e = parseOnly(p, lastInline(path.join(SITE, p))); say(!e, p + (e ? ' -> ' + e : '')); });

console.log('');
console.log('===== 2. 素材引用完整性（扩展名改动后最关键）=====');
{
  const ctxObj = buildContext('x', '');
  vm.runInContext(fs.readFileSync(path.join(SITE, 'assets/js/data.js'), 'utf8'), ctxObj.ctx, { filename: 'data.js' });
  const JB = ctxObj.sandbox.JB;

  const urls = [];
  const add = (label, u) => { if (u) urls.push({ label, u }); };
  add('favicon', JB.SITE.favicon);
  Object.keys(JB.CREST).forEach(k => add('CREST.' + k, JB.CREST[k]));
  JB.ROSTER.forEach(p => {
    (p.photos || []).forEach((u, i) => add(p.id + '.photos[' + i + ']', u));
    ['sticker', 'stickerT', 'sticker2', 'sticker2026', 'signature', 'jersey', 'idPhoto'].forEach(k => add(p.id + '.' + k, p[k]));
  });
  add('MEDIA.groupPhoto', JB.MEDIA.groupPhoto && JB.MEDIA.groupPhoto.src);
  JB.MEDIA.crestAnimations.forEach((v, i) => add('crestAnimations[' + i + ']', v.src));
  JB.MEDIA.entryAnimations.forEach((v, i) => add('entryAnimations[' + i + ']', v.src));
  JB.MEDIA.crestStill.forEach((v, i) => add('crestStill[' + i + ']', v.src));
  JB.MEDIA.gear.forEach((v, i) => add('gear[' + i + ']', v.src));

  let ok = 0; const missing = []; const badExt = [];
  urls.forEach(({ label, u }) => {
    if (/^https?:/i.test(u)) { ok++; return; }
    const rel = decodeURIComponent(u);
    if (/\.(png|jpg|jpeg)$/i.test(rel)) badExt.push(label + ' -> ' + rel);
    const full = path.join(SITE, rel);
    if (fs.existsSync(full) && fs.statSync(full).size > 0) ok++;
    else missing.push(label + ' -> ' + rel);
  });
  say(missing.length === 0, `引用总数 ${urls.length}，可解析 ${ok}，缺失 ${missing.length}`);
  if (missing.length) missing.slice(0, 8).forEach(m => console.log('      缺失: ' + m));
  say(badExt.length === 0, `仍指向 .png/.jpg 的引用: ${badExt.length}`);
  if (badExt.length) badExt.slice(0, 8).forEach(m => console.log('      ' + m));
}

console.log('');
console.log('===== 3. 各页面渲染 =====');
const EXPECT = {
  'index.html':   [['home-roster', /class="player /g, 7], ['home-group-frame', /<img/g, 1],
                   /* 导航里应有配色按钮（每页都由 buildNav 注入）。
                      注意不能用 /accent-btn/ —— 它也会匹配 accent-btn__dot */
                   ['site-nav', /class="accent-btn"/g, 1]],
  'about.html':   [],
  'players.html': [['roster-grid', /class="player /g, 7], ['role-filters', /class="filter/g, 5], ['role-cards', /class="card /g, 4]],
  'matches.html': [['mt-body', /<tr>/g, 1], ['mt-facts', /facts__cell/g, 4]],
  'media.html':   [['v-crest', /<video/g, 3], ['v-entry', /<video/g, 1], ['g-crest', /<img/g, 9],
                   ['g-gear', /<img/g, 3], ['g-stickers', /<img/g, 21], ['g-group', /<img/g, 1]],
  'follow.html':  [['channel-featured', /space\.bilibili\.com/g, 2], ['contact-grid', /class="contact"/g, 3]]
};
ALL.forEach(p => {
  if (p === 'player.html') return;
  const { ctx, getById } = buildContext(p, '');
  let err = null;
  const run = (s, l) => { try { vm.runInContext(s, ctx, { filename: l }); } catch (e) { err = err || (e.name + ': ' + e.message); } };
  run(fs.readFileSync(path.join(SITE, 'assets/js/data.js'), 'utf8'), 'data.js');
  run(fs.readFileSync(path.join(SITE, 'assets/js/main.js'), 'utf8'), 'main.js');
  run(lastInline(path.join(SITE, p)), p);
  const nav = getById('site-nav').innerHTML.length > 0;
  const bad = [];
  (EXPECT[p] || []).forEach(([id, re, want]) => {
    const got = (getById(id).innerHTML.match(re) || []).length;
    if (got !== want) bad.push(`${id} 期望${want}实际${got}`);
  });
  say(!err && nav && bad.length === 0,
      p + (err ? ' 错误:' + err : '') + (nav ? '' : ' 导航未注入') + (bad.length ? ' ' + bad.join(',') : ''));
  if (bad.length && p === 'matches.html') {
    const h = getById('mt-body').innerHTML;
    console.log('      mt-body 长度=' + h.length + '  <tr 出现=' + (h.match(/<tr/g) || []).length +
                '  <tr> 出现=' + (h.match(/<tr>/g) || []).length);
    console.log('      片段: ' + h.slice(0, 150).replace(/\s+/g, ' '));
  }
});

console.log('  player.html（逐位选手）');
const inline = lastInline(path.join(SITE, 'player.html'));
['YangC', 'Miyabi', 'Remilia', 'shen', 'Aspirin', 'Flash', 'Copier'].forEach(id => {
  const { ctx, getById } = buildContext('player.html', '?id=' + id);
  let err = null;
  const run = (s, l) => { try { vm.runInContext(s, ctx, { filename: l }); } catch (e) { err = err || (e.name + ': ' + e.message); } };
  run(fs.readFileSync(path.join(SITE, 'assets/js/data.js'), 'utf8'), 'data.js');
  run(fs.readFileSync(path.join(SITE, 'assets/js/main.js'), 'utf8'), 'main.js');
  run(inline, 'inline');
  const h = getById('pd-root').innerHTML;
  const s = h.slice(h.indexOf('stats-card'));
  const N = (s.match(/class="radar__axis"/g) || []).length;
  // 头像在 stats-card 之前，必须用整页 HTML 判断，不能用切片
  const ok = !err && (h.match(/<img/g) || []).length >= 1 &&
             (s.match(/class="ring__arc"/g) || []).length === 2 &&
             (s.match(/class="metric__v/g) || []).length === 6 && N >= 5;
  say(ok, id.padEnd(9) + ' 雷达轴=' + N + ' 环形=2 指标=6 页面图片=' +
         (h.match(/<img/g) || []).length + (err ? ' 错误:' + err : ''));
});

console.log('');
console.log(fail === 0 ? '===== 全部通过 =====' : '===== 有 ' + fail + ' 项未通过 =====');

// 用退出码反映结果，便于本地脚本与 CI 判断成败
process.exit(fail === 0 ? 0 : 1);

#!/usr/bin/env node
/* ==========================================================================
   性能预算检查 / Performance budget check
   --------------------------------------------------------------------------
   思路借鉴自 Astro 项目常见的 check-performance-budgets 做法：
   给每类资源定一个上限，超了就让进程以非零码退出，由 CI 拦住。

   为什么需要它
     站点没有构建步骤，也就没有打包器替你盯着体积。
     某天往 assets/media 扔进一个 20 MB 的 mp4，页面照样能开，
     但队友的手机流量会被吃掉 —— 这种事只能靠预算卡住。

   用法
     node _build/check-budget.js
     node _build/check-budget.js --report     # 只打印，不因超预算失败

   退出码
     0 全部在预算内 / 1 有项目超预算 / 2 站点目录不存在
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const SITE = path.resolve(__dirname, '..', 'site');

/* 预算表（单位 KB）。数值按当前实测上调了约 30% 的余量，
   不是拍脑袋 —— 留出正常迭代空间，但拦住数量级失控。 */
const BUDGET = {
  total: 12 * 1024,   // 全站总量（含全部素材）
  html: 40,           // 单个 HTML 页面
  css: 95,            // 单个 CSS 文件
  js: 60,             // 单个 JS 文件
  asset: 4096,        // 单个素材文件（图片 / 视频）
  page: 240,          // 单页关键资源 = HTML + 它引用的本地 CSS/JS
};

const KB = 1024;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

/* 单页关键资源：HTML 本身 + 它 <link href> / <script src> 指向的本地文件 */
function pageCriticalSize(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  let total = Buffer.byteLength(html);
  const used = [];
  const re = /(?:href|src)="([^"]+\.(?:css|js))"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const rel = m[1];
    if (/^(?:https?:)?\/\//.test(rel)) continue;   // 外链不计（本站本来也没有）
    const abs = path.join(SITE, decodeURIComponent(rel));
    if (fs.existsSync(abs)) {
      const size = fs.statSync(abs).size;
      total += size;
      used.push({ rel, size });
    }
  }
  return { total, used };
}

function main() {
  const reportOnly = process.argv.includes('--report');

  if (!fs.existsSync(SITE)) {
    console.error(`找不到站点目录：${SITE}`);
    process.exit(2);
  }

  const files = walk(SITE);
  const failures = [];
  const rows = [];

  const fail = (kind, label, kb, limit) => {
    failures.push({ kind, label, kb, limit });
  };

  let grandTotal = 0;
  for (const abs of files) {
    const size = fs.statSync(abs).size;
    const rel = path.relative(SITE, abs).split(path.sep).join('/');
    const ext = path.extname(abs).toLowerCase();
    grandTotal += size;

    const kb = size / KB;
    const mb = size / KB / 1024;

    if (ext === '.html' && kb > BUDGET.html) fail('HTML', rel, kb, BUDGET.html);
    if (ext === '.css' && kb > BUDGET.css) fail('CSS', rel, kb, BUDGET.css);
    if (ext === '.js' && kb > BUDGET.js) fail('JS', rel, kb, BUDGET.js);
    if (['.webp', '.mp4', '.jpg', '.jpeg', '.png', '.gif'].includes(ext) && kb > BUDGET.asset) {
      fail('素材', rel, kb, BUDGET.asset);
    }

    if (['.html', '.css', '.js'].includes(ext)) {
      rows.push({ rel, kb, mb, ext });
    }
  }

  const totalMb = grandTotal / KB / 1024;
  if (grandTotal / KB > BUDGET.total) {
    fail('总量', '全站', grandTotal / KB, BUDGET.total);
  }

  /* 单页关键资源 */
  const pages = files.filter((f) => f.toLowerCase().endsWith('.html'));
  const pageRows = [];
  for (const p of pages) {
    const { total, used } = pageCriticalSize(p);
    const kb = total / KB;
    const rel = path.relative(SITE, p).split(path.sep).join('/');
    pageRows.push({ rel, kb, used });
    if (kb > BUDGET.page) fail('单页关键资源', rel, kb, BUDGET.page);
  }

  /* ---- 输出 ---- */
  console.log('===== 性能预算检查 =====\n');

  console.log(`全站总量：${totalMb.toFixed(2)} MB / 预算 ${(BUDGET.total / 1024).toFixed(0)} MB`);
  console.log(`文件数：${files.length}\n`);

  console.log('单页关键资源（HTML + 本地 CSS/JS）：');
  for (const r of pageRows.sort((a, b) => b.kb - a.kb)) {
    const bar = '█'.repeat(Math.max(1, Math.round((r.kb / BUDGET.page) * 24)));
    console.log(`  ${r.rel.padEnd(16)} ${String(r.kb.toFixed(1)).padStart(7)} KB  ${bar}`);
  }

  console.log('\n代码体积（按大小排序）：');
  for (const r of rows.sort((a, b) => b.kb - a.kb)) {
    console.log(`  ${r.rel.padEnd(28)} ${String(r.kb.toFixed(1)).padStart(7)} KB`);
  }

  const biggest = files
    .map((f) => ({ rel: path.relative(SITE, f).split(path.sep).join('/'), size: fs.statSync(f).size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 3);
  console.log('\n最大的三个文件：');
  for (const b of biggest) {
    console.log(`  ${b.rel.padEnd(46)} ${(b.size / KB / 1024).toFixed(2)} MB`);
  }

  console.log('');
  if (failures.length === 0) {
    console.log('===== 全部在预算内 =====');
    return 0;
  }

  console.log(`===== ${failures.length} 项超预算 =====`);
  for (const f of failures) {
    console.log(`  [${f.kind}] ${f.label}  ${f.kb.toFixed(1)} KB > ${f.limit} KB`);
  }
  if (reportOnly) {
    console.log('\n（--report：仅报告，不判失败）');
    return 0;
  }
  console.log('\n处理方式：压缩素材、拆分文件，或确认后上调本脚本里的 BUDGET。');
  return 1;
}

process.exit(main());

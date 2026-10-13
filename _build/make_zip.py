#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检查并重建部署用 zip：确保条目路径使用正斜杠（ZIP 规范要求）。"""
import os
import sys
import zipfile
from pathlib import Path

WS = Path(r'D:\LittleProject\JBYangC')
SITE = WS / 'site'
OLD = WS / 'team-jbyangc-site.zip'
NEW = WS / 'team-jbyangc-部署包.zip'

# --- 1. 检查旧包 ---
if OLD.exists():
    with zipfile.ZipFile(OLD) as z:
        names = z.namelist()
    bs = sum(1 for n in names if '\\' in n)
    fs = sum(1 for n in names if '/' in n)
    print(f'旧包 {OLD.name}: 条目 {len(names)}，含反斜杠 {bs}，含正斜杠 {fs}')
    if bs:
        print('  -> 反斜杠路径不符合 ZIP 规范，需要重建')
        for n in names[:4]:
            print(f'     示例: {n!r}')
else:
    print('旧包不存在')

# --- 2. 用 zipfile 重建（始终写正斜杠）---
if NEW.exists():
    try:
        NEW.unlink()
    except Exception as e:
        print(f'!! 无法删除旧的新包: {e}')

count = 0
total = 0
with zipfile.ZipFile(NEW, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in sorted(SITE.rglob('*')):
        if p.is_file():
            rel = p.relative_to(SITE).as_posix()   # 关键：as_posix() 保证正斜杠
            z.write(p, rel)
            count += 1
            total += p.stat().st_size

print()
print(f'新包 {NEW.name}: {count} 个文件, 原始 {total/1024/1024:.2f} MB, '
      f'压缩后 {NEW.stat().st_size/1024/1024:.2f} MB')

# --- 3. 校验新包 ---
with zipfile.ZipFile(NEW) as z:
    names = z.namelist()
    bad = [n for n in names if '\\' in n]
    root_index = 'index.html' in names
    nested = [n for n in names if n.startswith('site/')]
    print(f'  含反斜杠条目: {len(bad)}')
    print(f'  根目录直接有 index.html: {root_index}')
    print(f'  误含 site/ 前缀: {len(nested)}')
    print(f'  最大条目: {max(names, key=lambda n: z.getinfo(n).file_size)}')
    # 抽查几个中文路径
    cn = [n for n in names if any(ord(c) > 127 for c in n)]
    print(f'  含中文的条目: {len(cn)}  (示例: {cn[0] if cn else "无"})')
    ok = (not bad) and root_index and (not nested) and len(names) == count
    print()
    print('  校验结果:', '通过' if ok else '有问题')

# --- 4. 尝试清掉不符合规范的旧包 ---
if OLD.exists():
    try:
        OLD.unlink()
        print(f'  已删除旧包 {OLD.name}')
    except Exception as e:
        print(f'  旧包无法删除（请手动删除）: {type(e).__name__}')

sys.exit(0)

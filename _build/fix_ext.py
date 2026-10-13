#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 data.js 里的图片引用扩展名改成 .webp（素材已全部转为 WebP）。

一次性工具：素材从 PNG/JPG 批量转成 WebP 之后，用它把 data.js 里的
扩展名同步过去。现在素材与 data.js 都已经是 .webp，正常情况跑它应当是
「无需改动」的空操作 —— 脚本会在没有任何可替换内容时直接返回，不写文件。
"""
import re
import sys
from pathlib import Path

WS = Path(r'D:\LittleProject\JBYangC')

TARGETS = [
    WS / 'site' / 'assets' / 'js' / 'data.js',
]


def main():
    changed_any = False
    for p in TARGETS:
        if not p.exists():
            print(f'!! 不存在: {p}')
            continue

        src = p.read_text(encoding='utf-8')
        n_png = len(re.findall(r"\.png'", src))
        n_jpg = len(re.findall(r"\.jpg'", src))

        # 先算替换结果，没有任何可替换内容就不落盘，避免白白改动文件时间戳
        out = src.replace(".png'", ".webp'").replace(".jpg'", ".webp'")
        if out == src:
            print(f'{p.name}: 无需改动（已全部是 .webp）')
            print(f'  现有 .webp 引用 : {len(re.findall(chr(46) + "webp", out))}')
            print(f'  .mp4 引用       : {len(re.findall(chr(46) + "mp4", out))}')
            continue

        n_left_png = len(re.findall(r"\.png'", out))
        n_left_jpg = len(re.findall(r"\.jpg'", out))
        n_webp = len(re.findall(r"\.webp'", out))

        p.write_text(out, encoding='utf-8')
        changed_any = True
        print(f'{p.name}:')
        print(f'  替换 .png -> .webp : {n_png}')
        print(f'  替换 .jpg -> .webp : {n_jpg}')
        print(f'  替换后 .webp 引用   : {n_webp}')
        print(f'  残留 .png / .jpg    : {n_left_png} / {n_left_jpg}')

        # 顺带核对：.mp4 引用不应被动到
        print(f'  .mp4 引用（应保持不变）: {len(re.findall(chr(46) + "mp4", out))}')

    return 0 if not changed_any else 0


if __name__ == '__main__':
    sys.exit(main())

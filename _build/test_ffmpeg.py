#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""探测 ffmpeg 子进程能写入哪些位置，用于决定视频优化的输出策略。"""
import glob
import os
import subprocess
import sys
from pathlib import Path

WS = Path(r'D:\LittleProject\JBYangC')
TOOLS = WS / '_tools'

# --- 定位 ffmpeg ---
ff = None
try:
    import imageio_ffmpeg
    ff = imageio_ffmpeg.get_ffmpeg_exe()
except Exception as e:
    print(f'API 取值失败({type(e).__name__})，改为搜索二进制')
    cands = glob.glob(str(TOOLS / 'imageio_ffmpeg' / 'binaries' / 'ffmpeg*'))
    cands += glob.glob(str(TOOLS / '**' / 'ffmpeg*.exe'), recursive=True)
    cands = [c for c in cands if c.lower().endswith('.exe')]
    if cands:
        ff = cands[0]

print(f'ffmpeg = {ff}')
if not ff or not Path(ff).exists():
    print('!! 找不到 ffmpeg')
    sys.exit(2)

TARGETS = {
    '工作区 _tmp':        WS / '_tmp',
    '工作区 _build':      WS / '_build',
    '站点根 site':        WS / 'site',
    '站点 media':         WS / 'site' / 'assets' / 'media',
    '站点 media 子目录':  WS / 'site' / 'assets' / 'media' / '队伍徽章',
    '优化前源素材（已删除）':  WS / 'TEAM JBYangC',
    '用户临时目录':        Path(os.environ.get('TEMP', 'C:/Windows/Temp')),
}

print()
print('=== ffmpeg 写入测试（1 秒测试视频）===')
ok_dirs = []
for name, d in TARGETS.items():
    if not d.exists():
        print(f'  --    {name:22} 目录不存在')
        continue
    out = d / f'_ffprobe_{abs(hash(str(d))) % 99999}.mp4'
    if out.exists():
        out.unlink()
    cmd = [ff, '-y', '-loglevel', 'error', '-f', 'lavfi',
           '-i', 'testsrc=size=64x64:rate=5', '-t', '1',
           '-pix_fmt', 'yuv420p', str(out)]
    try:
        r = subprocess.run(cmd, capture_output=True, timeout=60)
        if out.exists() and out.stat().st_size > 0:
            print(f'  OK    {name:22} {out.stat().st_size} 字节')
            ok_dirs.append(str(d))
            out.unlink()
        else:
            msg = (r.stderr or b'').decode('utf-8', 'ignore').strip().replace('\n', ' ')[-120:]
            print(f'  拒绝  {name:22} {msg}')
    except Exception as e:
        print(f'  异常  {name:22} {type(e).__name__}: {e}')

print()
print('可写目录数:', len(ok_dirs))
for d in ok_dirs:
    print('  ', d)

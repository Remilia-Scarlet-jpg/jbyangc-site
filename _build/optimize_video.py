#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视频优化：解决"ffmpeg 子进程无法直接写入站点目录"的限制。

策略：
  1. 先解析可用的 ffmpeg：优先 imageio_ffmpeg，其次本地已下载的静态构建，
     最后从官方镜像下载（gyan.dev / BtbN）
  2. 探测 ffmpeg 能写入哪个目录；把成片先编码到那个暂存目录
  3. 由 Python 自己把文件搬到 site\\assets\\media（已证明 Python 能写该目录）
原视频已迁移进站点，脚本只做原地重编码，不改变文件名。
"""
import os
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

WS = Path(r'D:\LittleProject\JBYangC')
TOOLS = WS / '_tools'
BUILD = WS / '_build'
STAGE = WS / '_tmp'
MEDIA = WS / 'site' / 'assets' / 'media'

MAX_WIDTH = 1280
CRF = '26'
PRESET = 'slow'

FFMPEG_URLS = [
    'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip',
    'https://github.com/GyanD/codexffmpeg/releases/latest/download/ffmpeg-release-essentials.zip',
    'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip',
]


def human(n):
    return f'{n/1024/1024:.2f} MB' if n >= 1024 * 1024 else f'{n/1024:.0f} KB'


def find_local_ffmpeg():
    """在工作区里找已存在的 ffmpeg.exe"""
    for pat in ('**/ffmpeg.exe', '**/ffmpeg'):
        for p in WS.glob(pat):
            if p.is_file() and p.stat().st_size > 1_000_000:
                return p
    return None


def ensure_ffmpeg():
    # 1) imageio_ffmpeg
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and Path(exe).exists():
            print(f'[ffmpeg] 来自 imageio_ffmpeg: {exe}')
            return Path(exe)
    except Exception as e:
        print(f'[ffmpeg] imageio_ffmpeg 不可用: {type(e).__name__}')

    # 2) 本地已有
    local = find_local_ffmpeg()
    if local:
        print(f'[ffmpeg] 本地已有: {local}')
        return local

    # 3) 下载静态构建
    dest = BUILD / 'ffmpeg'
    dest.mkdir(parents=True, exist_ok=True)
    for url in FFMPEG_URLS:
        try:
            print(f'[ffmpeg] 尝试下载 {url}')
            zip_path = STAGE / 'ffmpeg.zip'
            STAGE.mkdir(parents=True, exist_ok=True)
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=120) as r, open(zip_path, 'wb') as f:
                shutil.copyfileobj(r, f)
            size = zip_path.stat().st_size
            print(f'[ffmpeg] 已下载 {human(size)}，开始解压')
            with zipfile.ZipFile(zip_path) as z:
                for name in z.namelist():
                    if name.lower().endswith('ffmpeg.exe'):
                        z.extract(name, dest)
                        exe = dest / name
                        print(f'[ffmpeg] 解压完成: {exe}')
                        zip_path.unlink(missing_ok=True)
                        return exe
            print('[ffmpeg] 压缩包里没有找到 ffmpeg.exe')
        except Exception as e:
            print(f'[ffmpeg] 该源失败: {type(e).__name__}: {str(e)[:90]}')
    return None


def probe_writable(ff):
    """返回 ffmpeg 能写入的第一个目录"""
    cands = [STAGE, BUILD, TOOLS, Path(os.environ.get('TEMP', 'C:/Windows/Temp')), MEDIA]
    for d in cands:
        if not d.exists():
            continue
        out = d / '_ffprobe_write_test.mp4'
        out.unlink(missing_ok=True)
        try:
            r = subprocess.run(
                [str(ff), '-y', '-loglevel', 'error', '-f', 'lavfi',
                 '-i', 'testsrc=size=64x64:rate=5', '-t', '1',
                 '-pix_fmt', 'yuv420p', str(out)],
                capture_output=True, timeout=90)
            if out.exists() and out.stat().st_size > 0:
                out.unlink()
                print(f'[probe] ffmpeg 可写: {d}')
                return d
            msg = (r.stderr or b'').decode('utf-8', 'ignore').strip().replace('\n', ' ')[-90:]
            print(f'[probe] 拒绝 {d}: {msg}')
        except Exception as e:
            print(f'[probe] 异常 {d}: {type(e).__name__}')
    return None


def main():
    ff = ensure_ffmpeg()
    if not ff:
        print('!! 无法获得 ffmpeg，视频优化中止（图片优化已完成）')
        return 1

    stage = probe_writable(ff)
    if not stage:
        print('!! ffmpeg 在任何位置都无法写出文件，中止')
        return 1

    vids = []
    for folder in ('队伍徽章', '入场动画'):
        d = MEDIA / folder
        if d.exists():
            vids += [p for p in sorted(d.rglob('*'))
                     if p.is_file() and p.suffix.lower() in ('.mp4', '.webm', '.mov')]

    if not vids:
        print('没有找到视频文件')
        return 0

    print()
    print(f'共 {len(vids)} 个视频，暂存目录: {stage}')
    print('=' * 62)

    total_before = total_after = 0
    for src in vids:
        size_before = src.stat().st_size
        total_before += size_before
        staged = stage / (src.stem + '.__opt.mp4')
        staged.unlink(missing_ok=True)

        cmd = [str(ff), '-y', '-loglevel', 'error', '-i', str(src),
               '-vf', f"scale='min({MAX_WIDTH},iw)':-2",
               '-c:v', 'libx264', '-crf', CRF, '-preset', PRESET,
               '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
               str(staged)]
        try:
            r = subprocess.run(cmd, capture_output=True, timeout=3600)
        except Exception as e:
            print(f'  !! {src.name}: 执行异常 {type(e).__name__}')
            total_after += size_before
            continue

        if not staged.exists() or staged.stat().st_size == 0:
            msg = (r.stderr or b'').decode('utf-8', 'ignore').strip().replace('\n', ' ')[-140:]
            print(f'  !! {src.name}: 编码失败 {msg}')
            total_after += size_before
            continue

        size_after = staged.stat().st_size
        if size_after < size_before:
            # Python 自己搬运（ffmpeg 写不进去，但 Python 可以）
            try:
                if src.exists():
                    src.unlink()
                shutil.move(str(staged), str(src))
                note = ''
            except Exception as e:
                note = f'  [搬运失败: {type(e).__name__}]'
                size_after = size_before
        else:
            staged.unlink(missing_ok=True)
            size_after = size_before
            note = '  [已压缩但体积未减小，保留原文件]'

        total_after += size_after
        print(f'  {src.name}   {human(size_before)} -> {human(size_after)}{note}')

    print('=' * 62)
    print(f'视频总体积: {human(total_before)} -> {human(total_after)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())

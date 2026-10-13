#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
站点素材优化脚本（一次性使用）
- 图片：全部转 WebP，按用途限制最大边长，大幅压缩体积
- 视频：H.264 重编码，限制到 720p，去掉音轨（站点里都是静音播放）
- 原图已迁移进站点，脚本只做原地转换，不保留未压缩副本
"""
import os
import sys
import json
from pathlib import Path

WS = Path(r'D:\LittleProject\JBYangC')
SITE = WS / 'site'
MEDIA = SITE / 'assets' / 'media'

# 文件夹 -> (最大边长, WebP 质量)
IMAGE_RULES = {
    '队伍徽章': (512, 88),    # 徽章要边缘锐利
    '选手照片': (1000, 80),   # 人物照，卡片与详情页用
    '选手印花': (640, 85),    # 印花/贴纸
    '选手签名': (640, 85),    # 签名
    '队服':     (900, 82),
    '合影':     (1800, 82),
}

VIDEO_RULES = {
    'max_width': 1280,
    'crf': 26,
    'preset': 'slow',
}

IMG_EXT = {'.png', '.jpg', '.jpeg', '.bmp', '.gif'}
VID_EXT = {'.mp4', '.webm', '.mov', '.m4v'}


def human(n):
    return f'{n/1024/1024:.2f} MB' if n >= 1024 * 1024 else f'{n/1024:.0f} KB'


def main():
    try:
        from PIL import Image
    except ImportError:
        print('!! Pillow 未安装')
        return 2

    try:
        import imageio_ffmpeg
        FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as e:
        FFMPEG = None
        print(f'!! ffmpeg 不可用: {e}')

    if not MEDIA.exists():
        print(f'!! 素材目录不存在: {MEDIA}')
        return 2

    report = {'images': [], 'videos': [], 'skipped': []}
    before_total = 0
    after_total = 0

    # ---------- 图片 ----------
    for folder, (max_dim, quality) in IMAGE_RULES.items():
        d = MEDIA / folder
        if not d.exists():
            print(f'-- 跳过（目录不存在）: {folder}')
            continue
        for src in sorted(d.rglob('*')):
            if not src.is_file() or src.suffix.lower() not in IMG_EXT:
                continue
            before_total += src.stat().st_size
            try:
                im = Image.open(src)
                im.load()
                ow, oh = im.size

                # 按最长边等比缩放
                scale = min(1.0, max_dim / max(ow, oh))
                if scale < 1.0:
                    nw, nh = max(1, round(ow * scale)), max(1, round(oh * scale))
                    im = im.resize((nw, nh), Image.LANCZOS)
                else:
                    nw, nh = ow, oh

                # 有透明通道就保留，否则转 RGB（WebP 有损模式对 RGB 更省）
                has_alpha = im.mode in ('RGBA', 'LA') or (
                    im.mode == 'P' and 'transparency' in im.info)
                im = im.convert('RGBA' if has_alpha else 'RGB')

                dst = src.with_suffix('.webp')
                im.save(dst, 'WEBP', quality=quality, method=6)
                after_total += dst.stat().st_size

                if dst != src:
                    src.unlink()

                report['images'].append({
                    'file': str(src.relative_to(MEDIA)),
                    'from': f'{ow}x{oh}',
                    'to': f'{nw}x{nh}',
                    'before': before_total,
                    'size_before': None,
                    'size_after': dst.stat().st_size,
                    'alpha': has_alpha,
                })
                print(f'  图 {src.relative_to(MEDIA)}  {ow}x{oh} -> {nw}x{nh}  '
                      f'{human(dst.stat().st_size)}')
            except Exception as e:
                print(f'  !! 图片失败 {src.name}: {type(e).__name__}: {e}')
                report['skipped'].append(str(src))

    # ---------- 视频 ----------
    if FFMPEG:
        import subprocess
        for folder in ('队伍徽章', '入场动画'):
            d = MEDIA / folder
            if not d.exists():
                continue
            for src in sorted(d.rglob('*')):
                if not src.is_file() or src.suffix.lower() not in VID_EXT:
                    continue
                size_before = src.stat().st_size
                before_total += size_before
                tmp = src.with_name(src.stem + '.__opt.mp4')
                cmd = [
                    FFMPEG, '-y', '-i', str(src),
                    '-vf', f"scale='min({VIDEO_RULES['max_width']},iw)':-2",
                    '-c:v', 'libx264', '-crf', str(VIDEO_RULES['crf']),
                    '-preset', VIDEO_RULES['preset'],
                    '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart',
                    '-an',
                    str(tmp),
                ]
                try:
                    r = subprocess.run(cmd, capture_output=True, timeout=1800)
                    if r.returncode != 0 or not tmp.exists() or tmp.stat().st_size == 0:
                        err = (r.stderr or b'').decode('utf-8', 'ignore')[-300:]
                        print(f'  !! 视频失败 {src.name}: {err}')
                        if tmp.exists():
                            tmp.unlink()
                        after_total += size_before
                        continue
                    size_after = tmp.stat().st_size
                    # 只有在确实变小的时候才替换
                    if size_after < size_before:
                        src.unlink()
                        tmp.rename(src)
                        after_total += size_after
                    else:
                        tmp.unlink()
                        size_after = size_before
                        after_total += size_before
                    report['videos'].append({
                        'file': str(src.relative_to(MEDIA)),
                        'size_before': size_before,
                        'size_after': size_after,
                    })
                    print(f'  视 {src.relative_to(MEDIA)}  {human(size_before)} -> {human(size_after)}')
                except Exception as e:
                    print(f'  !! 视频异常 {src.name}: {type(e).__name__}: {e}')
                    if tmp.exists():
                        tmp.unlink()
                    after_total += size_before
                    report['skipped'].append(str(src))

    print()
    print('=' * 62)
    print(f'图片处理 {len(report["images"])} 张，视频处理 {len(report["videos"])} 个')
    print(f'站点素材总体积: {human(before_total)} -> {human(after_total)}')
    if report['skipped']:
        print(f'跳过/失败: {len(report["skipped"])} 个')
    print('=' * 62)

    out = WS / '_build'
    out.mkdir(parents=True, exist_ok=True)
    (out / 'optimize-report.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'明细已写入 {out / "optimize-report.json"}')
    return 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把站点里的 __SITE_URL__ 占位符替换成真实域名。

为什么需要它
    og:url / og:image / sitemap.xml / robots.txt 都要求**绝对地址**，
    但开发阶段域名还没定。所以源码里统一留 __SITE_URL__ 占位，
    上线前跑一次本脚本；以后换域名也只改这一处。

用法
    python _build/set-domain.py
        不带参数：从 git remote origin 自动推断 GitHub Pages 地址
        （https 与 ssh 两种 remote 写法都支持）

    python _build/set-domain.py https://example.com
        手动指定。结尾的斜杠会自动去掉。

    python _build/set-domain.py --dry-run
        只打印将要替换的位置和次数，不写任何文件。

注意
    本脚本只动 site/ 下的 .html / .txt / .xml，
    不碰 _build/ 与二进制素材，并按字节读写以保持原有换行符。
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
SITE = WORKSPACE / "site"
PLACEHOLDER = "__SITE_URL__"
SUFFIXES = {".html", ".txt", ".xml"}


def infer_from_git() -> str | None:
    """从 origin 推断 GitHub Pages 地址；推不出来就返回 None。"""
    try:
        out = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            cwd=str(WORKSPACE),
            capture_output=True,
            text=True,
            timeout=10,
        )
    except Exception:
        return None
    if out.returncode != 0:
        return None

    url = out.stdout.strip()
    m = re.search(r"github\.com[:/]+([^/\s]+)/([^/\s]+?)(?:\.git)?/?$", url)
    if not m:
        return None

    user, repo = m.group(1), m.group(2)
    # 仓库名就是 <user>.github.io 时，站点挂在域名根目录
    if repo.lower() == f"{user.lower()}.github.io":
        return f"https://{user}.github.io"
    return f"https://{user}.github.io/{repo}"


def main() -> int:
    argv = sys.argv[1:]
    dry_run = "--dry-run" in argv
    argv = [a for a in argv if a != "--dry-run"]

    if argv:
        site_url = argv[0].strip().rstrip("/")
    else:
        inferred = infer_from_git()
        if inferred:
            site_url = inferred
            print(f"从 git remote 推断：{site_url}")
        elif dry_run:
            # 还没配 remote 时也允许先看影响面
            site_url = "https://example.com"
            print("未检测到 git remote，dry-run 用占位域名演示（不会写文件）")
        else:
            print("无法从 git remote 推断域名（还没 push 过？）。")
            print("请手动执行：python _build/set-domain.py https://你的域名")
            return 1

    if not re.match(r"^https?://[^/\s]+", site_url):
        print(f"域名格式不对：{site_url}")
        print("应以 http:// 或 https:// 开头")
        return 1

    touched: list[tuple[str, int]] = []
    total = 0

    for path in sorted(SITE.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in SUFFIXES:
            continue
        # 按字节读写，避免改动换行符（CRLF/LF）
        text = path.read_bytes().decode("utf-8")
        n = text.count(PLACEHOLDER)
        if not n:
            continue
        touched.append((path.relative_to(SITE).as_posix(), n))
        total += n
        if not dry_run:
            path.write_bytes(text.replace(PLACEHOLDER, site_url).encode("utf-8"))

    if not touched:
        print(f"没有找到 {PLACEHOLDER}，可能已经替换过了。")
        print(f"当前设定：{site_url}")
        return 0

    print("将替换：" if dry_run else "已替换：")
    for rel, n in touched:
        print(f"  {rel:<22} {n} 处")
    print(f"合计 {total} 处 -> {site_url}")

    if dry_run:
        print("\n（--dry-run：未写文件）")
    else:
        print("\n下一步：node _build/verify.js 确认没改坏，然后 git commit")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

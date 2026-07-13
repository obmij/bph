#!/usr/bin/env python3
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "www.bph.com.tw"

# Files from the temporary synthetic rebuild that are not part of the preserved original site.
SYNTHETIC_FILES = {
    "ximen.html", "changchun.html", "nearby.html", "contact.html", "news.html",
    "privacy.html", "offline.html", "404.html", "manifest.webmanifest",
    "robots.txt", "sitemap.xml", "sw.js",
}

HEAD_INJECT = """
<link rel="stylesheet" href="./assets/css/quick-services.css">
<link rel="stylesheet" href="./assets/css/original-preservation.css">
""".strip()

BODY_INJECT = """
<script type="module" src="./assets/js/original-preservation.js"></script>
""".strip()


def process_html(text: str) -> str:
    # Original HTML lived one directory below repository root. Moving it to root
    # requires only this relative-path adjustment; page text and image references remain unchanged.
    text = text.replace("../", "./")
    if "original-preservation.css" not in text:
        text = text.replace("</head>", f"{HEAD_INJECT}\n</head>", 1)
    if "original-preservation.js" not in text:
        text = text.replace("</body>", f"{BODY_INJECT}\n</body>", 1)
    return text


def main() -> None:
    if not SOURCE.is_dir():
        raise SystemExit("www.bph.com.tw source directory is missing")

    # Copy every original page/feed file to repository root. Original CDN asset
    # directories are already retained at root by the restoration commit.
    for path in SOURCE.rglob("*"):
        relative = path.relative_to(SOURCE)
        destination = ROOT / relative
        if path.is_dir():
            destination.mkdir(parents=True, exist_ok=True)
            continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        if path.suffix.lower() == ".html":
            destination.write_text(
                process_html(path.read_text(encoding="utf-8", errors="replace")),
                encoding="utf-8",
            )
        else:
            shutil.copy2(path, destination)

    for filename in SYNTHETIC_FILES:
        target = ROOT / filename
        if target.exists():
            target.unlink()

    # Keep only the two requested overlay modules and the floating service bar.
    assets = ROOT / "assets"
    keep = {
        assets / "css" / "quick-services.css",
        assets / "css" / "original-preservation.css",
        assets / "js" / "quick-services.js",
        assets / "js" / "original-preservation.js",
    }
    if assets.exists():
        for path in sorted(assets.rglob("*"), key=lambda item: len(item.parts), reverse=True):
            if path.is_file() and path not in keep:
                path.unlink()
            elif path.is_dir() and not any(path == kept.parent or path in kept.parents for kept in keep):
                shutil.rmtree(path, ignore_errors=True)

    shutil.rmtree(SOURCE)

    # Remove one-time migration machinery after the restoration commit is generated.
    for disposable in (
        ROOT / "scripts" / "restore_original.py",
        ROOT / ".github" / "workflows" / "restore-original.yml",
    ):
        if disposable.exists():
            disposable.unlink()

    scripts = ROOT / "scripts"
    if scripts.exists() and not any(scripts.iterdir()):
        scripts.rmdir()


if __name__ == "__main__":
    main()

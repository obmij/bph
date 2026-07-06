#!/usr/bin/env python3
"""Validate the BPH GitHub Pages site without external dependencies."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
IGNORED_SCHEMES = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:")


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.references: list[tuple[str, str]] = []
        self.has_title = False
        self.has_viewport = False
        self.html_lang = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "html":
            self.html_lang = values.get("lang") or ""
        if tag == "title":
            self.has_title = True
        if tag == "meta" and (values.get("name") or "").lower() == "viewport":
            self.has_viewport = True
        element_id = values.get("id")
        if element_id:
            self.ids.append(element_id)
        for attribute in ("href", "src"):
            value = values.get(attribute)
            if value:
                self.references.append((attribute, value))


def resolve_reference(page: Path, value: str) -> Path | None:
    value = value.strip()
    if not value or value.startswith("#") or value.lower().startswith(IGNORED_SCHEMES):
        return None
    parsed = urlsplit(value)
    path = unquote(parsed.path)
    if not path:
        return None
    if path.startswith("/"):
        candidate = SITE / path.lstrip("/")
    else:
        candidate = page.parent / path
    candidate = candidate.resolve()
    try:
        candidate.relative_to(SITE.resolve())
    except ValueError:
        return candidate
    if candidate.is_dir():
        candidate = candidate / "index.html"
    return candidate


def validate_html(page: Path) -> list[str]:
    errors: list[str] = []
    parser = PageParser()
    try:
        parser.feed(page.read_text(encoding="utf-8"))
    except (OSError, UnicodeError) as exc:
        return [f"{page.relative_to(ROOT)}: cannot read UTF-8 HTML: {exc}"]

    rel = page.relative_to(ROOT)
    if not parser.html_lang:
        errors.append(f"{rel}: <html> is missing a lang attribute")
    if not parser.has_title:
        errors.append(f"{rel}: missing <title>")
    if not parser.has_viewport:
        errors.append(f"{rel}: missing viewport meta tag")

    duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    for duplicate in duplicates:
        errors.append(f"{rel}: duplicate id '{duplicate}'")

    for attribute, value in parser.references:
        target = resolve_reference(page, value)
        if target is not None and not target.exists():
            errors.append(f"{rel}: broken {attribute} reference '{value}'")
    return errors


def validate_service_worker() -> list[str]:
    errors: list[str] = []
    sw = SITE / "sw.js"
    if not sw.exists():
        return ["site/sw.js: missing service worker"]
    text = sw.read_text(encoding="utf-8")
    assets = re.findall(r"['\"](\./[^'\"]+)['\"]", text)
    for asset in sorted(set(assets)):
        target = (SITE / asset[2:]).resolve()
        if not target.exists():
            errors.append(f"site/sw.js: cached asset does not exist: {asset}")
    return errors


def validate_required_files() -> list[str]:
    required = [
        "index.html",
        "ximen.html",
        "changchun.html",
        "nearby.html",
        "contact.html",
        "news.html",
        "privacy.html",
        "404.html",
        "offline.html",
        "manifest.webmanifest",
        "robots.txt",
        "sitemap.xml",
    ]
    return [f"site/{name}: required file is missing" for name in required if not (SITE / name).exists()]


def main() -> int:
    if not SITE.exists():
        print("site directory is missing", file=sys.stderr)
        return 1

    errors: list[str] = []
    errors.extend(validate_required_files())
    for page in sorted(SITE.rglob("*.html")):
        errors.extend(validate_html(page))
    errors.extend(validate_service_worker())

    if errors:
        print("BPH site validation failed:\n")
        for error in errors:
            print(f"- {error}")
        return 1

    pages = len(list(SITE.rglob("*.html")))
    print(f"BPH site validation passed: {pages} HTML pages checked.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

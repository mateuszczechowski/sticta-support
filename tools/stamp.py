"""Stamp style.css, home.css and home.js links in every page with a hash of
the file, so a browser never pairs a new page with a cached old stylesheet.
Run after editing any of them: python3 tools/stamp.py"""
import hashlib, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
assets = {name: hashlib.sha1((root / name).read_bytes()).hexdigest()[:8]
          for name in ("style.css", "home.css", "home.js")}
for page in root.glob("*.html"):
    html = page.read_text()
    for name, digest in assets.items():
        html = re.sub(rf'(["\']){re.escape(name)}(\?v=[0-9a-f]+)?(["\'])', rf'\g<1>{name}?v={digest}\3', html)
    page.write_text(html)
print(assets)

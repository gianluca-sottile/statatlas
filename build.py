#!/usr/bin/env python3
"""Costruisce index.html (file unico, offline) a partire da src/.
Uso: python3 build.py   ->  scrive ./index.html
"""
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
STYLES = ["styles/tokens.css", "styles/app.css", "styles/editorial.css"]
SCRIPTS = ["core/rng.js", "core/dist.js", "core/laws.js", "core/linalg.js", "core/resampling.js", "core/plot.js", "core/plot3d.js", "core/art.js", "core/content.js", "core/ui.js", "core/app.js"]
SCRIPTS += sorted(str(p.relative_to(SRC)) for p in (SRC / "labs").glob("*.js"))


def read(rel):
    return (SRC / rel).read_text(encoding="utf-8")


def main():
    shell = read("shell.html")
    css = "\n".join(f"/* {f} */\n" + read(f) for f in STYLES)
    js = "\n".join(f"/* {f} */\n" + read(f).replace("</script", "<\\/script") for f in SCRIPTS)
    out = shell.replace("<!-- @styles -->", f"<style>\n{css}\n</style>")
    out = out.replace("<!-- @scripts -->", f"<script>\n{js}\n</script>")
    (ROOT / "index.html").write_text(out, encoding="utf-8")
    print(f"index.html: {len(out) / 1024:.0f} KB · {len(SCRIPTS)} script")


if __name__ == "__main__":
    main()

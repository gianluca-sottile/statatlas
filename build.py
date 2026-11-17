#!/usr/bin/env python3
"""Costruisce index.html (file unico, offline) a partire da src/.
Uso: python3 build.py   ->  scrive ./index.html
"""
from pathlib import Path
import hashlib

ROOT = Path(__file__).parent
SRC = ROOT / "src"
STYLES = ["styles/tokens.css", "styles/app.css", "styles/editorial.css", "styles/challenges.css", "styles/mobile.css", "styles/spatial-studio.css", "styles/course-bridge.css", "styles/i18n.css", "styles/experiments.css"]
SCRIPTS = ["core/rng.js", "core/dist.js", "core/laws.js", "core/math.js", "core/linalg.js", "core/resampling.js", "core/ml.js", "core/boost.js", "core/spatial.js", "core/spatial-areal.js", "core/spatial-local.js", "core/spatial-points.js", "core/spatial-geostat.js", "core/spatial-kriging.js", "core/spatial-regression.js", "core/r-code.js", "core/spatial-studio.js", "core/spatial-unified.js", "core/cluster.js", "core/nn.js", "core/plot.js", "core/plot3d.js", "core/art.js", "core/content.js", "core/pedagogy.js", "core/pedagogy-theory.js", "core/pedagogy-formulas.js", "core/pedagogy-rigorous.js", "core/ui.js", "core/challenges.js", "core/challenges-curriculum.js", "core/course-bridge.js", "core/i18n-data.js", "core/i18n-lessons.js", "core/i18n-theory.js", "core/i18n-goals.js", "core/i18n-challenges.js", "core/i18n-ui.js", "core/i18n-rcomments.js", "core/i18n.js", "core/experiments.js", "core/app.js"]
SCRIPTS += sorted(str(p.relative_to(SRC)) for p in (SRC / "labs").glob("*.js"))


def read(rel):
    return (SRC / rel).read_text(encoding="utf-8")


def main():
    shell = read("shell.html")
    css = "\n".join(f"/* {f} */\n" + read(f) for f in STYLES)
    js = "\n".join(f"/* {f} */\n" + read(f).replace("</script", "<\\/script") for f in SCRIPTS)
    # Content-addressed engine fingerprint excludes this embedded marker itself.
    fingerprint = hashlib.sha256((shell + css + js).encode('utf-8')).hexdigest()
    js = "window.SA = window.SA || {}; window.SA.buildId = '" + fingerprint + "';\n" + js
    out = shell.replace("<!-- @styles -->", f"<style>\n{css}\n</style>")
    out = out.replace("<!-- @scripts -->", f"<script>\n{js}\n</script>")
    (ROOT / "index.html").write_text(out, encoding="utf-8")
    print(f"index.html: {len(out) / 1024:.0f} KB · {len(SCRIPTS)} script")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the single-file app (index.html) from src/app.html.

Usage:  python3 src/build.py            -> writes index.html in the repo root
        python3 src/build.py --check    -> exits 1 if index.html is out of date
"""
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
def read(*p): return open(os.path.join(here, *p), encoding="utf-8").read()
def script_safe(js): return js.replace("</script", "<\\/script")

html = read("app.html")
trystero = script_safe(read("vendor", "trystero.iife.js")).split("\n//# sourceMappingURL")[0]
html = (html.replace("%%LOGO_TM%%", read("assets", "logo_tm.datauri.txt").strip())
            .replace("%%LOGO_CO%%", read("assets", "logo_co.datauri.txt").strip())
            .replace("%%TRYSTERO%%", trystero)
            .replace("%%QRCODE%%", script_safe(read("vendor", "qrcode.min.js"))))
for marker in ("%%LOGO_TM%%", "%%LOGO_CO%%", "%%TRYSTERO%%", "%%QRCODE%%"):
    assert marker not in html, marker
out = os.path.join(root, "index.html")
if "--check" in sys.argv:
    cur = open(out, encoding="utf-8").read() if os.path.exists(out) else ""
    if cur != html:
        print("index.html is out of date: run  python3 src/build.py"); sys.exit(1)
    print("index.html is up to date"); sys.exit(0)
open(out, "w", encoding="utf-8").write(html)
print("built index.html (%d KB)" % (len(html.encode("utf-8")) // 1024))

#!/usr/bin/env python3
"""Build the single-file app (index.html) from the source files in src/.

  src/index.template.html   page markup, with %%CSS%% and %%JS%% where the styles and the app script go
  src/css/order.txt         the CSS files, in order
  src/js/order.txt          the JavaScript files, in order (they share one scope, so order matters)
  src/assets/, src/vendor/  logos and third-party libraries, inlined at %%LOGO_*%%, %%TRYSTERO%%, %%QRCODE%%

Usage:  python3 src/build.py            -> writes index.html in the repo root
        python3 src/build.py --check    -> exits 1 if index.html is out of date
"""
import os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
def read(*p): return open(os.path.join(here, *p), encoding="utf-8").read()
def script_safe(js): return js.replace("</script", "<\\/script")
def ordered(folder):
    names = [l.strip() for l in read(folder, "order.txt").splitlines() if l.strip() and not l.startswith("#")]
    on_disk = sorted(os.path.relpath(os.path.join(d, f), os.path.join(here, folder)).replace(os.sep, "/")
                     for d, _, fs in os.walk(os.path.join(here, folder)) for f in fs if f.endswith((".js", ".css")))
    missing = sorted(set(on_disk) - set(names)); gone = sorted(set(names) - set(on_disk))
    if missing or gone: sys.exit("src/%s/order.txt is out of step: not listed %s, missing on disk %s" % (folder, missing, gone))
    return "".join(read(folder, n) for n in names)

css = ordered("css"); js = ordered("js")
html = read("index.template.html").replace("%%CSS%%", css.rstrip("\n")).replace("%%JS%%", js.rstrip("\n"))
trystero = script_safe(read("vendor", "trystero.iife.js")).split("\n//# sourceMappingURL")[0]
html = (html.replace("%%LOGO_TM%%", read("assets", "logo_tm.datauri.txt").strip())
            .replace("%%LOGO_CO%%", read("assets", "logo_co.datauri.txt").strip())
            .replace("%%TRYSTERO%%", trystero)
            .replace("%%QRCODE%%", script_safe(read("vendor", "qrcode.min.js"))))
for marker in ("%%CSS%%", "%%JS%%", "%%LOGO_TM%%", "%%LOGO_CO%%", "%%TRYSTERO%%", "%%QRCODE%%"):
    assert marker not in html, marker
# the files share one scope: two functions with the same name would silently override each other
dupes = [n for n, c in __import__("collections").Counter(re.findall(r"^\s*function\s+([A-Za-z_$][\w$]*)\s*\(", js, re.M)).items() if c > 1]
if dupes: sys.exit("duplicate function names across src/js: %s" % dupes)
out = os.path.join(root, "index.html")
if "--check" in sys.argv:
    cur = open(out, encoding="utf-8").read() if os.path.exists(out) else ""
    if cur != html:
        print("index.html is out of date: run  python3 src/build.py"); sys.exit(1)
    print("index.html is up to date"); sys.exit(0)
open(out, "w", encoding="utf-8").write(html)
print("built index.html (%d KB)" % (len(html.encode("utf-8")) // 1024))

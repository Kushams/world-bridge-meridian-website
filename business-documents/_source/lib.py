"""Shared styling and helpers for the WBM client documents (HTML -> PDF via headless Chromium)."""
import base64, html, os, subprocess, pathlib

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

COMPANY = "World Bridge Meridian"
EMAIL = "info@worldbridgemeridian.group"
PHONE = "+1 (302) 627-3325"
SITE = "worldbridgemeridian.com"
PAY_URL = "worldbridgemeridian.com/payments"
JOURNEY_URL = "worldbridgemeridian.com/plan-your-journey"

LOGO = "data:image/jpeg;base64," + base64.b64encode((HERE / "logo.jpg").read_bytes()).decode()

CSS = """
@page { size: Letter; margin: 0.75in 0.8in 0.85in 0.8in;
  @bottom-left { content: "World Bridge Meridian  |  info@worldbridgemeridian.group  |  +1 (302) 627-3325"; font: 7.5pt 'Liberation Sans', sans-serif; color: #8a7a62; }
  @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 7.5pt 'Liberation Sans', sans-serif; color: #8a7a62; } }
:root { --gold:#a97b3f; --cream:#f1ead8; --ink:#1f1d1a; --muted:#6d6558; --line:#d9ccb2; }
* { box-sizing: border-box; }
body { font: 10pt/1.5 'Liberation Sans', 'DejaVu Sans', sans-serif; color: var(--ink); margin: 0; }
.letterhead { background: var(--cream); margin: 0 0 0.28in 0; padding: 0.16in 0.22in 0.12in; border-bottom: 2px solid var(--gold); display: flex; justify-content: space-between; align-items: center; }
.letterhead img { height: 0.82in; }
.letterhead .ref { text-align: right; font-size: 8pt; color: var(--muted); line-height: 1.5; }
.letterhead .ref b { color: var(--gold); letter-spacing: .12em; font-size: 7.5pt; }
h1 { font: 400 21pt/1.2 'Liberation Serif', serif; margin: 0 0 3pt; color: var(--ink); }
.sub { color: var(--muted); font-size: 10pt; margin: 0 0 14pt; }
h2 { font: 700 11.5pt/1.3 'Liberation Serif', serif; color: var(--gold); text-transform: uppercase; letter-spacing: .06em; margin: 16pt 0 5pt; padding-bottom: 3pt; border-bottom: 1px solid var(--line); break-after: avoid; }
h3 { font: 700 10pt/1.3 'Liberation Sans', sans-serif; margin: 10pt 0 3pt; break-after: avoid; }
p { margin: 0 0 6pt; } ul, ol { margin: 0 0 7pt; padding-left: 17pt; } li { margin-bottom: 2.5pt; }
table { width: 100%; border-collapse: collapse; margin: 4pt 0 9pt; font-size: 9.2pt; }
th { background: var(--cream); text-align: left; font-weight: 700; padding: 5pt 6pt; border: 1px solid var(--line); }
td { padding: 6pt; border: 1px solid var(--line); vertical-align: top; }
td.k { width: 30%; background: #faf6ea; font-weight: 700; color: #4b4438; }
tr { break-inside: avoid; }
.fill { background: #fbf0cf; border-bottom: 1px dashed #b8923f; padding: 0 3pt; color: #6b5420; }
.line { display: inline-block; border-bottom: 1px solid #8a7a62; min-width: 170pt; height: 11pt; vertical-align: bottom; }
.line.s { min-width: 90pt; } .line.l { min-width: 300pt; }
.blank td { height: 22pt; }
.box { display: inline-block; width: 8.5pt; height: 8.5pt; border: 1.1px solid #4b4438; margin-right: 5pt; vertical-align: -1pt; }
.note { background: #faf6ea; border-left: 3px solid var(--gold); padding: 7pt 10pt; margin: 8pt 0; font-size: 9pt; break-inside: avoid; }
.warn { background: #fdf0ec; border-left: 3px solid #b3402a; padding: 7pt 10pt; margin: 8pt 0; font-size: 9.2pt; break-inside: avoid; }
.sig { display: flex; gap: 28pt; margin-top: 18pt; break-inside: avoid; }
.sig > div { flex: 1; } .sig .l { border-bottom: 1px solid #4b4438; height: 26pt; } .sig .c { font-size: 8pt; color: var(--muted); margin-top: 2pt; }
.draft { display:inline-block; border: 1px solid #b3402a; color: #b3402a; font-size: 7pt; letter-spacing: .1em; padding: 1pt 5pt; margin-top: 3pt; }
.tot td { font-weight: 700; background: #faf6ea; }
.r { text-align: right; }
.small { font-size: 8.5pt; color: var(--muted); }
.pb { break-before: page; }
.cl { counter-reset: c; } .cl h2 { counter-increment: c; } .cl h2::before { content: counter(c) ". "; }
"""

def esc(s): return html.escape(s)
def F(label): return f'<span class="fill">[{esc(label)}]</span>'
def line(cls=""): return f'<span class="line {cls}"></span>'
def box(label): return f'<span class="box"></span>{label}'
def kv(rows):
    return "<table>" + "".join(f'<tr><td class="k">{k}</td><td>{v}</td></tr>' for k, v in rows) + "</table>"
def grid(head, rows):
    h = "".join(f"<th>{c}</th>" for c in head)
    return f"<table><tr>{h}</tr>" + "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows) + "</table>"
def blank_rows(head, n):
    h = "".join(f"<th>{c}</th>" for c in head)
    return f'<table class="blank"><tr>{h}</tr>' + "".join("<tr>" + "<td></td>" * len(head) + "</tr>" for _ in range(n)) + "</table>"
def sig(*labels):
    return '<div class="sig">' + "".join(f'<div><div class="l"></div><div class="c">{l}</div></div>' for l in labels) + "</div>"
def note(t): return f'<div class="note">{t}</div>'
def warn(t): return f'<div class="warn">{t}</div>'

ENTITY = F("WBM legal entity name") + " (trading as World Bridge Meridian)"
ADDR = F("Registered business address")

def page(ref, title, subtitle, body, draft=False):
    tag = '<div><span class="draft">DRAFT FOR LEGAL REVIEW</span></div>' if draft else ""
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>{esc(title)}</title><style>{CSS}</style></head><body>
<div class="letterhead"><img src="{LOGO}" alt="World Bridge Meridian"><div class="ref"><b>{esc(ref)}</b><br>{SITE}<br>{EMAIL}<br>{PHONE}{tag}</div></div>
<h1>{esc(title)}</h1><p class="sub">{subtitle}</p>{body}</body></html>"""

def render(doc_html, out_pdf):
    out_pdf = pathlib.Path(out_pdf); out_pdf.parent.mkdir(parents=True, exist_ok=True)
    tmp = HERE / "_tmp.html"; tmp.write_text(doc_html, encoding="utf-8")
    subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={out_pdf}", "--run-all-compositor-stages-before-draw", f"file://{tmp}"],
                   check=True, capture_output=True, timeout=120)
    tmp.unlink()

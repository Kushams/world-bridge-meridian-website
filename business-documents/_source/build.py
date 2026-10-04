"""Build every WBM client document into business-documents/<send folder>/*.pdf. Run: python3 build.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from lib import OUT, render
import docs1, docs2

docs = []
docs += docs1.guide()
docs += [docs1.send1(), docs1.journey_form(), docs1.proposal(), docs1.agreement(), docs1.acceptance(), docs1.supplier_ack(), docs1.group_contract(), docs1.corporate()]
docs += [f() for f in docs2.ALL]
for folder, name, html in docs:
    out = OUT / folder / name
    render(html, out)
    print("built", out.relative_to(OUT))
print(len(docs), "documents")

"""Build src/tools/catalog/content/{bugs,foreign}.ts from spec_bugs.py / spec_foreign.py.

For every photo: fetch metadata (license, author) from Commons, refuse anything
that is not a free licence, download a 1400 px rendition, save it under
src/assets/catalog/<catalog>/<entry>-<n>.jpg and emit the credit line.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
# scripts/catalog/ -> repo root; the generator can also run from any folder that holds the specs.
ROOT = os.environ.get("PATHOLYTICS_ROOT") or os.path.normpath(os.path.join(HERE, "..", ".."))
API = "https://commons.wikimedia.org/w/api.php"
UA = "PatholyticsCatalogResearch/1.0 (guimota1@gmail.com)"
META = os.path.join(HERE, "meta.json")
CACHE = os.path.join(HERE, "final")
os.chdir(HERE)
ALLOWED = re.compile(r"^(CC BY(-SA)? \d(\.\d)?|CC0|Public domain|Copyrighted free use)$")

import spec_bugs
import spec_foreign


def call(params):
    params = dict(params, format="json")
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(API, data=data, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))


def strip_html(s):
    return " ".join(re.sub(r"<[^>]+>", "", s or "").split())


def load_meta():
    return json.load(open(META, encoding="utf-8")) if os.path.exists(META) else {}


def ensure_meta(meta, titles):
    missing = [t for t in titles if t not in meta]
    for i in range(0, len(missing), 25):
        chunk = missing[i:i + 25]
        data = call({
            "action": "query", "titles": "|".join(chunk), "prop": "imageinfo",
            "iiprop": "url|size|extmetadata|mime",
            "iiextmetadatafilter": "LicenseShortName|Artist|Credit|ImageDescription|Attribution",
        })
        for page in data.get("query", {}).get("pages", {}).values():
            if "missing" in page or not page.get("imageinfo"):
                raise SystemExit(f"MISSING on Commons: {page.get('title')}")
            ii = page["imageinfo"][0]
            md = {k: strip_html(v.get("value")) for k, v in ii.get("extmetadata", {}).items()}
            meta[page["title"]] = {
                "license": md.get("LicenseShortName"), "artist": md.get("Artist"), "credit": md.get("Credit"),
                "attribution": md.get("Attribution"), "desc": md.get("ImageDescription"),
                "w": ii.get("width"), "h": ii.get("height"), "url": (ii.get("url") or "").split("?")[0],
            }
    json.dump(meta, open(META, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


MAX_EDGE = 1100
THUMB_EDGE = 480


def fetch_big(title, out, width=1400):
    """Cache the Commons rendition at `width`; the asset is resized from it."""
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return
    data = call({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url", "iiurlwidth": width})
    for page in data["query"]["pages"].values():
        ii = page["imageinfo"][0]
        url = ii.get("thumburl") or ii["url"]
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        raw = urllib.request.urlopen(req, timeout=180).read()
        tmp = out + ".tmp"
        open(tmp, "wb").write(raw)
        im = Image.open(tmp).convert("RGB")
        im.thumbnail((width, width))
        im.save(out, "JPEG", quality=90)
        os.remove(tmp)


def write_asset(cache, dest, edge, quality):
    im = Image.open(cache).convert("RGB")
    im.thumbnail((edge, edge))
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)


LIC_PT = {"Public domain": "domínio público", "CC0": "CC0", "Copyrighted free use": "uso livre"}


def credit_for(m):
    lic = m.get("license") or ""
    if not ALLOWED.match(lic):
        raise SystemExit(f"LICENCE NOT ALLOWED: {lic!r}")
    artist = (m.get("artist") or "").strip()
    desc = m.get("desc") or ""
    lic_pt = LIC_PT.get(lic, lic)
    phil = re.search(r"ID#:\s*(\d+)", desc)
    low = artist.lower()
    if "annotation by" in low and "cdc" in low:
        return "CDC/Dr. Daniel P. Perl, anotação de Mikael Häggström — Wikimedia Commons, CC0"
    if lic == "Public domain" and (
        "cdc" in low or "us gov" in low or "dpdx" in low or artist in ("", "None", "Unknown authorUnknown author")
    ):
        a = re.sub(r"^(Photo Credit:\s*)?(Content Providers?\(s\):\s*)?", "", artist).strip()
        if a in ("", "None", "US gov", "Unknown authorUnknown author"):
            a = "CDC"
        a = a.replace("CDC/ ", "CDC/")
        if not a.startswith("CDC"):
            a = "CDC/" + a
        return f"{a} — Public Health Image Library{' #' + phil.group(1) if phil else ''}, domínio público"
    if "häggström" in low:
        artist = "Mikael Häggström, M.D."
    elif low.startswith("yale rosen") or low.startswith("y. rosen"):
        artist = "Yale Rosen, MD"
    elif "atlas of medical foreign bodies" in low:
        artist = "Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer)"
        c = re.search(r"contributed by\s+(Dr\.?\s*[A-Z][A-Za-z.\- ]+?)(?=\s*[-@,.(]|$)", desc)
        if c:
            artist += f"; foto: {c.group(1).strip()}"
    elif low.startswith("ed uthman"):
        artist = "Ed Uthman, MD"
    elif "nasimudeen" in low:
        artist = "Dr. Roshan Nasimudeen"
    elif low.startswith("no machine-readable"):
        artist = "KGH"
    elif "wellcome" in low:
        artist = "Wellcome Collection"
    elif "tsutsumi" in low:
        artist = "Yutaka Tsutsumi, M.D."
    elif low.startswith("cruz ar"):
        artist = "Cruz AR et al."
    elif "sb lucas" in low:
        artist = "SB Lucas / Wellcome Collection"
    elif "jitinder" in low:
        artist = "Jitinder P. Dubey (USDA)"
    if lic == "Public domain":
        return f"{artist} — Wikimedia Commons, domínio público"
    return f"{artist} — Wikimedia Commons, {lic_pt}"


def ts_str(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n") + "'"


def ts_list(items):
    return "[" + ", ".join(ts_str(x) for x in items) + "]"


def build(catalog_id, spec, header_comment, icon, color, path, facets, meta):
    ident = lambda s: re.sub(r"[^a-z0-9]", "_", s)
    known = {f[0] for group in facets.values() for f in group}
    titles = []
    for e in spec:
        for p in e["photos"]:
            titles.append(p[0])
    ensure_meta(meta, titles)
    asset_dir = os.path.join(ROOT, "src/assets/catalog", catalog_id)
    os.makedirs(asset_dir, exist_ok=True)
    os.makedirs(os.path.join("final", catalog_id), exist_ok=True)
    imports = []
    entries_ts = []
    used_assets = set()
    for e in spec:
        for facet in e["traits"] + e["sites"] + e["clinical"]:
            if facet not in known:
                raise SystemExit(f"{catalog_id}/{e['id']}: unknown facet {facet!r}")
        photo_lines = []
        for n, p in enumerate(e["photos"]):
            title, caption, stain = p[0], p[1], (p[2] if len(p) > 2 else None)
            m = meta[title]
            credit = credit_for(m)
            fname = f"{e['id']}-{n}.jpg"
            cache = os.path.join("final", catalog_id, fname)
            fetch_big(title, cache)
            dest = os.path.join(asset_dir, fname)
            if not os.path.exists(dest):
                write_asset(cache, dest, MAX_EDGE, 80)
            used_assets.add(fname)
            var = f"img_{ident(e['id'])}_{n}"
            imports.append(f"import {var} from '@/assets/catalog/{catalog_id}/{fname}'")
            fields = [f"src: {var}"]
            if n == 0:
                tname = f"{e['id']}-0-thumb.jpg"
                tdest = os.path.join(asset_dir, tname)
                if not os.path.exists(tdest):
                    write_asset(cache, tdest, THUMB_EDGE, 72)
                used_assets.add(tname)
                tvar = f"{var}_thumb"
                imports.append(f"import {tvar} from '@/assets/catalog/{catalog_id}/{tname}'")
                fields.append(f"thumb: {tvar}")
            fields.append(f"caption: {ts_str(caption)}")
            if stain:
                fields.append(f"stain: {ts_str(stain)}")
            fields.append(f"credit: {ts_str(credit)}")
            photo_lines.append("        { " + ", ".join(fields) + " },")
        lines = ["    {", f"      id: {ts_str(e['id'])},", f"      name: {ts_str(e['name'])},"]
        if e.get("aka"):
            lines.append(f"      aka: {ts_list(e['aka'])},")
        lines.append(f"      summary: {ts_str(e['summary'])},")
        if e.get("description"):
            lines.append(f"      description:\n        {ts_str(e['description'])},")
        lines.append(f"      traits: {ts_list(e['traits'])},")
        lines.append(f"      sites: {ts_list(e['sites'])},")
        lines.append(f"      clinical: {ts_list(e['clinical'])},")
        if photo_lines:
            lines.append("      photos: [")
            lines.extend(photo_lines)
            lines.append("      ],")
        else:
            lines.append("      photos: [],")
        lines.append("    },")
        entries_ts.append("\n".join(lines))
    # remove stale assets
    for f in os.listdir(asset_dir):
        if f not in used_assets:
            os.remove(os.path.join(asset_dir, f))
            print("removed stale asset", f)

    def facet_ts(group):
        return "\n".join(f"    {{ id: {ts_str(i)}, label: {ts_str(l)} }}," for i, l in group)

    out = [header_comment, "", f"import {{ {icon} }} from 'lucide-react'"]
    out.extend(imports)
    out.append("import type { Catalog } from '../types'")
    out.append("")
    out.append(f"export const {catalog_id}: Catalog = {{")
    out.append(f"  id: {ts_str(catalog_id)},")
    out.append(f"  path: {ts_str(path)},")
    out.append(f"  icon: {icon},")
    out.append(f"  color: {ts_str(color)},")
    for key in ("traits", "sites", "clinical"):
        if facets[key]:
            out.append(f"  {key}: [")
            out.append(facet_ts(facets[key]))
            out.append("  ],")
        else:
            out.append(f"  {key}: [],")
    out.append("  entries: [")
    out.extend(entries_ts)
    out.append("  ],")
    out.append("}")
    out.append("")
    dest = os.path.join(ROOT, "src/tools/catalog/content", f"{catalog_id}.ts")
    open(dest, "w", encoding="utf-8", newline="\n").write("\n".join(out))
    print(f"wrote {dest}: {len(spec)} entries, {len(imports)} photos")


if __name__ == "__main__":
    meta = load_meta()
    build("bugs", spec_bugs.ENTRIES, spec_bugs.HEADER, "Bug", "#0f9d6e", "/tools/bichos", spec_bugs.FACETS, meta)
    build("foreign", spec_foreign.ENTRIES, spec_foreign.HEADER, "Gem", "#c2410c", "/tools/corpos-estranhos", spec_foreign.FACETS, meta)

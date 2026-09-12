"""Fetch compact metadata for every title in a list file; merge into meta.json.

  python meta.py candidates.txt [desc_chars]
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
API = "https://commons.wikimedia.org/w/api.php"
UA = "PatholyticsCatalogResearch/1.0 (guimota1@gmail.com)"
META = "meta.json"


def call(params):
    params = dict(params, format="json")
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(API, data=data, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))


def strip_html(s):
    s = re.sub(r"<[^>]+>", "", s or "")
    return " ".join(s.split())


def main(list_file, desc_chars=220):
    titles = [l.strip() for l in open(list_file, encoding="utf-8") if l.strip() and not l.startswith("#")]
    meta = json.load(open(META, encoding="utf-8")) if os.path.exists(META) else {}
    for i in range(0, len(titles), 25):
        chunk = titles[i:i + 25]
        data = call({
            "action": "query", "titles": "|".join(chunk), "prop": "imageinfo",
            "iiprop": "url|size|extmetadata|mime",
            "iiextmetadatafilter": "LicenseShortName|Artist|Credit|ImageDescription|Attribution",
        })
        norm = {}
        for n in data.get("query", {}).get("normalized", []):
            norm[n["to"]] = n["from"]
        for page in data.get("query", {}).get("pages", {}).values():
            title = page.get("title")
            if "missing" in page or not page.get("imageinfo"):
                print("MISSING", title)
                continue
            ii = page["imageinfo"][0]
            md = {k: strip_html(v.get("value")) for k, v in ii.get("extmetadata", {}).items()}
            entry = {
                "license": md.get("LicenseShortName"),
                "artist": md.get("Artist"),
                "credit": md.get("Credit"),
                "attribution": md.get("Attribution"),
                "desc": md.get("ImageDescription"),
                "w": ii.get("width"), "h": ii.get("height"),
                "url": (ii.get("url") or "").split("?")[0],
            }
            meta[title] = entry
    json.dump(meta, open(META, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for t in titles:
        e = meta.get(t)
        if not e:
            continue
        print(f"{t}\n   {e['license']} | {e['artist']} | {e['w']}x{e['h']}\n   {(e['desc'] or '')[:desc_chars]}")


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 220)

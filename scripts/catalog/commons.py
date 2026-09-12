"""Wikimedia Commons helper: search files, read license/credit, download originals.

  python commons.py search "query" [limit]
  python commons.py info "File:Name.jpg" ["File:Other.jpg" ...]
  python commons.py get "File:Name.jpg" out_path [max_edge]
  python commons.py cat "Category:Name"
"""
import json
import os
import sys
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

API = "https://commons.wikimedia.org/w/api.php"
UA = "PatholyticsCatalogResearch/1.0 (guimota1@gmail.com)"


def call(params):
    params = dict(params, format="json")
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def strip_html(s):
    import re
    s = re.sub(r"<[^>]+>", "", s or "")
    return " ".join(s.split())


def search(query, limit=20):
    data = call({"action": "query", "list": "search", "srsearch": query, "srnamespace": 6, "srlimit": limit})
    for hit in data.get("query", {}).get("search", []):
        if hit["title"].lower().endswith((".pdf", ".djvu", ".ogv", ".webm")):
            continue
        print(hit["title"])
        snippet = strip_html(hit.get("snippet", ""))
        if snippet:
            print("   ", snippet[:160])


def info(titles):
    data = call({
        "action": "query",
        "titles": "|".join(titles),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|mime",
        "iiextmetadatafilter": "LicenseShortName|License|Artist|Credit|ImageDescription|Attribution|UsageTerms|Copyrighted",
    })
    for page in data.get("query", {}).get("pages", {}).values():
        print("==", page.get("title"))
        if "missing" in page:
            print("   MISSING")
            continue
        for ii in page.get("imageinfo", []):
            md = {k: strip_html(v.get("value")) for k, v in ii.get("extmetadata", {}).items()}
            print("   license:", md.get("LicenseShortName"), "|", md.get("License"), "| copyrighted:", md.get("Copyrighted"))
            print("   artist:", md.get("Artist"))
            print("   credit:", md.get("Credit"))
            print("   attribution:", md.get("Attribution"))
            print("   size:", ii.get("width"), "x", ii.get("height"), ii.get("mime"))
            print("   url:", ii.get("url"))
            print("   desc:", (md.get("ImageDescription") or "")[:700])


def get(title, out, max_edge=1600):
    data = call({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url", "iiurlwidth": max_edge})
    for page in data.get("query", {}).get("pages", {}).values():
        for ii in page.get("imageinfo", []):
            url = ii.get("thumburl") or ii.get("url")
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r, open(out, "wb") as f:
                f.write(r.read())
            print("saved", out, os.path.getsize(out))


def cat(name, limit=200):
    data = call({"action": "query", "list": "categorymembers", "cmtitle": name, "cmlimit": limit, "cmtype": "file|subcat"})
    for m in data.get("query", {}).get("categorymembers", []):
        print(m["title"])


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "search":
        search(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 20)
    elif cmd == "info":
        info(sys.argv[2:])
    elif cmd == "get":
        get(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 1600)
    elif cmd == "cat":
        cat(sys.argv[2])

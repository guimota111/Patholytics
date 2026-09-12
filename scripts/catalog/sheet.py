"""Download Commons thumbnails for a list of titles and compose labelled contact sheets.

  python sheet.py list.txt prefix [per_sheet=6] [thumb_width=900]

Writes dl/<n>-<slug>.jpg (cached) and sheets/<prefix>-<k>.jpg; prints index -> title.
"""
import hashlib
import json
import os
import re
import sys
import urllib.parse
import urllib.request

from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
API = "https://commons.wikimedia.org/w/api.php"
UA = "PatholyticsCatalogResearch/1.0 (guimota1@gmail.com)"


def call(params):
    params = dict(params, format="json")
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(API, data=data, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))


def slug(title):
    s = re.sub(r"^File:", "", title)
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()[:60]
    return s + "-" + hashlib.md5(title.encode()).hexdigest()[:6]


def fetch(title, width):
    os.makedirs("dl", exist_ok=True)
    out = os.path.join("dl", slug(title) + ".jpg")
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return out
    data = call({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url", "iiurlwidth": width})
    for page in data.get("query", {}).get("pages", {}).values():
        for ii in page.get("imageinfo", []):
            url = ii.get("thumburl") or ii.get("url")
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            raw = urllib.request.urlopen(req, timeout=180).read()
            tmp = out + ".tmp"
            open(tmp, "wb").write(raw)
            try:
                im = Image.open(tmp).convert("RGB")
                im.save(out, "JPEG", quality=88)
            finally:
                os.remove(tmp)
            return out
    return None


def main(list_file, prefix, per_sheet=6, width=900):
    titles = [l.strip() for l in open(list_file, encoding="utf-8") if l.strip() and not l.startswith("#")]
    os.makedirs("sheets", exist_ok=True)
    try:
        font = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font = ImageFont.load_default()
    cell_w, cell_h, label_h = 700, 520, 34
    cols = 2
    rows = (per_sheet + cols - 1) // cols
    sheet_index = 0
    for start in range(0, len(titles), per_sheet):
        batch = titles[start:start + per_sheet]
        sheet = Image.new("RGB", (cols * cell_w, rows * (cell_h + label_h)), "white")
        draw = ImageDraw.Draw(sheet)
        for i, title in enumerate(batch):
            n = start + i
            path = None
            try:
                path = fetch(title, width)
            except Exception as e:
                print("FAILED", title, e)
            x = (i % cols) * cell_w
            y = (i // cols) * (cell_h + label_h)
            draw.rectangle([x, y, x + cell_w, y + label_h], fill="#222")
            draw.text((x + 8, y + 5), f"#{n} {re.sub(r'^File:', '', title)[:60]}", fill="white", font=font)
            if path:
                im = Image.open(path)
                im.thumbnail((cell_w - 8, cell_h - 8))
                sheet.paste(im, (x + 4 + (cell_w - 8 - im.width) // 2, y + label_h + 4 + (cell_h - 8 - im.height) // 2))
            print(f"#{n} {title}")
        out = os.path.join("sheets", f"{prefix}-{sheet_index}.jpg")
        sheet.save(out, "JPEG", quality=80)
        print("SHEET", out)
        sheet_index += 1


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 6, int(sys.argv[4]) if len(sys.argv) > 4 else 900)

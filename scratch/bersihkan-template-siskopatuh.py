"""
Membuat template Siskopatuh KOSONG dari file template jamaah yang sudah terisi.
    python scratch/bersihkan-template-siskopatuh.py "<template jamaah terisi>.xlsm"

File contoh dari kantor berisi NIK, alamat, dan paspor jamaah asli. Yang boleh
masuk repo hanya kerangkanya: header, gaya kolom, dropdown (data validation),
daftar Provinsi/Kabupaten, Provider Visa, Asuransi, dan makro VBA-nya.

Yang dibuang:
  * semua baris data di Sheet1 (baris 2 dipertahankan TANPA nilai, hanya gaya
    per kolomnya -- lib/manifest/siskopatuh.ts meniru gaya itu untuk setiap
    baris jamaah yang ditulis)
  * string yang hanya dipakai baris data, dari sharedStrings.xml. Tanpa ini
    nama & NIK jamaah tetap tersimpan di dalam file walau selnya sudah kosong.
  * nama pembuat file di docProps/core.xml

Hasil: lib/manifest/templates/siskopatuh.xlsm
"""

import re
import sys
import zipfile
from xml.sax.saxutils import escape

SRC = sys.argv[1]
DST = "lib/manifest/templates/siskopatuh.xlsm"

zin = zipfile.ZipFile(SRC)
files = {n: zin.read(n) for n in zin.namelist() if not n.endswith("/")}

sheet1 = files["xl/worksheets/sheet1.xml"].decode("utf-8")

# Baris 1 utuh, baris 2 tanpa nilai, sisanya dibuang.
rows = re.search(r"<sheetData>(.*)</sheetData>", sheet1, re.S).group(1)
row1 = re.search(r'<row r="1".*?</row>', rows, re.S).group(0)
row2 = re.search(r'<row r="2".*?</row>', rows, re.S).group(0)
row2 = re.sub(r'<c r="([A-Z]+2)"( s="\d+")?[^>]*?(?:/>|>.*?</c>)', lambda m: f'<c r="{m.group(1)}"{m.group(2) or ""}/>', row2, flags=re.S)
sheet1 = sheet1.replace(rows, row1 + row2)
sheet1 = re.sub(r'<dimension ref="[^"]*"/>', '<dimension ref="A1:AF2"/>', sheet1)
sheet1 = re.sub(r'<selection [^>]*/>', '<selection activeCell="A2" sqref="A2"/>', sheet1)
files["xl/worksheets/sheet1.xml"] = sheet1.encode("utf-8")

table = files["xl/tables/table1.xml"].decode("utf-8")
table = re.sub(r'ref="A1:AF\d+"', 'ref="A1:AF2"', table)
table = re.sub(r"<sortState.*?</sortState>", "", table, flags=re.S)
files["xl/tables/table1.xml"] = table.encode("utf-8")

# sharedStrings: simpan hanya yang masih dirujuk, lalu nomori ulang.
sst = files["xl/sharedStrings.xml"].decode("utf-8")
items = re.findall(r"<si>.*?</si>", sst, re.S)
sheet_names = [n for n in files if n.startswith("xl/worksheets/sheet")]
used = set()
for name in sheet_names:
    xml = files[name].decode("utf-8")
    for m in re.finditer(r'<c [^>]*t="s"[^>]*>\s*<v>(\d+)</v>', xml):
        used.add(int(m.group(1)))
order = sorted(used)
remap = {old: new for new, old in enumerate(order)}
for name in sheet_names:
    xml = files[name].decode("utf-8")
    xml = re.sub(
        r'(<c [^>]*t="s"[^>]*>\s*<v>)(\d+)(</v>)',
        lambda m: f"{m.group(1)}{remap[int(m.group(2))]}{m.group(3)}",
        xml,
    )
    files[name] = xml.encode("utf-8")
sst_open = re.sub(r'\s(count|uniqueCount)="\d+"', "", re.search(r"<sst[^>]*>", sst).group(0))
sst_open = sst_open[:-1] + f' count="{len(order)}" uniqueCount="{len(order)}">'
prefix = sst[: sst.index("<sst")]
files["xl/sharedStrings.xml"] = (prefix + sst_open + "".join(items[i] for i in order) + "</sst>").encode("utf-8")

core = files["docProps/core.xml"].decode("utf-8")
core = re.sub(r"<dc:creator>.*?</dc:creator>", f"<dc:creator>{escape('El Massa Tour & Travel')}</dc:creator>", core)
core = re.sub(r"<cp:lastModifiedBy>.*?</cp:lastModifiedBy>", "<cp:lastModifiedBy>El Massa Web</cp:lastModifiedBy>", core)
files["docProps/core.xml"] = core.encode("utf-8")

with zipfile.ZipFile(DST, "w", zipfile.ZIP_DEFLATED) as zout:
    for name in zin.namelist():
        if name.endswith("/"):
            continue
        zout.writestr(name, files[name])

print(f"sharedStrings: {len(items)} -> {len(order)}")
print(f"tersimpan: {DST}")

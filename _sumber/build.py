import os, html
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
os.makedirs(OUT + "/assets", exist_ok=True)
E = html.escape

I = {
 "wa": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.2A8.5 8.5 0 1 1 20 11.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>',
 "chev": '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
 "menu": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
 "close": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
 "plus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
 "check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" stroke="none"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
}

LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#15284A"/><path d="M8 30c4-3 8-3 12 0s8 3 12 0 6-2 8-1" stroke="#1E9DB0" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M8 37c4-3 8-3 12 0s8 3 12 0 6-2 8-1" stroke="#B68A4A" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M17 25V11h8a5 5 0 0 1 0 10h-8" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'

DIVS = [
 ("Edu Wisata Kolam Renang", "edu-wisata.html", "#1E9DB0", "Kolam renang keluarga, les renang, dan tempat acara.", [
   ("Tiket & langganan", "edu-wisata.html#tiket"), ("Les renang", "edu-wisata.html#les"), ("Paket ulang tahun", "ulang-tahun.html"),
   ("Arisan & keluarga", "edu-wisata.html#arisan"), ("Komunitas & perusahaan", "edu-wisata.html#komunitas"),
   ("Sekolah & edukasi", "edu-wisata.html#sekolah"), ("Program musiman", "edu-wisata.html#musiman")]),
 ("HD Star Course", "hd-star.html", "#B68A4A", "Les bahasa Inggris untuk anak dan remaja.", [
   ("Kelas sesuai usia", "hd-star.html#kelas"), ("Program khusus", "hd-star.html#khusus"), ("Untuk sekolah", "hd-star.html#sekolah"), ("Cara daftar", "hd-star.html#daftar")]),
 ("Globe.Net", "globe-net.html", "#3B6FB6", "Internet rumah dan usaha di Sukabumi.", [
   ("Internet rumah", "globe-net.html#rumah"), ("Usaha & kantor", "globe-net.html#usaha"), ("Cara pasang", "globe-net.html#pasang")]),
 ("Hydro Pilarmas", "hydro.html", "#2FA58A", "Air minum galon, diantar ke tempat Anda.", [
   ("Pesan antar", "hydro.html#layanan"), ("Langganan mingguan", "hydro.html#layanan"), ("Harga agen & warung", "hydro.html#layanan")]),
 ("Global Hospitality", "global-hospitality.html", "#7A5C9E", "Pelatihan perhotelan dan penempatan kerja.", [
   ("Program pelatihan", "global-hospitality.html#program"), ("Alur pendaftaran", "global-hospitality.html#alur"), ("Syarat peserta", "global-hospitality.html#syarat")]),
]

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">'


def tetes(cls="", pose="wave", label=None):
    """Si Tetes: maskot tetes air Pilarmas (karakter orisinal sementara)."""
    aria = f'role="img" aria-label="{E(label)}"' if label else 'aria-hidden="true"'
    hat = '<path d="M46 14 60-18 74 14Z" fill="#F0883E"/><path d="M50 6 70 6M54-2 66-2" stroke="#FFD45A" stroke-width="4"/><circle cx="60" cy="-20" r="6" fill="#FFD45A"/>' if pose == "party" else ""
    ring = '<g><ellipse cx="60" cy="124" rx="50" ry="15" fill="none" stroke="#fff" stroke-width="11"/><ellipse cx="60" cy="124" rx="50" ry="15" fill="none" stroke="#E3584A" stroke-width="11" stroke-dasharray="18 18"/></g>' if pose == "ring" else ""
    arm_r = '<g class="arm-wave"><path d="M96 96 112 74" stroke="#2B9FE0" stroke-width="8" stroke-linecap="round"/><circle cx="113" cy="71" r="7" fill="#7FD3F7" stroke="#1673AE" stroke-width="2.5"/></g>' if pose in ("wave", "ring") else '<path d="M96 98 110 108" stroke="#2B9FE0" stroke-width="8" stroke-linecap="round"/><circle cx="112" cy="110" r="7" fill="#7FD3F7" stroke="#1673AE" stroke-width="2.5"/>'
    return f'''<svg class="tetes {cls}" viewBox="0 -26 124 172" {aria}>
<defs><linearGradient id="tg{cls.replace(' ','')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A6E4FB"/><stop offset="1" stop-color="#2B9FE0"/></linearGradient></defs>
<ellipse cx="60" cy="134" rx="34" ry="6" fill="#1673AE" opacity=".16"/>
<path d="M24 98 10 108" stroke="#2B9FE0" stroke-width="8" stroke-linecap="round"/><circle cx="9" cy="110" r="7" fill="#7FD3F7" stroke="#1673AE" stroke-width="2.5"/>
<path d="M60 10C60 10 20 58 20 90a40 40 0 0 0 80 0C100 58 60 10 60 10Z" fill="url(#tg{cls.replace(' ','')})" stroke="#1673AE" stroke-width="3"/>
<ellipse cx="40" cy="70" rx="7" ry="14" fill="#fff" opacity=".55" transform="rotate(25 40 70)"/>
<path d="M28 60Q60 48 92 60" stroke="#F0883E" stroke-width="4" fill="none"/>
<circle cx="49" cy="59" r="9" fill="#FFE9A8" stroke="#F0883E" stroke-width="3.5"/><circle cx="71" cy="59" r="9" fill="#FFE9A8" stroke="#F0883E" stroke-width="3.5"/>
<g class="blink"><ellipse cx="48" cy="86" rx="7.5" ry="9.5" fill="#fff"/><ellipse cx="72" cy="86" rx="7.5" ry="9.5" fill="#fff"/><circle cx="49" cy="88" r="4.6" fill="#15284A"/><circle cx="73" cy="88" r="4.6" fill="#15284A"/><circle cx="50.6" cy="86.2" r="1.6" fill="#fff"/><circle cx="74.6" cy="86.2" r="1.6" fill="#fff"/></g>
<ellipse cx="37" cy="101" rx="6" ry="3.6" fill="#FF8F80" opacity=".65"/><ellipse cx="83" cy="101" rx="6" ry="3.6" fill="#FF8F80" opacity=".65"/>
<path d="M50 101Q60 113 70 101Z" fill="#15284A"/><path d="M54 106Q60 111 66 106" fill="#FF8F80"/>
{arm_r}{hat}{ring}
</svg>'''

CHARS = {"bae": "Bae", "bungjin": "Bung Jin", "halaf": "Halaf", "kuya": "Kuya", "monpil": "Monpil & Ubbie", "tanbo": "Tanbo"}
CSZ = {"bae": (411, 520), "bungjin": (347, 520), "halaf": (390, 520), "kuya": (301, 520), "monpil": (508, 520), "tanbo": (358, 520)}
def char(key, cls="", alt=True, id_=None):
    w, h = CSZ[key]
    a = f'alt="{E(CHARS[key])}, karakter Pilarmas"' if alt else 'alt=""'
    i = f' id="{id_}"' if id_ else ""
    return f'<img class="char {cls}"{i} src="assets/char-{key}.webp" {a} width="{w}" height="{h}" loading="lazy">'

def head(title, desc):
    return f'''<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
{FONTS}
<link rel="icon" href="assets/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png"><meta name="theme-color" content="#1673AE"><link rel="stylesheet" href="assets/style.css">
</head>
<body>
<a class="skip" href="#isi">Langsung ke isi</a>'''

PAGE_WA = {"hd-star.html": ("hdstar", "HD Star", "Halo admin HD Star, saya mau tanya kelas bahasa Inggris."),
           "globe-net.html": ("globenet", "Globe.Net", "Halo admin Globe.Net, saya mau tanya paket internet."),
           "hydro.html": ("hydro", "Hydro", "Halo admin Hydro Pilarmas, saya mau pesan air galon."),
           "global-hospitality.html": ("gh", "Global Hospitality", "Halo admin Global Hospitality, saya mau konsultasi program."),
           "ulang-tahun.html": ("acara", "acara", "Halo admin Pilarmas, saya mau tanya paket ulang tahun.")}

def topbar(active):
    wk, wn, wm = PAGE_WA.get(active, ("kolam", "Pilarmas", "Halo admin Pilarmas, saya mau tanya."))
    wlabel = "Chat admin" if wk == "kolam" else f"Chat admin {wn}"
    cols = "".join(f'''<div class="col" style="--i:{i}"><h3><a href="{href}"><span class="dot" style="background:{c}"></span>{E(n)}</a></h3><p>{E(d)}</p><ul>{"".join(f'<li><a href="{h}">{E(t)}</a></li>' for t, h in progs)}</ul></div>''' for i, (n, href, c, d, progs) in enumerate(DIVS))
    drawer_items = "".join(f'''<details style="--i:{i+1}"><summary>{E(n)}{I["plus"]}</summary><ul><li><a href="{href}">Semua program {E(n.split(" ")[0] if n.startswith("Edu") else n)}</a></li>{"".join(f'<li><a href="{h}">{E(t)}</a></li>' for t, h in progs)}</ul></details>''' for i, (n, href, c, d, progs) in enumerate(DIVS))
    def nl(label, href):
        cur = ' aria-current="page"' if active == href else ""
        return f'<a href="{href}"{cur}>{E(label)}</a>'
    return f'''<header class="top">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="Pilarmas Kolam Renang Keluarga, ke beranda"><img src="assets/logo-pilarmas-sm.png" alt="" width="130" height="67"></a>
    <nav class="nav" aria-label="Menu utama">
      {nl("Beranda", "index.html")}
      <button id="progBtn" aria-expanded="false" aria-controls="mega">Program {I["chev"]}</button>
      {nl("Ulang tahun", "ulang-tahun.html")}
      {nl("Les renang", "edu-wisata.html#les")}
      <a href="#kontak">Kontak</a>
    </nav>
    <a class="btn wa" data-wa="{wk}" data-msg="{E(wm)}" href="#kontak">{I["wa"]}{E(wlabel if wk == "kolam" else "Chat admin")}</a>
    <button class="burger" id="burger" aria-expanded="false" aria-controls="drawer" aria-label="Buka menu">{I["menu"]}</button>
  </div>
  <div class="mega" id="mega"><div class="wrap">{cols}</div></div>
</header>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="row"><a class="logo drawer-logo" href="index.html" aria-label="Pilarmas, ke beranda"><img src="assets/logo-pilarmas-sm.png" alt="" width="130" height="67"></a><button class="close" id="drawerClose" aria-label="Tutup menu">{I["close"]}</button></div>
  <a class="item" href="index.html" style="--i:0">Beranda</a>
  {drawer_items}
  <a class="item" href="ulang-tahun.html" style="--i:6">Paket ulang tahun</a>
  <a class="btn brass" data-wa="{wk}" data-msg="{E(wm)}" href="#kontak">{I["wa"]}{E(wlabel if wk != "kolam" else "Chat admin Pilarmas")}</a>
</div>'''

def foot():
    btns = [("kolam", "Kolam renang & tiket"), ("les", "Les renang"), ("acara", "Ulang tahun & acara"), ("hdstar", "HD Star Course"), ("globenet", "Globe.Net"), ("hydro", "Hydro Pilarmas"), ("gh", "Global Hospitality")]
    return f'''<footer class="foot" id="kontak">
  {char("bae", "foot-char")}
  <div class="rope"></div>
  <div class="wrap">
    <div><h2>Tanya langsung ke admin</h2><p>Pilih kebutuhan Anda. Tombol membuka WhatsApp admin divisi yang tepat.</p></div>
    <div class="wa-grid">{"".join(f'<a data-wa="{k}" href="#kontak">{I["wa"]}{E(t)}</a>' for k, t in btns)}</div>
    <nav aria-label="Semua halaman"><a href="index.html">Beranda</a>{"".join(f'<a href="{h}">{E(n)}</a>' for n, h, *_ in DIVS)}<a href="ulang-tahun.html">Paket ulang tahun</a></nav>
    <small>Kolam Renang Pilar Mas, Baros, Kota Sukabumi, Jawa Barat 43161. Senin–Kamis 09.00–17.00, Sabtu–Minggu 08.00–17.00, Jumat libur. <a href="https://www.google.com/maps/search/?api=1&query=Kolam+Renang+Pilar+Mas&query_place_id=ChIJv0X-8mlHaC4R28F2sM2gNaU" style="color:#FFE29A">Buka di Google Maps</a>. Harga paket di situs ini masih draf dan dapat berubah.</small>
  </div>
</footer>
{LIGHTBOX}
<script src="assets/app.js"></script>
</body>
</html>'''

def pagehero(crumb, title, lead, cta=None, navy=False, mascot=False):
    c = f'<div class="cta">{cta}</div>' if cta else ""
    m = f'<img class="ph-mascot{" is-char" if "char-" in mascot else ""}{" is-brand" if mascot in ("logo-hydro.webp", "logo-gh.webp", "logo-hdstar.webp", "logo-globenet.webp") else ""}" src="assets/{mascot}" alt="">' if mascot else ""
    return f'''<section class="pagehero{' navy' if navy else ''}{' has-mascot' if mascot else ''}" id="isi">
  {m}<div class="wrap">
    <p class="crumb"><a href="index.html">Beranda</a> / {E(crumb)}</p>
    <h1>{E(title)}</h1>
    <p class="lead">{E(lead)}</p>
    {c}
  </div>
  <svg class="wave" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 22c120-18 240-18 360 0s240 18 360 0 240-18 360 0 240 18 360 0v18H0z"/></svg>
</section>'''

def subnav(items):
    return f'<nav class="subnav" aria-label="Bagian halaman"><div class="wrap"><span class="pill" aria-hidden="true"></span>{"".join(f"<a href=\"#{a}\">{E(l)}</a>" for l, a in items)}</div></nav>'

def card(title, desc, price=None, note=None, tag=None, go=None, href=None, wa=None, msg=None, big=False, bullets=None, img=None, alt=""):
    out = f'<article class="card{" big" if big else ""}{" has-ph" if img else ""}">'
    if img: out += f'<img class="ph" src="assets/foto-{img}.webp" alt="{E(alt)}" loading="lazy" width="1200" height="900">'
    if tag: out += f'<span class="tag">{E(tag)}</span>'
    out += f'<h3>{E(title)}</h3><p>{E(desc)}</p>'
    if bullets: out += "<ul>" + "".join(f"<li>{E(b)}</li>" for b in bullets) + "</ul>"
    if price: out += f'<p class="price">{E(price)}</p>'
    if note: out += f'<p class="note">{E(note)}</p>'
    if go:
        if wa: out += f'<a class="go" data-wa="{wa}" data-msg="{E(msg or ("Halo, saya mau tanya " + title))}" href="#kontak">{E(go)}</a>'
        else: out += f'<a class="go" href="{href}">{E(go)}</a>'
    return out + "</article>"

def section(sid, title, lead, cards, extra="", alt=False, ch=None):
    bg = ' style="background:var(--water-3)"' if alt else ""
    l = f'<p class="lead">{E(lead)}</p>' if lead else ""
    cc = char(ch, "sec-char") if ch else ""
    return f'<section class="band" id="{sid}"{bg}><div class="wrap"><div class="sec-head">{cc}<h2>{E(title)}</h2>{l}</div><div class="cards">{"".join(cards)}</div>{extra}</div></section>'

def perks(items):
    return '<div class="perks">' + "".join(f'<span>{I["check"]}{E(t)}</span>' for t in items) + "</div>"

def steps(sid, title, items, alt=False):
    bg = ' style="background:var(--water-3)"' if alt else ""
    return f'<section class="band" id="{sid}"{bg}><div class="wrap"><div class="sec-head"><h2>{E(title)}</h2></div><ol class="steps">{"".join(f"<li><h3>{E(t)}</h3><p>{E(d)}</p></li>" for t, d in items)}</ol></div></section>'

def faq(title, qas, sid="faq"):
    return f'<section class="band" id="{sid}"><div class="wrap"><div class="sec-head"><h2>{E(title)}</h2></div><div class="faq">{"".join(f"<details><summary>{E(q)}{I['plus']}</summary><p class=\"ans\">{E(a)}</p></details>" for q, a in qas)}</div></div></section>'

def promo(title, text, label, href=None, wa=None):
    btn = f'<a class="btn" style="background:var(--deep);color:#fff" href="{href}">{E(label)}</a>' if href else f'<a class="btn" style="background:var(--deep);color:#fff" data-wa="{wa}" href="#kontak">{I["wa"]}{E(label)}</a>'
    return f'<section class="promo"><div class="wrap"><div><h2>{E(title)}</h2><p>{E(text)}</p></div>{btn}</div></section>'

def write(name, body):
    open(os.path.join(OUT, name), "w").write(body)

SCENE = '''<svg class="scene" viewBox="0 0 640 440" role="img" aria-label="Ilustrasi kolam renang Pilarmas dengan pegunungan Sukabumi di belakangnya">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDEEF3"/><stop offset="1" stop-color="#F4FBFC"/></linearGradient>
<linearGradient id="pool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FC3D1"/><stop offset="1" stop-color="#157F91"/></linearGradient>
<pattern id="tile" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.2"/></pattern>
<pattern id="rope" width="18" height="14" patternUnits="userSpaceOnUse"><ellipse cx="9" cy="7" rx="8" ry="5.5" fill="#B68A4A"/><ellipse cx="7" cy="5.5" rx="3" ry="1.6" fill="#fff" opacity=".45"/></pattern>
<clipPath id="poolClip"><path d="M0 330H640V440H0Z"/></clipPath>
</defs>
<rect width="640" height="440" rx="28" fill="url(#sky)"/>
<circle cx="508" cy="92" r="44" fill="#F5C452"/><circle cx="508" cy="92" r="64" fill="#F5C452" opacity=".18"/>
<path d="M0 262 140 160l88 50 104-112 104 96 86-52 118 92v76H0Z" fill="#9CC0D3"/>
<path d="M0 292 108 232l90 34 106-96 58 36 62-46 102 86 114 22v52H0Z" fill="#2F5878"/>
<path d="M300 170l14 10 12-6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<path d="M0 308q40-26 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0v26H0Z" fill="#3C8C6E"/>
<rect y="318" width="640" height="18" fill="#E7DAC2"/><rect y="334" width="640" height="4" fill="#CDBD9F"/>
<g clip-path="url(#poolClip)">
<rect y="338" width="640" height="102" fill="url(#pool)"/><rect y="338" width="640" height="102" fill="url(#tile)"/>
<g class="ripple" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round">
<path d="M0 356q30-8 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0"/>
<path d="M-40 412q30-8 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0" stroke-opacity=".35"/>
</g>
<rect y="378" width="640" height="14" fill="url(#rope)"/><rect y="384" width="640" height="2" fill="#15284A" opacity=".5"/>
<g class="float"><circle cx="430" cy="412" r="25" fill="none" stroke="#fff" stroke-width="15"/><circle cx="430" cy="412" r="25" fill="none" stroke="#E3584A" stroke-width="15" stroke-dasharray="19.6 19.6"/><ellipse cx="430" cy="430" rx="34" ry="5" fill="#0F5F6D" opacity=".35"/></g>
</g>
<rect x="56" y="300" width="14" height="38" rx="3" fill="#C7D3DC"/><rect x="82" y="300" width="14" height="38" rx="3" fill="#C7D3DC"/><path d="M63 300v-14a13 13 0 0 1 26 0v14" stroke="#C7D3DC" stroke-width="6" fill="none"/>
</svg>'''


# ---------- Galeri kegiatan & media sosial per divisi ----------
SOCIAL = {
 "kolam": [("instagram", "Instagram", "@kolam_pilarmas", "https://www.instagram.com/kolam_pilarmas/"),
           ("facebook", "Facebook", "Wisata Kolam Renang Pilar Mas", "https://www.facebook.com/KolamPilarMas/")],
 "hdstar": [], "globenet": [], "hydro": [], "gh": [],
}
SICON = {
 "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
 "facebook": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z"/></svg>',
 "tiktok": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.8 2.4 4.5 5 4.7"/></svg>',
 "youtube": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></svg>',
}

def social_row(key, label="Ikuti kegiatan terbaru kami"):
    acc = SOCIAL.get(key) or []
    if not acc:
        return ""
    btn = "".join('<a class="soc soc-%s" href="%s" target="_blank" rel="noopener">%s<span><b>%s</b><small>%s</small></span></a>' % (k, E(u), SICON[k], E(n), E(h)) for k, n, h, u in acc)
    return '<div class="socials"><p>%s</p><div class="soc-list">%s</div></div>' % (E(label), btn)

def kegiatan(sid, title, lead, items, key, alt=False, extra=""):
    figs = ""
    for img, cap, when, alt_, c in items:
        w = "<span>%s</span>" % E(when) if when else ""
        figs += ('<figure class="k-%s"><button type="button" data-lb="assets/%s.webp" data-cap="%s" aria-label="Perbesar foto: %s">'
                 '<img src="assets/%s.webp" alt="%s" loading="lazy"></button><figcaption><b>%s</b>%s</figcaption></figure>') % (c, img, E(cap), E(cap), img, E(alt_), E(cap), w)
    bg = ' style="background:var(--water-3)"' if alt else ""
    return ('<section class="band kegiatan" id="%s"%s><div class="wrap">'
            '<div class="sec-head"><h2>%s</h2><p class="lead">%s</p></div>'
            '<div class="k-grid">%s%s</div>%s</div></section>') % (sid, bg, E(title), E(lead), figs, extra, social_row(key))

LIGHTBOX = '<dialog class="lb" id="lb" aria-label="Foto kegiatan"><button class="lb-x" type="button" aria-label="Tutup foto">&times;</button><img alt=""><p></p></dialog>'


# ======================= BERANDA =======================
TILES = [
 ("Les renang anak", "Kelas per level dari usia 3 tahun, ada sertifikat naik level.", "Mulai Rp 250.000/bulan", "Edu Wisata", "edu-wisata.html#les", "anak"),
 ("Paket ulang tahun", "Pesta di kolam untuk 20 anak, sudah termasuk dekor, snack, dan MC.", "Mulai Rp 40.000/anak", "Edu Wisata", "ulang-tahun.html", "anak keluarga"),
 ("Tiket renang harian", "Kolam dewasa dan kolam anak, buka Sabtu sampai Kamis.", "Rp 20.000, dewasa dan anak", "Edu Wisata", "edu-wisata.html#tiket", "keluarga anak"),
 ("Kartu langganan 10x", "Bayar 8 kali, berenang 10 kali. Berlaku 3 bulan.", "Hemat 2 tiket", "Edu Wisata", "edu-wisata.html#tiket", "keluarga"),
 ("Arisan santai", "Gazebo 3 jam di hari kerja, mama ngobrol, anak berenang.", "Rp 45.000/orang", "Edu Wisata", "edu-wisata.html#arisan", "keluarga komunitas"),
 ("Kumpul keluarga besar", "Area semi-privat, prasmanan, dan renang untuk semua.", "Mulai Rp 75.000/orang", "Edu Wisata", "edu-wisata.html#arisan", "keluarga"),
 ("Family gathering kantor", "Lomba air, doorprize, dan prasmanan untuk karyawan dan keluarganya.", "Mulai Rp 75.000/orang", "Edu Wisata", "edu-wisata.html#komunitas", "komunitas"),
 ("Edu Trip sekolah", "Tiga pos belajar: renang, air bersih, dan bahasa Inggris.", "Mulai Rp 45.000/siswa", "Edu Wisata", "edu-wisata.html#sekolah", "sekolah anak"),
 ("Renang PJOK sekolah", "Pelajaran renang untuk SD dan SMP, kontrak per semester.", "Mulai Rp 15.000/siswa", "Edu Wisata", "edu-wisata.html#les", "sekolah"),
 ("Dewasa & kelas wanita", "Belajar berenang dari nol, ada kelas dengan pelatih wanita.", "Mulai Rp 300.000/bulan", "Edu Wisata", "edu-wisata.html#les", "dewasa"),
 ("Les bahasa Inggris", "Kelas Kids, Juniors, dan Teens dengan banyak praktik bicara.", "Tanya biaya", "HD Star", "hd-star.html#kelas", "anak"),
 ("Splash & Speak Camp", "Camp libur sekolah: renang pagi dan bahasa Inggris.", "Mulai Rp 350.000/anak", "HD Star + Edu Wisata", "edu-wisata.html#musiman", "anak sekolah"),
 ("Internet rumah", "Pilih kecepatan sesuai jumlah perangkat di rumah.", "Tanya paket", "Globe.Net", "globe-net.html#rumah", "rumah"),
 ("Internet usaha", "Untuk warung, UMKM, kantor, dan sekolah.", "Tanya paket", "Globe.Net", "globe-net.html#usaha", "rumah komunitas sekolah"),
 ("Galon antar & langganan", "Air minum diantar, bisa jadwal tetap setiap minggu.", "Tanya harga", "Hydro", "hydro.html#layanan", "rumah"),
 ("Pelatihan perhotelan", "Siapkan karier di hotel, dalam dan luar negeri.", "Tanya program", "Global Hospitality", "global-hospitality.html#program", "dewasa karier"),
]

# Visual tiap kartu program: foto asli bila ada, selain itu karakter di atas warna divisi
TILE_VIS = ["f:kolam-anak", "f:kolam-perosotan", "f:kolam-utama", "c:kuya", "f:saung", "f:saung-bambu", "f:kegiatan-saung", "f:edu-trip",
            "c:halaf", "c:monpil", "f:spelling-bee", "c:tanbo", "c:bungjin", "l:globenet", "c:bae", "l:gh"]
TILE_TAG = {0: "Paling dicari", 1: "Favorit keluarga", 3: "Lebih hemat", 11: "Libur sekolah"}
TILE_COLOR = {"Edu Wisata": "#1E9DB0", "HD Star": "#B68A4A", "HD Star + Edu Wisata": "#B68A4A", "Globe.Net": "#3B6FB6", "Hydro": "#2FA58A", "Global Hospitality": "#7A5C9E"}
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
def tile(i, t, desc, p, d, h, f):
    kind, key = TILE_VIS[i].split(":")
    if kind == "f":
        pic = f'<img src="assets/foto-{key}.webp" alt="" loading="lazy">'
    elif kind == "c":
        pic = f'<img class="tchar" src="assets/char-{key}.webp" alt="" loading="lazy">'
    else:
        pic = f'<img class="tlogo" src="assets/logo-{key}.webp" alt="" loading="lazy">'
    tag = f'<span class="ttag">{E(TILE_TAG[i])}</span>' if i in TILE_TAG else ""
    return (f'<a class="tile t-{kind}" data-for="{f}" href="{h}" style="--c:{TILE_COLOR.get(d, "#1E9DB0")}">'
            f'<span class="tpic">{pic}{tag}<span class="div">{E(d)}</span></span>'
            f'<span class="tbody"><h3>{E(t)}</h3><p>{E(desc)}</p>'
            f'<span class="tfoot"><span class="price">{E(p)}</span><span class="more">Lihat {ARROW}</span></span></span></a>')
CHIPS = [("semua", "Semua"), ("anak", "Untuk anak"), ("keluarga", "Keluarga"), ("sekolah", "Sekolah"), ("komunitas", "Komunitas & kantor"), ("dewasa", "Dewasa"), ("rumah", "Rumah & usaha"), ("karier", "Karier")]

b = head("Pilarmas Sukabumi", "Kolam renang, les renang, paket ulang tahun, les bahasa Inggris, internet, dan air minum dari Pilarmas Sukabumi.") + topbar("index.html")
b += f'''<main id="isi">
<section class="hero"><div class="wrap">
  <div class="text">
    <h1>Hari ini mau berenang, belajar, atau merayakan sesuatu?</h1>
    <p class="lead">Pilarmas adalah tempat wisata air dan keluarga usaha di Sukabumi: kolam renang, les renang dan bahasa Inggris, sampai internet dan air minum untuk rumah Anda.</p>
    <div class="cta"><a class="btn wa" href="#cari">Cari program</a><a class="btn ghost" href="ulang-tahun.html">Lihat paket ulang tahun</a></div>
    <ul class="facts"><li>Rating 4,5 di Google</li><li>Jumat libur</li><li>Tiket Rp 20.000</li><li>Kolam anak dan dewasa</li></ul>
  </div>
  <div class="scene mascot">{char("monpil", "hero-char")}<span class="splash" aria-hidden="true"></span><img src="assets/logo-pilarmas.webp" alt="Logo Pilarmas Kolam Renang Keluarga: pulau dengan pohon kelapa dan hammock di tengah air" width="1100" height="568"></div>
</div></section>
<div class="rope"></div>
<section class="band finder" id="cari"><div class="wrap">
  <h2>Program untuk siapa?</h2>
  <p class="lead">Pilih yang paling pas. Daftar di bawah langsung menyesuaikan.</p>
  <div class="guide">{char("bae", "", True, "guideChar")}<p class="bubble" aria-live="polite"><b id="guideName">Bae</b><span id="bubble">Halo, aku Bae! Pilih untuk siapa programnya, nanti teman-temanku yang menunjukkan.</span></p></div>
  <div class="chips" role="group" aria-label="Saring program">{"".join(f'<button class="chip" data-f="{k}" aria-pressed="false">{E(t)}</button>' for k, t in CHIPS)}</div>
  <p class="count" id="count" aria-live="polite"></p>
  <div class="grid">{"".join(tile(i, *x) for i, x in enumerate(TILES))}</div>
</div></section>
<section class="band" style="background:var(--water-3)"><div class="wrap">
  <div class="sec-head"><h2>Lima divisi, satu keluarga Pilarmas</h2><p class="lead">Setiap divisi punya halaman sendiri berisi semua programnya.</p></div>
  <div class="divs">'''
for i, (n, href, c, d, progs) in enumerate(DIVS):
    feat = " feature" if i == 0 else ""
    badge = ["Rekreasi, olahraga, dan acara", "Pendidikan", "Internet", "Air minum", "Karier"][i]
    lg = {0: "logo-pilarmas.webp", 1: "logo-hdstar.webp", 2: "logo-globenet.webp", 3: "logo-hydro.webp", 4: "logo-gh.webp"}.get(i)
    lgh = f'<img class="div-logo" src="assets/{lg}" alt="Logo {E(n)}" loading="lazy">' if lg else ""
    b += f'''<article class="div-row{feat}"><div class="head">{lgh}<span class="badge" style="justify-self:start">{badge}</span><h3 style="font-size:28px">{E(n)}</h3><p>{E(d)}</p><a class="btn {'brass' if i == 0 else 'wa'}" style="justify-self:start" href="{href}">Buka halaman {E(n.split(' Kolam')[0])}</a></div><ul>{"".join(f'<li><a href="{h}">{E(t)}</a></li>' for t, h in progs)}</ul></article>'''
b += '''</div></div></section>'''
b += promo("Ulang tahun si kecil di kolam renang", "Tiga paket untuk 20 anak, mulai Rp 40.000 per anak. Hitung sendiri biayanya dan kirim langsung ke admin.", "Hitung biaya pesta", href="ulang-tahun.html#hitung")
b += f'''<section class="band" id="suasana" style="background:var(--water-3)"><div class="wrap">
  <div class="sec-head"><h2>Suasana di Pilarmas</h2><p class="lead">Foto asli dari kolam, saung, dan kegiatan yang pernah berlangsung di sini.</p></div>
  <div class="gallery">
    <figure class="g-big"><img src="assets/foto-kolam-perosotan.webp" alt="Anak-anak bermain perosotan di kolam anak" loading="lazy"><figcaption>Kolam anak</figcaption></figure>
    <figure><img src="assets/foto-kolam-utama.webp" alt="Kolam utama Pilarmas" loading="lazy"><figcaption>Kolam utama</figcaption></figure>
    <figure><img src="assets/foto-saung.webp" alt="Saung Pilarmas" loading="lazy"><figcaption>Saung keluarga</figcaption></figure>
    <figure><img src="assets/foto-manasik.webp" alt="Acara manasik rombongan sekolah" loading="lazy"><figcaption>Manasik sekolah</figcaption></figure>
    <figure><img src="assets/foto-edu-trip.webp" alt="Kunjungan TK ke kebun anggur" loading="lazy"><figcaption>Edu Trip ke kebun anggur</figcaption></figure>
  </div>
</div></section>'''
b += f'''<section class="band pals-band" id="teman"><div class="wrap">
  <div class="sec-head"><h2>Kenalan dengan teman-teman Pilarmas</h2><p class="lead">Mereka yang menyambut Anda di kolam. Ketuk salah satu untuk menyapa.</p></div>
  <div class="pals">{"".join(f'<button class="pal" data-hi="{E(v)}">{char(k, "", False)}<span>{E(v)}</span></button>' for k, v in CHARS.items())}</div>
</div></section>'''
b += f'''<section class="band" id="lokasi"><div class="wrap visit">
  <div><h2>Mampir ke Pilarmas</h2><p class="lead">Udara Sukabumi yang sejuk, kolam yang bersih, dan tempat duduk teduh untuk orang tua.</p>
  <dl><dt>Lokasi</dt><dd>Baros, Kota Sukabumi, Jawa Barat 43161</dd><dt>Senin–Kamis</dt><dd>09.00–17.00</dd><dt>Sabtu–Minggu</dt><dd>08.00–17.00</dd><dt>Jumat</dt><dd>Libur</dd><dt>Tiket</dt><dd>Rp 20.000, dewasa dan anak</dd><dt>Ulasan</dt><dd>4,5 dari 5 di Google, 373 ulasan</dd></dl>
  <div class="cta"><a class="btn wa" href="https://www.google.com/maps/search/?api=1&query=Kolam+Renang+Pilar+Mas&query_place_id=ChIJv0X-8mlHaC4R28F2sM2gNaU">Buka di Google Maps</a><a class="btn ghost" data-wa="kolam" data-msg="Halo Pilarmas, hari ini buka jam berapa?" href="#kontak">Tanya jam buka</a></div></div>
  <figure class="map"><img src="assets/peta-pilarmas.webp" alt="Peta ilustrasi kawasan Pilarmas: kolam renang, gazebo, gedung, dan sawah di sekitarnya" width="669" height="909" loading="lazy"><figcaption>Peta ilustrasi kawasan Pilarmas</figcaption></figure>
</div></section>
</main>'''
b += foot()
write("index.html", b)

# ======================= EDU WISATA =======================
b = head("Edu Wisata Kolam Renang", "Tiket, les renang, paket ulang tahun, arisan, gathering, dan program sekolah di Edu Wisata Kolam Renang Pilarmas, Sukabumi.") + topbar("edu-wisata.html")
b += pagehero("Edu Wisata Kolam Renang", "Edu Wisata Kolam Renang Pilarmas", "Datang untuk berenang bersama keluarga, ikut les renang, atau pesan tempat untuk ulang tahun, arisan, gathering, dan kunjungan sekolah.", f'<a class="btn brass" data-wa="kolam" href="#kontak">{I["wa"]}Tanya admin kolam</a>', mascot="logo-pilarmas.webp")
b += subnav([("Tiket", "tiket"), ("Fasilitas", "fasilitas"), ("Les renang", "les"), ("Ulang tahun", "ultah"), ("Arisan & keluarga", "arisan"), ("Komunitas & kantor", "komunitas"), ("Sekolah", "sekolah"), ("Musiman", "musiman"), ("Galeri", "kegiatan"), ("Tanya jawab", "faq")])
b += section("tiket", "Tiket & langganan", "Untuk keluarga yang ingin berenang kapan saja.", [
  card("Tiket harian", "Akses kolam dewasa dan kolam anak. Buka Senin–Kamis 09.00–17.00, Sabtu–Minggu 08.00–17.00. Jumat libur.", "Rp 20.000, dewasa dan anak", go="Tanya admin kolam", wa="kolam", img="kolam-perosotan", alt="Kolam anak Pilarmas dengan perosotan"),
  card("Kartu langganan 10x", "Bayar 8 kali, berenang 10 kali. Berlaku 3 bulan dan bisa dipakai bergantian dalam satu keluarga.", "Harga 8 tiket", tag="Paling hemat", go="Beli kartu langganan", wa="kolam"),
  card("Sewa kolam privat", "Kolam ditutup untuk umum selama 2 sampai 3 jam, khusus keluarga atau rombongan Anda, di luar jam ramai.", "Mulai Rp 1.500.000 per sesi", go="Cek tanggal", wa="acara", img="kolam-utama", alt="Kolam utama Pilarmas dengan gazebo biru"),
])
b += f'''<section class="band" id="fasilitas"><div class="wrap"><div class="sec-head"><h2>Fasilitas di Pilarmas</h2><p class="lead">Semua ada di satu kawasan, jadi keluarga bisa seharian di sini.</p></div>
<div class="gallery">
<figure class="g-big"><img src="assets/foto-kolam-perosotan.webp" alt="Kolam anak dengan perosotan" loading="lazy"><figcaption>Kolam anak dengan perosotan dan air mancur</figcaption></figure>
<figure><img src="assets/foto-kolam-utama.webp" alt="Kolam utama" loading="lazy"><figcaption>Kolam utama dan meja teduh</figcaption></figure>
<figure><img src="assets/foto-saung.webp" alt="Deretan saung" loading="lazy"><figcaption>Saung untuk keluarga dan rombongan</figcaption></figure>
<figure><img src="assets/foto-saung-bambu.webp" alt="Saung bambu" loading="lazy"><figcaption>Saung bambu untuk acara</figcaption></figure>
<figure><img src="assets/foto-edu-trip.webp" alt="Kebun anggur edukasi" loading="lazy"><figcaption>Kebun anggur edukasi</figcaption></figure>
</div>
<ul class="facts" style="margin-top:18px"><li>Raja Coffee Pilar Mas</li><li>GOR badminton</li><li>Area manasik</li><li>Parkir mobil dan motor</li></ul>
</div></section>'''
ladder = '<div class="ladder" aria-label="Jenjang les renang">' + "".join(f"<div><b>{i}</b><strong>{E(t)}</strong><small>{E(s)}</small></div>" for i, (t, s) in enumerate([("Si Kecil", "3–5 tahun, kenalan dengan air"), ("Pemula", "Berani masuk air, mengapung"), ("Dasar", "Gaya bebas dan gaya dada"), ("Mahir", "Empat gaya, napas teratur"), ("Prestasi", "Teknik dan persiapan lomba")], 1)) + "</div>"
b += f'''<section class="band" id="les" style="background:var(--water-3)"><div class="wrap"><div class="sec-head">{char("kuya", "sec-char")}<h2>Les renang untuk semua usia</h2><p class="lead">Anak naik level setelah lulus tes, biasanya setiap 2 sampai 3 bulan, dan mendapat sertifikat.</p></div>{ladder}<div class="cards">'''
b += "".join([
  card("Kelas coba", "Satu sesi percobaan dan tes level, supaya anak masuk kelas yang tepat.", "Rp 35.000", "Dipotong dari biaya bulan pertama kalau lanjut", tag="Mulai di sini", go="Daftar online", href="https://daftarlesrenang.pilarmas.online/"),
  card("Kelas Si Kecil", "Usia 3 sampai 5 tahun bersama orang tua. Belajar tidak takut air sambil bermain.", "Mulai Rp 250.000/bulan", "4 sampai 8 pertemuan", tag="Anak", go="Tanya jadwal", wa="les"),
  card("Grup anak: Pemula, Dasar, Mahir", "Usia 5 sampai 12 tahun, 4 sampai 6 anak per pelatih, ada rapor kemajuan.", "Mulai Rp 250.000/bulan", "8 pertemuan", tag="Paling diminati", go="Tanya jadwal", wa="les", big=True, img="kolam-anak", alt="Anak-anak belajar di kolam anak Pilarmas"),
  card("Privat dan semi-privat", "Satu atau dua orang per pelatih, untuk anak atau dewasa yang ingin cepat bisa.", "Mulai Rp 400.000/bulan", "4 atau 8 pertemuan", tag="Anak & dewasa", go="Tanya jadwal", wa="les"),
  card("Dewasa pemula", "Untuk orang tua yang belum bisa berenang. Jadwal pagi di hari kerja.", "Mulai Rp 300.000/bulan", "8 pertemuan", tag="Dewasa", go="Tanya jadwal", wa="les"),
  card("Kelas khusus wanita", "Pelatih wanita dan jam khusus, nyaman untuk ibu-ibu dan muslimah.", "Mulai Rp 300.000/bulan", "8 pertemuan", tag="Dewasa", go="Tanya jadwal", wa="les"),
  card("Tim prestasi", "Latihan teknik empat gaya dan persiapan lomba untuk anak yang sudah mahir.", "Mulai Rp 400.000/bulan", tag="Lanjutan", go="Tanya seleksi", wa="les"),
  card("Renang PJOK sekolah", "Kerja sama dengan SD dan SMP. Pelatih dan lifeguard dari kami, jadwal hari kerja.", "Mulai Rp 15.000/siswa per pertemuan", "Kontrak per semester", tag="Sekolah", go="Ajukan kerja sama", wa="les"),
])
b += "</div>" + perks(["Diskon untuk kakak-adik", "Bayar 3 bulan, gratis 1 sesi", "Sertifikat setiap naik level", "Rapor kemajuan untuk orang tua"]) + "</div></section>"
b += promo("Daftar les renang secara online", "Isi formulir pendaftaran, lalu admin menghubungi Anda untuk tes level dan jadwal kelas.", "Buka formulir les renang", href="https://daftarlesrenang.pilarmas.online/")
b += section("ultah", "Paket ulang tahun anak", "Untuk 20 anak, sudah termasuk tiket renang, dekor, snack, MC, dan games air.", [
  card("Hemat", "Pesta simpel di pinggir kolam, boleh bawa kue sendiri. Senin sampai Kamis, 2 jam.", "Rp 40.000/anak", go="Lihat isi paket", href="ulang-tahun.html#paket"),
  card("Reguler", "Ditambah nasi box, kue 18 cm, dekor tema, goodie bag, dan gazebo. 2,5 jam.", "Rp 85.000/anak", tag="Paling laris", go="Lihat isi paket", href="ulang-tahun.html#paket", big=True),
  card("Premium", "Dekor tema penuh, kue karakter, badut atau MC profesional, dan foto 1 jam. 3 jam.", "Rp 150.000/anak", go="Lihat isi paket", href="ulang-tahun.html#paket"),
])
b += section("arisan", "Arisan & kumpul keluarga", "Mama ngobrol dengan tenang, anak-anak berenang aman dengan lifeguard yang berjaga.", [
  card("Arisan santai", "Gazebo 3 jam di hari kerja, pukul 09.00 sampai 13.00. Teh, kopi, snack, nasi box, dan anak boleh berenang.", "Rp 45.000/orang", "Minimal 15 orang", tag="Hari kerja", go="Pesan tempat arisan", wa="acara", img="saung", alt="Deretan saung di area Pilarmas"),
  card("Arisan plus senam air", "Arisan santai ditambah 30 menit senam air dipandu instruktur.", "Rp 65.000/orang", "Minimal 15 orang", go="Pesan tempat arisan", wa="acara"),
  card("Kumpul keluarga besar dan reuni", "Area semi-privat 4 jam, tiket renang, prasmanan, dan sound sederhana.", "Mulai Rp 75.000/orang", "Minimal 25 orang", go="Pesan tempat", wa="acara"),
  card("Syukuran, halal bihalal, aqiqah", "Tempat, konsumsi, meja, tenda, dan MC sesuai kebutuhan acara.", "Mulai Rp 3.000.000 per acara", go="Konsultasi acara", wa="acara"),
], alt=True)
b += section("komunitas", "Gathering komunitas & perusahaan", "Untuk kantor, pabrik, komunitas usaha, hobi, dan majelis taklim.", [
  card("Family gathering kantor dan pabrik", "Renang keluarga karyawan, lomba air, doorprize, prasmanan, dan MC.", "Mulai Rp 75.000/orang", "Minimal 50 orang", go="Minta penawaran", wa="acara", img="saung-bambu", alt="Saung bambu Pilarmas"),
  card("Kopdar komunitas", "Area 3 jam, snack atau nasi box, sound, dan renang bebas.", "Mulai Rp 50.000/orang", "Minimal 20 orang", go="Pesan tempat", wa="acara", img="kegiatan-saung", alt="Kegiatan bersama di saung Pilarmas"),
  card("Rekreasi majelis taklim", "Jadwal khusus, konsumsi, dan waktu salat yang sudah diatur.", "Mulai Rp 45.000/orang", go="Pesan tempat", wa="acara"),
  card("Lomba renang Pilarmas", "Lomba antar-sekolah dan komunitas yang diadakan Pilarmas. Terbuka untuk sponsor.", "Pendaftaran mulai Rp 50.000 per nomor", go="Info lomba dan sponsor", wa="acara"),
])
b += section("sekolah", "Program untuk sekolah", "Jadwal Senin sampai Kamis, untuk TK, SD, dan SMP.", [
  card("Edu Trip Pilarmas", "Satu hari kunjungan dengan tiga pos belajar:", "Mulai Rp 45.000/siswa", "Minimal 30 siswa, termasuk snack dan sertifikat", tag="Hanya di Pilarmas", go="Ajukan jadwal kunjungan", wa="acara", big=True,
       bullets=["Renang dan keselamatan di air", "Dari mana air minum kita? bersama Hydro Pilarmas", "Games bahasa Inggris bersama HD Star"], img="edu-trip", alt="Rombongan TK belajar di kebun anggur Pilarmas"),
  card("Outing class dan market day", "Kegiatan bebas sekolah di area Pilarmas, ditutup dengan berenang.", "Mulai Rp 30.000/siswa", go="Ajukan jadwal", wa="acara", img="manasik", alt="Rombongan sekolah di acara manasik Pilarmas"),
  card("Perpisahan dan wisuda TK", "Tempat, dekor, sound, konsumsi, dan renang setelah acara.", "Mulai Rp 3.000.000 per acara", go="Konsultasi acara", wa="acara"),
], alt=True)
b += section("musiman", "Program musiman", None, [
  card("Splash & Speak Camp", "Lima hari saat libur sekolah: renang pagi, bahasa Inggris bersama HD Star, dan games.", "Mulai Rp 350.000/anak", "Juni sampai Juli, dan Desember", go="Daftar camp", wa="hdstar"),
  card("Lomba air 17 Agustus", "Lomba air untuk anak dan keluarga.", "Tanya biaya pendaftaran", "Setiap Agustus", go="Info lomba", wa="acara"),
  card("Paket halal bihalal", "Paket kumpul keluarga besar dan kantor setelah Lebaran.", "Mulai Rp 75.000/orang", "Bulan Syawal", go="Pesan tempat", wa="acara"),
])
b += kegiatan("kegiatan", "Galeri kegiatan", "Kunjungan sekolah, acara komunitas, dan liburan keluarga yang pernah berlangsung di Pilarmas. Ketuk foto untuk memperbesar.", [
  ("g-libur-perosotan", "Libur akhir tahun", "Desember 2025", "Anak-anak meluncur di perosotan kolam anak saat libur akhir tahun", "tall"),
  ("g-manasik-anak", "Manasik haji anak", "Desember 2025", "Anak-anak berpakaian ihram berlatih tawaf di replika Ka'bah", "tall"),
  ("g-komunitas-ibu", "Kumpul komunitas di saung", "Februari 2026", "Rombongan ibu-ibu berbincang dan makan bersama di saung", "wide"),
  ("g-pentas-sekolah", "Pentas siswa di panggung", "Juni 2026", "Siswa TK tampil di panggung dengan pendamping guru", "tall"),
  ("g-paud-bermain", "Bermain bersama PAUD", "Juni 2026", "Anak PAUD dan orang tua bermain melingkar di aula", "tall"),
  ("g-edutrip-anggur", "Edu Trip kebun anggur", "September 2026", "Siswa TK memegang anggur hasil petik di kebun Pilarmas", "tall"),
  ("g-lomba-gathering", "Lomba saat gathering", "Juli 2025", "Peserta gathering berkaos biru mengikuti lomba di halaman", "tall"),
], "kolam", alt=True)
b += faq("Tanya jawab", [
  ("Kolam buka jam berapa?", "Senin sampai Kamis pukul 09.00–17.00, Sabtu dan Minggu pukul 08.00–17.00. Hari Jumat kolam libur. Saat libur panjang, cek dulu ke admin."),
  ("Di mana lokasinya?", "Kolam Renang Pilar Mas ada di Baros, Kota Sukabumi, Jawa Barat 43161. Cari \"Kolam Renang Pilar Mas\" di Google Maps."),
  ("Apakah ada kolam khusus anak?", "Ada. Kolam anak terpisah dari kolam dewasa, dan lifeguard berjaga selama jam buka."),
  ("Apakah anak harus didampingi?", "Ya. Anak yang berenang tetap wajib didampingi orang tua atau pendamping dewasa."),
  ("Bagaimana cara memesan tempat untuk acara?", "Kirim tanggal, jenis acara, dan jumlah peserta ke admin. Tanggal dikunci setelah DP 50%."),
])
b += foot()
write("edu-wisata.html", b)

# ======================= ULANG TAHUN =======================
PK = [("hemat", "Hemat", 40000, 50000, "Pesta simpel, boleh bawa kue sendiri", "Senin sampai Kamis, 2 jam", ["Tiket renang anak", "Area pesta di pinggir kolam", "Snack box: roti 2 pcs dan air mineral", "Balon dan backdrop Happy Birthday", "MC dan games air oleh pelatih kami", "Topi ulang tahun dan undangan digital", "Hadiah untuk yang berulang tahun"], False),
      ("reguler", "Reguler", 85000, 95000, "Paling lengkap untuk harganya", "Sabtu sampai Kamis, 2,5 jam", ["Semua isi paket Hemat", "Gazebo atau area semi-privat", "Nasi box anak: ayam, nasi, minum", "Kue ulang tahun 18 cm", "Dekor tema pilihan", "Goodie bag untuk setiap anak", "Gratis 2 pendamping"], True),
      ("premium", "Premium", 150000, 150000, "Semua kami urus", "Sabtu sampai Kamis, harga sama, 3 jam", ["Semua isi paket Reguler", "Dekor tema penuh dengan arch balon", "Kue karakter atau 2 tingkat", "Badut atau MC profesional", "Es krim dan goodie bag premium", "Dokumentasi foto 1 jam", "Lifeguard khusus rombongan", "Gratis 5 pendamping"], False)]
AD = [("Kue ulang tahun 18 cm", 185000, "acara"), ("Kue karakter atau 2 tingkat", 325000, "acara"), ("Nasi box anak", 22000, "anak"), ("Goodie bag", 10000, "anak"), ("Es krim cup", 7500, "anak"), ("Badut atau MC profesional", 425000, "acara"), ("Dekor tema penuh", 350000, "acara"), ("Dokumentasi foto 1 jam", 250000, "acara"), ("Photobooth dan cetak foto", 450000, "acara"), ("Tambahan waktu 1 jam", 150000, "acara")]
rp = lambda n: "Rp " + f"{n:,}".replace(",", ".")
b = head("Paket ulang tahun Pilarmas", "Paket ulang tahun anak di kolam renang Pilarmas Sukabumi untuk 20 anak, mulai Rp 40.000 per anak.") + topbar("ulang-tahun.html")
b += pagehero("Edu Wisata / Paket ulang tahun", "Ulang tahun si kecil di kolam renang", "Tiket renang, dekor, snack, MC, dan games air sudah kami siapkan. Orang tua tinggal datang dan menikmati acaranya.", f'<a class="btn brass" href="#hitung">Hitung biaya pesta</a><a class="btn ghost" data-wa="acara" data-msg="Halo Pilarmas, saya mau cek tanggal kosong untuk ulang tahun anak." href="#kontak">Cek tanggal kosong</a>', navy=True, mascot="char-monpil.webp")
b += subnav([("Paket", "paket"), ("Hitung biaya", "hitung"), ("Tema dekor", "tema"), ("Tambahan", "tambahan"), ("Syarat", "syarat"), ("Tanya jawab", "faq")])
b += f'''<section class="band" id="paket"><div class="wrap">
<div class="sec-head"><h2>Pilih paket untuk 20 anak</h2><p class="lead">Harga per anak. Anak tambahan dihitung dengan harga yang sama.</p></div>
<div class="toggle" id="dayToggle" role="group" aria-label="Pilih hari acara"><span class="knob" aria-hidden="true"></span><button aria-pressed="true">Hari kerja</button><button aria-pressed="false">Akhir pekan</button></div>
<div class="pkgs">'''
for key, name, wd, we, sub, when, items, best in PK:
    b += f'''<article class="pkg{' best' if best else ''}">{'<span class="flag">Paling laris</span>' if best else ''}<h3 style="font-size:26px">{name}</h3><p>{E(sub)}</p><p class="amt"><span data-wd="{wd}" data-we="{we}">{rp(wd)}</span> <small>/anak</small></p><p style="font-size:14px">{E(when)}</p><ul>{"".join(f"<li>{E(i)}</li>" for i in items)}</ul><a class="btn {'brass' if best else 'wa'}" href="#hitung" data-pick="{key}">Pilih {name}</a></article>'''
b += f'''</div>
<ol class="steps" style="margin-top:28px"><li><h3>Pilih paket</h3><p>Tambahkan kue, badut, atau foto kalau perlu.</p></li><li><h3>Kirim ke admin</h3><p>Sebutkan tanggal, jumlah anak, dan usia yang berulang tahun.</p></li><li><h3>Bayar DP 50%</h3><p>Tanggal terkunci, sisanya dilunasi di hari acara.</p></li></ol>
</div></section>
<section class="band" id="hitung" style="background:var(--water-3)"><div class="wrap">
<div class="sec-head"><h2>Hitung biaya pesta</h2><p class="lead">Atur sendiri, lalu kirim rinciannya ke admin lewat WhatsApp.</p></div>
<div class="calc">
  <div>
    <fieldset><legend>Paket</legend>{"".join(f'<label><input type="radio" name="pk" value="{k}"{" checked" if k == "reguler" else ""}> {n}</label>' for k, n, *_ in PK)}</fieldset>
    <fieldset><legend class="lbl" style="width:100%">Jumlah anak <span id="kidsOut">20 anak</span></legend><input type="range" id="kids" min="20" max="60" step="1" value="20" aria-label="Jumlah anak"></fieldset>
    <fieldset><legend>Tambahan</legend>{"".join(f'<label><input type="checkbox" name="ad" data-name="{E(n)}" data-price="{p}" data-per="{per}"> {E(n)} <span style="margin-left:auto;color:var(--sub);white-space:nowrap">{rp(p)}{"/anak" if per == "anak" else ""}</span></label>' for n, p, per in AD)}</fieldset>
  </div>
  <div class="total" aria-live="polite">{char("tanbo", "calc-char")}<p>Perkiraan total</p><span class="big" id="total">Rp 1.700.000</span><ul id="lines"></ul><a class="btn brass" id="calcWa" href="#kontak">{I["wa"]}Kirim ke admin</a><p>Harga akhir dikonfirmasi admin sesuai tanggal acara.</p></div>
</div>
</div></section>
<section class="band" id="tema"><div class="wrap"><div class="sec-head"><h2>Tema dekor</h2><p class="lead">Untuk paket Reguler dan Premium. Pilih satu saat memesan.</p></div>
<div class="themes">
<div class="theme" style="background:linear-gradient(160deg,#1E9DB0,#15284A)">Petualangan bawah laut</div>
<div class="theme" style="background:linear-gradient(160deg,#F2B544,#2FA58A)">Pesta tropis</div>
<div class="theme" style="background:linear-gradient(160deg,#7FD1D8,#7A5C9E)">Putri duyung</div>
<div class="theme" style="background:linear-gradient(160deg,#B68A4A,#15284A)">Bajak laut</div>
</div></div></section>
<section class="band" id="tambahan" style="background:var(--water-3)"><div class="wrap"><div class="sec-head"><h2>Tambahan</h2><p class="lead">Bisa ditambahkan ke paket mana pun.</p></div>
<div style="overflow-x:auto"><table class="addon"><thead><tr><th>Tambahan</th><th>Harga</th></tr></thead><tbody>{"".join(f"<tr><td>{E(n)}</td><td>{rp(p)}{'/anak' if per == 'anak' else ''}</td></tr>" for n, p, per in AD)}<tr><td>Nasi box pendamping dewasa</td><td>Rp 27.000/orang</td></tr></tbody></table></div>
</div></section>
<section class="band" id="syarat"><div class="wrap terms">
<div><h2 style="margin-bottom:16px">Syarat & ketentuan</h2><ul><li>Minimal 20 anak per acara.</li><li>Pesan paling lambat 5 hari sebelumnya, Premium 7 hari, dengan DP 50%.</li><li>Paket Hemat hanya Senin sampai Kamis. Hari Jumat kolam libur.</li><li>Akhir pekan dan libur nasional: Hemat dan Reguler tambah Rp 10.000 per anak.</li><li>Pendamping di luar kuota gratis membayar tiket biasa.</li><li>Makanan dari luar tidak diperbolehkan, kecuali kue ulang tahun.</li><li>Anak berenang dengan didampingi orang tua. Lifeguard kami berjaga selama acara.</li></ul></div>
<div class="faq" id="faq"><h2 style="margin-bottom:6px">Tanya jawab</h2>
<details><summary>Boleh bawa kue sendiri?{I["plus"]}</summary><p class="ans">Boleh, di semua paket, tanpa biaya tambahan.</p></details>
<details><summary>Kalau hujan bagaimana?{I["plus"]}</summary><p class="ans">Acara dipindah ke area teduh. Jadwal ulang bisa dibicarakan dengan admin.</p></details>
<details><summary>Apakah DP bisa dikembalikan?{I["plus"]}</summary><p class="ans">Tanyakan kebijakan pembatalan dan jadwal ulang ke admin saat memesan.</p></details>
<details><summary>Berapa usia anak yang cocok?{I["plus"]}</summary><p class="ans">Paket cocok untuk usia 3 sampai 12 tahun. Kolam anak terpisah dari kolam dewasa.</p></details>
</div></div></section>'''
b += foot()
write("ulang-tahun.html", b)

# ======================= HD STAR =======================
b = head("HD Star Course Pilarmas", "Les bahasa Inggris HD Star Course untuk anak dan remaja di Sukabumi.") + topbar("hd-star.html")
b += pagehero("HD Star Course", "Anak berani bicara bahasa Inggris", "Kelas kecil, belajar aktif, dan banyak praktik bicara. Ada kelas di luar ruangan supaya anak tidak bosan.", f'<a class="btn brass" href="https://daftarsiswahd.pilarmas.online/">Daftar online</a><a class="btn ghost" data-wa="hdstar" data-msg="Halo HD Star, saya mau tanya kelas untuk anak saya." href="#kontak">{I["wa"]}Tanya admin</a>', mascot="logo-hdstar.webp")
b += subnav([("Kelas", "kelas"), ("Program khusus", "khusus"), ("Untuk sekolah", "sekolah"), ("Cara daftar", "daftar"), ("Galeri", "kegiatan"), ("Tanya jawab", "faq")])
b += section("kelas", "Kelas sesuai usia", "Setiap murid baru ikut tes penempatan, lalu orang tua menerima laporan perkembangan berkala.", [
  card("Kids English", "Usia 5 sampai 8 tahun. Kosakata, lagu, cerita, dan games.", "Tanya biaya bulanan", tag="Anak", go="Tanya jadwal", wa="hdstar"),
  card("Juniors English", "Usia 9 sampai 12 tahun. Percakapan sehari-hari, membaca, dan menulis sederhana.", "Tanya biaya bulanan", tag="Paling diminati", go="Tanya jadwal", wa="hdstar", big=True),
  card("Teens Conversation", "Usia 13 sampai 17 tahun. Speaking, presentasi, dan persiapan ujian sekolah.", "Tanya biaya bulanan", tag="Remaja", go="Tanya jadwal", wa="hdstar"),
  card("Kelas privat", "Satu guru untuk satu murid, jadwal fleksibel, materi sesuai kebutuhan.", "Tanya biaya per pertemuan", tag="Semua usia", go="Tanya jadwal", wa="hdstar"),
], ch="tanbo")
b += promo("Daftar HD Star secara online", "Isi formulir pendaftaran siswa, lalu admin menghubungi Anda untuk jadwal kelas coba.", "Buka formulir pendaftaran", href="https://daftarsiswahd.pilarmas.online/")
b += section("khusus", "Program khusus", None, [
  card("Kelas pagi hari kerja", "Senin sampai Jumat pagi, untuk anak usia dini, homeschooling, atau anak yang sekolah siang.", "Tanya biaya", tag="Baru", go="Tanya jadwal", wa="hdstar"),
  card("Outdoor English class", "Belajar di luar ruangan dengan role play, games, dan praktik bicara langsung.", "Tanya biaya per sesi", go="Tanya jadwal", wa="hdstar"),
  card("Spelling Bee Contest", "Lomba mengeja bahasa Inggris yang diadakan HD Star di Edu Wisata Pilarmas. Pantau jadwal lomba berikutnya.", "Tanya jadwal lomba", tag="Event", go="Info lomba berikutnya", wa="hdstar", img="spelling-bee", alt="Peserta Spelling Bee Contest HD Star"),
  card("Splash & Speak Camp", "Lima hari saat libur sekolah: bahasa Inggris dan renang pagi di Edu Wisata Pilarmas.", "Mulai Rp 350.000/anak", "Juni sampai Juli, dan Desember", go="Lihat camp", href="edu-wisata.html#musiman"),
], alt=True)
b += section("sekolah", "Kerja sama dengan sekolah", None, [
  card("English day di sekolah", "Tim HD Star datang ke sekolah untuk kegiatan bahasa Inggris satu hari.", "Tanya biaya per siswa", go="Ajukan jadwal", wa="hdstar"),
  card("Edu Trip Pilarmas", "Kunjungan sekolah ke Pilarmas: renang, edukasi air bersih, dan games bahasa Inggris.", "Mulai Rp 45.000/siswa", go="Lihat Edu Trip", href="edu-wisata.html#sekolah"),
])
b += steps("daftar", "Cara daftar", [("Isi formulir online", "Daftar di daftarsiswahd.pilarmas.online atau chat admin."), ("Kelas coba", "Anak ikut satu sesi dan tes penempatan."), ("Pilih jadwal", "Admin bantu mencari kelas yang pas."), ("Mulai belajar", "Laporan perkembangan dikirim berkala.")], alt=True)
b += kegiatan("kegiatan", "Galeri kegiatan", "Lomba dan kegiatan siswa HD Star. Ketuk foto untuk memperbesar.", [
  ("foto-spelling-bee", "Spelling Bee Contest", "Juni 2026", "Peserta Spelling Bee Contest HD Star di panggung", "tall"),
  ("g-spelling-bee-2", "Peserta tampil di panggung", "Juni 2026", "Peserta menjawab soal di depan juri Spelling Bee HD Star", "tall"),
], "hdstar", extra='<div class="k-note">' + char("tanbo", "k-note-char") + '<h3>Mau anak ikut kegiatan seperti ini?</h3><p>Siswa HD Star berlatih bicara bahasa Inggris di kelas, lalu tampil di acara seperti Spelling Bee.</p><a class="btn brass" href="https://daftarsiswahd.pilarmas.online/">Daftar online</a></div>')
b += faq("Tanya jawab", [("Berapa murid dalam satu kelas?", "Kelas dibuat kecil supaya setiap anak mendapat giliran bicara. Tanyakan jumlah pastinya ke admin."), ("Kalau anak tidak masuk, bisa diganti?", "Tanyakan kebijakan kelas pengganti ke admin saat mendaftar."), ("Apakah ada kelas untuk dewasa?", "Saat ini kelas difokuskan untuk anak dan remaja. Kelas privat bisa untuk dewasa.")])
b += foot()
write("hd-star.html", b)

# ======================= GLOBE.NET =======================
b = head("Globe.Net Pilarmas", "Internet rumah dan usaha Globe.Net di Sukabumi.") + topbar("globe-net.html")
b += pagehero("Globe.Net", "Internet stabil untuk rumah dan usaha", "Cek dulu apakah lokasi Anda sudah terjangkau, lalu pilih paket sesuai kebutuhan.", f'<a class="btn brass" data-wa="globenet" data-msg="Halo Globe.Net, saya mau cek jangkauan internet di alamat saya: " href="#kontak">{I["wa"]}Cek jangkauan</a>', navy=True, mascot="logo-globenet.webp")
b += subnav([("Internet rumah", "rumah"), ("Usaha & kantor", "usaha"), ("Cara pasang", "pasang"), ("Tanya jawab", "faq")])
b += section("rumah", "Internet rumah", "Pilih berdasarkan jumlah perangkat yang dipakai bersamaan.", [
  card("Paket keluarga kecil", "Untuk 2 sampai 4 perangkat: sekolah online, media sosial, dan video.", "Tanya harga dan kecepatan", go="Tanya paket", wa="globenet"),
  card("Paket keluarga", "Untuk 4 sampai 8 perangkat, termasuk streaming di TV.", "Tanya harga dan kecepatan", tag="Paling diminati", go="Tanya paket", wa="globenet", big=True),
  card("Paket kencang", "Untuk banyak perangkat, kerja dari rumah, dan game online.", "Tanya harga dan kecepatan", go="Tanya paket", wa="globenet"),
], ch="bungjin")
b += section("usaha", "Internet untuk usaha", None, [
  card("Warung dan UMKM", "Paket usaha kecil, bisa dipakai untuk WiFi pelanggan.", "Tanya harga", go="Tanya paket", wa="globenet"),
  card("Kantor dan sekolah", "Kecepatan lebih tinggi dan prioritas penanganan gangguan.", "Minta penawaran", go="Minta penawaran", wa="globenet"),
], alt=True)
b += steps("pasang", "Cara pasang", [("Kirim lokasi", "Kirim titik lokasi ke admin untuk cek jangkauan."), ("Pilih paket", "Admin bantu memilih sesuai kebutuhan."), ("Jadwal pasang", "Teknisi datang sesuai jadwal yang disepakati."), ("Internet aktif", "Pembayaran bulanan, tanpa ribet.")])
b += faq("Tanya jawab", [("Berapa biaya pemasangan?", "Biaya pasang tergantung lokasi dan paket. Tanyakan ke admin saat cek jangkauan."), ("Kalau ada gangguan, hubungi siapa?", "Hubungi admin Globe.Net lewat WhatsApp. Teknisi kami ada di Sukabumi."), ("Apakah ada kontrak minimal?", "Tanyakan ketentuan kontrak ke admin sebelum pemasangan.")])
b += foot()
write("globe-net.html", b)

# ======================= HYDRO =======================
b = head("Hydro Pilarmas", "Air minum galon Hydro Pilarmas, diantar ke rumah, kantor, sekolah, dan warung di Sukabumi.") + topbar("hydro.html")
b += pagehero("Hydro Pilarmas", "Air minum galon, diantar sampai depan pintu", "Pesan lewat WhatsApp untuk rumah, kantor, sekolah, atau warung Anda.", f'<a class="btn brass" data-wa="hydro" data-msg="Halo Hydro Pilarmas, saya mau pesan galon. Alamat: " href="#kontak">{I["wa"]}Pesan galon</a>', mascot="logo-hydro.webp")
b += section("layanan", "Layanan Hydro Pilarmas", None, [
  card("Pesan antar", "Isi ulang galon, diantar ke rumah Anda.", "Tanya harga per galon", go="Pesan sekarang", wa="hydro"),
  card("Langganan mingguan", "Jadwal antar tetap setiap minggu, tidak perlu pesan ulang. Bayar per bulan.", "Tanya harga langganan", tag="Paling praktis", go="Daftar langganan", wa="hydro", big=True),
  card("Harga agen dan warung", "Harga khusus untuk warung dan agen yang menjual kembali.", "Tanya harga agen", go="Daftar jadi agen", wa="hydro"),
  card("Kantor dan sekolah", "Antar rutin dengan tagihan bulanan untuk instansi.", "Minta penawaran", go="Minta penawaran", wa="hydro"),
])
b += promo("Kunjungan edukasi air bersih", "Sekolah bisa belajar dari mana air minum berasal sebagai bagian dari Edu Trip Pilarmas.", "Lihat Edu Trip", href="edu-wisata.html#sekolah")
b += faq("Tanya jawab", [("Jam berapa pengantaran?", "Tanyakan jadwal antar ke admin. Pesanan pagi biasanya diantar di hari yang sama."), ("Wilayah mana saja yang dilayani?", "Kirim alamat Anda ke admin untuk memastikan wilayah antar."), ("Bisa bayar bulanan?", "Bisa, untuk pelanggan langganan, kantor, dan sekolah.")])
b += foot()
write("hydro.html", b)

# ======================= GLOBAL HOSPITALITY =======================
b = head("Global Hospitality Pilarmas", "Pelatihan perhotelan dan pendampingan penempatan kerja Global Hospitality, Sukabumi.") + topbar("global-hospitality.html")
b += pagehero("Global Hospitality", "Siapkan karier di dunia perhotelan", "Pelatihan perhotelan dan pendampingan penempatan kerja, dari pendaftaran sampai berangkat.", f'<a class="btn brass" href="https://daftarsiswaghs.pilarmas.online/">Daftar online</a><a class="btn ghost" data-wa="gh" data-msg="Halo Global Hospitality, saya mau konsultasi program pelatihan." href="#kontak">{I["wa"]}Konsultasi gratis</a>', navy=True, mascot="logo-gh.webp")
b += subnav([("Program", "program"), ("Alur", "alur"), ("Syarat", "syarat"), ("Tanya jawab", "faq")])
b += section("program", "Program", "Detail program, durasi, dan biaya dijelaskan admin saat konsultasi.", [
  card("Pelatihan perhotelan", "Persiapan kerja di hotel: pelayanan tamu, kebersihan kamar, dan layanan makanan dan minuman.", "Tanya durasi dan biaya", go="Tanya program", wa="gh"),
  card("Bahasa untuk kerja", "Latihan bahasa yang dibutuhkan di tempat kerja tujuan.", "Tanya jadwal", go="Tanya program", wa="gh"),
  card("Pendampingan penempatan kerja", "Pendampingan untuk lulusan yang memenuhi syarat, termasuk proses dokumen.", "Tanya negara dan mitra tujuan", tag="Untuk lulusan", go="Tanya penempatan", wa="gh", big=True),
])
b += promo("Daftar Global Hospitality secara online", "Isi formulir pendaftaran calon siswa, lalu admin menghubungi Anda untuk konsultasi dan jadwal seleksi.", "Buka formulir pendaftaran", href="https://daftarsiswaghs.pilarmas.online/")
b += steps("alur", "Alur pendaftaran", [("Isi formulir online", "Daftar di daftarsiswaghs.pilarmas.online atau chat admin untuk konsultasi."), ("Seleksi", "Tes dan wawancara."), ("Pelatihan", "Ikuti program sampai lulus."), ("Penempatan", "Proses dokumen dan keberangkatan.")], alt=True)
b += f'''<section class="band" id="syarat"><div class="wrap terms">
<div><h2 style="margin-bottom:16px">Syarat umum</h2><ul><li>Usia dan pendidikan minimal sesuai program yang dipilih.</li><li>Sehat jasmani dan rohani.</li><li>Dokumen identitas yang masih berlaku.</li><li>Siap mengikuti pelatihan sampai selesai.</li></ul><p style="margin-top:14px;color:var(--sub)">Syarat lengkap tiap program dijelaskan saat konsultasi.</p></div>
<div class="card"><h3>Legalitas</h3><p>Data badan usaha dan izin resmi Global Hospitality ditampilkan di sini.</p><a class="go" data-wa="gh" data-msg="Halo, saya mau menanyakan legalitas Global Hospitality." href="#kontak">Tanya dokumen legalitas</a></div>
</div></section>'''
b += faq("Tanya jawab", [("Berapa total biaya sampai berangkat?", "Biaya berbeda untuk setiap program. Admin akan menjelaskan rinciannya saat konsultasi."), ("Apakah ada jaminan kerja?", "Tanyakan ketentuan penempatan ke admin sebelum mendaftar."), ("Di mana lokasi pelatihan?", "Pelatihan dilaksanakan di Sukabumi. Tanyakan alamat lengkapnya ke admin.")])
b += foot()
write("global-hospitality.html", b)
print("built")

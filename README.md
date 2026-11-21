# Website Pilarmas Grup

Website statis untuk **pilarmas.online**: Edu Wisata Kolam Renang, HD Star Course, Globe.Net, Hydro Pilarmas, dan Global Hospitality.

## Isi folder

| Lokasi | Isi |
|---|---|
| `index.html` dan halaman `.html` lain | Halaman website yang siap tayang |
| `assets/` | CSS, JavaScript, logo, karakter, foto, peta |
| `_sumber/build.py` | Generator halaman (Python). Ubah teks di sini, lalu jalankan ulang |
| `CNAME` | Nama domain untuk GitHub Pages |

## Mengubah isi

1. Edit `_sumber/build.py` (teks, harga, kartu program).
2. Jalankan `python3 _sumber/build.py`. Semua halaman `.html` di folder utama dibuat ulang.
3. Commit dan push.

Nomor WhatsApp admin tiap divisi ada di `assets/app.js` (objek `WA`).

## Link pendaftaran

- HD Star: https://daftarsiswahd.pilarmas.online/
- Les renang: https://daftarlesrenang.pilarmas.online/
- Global Hospitality: https://daftarsiswaghs.pilarmas.online/

## Memasang di pilarmas.online

**GitHub Pages:** Settings → Pages → Source: branch `main`, folder `/ (root)`. Domain sudah diisi lewat file `CNAME`. Di pengelola DNS domain, arahkan `pilarmas.online` (record A) ke 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153, dan `www` (CNAME) ke `<akun>.github.io`.

**VPS / hosting sendiri:** salin seluruh isi folder (kecuali `_sumber/`) ke document root web server. Tidak perlu PHP atau database.

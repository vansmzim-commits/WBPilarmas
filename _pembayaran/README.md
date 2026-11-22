# Pilarmas Pay: pembayaran DOKU

Layanan kecil (Node 24, tanpa npm, SQLite) di VPS, domain **bayar.pilarmas.online**.
Setiap pesanan dapat nomor Virtual Account sendiri dari DOKU Checkout, dan pembayaran
terverifikasi otomatis lewat notifikasi bertanda tangan (HMAC-SHA256) + Check Status API.

Folder ini diawali `_` supaya **tidak ikut tayang** di GitHub Pages.
Tidak ada kunci rahasia di repo: Client ID, Secret Key, dan token admin hanya ada di `/opt/pilarmas-pay/.env` di VPS.

## Pasang / update di VPS (satu perintah, sebagai root)
```
bash <(curl -fsSL https://raw.githubusercontent.com/vansmzim-commits/WBPilarmas/main/_pembayaran/install.sh)
```
Syarat sekali saja: record DNS **A `bayar` → 202.134.242.165**.

## Cara pelanggan memesan
Tidak ada halaman terpisah. `tombol-bayar.js` (dimuat di semua halaman lewat `_sumber/build.py`) menambahkan tombol
**Pesan & bayar** di setiap kartu menu yang punya harga. Form pesanan dan jendela pembayaran DOKU (Checkout JS) tampil
di atas halaman yang sama. Setelah bayar, pelanggan kembali ke halaman yang sama (`#pm=PM-...`) dan melihat status.

- Bayar penuh: tiket harian, kartu 10x, kelas coba, pendaftaran lomba
- DP 50%: ulang tahun (juga dari kalkulator), arisan, gathering, kopdar, majelis taklim, edu trip, outing, sewa kolam, syukuran, perpisahan TK, camp, halal bihalal
- Tagihan nominal bebas (les bulanan, Globe.Net, Hydro, dll.): admin membuat di `/bayar/admin.html`, link-nya `https://pilarmas.online/#pm=PM-...`
- Kartu tanpa harga ("Tanya harga") tetap lewat WhatsApp

## Harga
Ada di `catalog.js`. Harga selalu dihitung di server. Ubah, commit, lalu jalankan ulang perintah install.

## Tes lokal
`node test/run.js` (memakai DOKU tiruan)

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

## Halaman
- `/bayar/`: tiket harian, kartu 10x, DP 50% ulang tahun
- `/bayar/?inv=PM-...`: bayar tagihan dari admin
- `/bayar/admin.html`: buat tagihan nominal bebas + daftar transaksi
- `/bayar/tombol-bayar.js`: tombol hijau di website (dipasang lewat `_sumber/build.py`)

## Harga
Ada di `catalog.js`. Harga selalu dihitung di server. Ubah, commit, lalu jalankan ulang perintah install.

## Tes lokal
`node test/run.js` (memakai DOKU tiruan)

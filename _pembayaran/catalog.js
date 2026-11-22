// Daftar harga resmi. Harga SELALU dihitung di server dari file ini,
// bukan dari angka yang dikirim browser. Ubah harga di sini lalu restart.
'use strict';

const ULTAH_PAKET = {
  hemat:   { nama: 'Paket Hemat',   kerja: 40000,  libur: 50000 },
  reguler: { nama: 'Paket Reguler', kerja: 85000,  libur: 95000 },
  premium: { nama: 'Paket Premium', kerja: 150000, libur: 150000 },
};

const ULTAH_TAMBAHAN = {
  kue18:     { nama: 'Kue ulang tahun 18 cm',      harga: 185000, per: 'acara' },
  kueKarakter:{ nama: 'Kue karakter atau 2 tingkat', harga: 325000, per: 'acara' },
  nasiBox:   { nama: 'Nasi box anak',              harga: 22000,  per: 'anak' },
  goodieBag: { nama: 'Goodie bag',                 harga: 10000,  per: 'anak' },
  esKrim:    { nama: 'Es krim cup',                harga: 7500,   per: 'anak' },
  badut:     { nama: 'Badut atau MC profesional',  harga: 425000, per: 'acara' },
  dekor:     { nama: 'Dekor tema penuh',           harga: 350000, per: 'acara' },
  foto:      { nama: 'Dokumentasi foto 1 jam',     harga: 250000, per: 'acara' },
  photobooth:{ nama: 'Photobooth dan cetak foto',  harga: 450000, per: 'acara' },
  ekstraJam: { nama: 'Tambahan waktu 1 jam',       harga: 150000, per: 'acara' },
};

const TIKET_HARIAN = 20000;
const KARTU_10X = 8 * TIKET_HARIAN; // "Harga 8 tiket"

function int(v, min, max) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Jumlah harus ${min}-${max}`);
  return n;
}

function isLibur(tanggal) {
  // Sabtu/Minggu dianggap akhir pekan. Libur nasional dikonfirmasi admin.
  const d = new Date(tanggal + 'T00:00:00+07:00');
  if (isNaN(d)) throw new Error('Tanggal acara tidak valid');
  const day = new Date(d.getTime() + 7 * 3600e3).getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Menghitung pesanan. Mengembalikan { divisi, judul, amount, items[] }.
 * items = line_items untuk DOKU (price per unit * quantity harus = amount).
 */
function hitung(produk, data = {}) {
  switch (produk) {
    case 'tiket-harian': {
      const qty = int(data.jumlah, 1, 50);
      return {
        divisi: 'edu', judul: `Tiket harian renang x${qty}`, amount: qty * TIKET_HARIAN,
        items: [{ name: 'Tiket harian renang', price: TIKET_HARIAN, quantity: qty }],
      };
    }
    case 'kartu-10x': {
      const qty = int(data.jumlah, 1, 10);
      return {
        divisi: 'edu', judul: `Kartu langganan 10x x${qty}`, amount: qty * KARTU_10X,
        items: [{ name: 'Kartu langganan renang 10x', price: KARTU_10X, quantity: qty }],
      };
    }
    case 'dp-ulang-tahun': {
      const p = ULTAH_PAKET[data.paket];
      if (!p) throw new Error('Paket ulang tahun tidak dikenal');
      const anak = int(data.anak, 20, 60);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.tanggal || ''))) throw new Error('Isi tanggal acara');
      const libur = isLibur(data.tanggal);
      const perAnak = libur ? p.libur : p.kerja;
      let total = perAnak * anak;
      const rincian = [`${p.nama} ${anak} anak x Rp${perAnak.toLocaleString('id-ID')}${libur ? ' (akhir pekan)' : ''}`];
      for (const kode of [].concat(data.tambahan || [])) {
        const t = ULTAH_TAMBAHAN[kode];
        if (!t) throw new Error('Tambahan tidak dikenal: ' + kode);
        const sub = t.per === 'anak' ? t.harga * anak : t.harga;
        total += sub;
        rincian.push(`${t.nama}${t.per === 'anak' ? ` x${anak}` : ''}`);
      }
      const dp = Math.ceil(total / 2);
      return {
        divisi: 'edu', judul: `DP 50% ulang tahun ${data.tanggal}`, amount: dp, total,
        catatan: rincian.join('; '),
        items: [{ name: `DP 50% ${p.nama} (${anak} anak) ${data.tanggal}`.slice(0, 255), price: dp, quantity: 1 }],
      };
    }
    default:
      throw new Error('Produk tidak dikenal');
  }
}

module.exports = { hitung, ULTAH_PAKET, ULTAH_TAMBAHAN, TIKET_HARIAN, KARTU_10X };

// Daftar harga resmi. Harga SELALU dihitung di server dari file ini,
// bukan dari angka yang dikirim browser. Ubah di sini, commit, lalu jalankan ulang install.
'use strict';

// mode: 'lunas' = bayar penuh, 'dp' = DP 50% (sisa dilunasi di lokasi)
// per : satuan harga ('tiket','kartu','orang','siswa','anak','acara','sesi','nomor')
// min/max: batas jumlah. tanggal: wajib isi tanggal kunjungan/acara.
// hari: hari yang boleh dipilih (0=Minggu..6=Sabtu). Jumat (5) kolam libur.
// mulai: harga "mulai dari"; DP dihitung dari harga ini dan total akhir dikonfirmasi admin.
const SEMUA_HARI = [0, 1, 2, 3, 4, 6];
const HARI_KERJA = [1, 2, 3, 4];

const PRODUK = {
  'tiket-harian':   { nama: 'Tiket harian renang', harga: 20000, per: 'tiket', mode: 'lunas', min: 1, max: 50, divisi: 'edu' },
  'kartu-10x':      { nama: 'Kartu langganan 10x', harga: 160000, per: 'kartu', mode: 'lunas', min: 1, max: 10, divisi: 'edu' },
  'kelas-coba':     { nama: 'Kelas coba les renang', harga: 35000, per: 'orang', mode: 'lunas', min: 1, max: 5, divisi: 'edu' },

  'arisan-santai':  { nama: 'Arisan santai', harga: 45000, per: 'orang', mode: 'dp', min: 15, max: 200, tanggal: true, hari: HARI_KERJA, divisi: 'edu' },
  'arisan-senam':   { nama: 'Arisan plus senam air', harga: 65000, per: 'orang', mode: 'dp', min: 15, max: 200, tanggal: true, hari: HARI_KERJA, divisi: 'edu' },
  'keluarga-besar': { nama: 'Kumpul keluarga besar dan reuni', harga: 75000, per: 'orang', mode: 'dp', mulai: true, min: 25, max: 500, tanggal: true, divisi: 'edu' },
  'syukuran':       { nama: 'Syukuran, halal bihalal, aqiqah', harga: 3000000, per: 'acara', mode: 'dp', mulai: true, min: 1, max: 1, tanggal: true, divisi: 'edu' },
  'sewa-kolam':     { nama: 'Sewa kolam privat', harga: 1500000, per: 'sesi', mode: 'dp', mulai: true, min: 1, max: 3, tanggal: true, divisi: 'edu' },
  'gathering':      { nama: 'Family gathering kantor dan pabrik', harga: 75000, per: 'orang', mode: 'dp', mulai: true, min: 50, max: 2000, tanggal: true, divisi: 'edu' },
  'kopdar':         { nama: 'Kopdar komunitas', harga: 50000, per: 'orang', mode: 'dp', mulai: true, min: 20, max: 500, tanggal: true, divisi: 'edu' },
  'majelis-taklim': { nama: 'Rekreasi majelis taklim', harga: 45000, per: 'orang', mode: 'dp', mulai: true, min: 20, max: 500, tanggal: true, divisi: 'edu' },
  'lomba-renang':   { nama: 'Pendaftaran lomba renang Pilarmas', harga: 50000, per: 'nomor', mode: 'lunas', mulai: true, min: 1, max: 20, divisi: 'edu' },
  'edu-trip':       { nama: 'Edu Trip Pilarmas', harga: 45000, per: 'siswa', mode: 'dp', mulai: true, min: 30, max: 1000, tanggal: true, hari: HARI_KERJA, divisi: 'edu' },
  'outing-class':   { nama: 'Outing class dan market day', harga: 30000, per: 'siswa', mode: 'dp', mulai: true, min: 20, max: 1000, tanggal: true, hari: HARI_KERJA, divisi: 'edu' },
  'perpisahan-tk':  { nama: 'Perpisahan dan wisuda TK', harga: 3000000, per: 'acara', mode: 'dp', mulai: true, min: 1, max: 1, tanggal: true, divisi: 'edu' },
  'splash-camp':    { nama: 'Splash & Speak Camp', harga: 350000, per: 'anak', mode: 'dp', mulai: true, min: 1, max: 10, divisi: 'edu' },
  'halal-bihalal':  { nama: 'Paket halal bihalal', harga: 75000, per: 'orang', mode: 'dp', mulai: true, min: 25, max: 2000, tanggal: true, divisi: 'edu' },
};

const ULTAH_PAKET = {
  hemat:   { nama: 'Paket Hemat',   kerja: 40000,  libur: 50000,  hari: HARI_KERJA, lead: 5 },
  reguler: { nama: 'Paket Reguler', kerja: 85000,  libur: 95000,  hari: SEMUA_HARI, lead: 5 },
  premium: { nama: 'Paket Premium', kerja: 150000, libur: 150000, hari: SEMUA_HARI, lead: 7 },
};

const ULTAH_TAMBAHAN = {
  kue18:       { nama: 'Kue ulang tahun 18 cm',       harga: 185000, per: 'acara' },
  kueKarakter: { nama: 'Kue karakter atau 2 tingkat', harga: 325000, per: 'acara' },
  nasiBox:     { nama: 'Nasi box anak',               harga: 22000,  per: 'anak' },
  goodieBag:   { nama: 'Goodie bag',                  harga: 10000,  per: 'anak' },
  esKrim:      { nama: 'Es krim cup',                 harga: 7500,   per: 'anak' },
  badut:       { nama: 'Badut atau MC profesional',   harga: 425000, per: 'acara' },
  dekor:       { nama: 'Dekor tema penuh',            harga: 350000, per: 'acara' },
  foto:        { nama: 'Dokumentasi foto 1 jam',      harga: 250000, per: 'acara' },
  photobooth:  { nama: 'Photobooth dan cetak foto',   harga: 450000, per: 'acara' },
  ekstraJam:   { nama: 'Tambahan waktu 1 jam',        harga: 150000, per: 'acara' },
};

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const rp = (n) => 'Rp' + Number(n).toLocaleString('id-ID');

function int(v, min, max, label = 'Jumlah') {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label} harus ${min}${max > min ? '–' + max : ''}`);
  return n;
}

// Tanggal "YYYY-MM-DD" dicek terhadap hari buka & batas pemesanan (zona WIB)
function cekTanggal(tgl, hariBoleh = SEMUA_HARI, leadHari = 1) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(tgl || ''))) throw new Error('Pilih tanggal');
  const d = new Date(tgl + 'T00:00:00Z');
  if (isNaN(d)) throw new Error('Tanggal tidak valid');
  const hari = d.getUTCDay();
  if (hari === 5) throw new Error('Hari Jumat kolam libur, pilih hari lain');
  if (!hariBoleh.includes(hari)) throw new Error(`Hari ${HARI[hari]} tidak tersedia untuk pilihan ini (hanya ${hariBoleh.map((h) => HARI[h]).join(', ')})`);
  const todayWib = new Date(Date.now() + 7 * 3600e3); todayWib.setUTCHours(0, 0, 0, 0);
  const selisih = Math.round((d - todayWib) / 864e5);
  if (selisih < leadHari) throw new Error(`Pemesanan paling lambat ${leadHari} hari sebelumnya`);
  if (selisih > 365) throw new Error('Tanggal terlalu jauh');
  return { hari, libur: hari === 0 || hari === 6 };
}

/** Menghitung pesanan. Return { divisi, judul, amount, total, catatan, items[] } */
function hitung(kode, data = {}) {
  if (kode === 'dp-ulang-tahun') {
    const p = ULTAH_PAKET[data.paket];
    if (!p) throw new Error('Paket ulang tahun tidak dikenal');
    const anak = int(data.anak, 20, 60, 'Jumlah anak');
    const { libur } = cekTanggal(data.tanggal, p.hari, p.lead);
    const perAnak = libur ? p.libur : p.kerja;
    let total = perAnak * anak;
    const rincian = [`${p.nama} ${anak} anak × ${rp(perAnak)}${libur ? ' (akhir pekan)' : ''}`];
    for (const k of [].concat(data.tambahan || [])) {
      const t = ULTAH_TAMBAHAN[k];
      if (!t) throw new Error('Tambahan tidak dikenal');
      total += t.per === 'anak' ? t.harga * anak : t.harga;
      rincian.push(t.nama);
    }
    const dp = Math.ceil(total / 2);
    return {
      divisi: 'edu', judul: `DP 50% ulang tahun, ${p.nama}, ${data.tanggal}`, amount: dp, total,
      catatan: rincian.join('; ') + (data.catatan ? ` | ${String(data.catatan).slice(0, 300)}` : ''),
      items: [{ name: `DP 50% ${p.nama} ${anak} anak ${data.tanggal}`.slice(0, 255), price: dp, quantity: 1 }],
    };
  }

  const p = PRODUK[kode];
  if (!p) throw new Error('Produk tidak dikenal');
  const qty = int(data.jumlah, p.min, p.max, `Jumlah ${p.per}`);
  if (p.tanggal) cekTanggal(data.tanggal, p.hari || SEMUA_HARI, 2);
  const total = p.harga * qty;
  const catatan = [
    `${qty} ${p.per} × ${rp(p.harga)}${p.mulai ? ' (harga mulai)' : ''}`,
    p.tanggal ? `tanggal ${data.tanggal}` : '',
    data.catatan ? String(data.catatan).slice(0, 300) : '',
  ].filter(Boolean).join('; ');
  if (p.mode === 'lunas') {
    return {
      divisi: p.divisi, judul: `${p.nama} ×${qty}`, amount: total, total, catatan,
      items: [{ name: p.nama, price: p.harga, quantity: qty }],
    };
  }
  const dp = Math.ceil(total / 2);
  return {
    divisi: p.divisi, judul: `DP 50% ${p.nama}${p.tanggal ? ', ' + data.tanggal : ''}`, amount: dp, total, catatan,
    items: [{ name: `DP 50% ${p.nama} (${qty} ${p.per})`.slice(0, 255), price: dp, quantity: 1 }],
  };
}

module.exports = { hitung, PRODUK, ULTAH_PAKET, ULTAH_TAMBAHAN };

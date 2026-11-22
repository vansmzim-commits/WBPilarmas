/* Pilarmas: pesan & bayar langsung di halaman (DOKU Checkout tersemat).
 * Dimuat di semua halaman pilarmas.online:
 *   <script src="https://bayar.pilarmas.online/bayar/tombol-bayar.js" defer></script>
 * Tombol "Pesan & bayar" ditambahkan ke setiap kartu menu yang punya harga.
 * Form pesanan dan layar pembayaran DOKU tampil di atas halaman yang sama.
 */
(function () {
  'use strict';
  if (window.__pmPay) return; window.__pmPay = 1;
  var me = document.currentScript && document.currentScript.src;
  var API = (me ? new URL(me).origin : 'https://bayar.pilarmas.online') + '/api/pay';
  var DOKU_JS = {
    sandbox: 'https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js',
    production: 'https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js'
  };
  var K = null, pollTimer = null;

  // Judul kartu di website -> kode produk di server
  var JUDUL = {
    'Tiket harian': 'tiket-harian', 'Kartu langganan 10x': 'kartu-10x', 'Kelas coba': 'kelas-coba',
    'Sewa kolam privat': 'sewa-kolam', 'Arisan santai': 'arisan-santai', 'Arisan plus senam air': 'arisan-senam',
    'Kumpul keluarga besar dan reuni': 'keluarga-besar', 'Syukuran, halal bihalal, aqiqah': 'syukuran',
    'Family gathering kantor dan pabrik': 'gathering', 'Kopdar komunitas': 'kopdar',
    'Rekreasi majelis taklim': 'majelis-taklim', 'Lomba renang Pilarmas': 'lomba-renang',
    'Edu Trip Pilarmas': 'edu-trip', 'Outing class dan market day': 'outing-class',
    'Perpisahan dan wisuda TK': 'perpisahan-tk', 'Splash & Speak Camp': 'splash-camp',
    'Paket halal bihalal': 'halal-bihalal',
    'Hemat': 'ultah:hemat', 'Reguler': 'ultah:reguler', 'Premium': 'ultah:premium'
  };
  var NAMA_TAMBAHAN = {
    'Kue ulang tahun 18 cm': 'kue18', 'Kue karakter atau 2 tingkat': 'kueKarakter', 'Nasi box anak': 'nasiBox',
    'Goodie bag': 'goodieBag', 'Es krim cup': 'esKrim', 'Badut atau MC profesional': 'badut',
    'Dekor tema penuh': 'dekor', 'Dokumentasi foto 1 jam': 'foto', 'Photobooth dan cetak foto': 'photobooth',
    'Tambahan waktu 1 jam': 'ekstraJam'
  };
  var STATUS = { PAID: 'Lunas', PENDING: 'Menunggu pembayaran', OPEN: 'Belum dibayar', EXPIRED: 'Kedaluwarsa', REVIEW: 'Sedang dicek admin' };

  function rp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; }); }
  function api(path, opt) {
    return fetch(API + path, opt).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'Gagal, coba lagi'); return j; });
    });
  }
  function post(path, body) { return api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); }
  function ymd(d) { return new Date(d.getTime() + 7 * 3600e3).toISOString().slice(0, 10); }
  function hariDari(t) { return new Date(t + 'T00:00:00Z').getUTCDay(); }
  function simpan(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ambil(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }

  // ---------- gaya ----------
  var css = document.createElement('style');
  css.textContent =
    '.pmx-btn{display:inline-flex;align-items:center;gap:6px;margin:10px 8px 0 0;padding:10px 18px;border-radius:999px;border:0;cursor:pointer;' +
    'background:var(--brass,#F0883E);color:var(--navy,#15284A);font-family:inherit;font-weight:700;font-size:15px;line-height:1.1;box-shadow:0 3px 0 rgba(21,40,74,.18)}' +
    '.pmx-btn:hover{filter:brightness(1.05);transform:translateY(-1px)}.pmx-btn svg{width:18px;height:18px}' +
    '.pmx-ov{position:fixed;inset:0;z-index:9990;background:rgba(10,22,40,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}' +
    '.pmx-ov.on{opacity:1}@media(min-width:720px){.pmx-ov{align-items:center}}' +
    '.pmx-sh{background:#fff;color:#15284A;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:22px 20px 26px;' +
    'transform:translateY(30px);transition:transform .25s;font-family:inherit;box-shadow:0 -10px 40px rgba(0,0,0,.25)}' +
    '@media(min-width:720px){.pmx-sh{border-radius:22px}}.pmx-ov.on .pmx-sh{transform:none}' +
    '.pmx-sh h3{margin:0 34px 4px 0;font-size:24px}.pmx-sub{color:#5b6b7f;margin:0 0 12px;font-size:14px}' +
    '.pmx-x{position:sticky;top:0;float:right;margin:-6px -4px 0 0;width:36px;height:36px;border-radius:50%;border:0;background:#eef3f8;font-size:20px;cursor:pointer;color:#15284A}' +
    '.pmx-sh label{display:block;font-weight:700;font-size:14px;margin:12px 0 6px}' +
    '.pmx-sh input,.pmx-sh select,.pmx-sh textarea{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d5dfea;border-radius:12px;font-family:inherit;font-size:16px;color:#15284A;background:#fff}' +
    '.pmx-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:480px){.pmx-row{grid-template-columns:1fr}}' +
    '.pmx-chk{display:grid;grid-template-columns:1fr;gap:6px}.pmx-chk label{display:flex;gap:8px;align-items:center;font-weight:500;margin:0}.pmx-chk input{width:auto}' +
    '.pmx-sum{background:#FFF6E2;border-radius:14px;padding:12px 14px;margin-top:14px}.pmx-big{font-size:26px;font-weight:800}.pmx-sum small{color:#5b6b7f}' +
    '.pmx-go{display:block;width:100%;margin-top:14px;padding:14px;border:0;border-radius:999px;background:var(--water,#1673AE);color:#fff;font-family:inherit;font-weight:800;font-size:17px;cursor:pointer}' +
    '.pmx-go:disabled{opacity:.6;cursor:wait}.pmx-go.alt{background:#fff;color:#15284A;border:2px solid #15284A}' +
    '.pmx-err{color:#c0392b;font-weight:700;margin-top:10px;min-height:1em}.pmx-note{font-size:13px;color:#5b6b7f;margin-top:10px}' +
    '.pmx-badge{display:inline-block;padding:4px 12px;border-radius:999px;font-weight:800;font-size:14px;background:#fff1d6;color:#b7791f}' +
    '.pmx-badge.PAID{background:#dff5e8;color:#1d8a4e}.pmx-badge.EXPIRED,.pmx-badge.REVIEW{background:#fde4e1;color:#c0392b}' +
    '.pmx-ok{font-size:44px;line-height:1}';
  document.head.appendChild(css);

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>';

  // ---------- sheet ----------
  var ov, sh;
  function buka(html) {
    tutup(true);
    ov = document.createElement('div'); ov.className = 'pmx-ov';
    ov.innerHTML = '<div class="pmx-sh" role="dialog" aria-modal="true"><button class="pmx-x" aria-label="Tutup">×</button><div class="pmx-in"></div></div>';
    sh = ov.querySelector('.pmx-in'); sh.innerHTML = html;
    ov.addEventListener('click', function (e) { if (e.target === ov) tutup(); });
    ov.querySelector('.pmx-x').onclick = function () { tutup(); };
    document.body.appendChild(ov); document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { ov.classList.add('on'); });
    return sh;
  }
  function tutup(cepat) {
    clearTimeout(pollTimer);
    if (!ov) return;
    var o = ov; ov = null; document.documentElement.style.overflow = '';
    if (cepat) return o.remove();
    o.classList.remove('on'); setTimeout(function () { o.remove(); }, 220);
    if (/^#pm=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') tutup(); });

  // ---------- DOKU tersemat ----------
  var dokuReady = null;
  function muatDoku() {
    if (dokuReady) return dokuReady;
    dokuReady = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = DOKU_JS[(K && K.env) === 'production' ? 'production' : 'sandbox'];
      s.onload = function () { ok(); }; s.onerror = function () { dokuReady = null; no(new Error('Gagal memuat DOKU')); };
      document.head.appendChild(s);
    });
    return dokuReady;
  }
  function bukaDoku(url, invoice) {
    simpan('pm_last_inv', invoice);
    return muatDoku().then(function () {
      if (typeof window.loadJokulCheckout !== 'function') throw new Error('DOKU belum siap');
      tutup(true);              // tutup form agar jendela DOKU tampil di depan
      tunggu(invoice);          // status dicek di belakang; form muncul lagi saat lunas
      window.loadJokulCheckout(url);
    }).catch(function () { location.href = url; });
  }

  // ---------- status pesanan ----------
  function tampilStatus(o) {
    var paid = o.status === 'PAID';
    var h = paid ? '<div class="pmx-ok">🎉</div><h3>Pembayaran diterima</h3>' : '<h3>Status pesanan</h3>';
    h += '<p><span class="pmx-badge ' + esc(o.status) + '">' + esc(STATUS[o.status] || o.status) + '</span></p>' +
      '<div class="pmx-sum"><small>' + esc(o.judul) + '</small><div class="pmx-big">' + rp(o.amount) + '</div>' +
      (o.total && o.total !== o.amount ? '<small>Total ' + rp(o.total) + ', sisa dilunasi di lokasi</small>' : '') + '</div>' +
      '<p class="pmx-note">No. pesanan <b>' + esc(o.invoice) + '</b>' + (o.channel ? ' · ' + esc(String(o.channel).replace(/_/g, ' ')) : '') + '</p>';
    if (paid) h += '<p>Terima kasih, ' + esc(o.nama || '') + '! Simpan nomor pesanan ini. Admin akan menghubungi Anda lewat WhatsApp.</p><button class="pmx-go alt" data-a="tutup">Selesai</button>';
    else if (o.status === 'PENDING') h += '<button class="pmx-go" data-a="lanjut">Lanjutkan pembayaran</button><p class="pmx-note">Sudah transfer? Status diperbarui otomatis dalam 1–2 menit.</p>';
    else if (o.status === 'OPEN' || o.status === 'EXPIRED') h += '<button class="pmx-go" data-a="baru">Bayar sekarang</button>';
    else h += '<p class="pmx-note">Admin sedang memeriksa pembayaran ini. Hubungi admin bila perlu.</p>';
    h += '<div class="pmx-err"></div>';
    var el = ov ? (sh.innerHTML = h, sh) : buka(h);
    var b = el.querySelector('[data-a]');
    if (b) b.onclick = function () {
      var a = b.dataset.a; if (a === 'tutup') return tutup();
      b.disabled = true;
      (a === 'lanjut' && o.payment_url ? Promise.resolve({ payment_url: o.payment_url })
        : post('/order/' + encodeURIComponent(o.invoice) + '/bayar', { return_url: location.href }))
        .then(function (r) { return bukaDoku(r.payment_url, o.invoice); })
        .catch(function (e) { el.querySelector('.pmx-err').textContent = e.message; b.disabled = false; });
    };
  }
  function tunggu(invoice, n) {
    n = n || 0; clearTimeout(pollTimer);
    pollTimer = setTimeout(function () {
      api('/order/' + encodeURIComponent(invoice)).then(function (o) {
        if (o.status === 'PAID') { if (!ov) buka(''); tampilStatus(o); return; }
        if (n < 60) tunggu(invoice, n + 1);
      }).catch(function () { if (n < 60) tunggu(invoice, n + 1); });
    }, n < 6 ? 8000 : 20000);
  }
  function bukaInvoice(inv) {
    buka('<h3>Memuat pesanan…</h3>');
    api('/order/' + encodeURIComponent(inv)).then(function (o) {
      tampilStatus(o); if (o.status === 'PENDING') tunggu(inv);
    }).catch(function (e) { sh.innerHTML = '<h3>Pesanan tidak ditemukan</h3><p class="pmx-err">' + esc(e.message) + '</p>'; });
  }

  // ---------- form pesanan ----------
  function fieldPelanggan() {
    return '<div class="pmx-row"><div><label>Nama pemesan</label><input name="nama" autocomplete="name" value="' + esc(ambil('pm_nama')) + '"></div>' +
      '<div><label>No. WhatsApp</label><input name="hp" inputmode="tel" placeholder="08xxxxxxxxxx" autocomplete="tel" value="' + esc(ambil('pm_hp')) + '"></div></div>' +
      '<label>Catatan (opsional)</label><input name="catatan" maxlength="200" placeholder="Contoh: jam datang, nama yang ulang tahun">';
  }
  function minTanggal(hari) { var d = new Date(Date.now() + hari * 864e5); return ymd(d); }
  function tanggalAwal(lead, hariBoleh) {
    var d = new Date(Date.now() + lead * 864e5);
    for (var i = 0; i < 14; i++) { var t = ymd(d); if (hariBoleh.indexOf(hariDari(t)) >= 0) return t; d = new Date(d.getTime() + 864e5); }
    return ymd(d);
  }

  function formProduk(kode) {
    var p = K.produk[kode]; if (!p) return;
    var hb = p.hari || [0, 1, 2, 3, 4, 6];
    var html = '<h3>' + esc(p.nama) + '</h3><p class="pmx-sub">' + rp(p.harga) + ' / ' + esc(p.per) + (p.mulai ? ' (harga mulai)' : '') +
      (p.min > 1 ? ' · minimal ' + p.min + ' ' + esc(p.per) : '') + '</p><form novalidate>' +
      '<div class="pmx-row"><div><label>Jumlah ' + esc(p.per) + '</label><input name="jumlah" type="number" min="' + p.min + '" max="' + p.max + '" value="' + p.min + '"' + (p.max === 1 ? ' readonly' : '') + '></div>' +
      (p.tanggal ? '<div><label>Tanggal</label><input name="tanggal" type="date" min="' + minTanggal(2) + '" value="' + tanggalAwal(2, hb) + '"></div>' : '<div></div>') + '</div>' +
      fieldPelanggan() +
      '<div class="pmx-sum"><small class="k">Total</small><div class="pmx-big t">-</div><small class="x"></small></div>' +
      '<button class="pmx-go" type="submit">Bayar sekarang</button><div class="pmx-err"></div>' +
      '<p class="pmx-note">' + (p.mode === 'dp' ? 'DP 50% mengunci tanggal. ' + (p.mulai ? 'Total akhir dikonfirmasi admin sesuai menu & fasilitas, sisa dilunasi di lokasi. ' : 'Sisa dilunasi di lokasi. ') : '') +
      'Bayar lewat virtual account (BRI, BNI, Mandiri, Permata, CIMB, Danamon, BSI, BTN) atau QRIS. Nomor VA khusus untuk pesanan Anda.</p></form>';
    var el = buka(html), f = el.querySelector('form');
    function hit() {
      var q = Math.max(0, Math.floor(+f.jumlah.value || 0)), tot = q * p.harga;
      var dp = p.mode === 'dp';
      f.querySelector('.k').textContent = dp ? 'DP 50% yang dibayar sekarang' : 'Total bayar';
      f.querySelector('.t').textContent = rp(dp ? Math.ceil(tot / 2) : tot);
      f.querySelector('.x').textContent = dp ? 'Perkiraan total ' + rp(tot) : '';
      var e = '';
      if (q < p.min || q > p.max) e = 'Jumlah ' + p.per + ' ' + p.min + (p.max > p.min ? '–' + p.max : '');
      else if (p.tanggal && f.tanggal.value) {
        var h = hariDari(f.tanggal.value);
        if (h === 5) e = 'Hari Jumat kolam libur';
        else if (hb.indexOf(h) < 0) e = 'Hanya tersedia Senin sampai Kamis';
      }
      f.querySelector('.pmx-err').textContent = e;
    }
    f.addEventListener('input', hit); hit();
    kirim(f, function () { return { produk: kode, data: { jumlah: +f.jumlah.value, tanggal: f.tanggal ? f.tanggal.value : undefined, catatan: f.catatan.value } }; });
  }

  function formUltah(pre) {
    pre = pre || {};
    var P = K.ultah_paket, T = K.ultah_tambahan, pk = pre.paket || 'reguler';
    var html = '<h3>Pesan paket ulang tahun</h3><p class="pmx-sub">DP 50% mengunci tanggal, sisanya dilunasi di hari acara.</p><form novalidate>' +
      '<div class="pmx-row"><div><label>Paket</label><select name="paket">' + Object.keys(P).map(function (k) {
        return '<option value="' + k + '"' + (k === pk ? ' selected' : '') + '>' + esc(P[k].nama) + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Jumlah anak (20–60)</label><input name="anak" type="number" min="20" max="60" value="' + (pre.anak || 20) + '"></div></div>' +
      '<label>Tanggal acara</label><input name="tanggal" type="date">' +
      '<label>Tambahan</label><div class="pmx-chk">' + Object.keys(T).map(function (k) {
        return '<label><input type="checkbox" name="tb" value="' + k + '"' + ((pre.tambahan || []).indexOf(k) >= 0 ? ' checked' : '') + '> ' +
          esc(T[k].nama) + ' <small style="margin-left:auto;color:#5b6b7f">' + rp(T[k].harga) + (T[k].per === 'anak' ? '/anak' : '') + '</small></label>'; }).join('') + '</div>' +
      fieldPelanggan() +
      '<div class="pmx-sum"><small>DP 50% yang dibayar sekarang</small><div class="pmx-big t">-</div><small class="x"></small></div>' +
      '<button class="pmx-go" type="submit">Bayar DP sekarang</button><div class="pmx-err"></div>' +
      '<p class="pmx-note">Hemat hanya Senin–Kamis. Akhir pekan: Hemat & Reguler +Rp 10.000/anak. Pesan paling lambat 5 hari sebelumnya (Premium 7 hari). Jumat kolam libur.</p></form>';
    var el = buka(html), f = el.querySelector('form');
    function setTgl() {
      var p = P[f.paket.value]; f.tanggal.min = minTanggal(p.lead);
      if (!f.tanggal.value || f.tanggal.value < f.tanggal.min || p.hari.indexOf(hariDari(f.tanggal.value)) < 0) f.tanggal.value = tanggalAwal(p.lead, p.hari);
    }
    function hit() {
      var p = P[f.paket.value], anak = Math.floor(+f.anak.value || 0), h = f.tanggal.value ? hariDari(f.tanggal.value) : 1;
      var libur = h === 0 || h === 6, tot = (libur ? p.libur : p.kerja) * anak;
      [].forEach.call(f.querySelectorAll('[name=tb]:checked'), function (c) { var t = T[c.value]; tot += t.per === 'anak' ? t.harga * anak : t.harga; });
      f.querySelector('.t').textContent = rp(Math.ceil(tot / 2));
      f.querySelector('.x').textContent = 'Total acara ' + rp(tot) + (libur ? ' (harga akhir pekan)' : '');
      var e = '';
      if (anak < 20 || anak > 60) e = 'Jumlah anak 20–60';
      else if (h === 5) e = 'Hari Jumat kolam libur';
      else if (p.hari.indexOf(h) < 0) e = p.nama + ' hanya Senin sampai Kamis';
      f.querySelector('.pmx-err').textContent = e;
    }
    f.paket.addEventListener('change', setTgl);
    f.addEventListener('input', hit); f.addEventListener('change', hit); setTgl(); hit();
    kirim(f, function () {
      return { produk: 'dp-ulang-tahun', data: { paket: f.paket.value, anak: +f.anak.value, tanggal: f.tanggal.value, catatan: f.catatan.value,
        tambahan: [].map.call(f.querySelectorAll('[name=tb]:checked'), function (c) { return c.value; }) } };
    });
  }

  function kirim(f, ambilData) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('.pmx-go'), err = f.querySelector('.pmx-err');
      btn.disabled = true; err.textContent = '';
      var body = ambilData(); body.customer = { name: f.nama.value, phone: f.hp.value }; body.return_url = location.href;
      simpan('pm_nama', f.nama.value); simpan('pm_hp', f.hp.value);
      post('/checkout', body).then(function (r) {
        sh.innerHTML = '<h3>Membuka pembayaran…</h3><p class="pmx-note">No. pesanan <b>' + esc(r.invoice) + '</b>. Pilih bank atau QRIS di jendela DOKU.</p>' +
          '<button class="pmx-go alt" data-a="cek">Cek status pembayaran</button>';
        sh.querySelector('[data-a=cek]').onclick = function () { bukaInvoice(r.invoice); };
        return bukaDoku(r.payment_url, r.invoice);
      }).catch(function (e) { err.textContent = e.message; btn.disabled = false; });
    });
  }

  function pesan(kode, pre) {
    var go = function () { kode.indexOf('ultah:') === 0 || kode === 'ultah' ? formUltah(Object.assign({ paket: kode.split(':')[1] }, pre)) : formProduk(kode); };
    if (K) return go();
    buka('<h3>Memuat…</h3>');
    muatKatalog().then(go).catch(function () { sh.innerHTML = '<h3>Pembayaran online sedang tidak tersedia</h3><p>Silakan pesan lewat chat admin.</p>'; });
  }

  var katalogP = null;
  function muatKatalog() { return katalogP || (katalogP = api('/katalog').then(function (k) { K = k; return k; }).catch(function (e) { katalogP = null; throw e; })); }

  // ---------- pasang tombol di kartu menu ----------
  function tombol(label, onClick) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pmx-btn'; b.innerHTML = ICON + esc(label);
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); onClick(); });
    return b;
  }
  function pasang() {
    [].forEach.call(document.querySelectorAll('article.card, article.pkg'), function (card) {
      if (card.querySelector('.pmx-btn')) return;
      var h = card.querySelector('h3'); if (!h) return;
      var kode = JUDUL[h.textContent.trim()]; if (!kode) return;
      var isPkg = card.classList.contains('pkg');
      var b = tombol(kode.indexOf('ultah:') === 0 ? 'Pesan & bayar DP' : 'Pesan & bayar', function () { pesan(kode); });
      var anchor = card.querySelector(isPkg ? 'a.btn' : 'a.go');
      if (anchor && anchor.parentNode === card) card.insertBefore(b, anchor.nextSibling); else card.appendChild(b);
    });
    // Kalkulator ulang tahun: bawa pilihan ke form pesanan
    var calc = document.getElementById('calcWa');
    if (calc && !document.getElementById('pmxCalc')) {
      var b = tombol('Pesan & bayar DP 50%', function () {
        var root = document.getElementById('hitung') || document;
        var pk = (root.querySelector('input[name=pk]:checked') || {}).value || 'reguler';
        var kids = +((root.querySelector('#kids') || {}).value || 20);
        var tb = [].map.call(root.querySelectorAll('input[name=ad]:checked'), function (i) { return NAMA_TAMBAHAN[i.dataset.name]; }).filter(Boolean);
        pesan('ultah:' + pk, { anak: kids, tambahan: tb });
      });
      b.id = 'pmxCalc'; b.style.marginTop = '10px';
      calc.parentNode.insertBefore(b, calc.nextSibling);
    }
  }

  function dariHash() {
    var m = location.hash.match(/^#pm=(PM-\d{8}-[0-9A-F]{6})/);
    if (m) muatKatalog().catch(function () {}).then(function () { bukaInvoice(m[1]); });
  }

  function mulai() {
    muatKatalog().then(pasang).catch(function () { /* layanan mati: website tetap normal, tombol tidak muncul */ });
    dariHash();
    window.addEventListener('hashchange', dariHash);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
})();

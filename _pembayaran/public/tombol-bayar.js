// Tombol "Bayar online" untuk halaman pilarmas.online.
// Dipasang di website (GitHub Pages) lewat _sumber/build.py:
//   <script src="https://bayar.pilarmas.online/bayar/tombol-bayar.js" defer></script>
(function () {
  var me = document.currentScript && document.currentScript.src;
  var PAY = me ? new URL(me).origin : 'https://bayar.pilarmas.online';
  var NAMA_KE_KODE = {
    'Kue ulang tahun 18 cm': 'kue18', 'Kue karakter atau 2 tingkat': 'kueKarakter', 'Nasi box anak': 'nasiBox',
    'Goodie bag': 'goodieBag', 'Es krim cup': 'esKrim', 'Badut atau MC profesional': 'badut',
    'Dekor tema penuh': 'dekor', 'Dokumentasi foto 1 jam': 'foto', 'Photobooth dan cetak foto': 'photobooth',
    'Tambahan waktu 1 jam': 'ekstraJam'
  };
  function css(el) {
    el.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;gap:6px;margin:10px 0 0;padding:12px 22px;' +
      'border-radius:999px;background:#1d8a4e;color:#fff;font-weight:800;text-decoration:none;border:0;cursor:pointer;font-size:16px';
  }

  // 1) Kalkulator ulang tahun -> DP 50% online
  var hitung = document.getElementById('hitung');
  if (hitung && hitung.querySelector('input[name=pk]')) {
    var b = document.createElement('a');
    b.textContent = 'Bayar DP 50% online'; css(b); b.href = '#';
    b.onclick = function (e) {
      e.preventDefault();
      var pk = (hitung.querySelector('input[name=pk]:checked') || {}).value || 'reguler';
      var kids = (hitung.querySelector('input[type=range]') || {}).value || 20;
      var tambah = [].slice.call(hitung.querySelectorAll('input[name=ad]:checked'))
        .map(function (i) { return NAMA_KE_KODE[i.dataset.name]; }).filter(Boolean);
      location.href = PAY + '/bayar/?produk=dp-ulang-tahun&paket=' + pk + '&anak=' + kids + '&tambahan=' + tambah.join(',');
    };
    var kirim = [].slice.call(hitung.querySelectorAll('a,button')).filter(function (x) { return /Kirim ke admin/.test(x.textContent); })[0];
    (kirim && kirim.parentNode ? kirim.parentNode : hitung).insertBefore(b, kirim ? kirim.nextSibling : null);
  }

  // 2) Halaman Edu Wisata: tombol beli tiket & kartu langganan
  [].slice.call(document.querySelectorAll('a')).forEach(function (a) {
    if (/Beli kartu langganan/.test(a.textContent) && !a.dataset.pmPay) {
      a.dataset.pmPay = 1;
      var t = document.createElement('a'); t.textContent = 'Beli tiket online'; css(t); t.href = PAY + '/bayar/?produk=tiket-harian';
      var k = document.createElement('a'); k.textContent = 'Beli kartu 10x online'; css(k); k.href = PAY + '/bayar/?produk=kartu-10x';
      k.style.marginLeft = '8px';
      var wrap = document.createElement('div'); wrap.appendChild(t); wrap.appendChild(k);
      a.parentNode.insertBefore(wrap, a.nextSibling);
    }
  });

  // 3) Elemen bebas: <a data-bayar="tiket-harian">Bayar</a>
  [].slice.call(document.querySelectorAll('[data-bayar]')).forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); location.href = PAY + '/bayar/?produk=' + encodeURIComponent(el.dataset.bayar); });
  });
})();

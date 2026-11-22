// Uji end-to-end lokal dengan DOKU tiruan.
process.env.DOKU_CLIENT_ID = 'BRN-TEST-1'; process.env.DOKU_SECRET_KEY = 'SK-test-secret';
process.env.DOKU_BASE_URL = 'http://127.0.0.1:9099'; process.env.ADMIN_TOKEN = 'admintoken123'; process.env.RATE_MAX = '100';
process.env.DATA_DIR = require('fs').mkdtempSync('/tmp/pay-'); process.env.PORT = '18088'; process.env.PUBLIC_BASE = 'https://bayar.pilarmas.online';
const http = require('http'); const assert = require('assert'); const crypto = require('crypto');
const doku = require('../doku');
let lastCheckout = null, statusReply = { transaction: { status: 'PENDING' } };
const mock = http.createServer((req, res) => {
  let b = ''; req.on('data', c => b += c); req.on('end', () => {
    // verifikasi signature request kita dengan rumus yang sama
    const exp = doku.signature({ clientId: req.headers['client-id'], requestId: req.headers['request-id'], timestamp: req.headers['request-timestamp'], target: req.url, body: req.method === 'POST' ? b : undefined });
    assert.strictEqual(req.headers['signature'], exp, 'signature request ke DOKU');
    assert.match(req.headers['request-timestamp'], /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    if (req.url === '/checkout/v1/payment') { lastCheckout = JSON.parse(b); res.end(JSON.stringify({ response: { payment: { url: 'https://sandbox.doku.com/checkout/link/abc', token_id: 't' } } })); }
    else if (req.url.startsWith('/orders/v1/status/')) res.end(JSON.stringify(statusReply));
    else { res.statusCode = 404; res.end('{}'); }
  });
}).listen(9099);
const { server, db } = require('../server');
server.listen(18088);
const B = 'http://127.0.0.1:18088';
const j = async (p, o) => { const r = await fetch(B + p, o); return { s: r.status, b: await r.json() }; };
const post = (p, body, h = {}) => j(p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...h }, body: JSON.stringify(body) });

function signedNotify(body, secret = 'SK-test-secret') {
  const raw = JSON.stringify(body); const rid = crypto.randomUUID(); const ts = new Date().toISOString().replace(/\.\d+Z/, 'Z');
  const comp = `Client-Id:BRN-TEST-1\nRequest-Id:${rid}\nRequest-Timestamp:${ts}\nRequest-Target:/api/pay/doku/notify\nDigest:${crypto.createHash('sha256').update(raw).digest('base64')}`;
  const sig = 'HMACSHA256=' + crypto.createHmac('sha256', secret).update(comp).digest('base64');
  return fetch(B + '/api/pay/doku/notify', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Client-Id': 'BRN-TEST-1', 'Request-Id': rid, 'Request-Timestamp': ts, 'Signature': sig }, body: raw });
}

(async () => {
  const cust = { name: 'Budi', phone: '0812 3456 7890' };
  // 1. tiket
  let r = await post('/api/pay/checkout', { produk: 'tiket-harian', data: { jumlah: 3 }, customer: cust });
  assert.strictEqual(r.s, 200, JSON.stringify(r.b)); assert.strictEqual(r.b.amount, 60000);
  assert.strictEqual(lastCheckout.order.amount, 60000);
  assert.strictEqual(lastCheckout.additional_info.override_notification_url, 'https://bayar.pilarmas.online/api/pay/doku/notify');
  assert.strictEqual(lastCheckout.customer.phone, '6281234567890');
  const sumItems = lastCheckout.order.line_items.reduce((a, i) => a + i.price * i.quantity, 0);
  assert.strictEqual(sumItems, 60000);
  const inv = r.b.invoice; console.log('✓ checkout tiket', inv);

  // 2. ulang tahun Sabtu reguler 25 anak + kue18 + goodie => (95000*25 + 185000 + 10000*25)/2
  const sab = new Date(Date.now() + 10 * 864e5); while (sab.getUTCDay() !== 6) sab.setUTCDate(sab.getUTCDate() + 1);
  const tglSab = sab.toISOString().slice(0, 10);
  r = await post('/api/pay/checkout', { produk: 'dp-ulang-tahun', data: { paket: 'reguler', anak: 25, tanggal: tglSab, tambahan: ['kue18', 'goodieBag'] }, customer: cust, return_url: 'https://pilarmas.online/ulang-tahun.html?x=1' });
  assert.ok(lastCheckout.order.callback_url.startsWith('https://pilarmas.online/ulang-tahun.html#pm=PM-'), lastCheckout.order.callback_url);
  assert.strictEqual(r.b.total, 95000 * 25 + 185000 + 250000); assert.strictEqual(r.b.amount, Math.ceil(r.b.total / 2));
  console.log('✓ DP ulang tahun', r.b.amount, 'dari', r.b.total, '-> kembali ke', lastCheckout.order.callback_url);
  // aturan tanggal: Hemat di hari Sabtu ditolak, Jumat ditolak
  r = await post('/api/pay/checkout', { produk: 'dp-ulang-tahun', data: { paket: 'hemat', anak: 20, tanggal: tglSab }, customer: cust });
  assert.strictEqual(r.s, 400); console.log('✓ Hemat di akhir pekan ditolak:', r.b.error);
  const jum = new Date(sab); jum.setUTCDate(jum.getUTCDate() - 1);
  r = await post('/api/pay/checkout', { produk: 'arisan-santai', data: { jumlah: 15, tanggal: jum.toISOString().slice(0, 10) }, customer: cust });
  assert.strictEqual(r.s, 400); console.log('✓ Jumat ditolak:', r.b.error);
  const kam = new Date(sab); kam.setUTCDate(kam.getUTCDate() - 2);
  r = await post('/api/pay/checkout', { produk: 'arisan-santai', data: { jumlah: 20, tanggal: kam.toISOString().slice(0, 10) }, customer: cust });
  assert.strictEqual(r.b.amount, 450000); assert.strictEqual(r.b.total, 900000); console.log('✓ arisan santai 20 orang DP', r.b.amount);
  r = await post('/api/pay/checkout', { produk: 'arisan-santai', data: { jumlah: 10, tanggal: kam.toISOString().slice(0, 10) }, customer: cust });
  assert.strictEqual(r.s, 400); console.log('✓ minimal peserta:', r.b.error);
  // CORS dari pilarmas.online, ditolak dari domain lain
  let c = await fetch(B + '/api/pay/katalog', { headers: { Origin: 'https://pilarmas.online' } });
  assert.strictEqual(c.headers.get('access-control-allow-origin'), 'https://pilarmas.online');
  c = await fetch(B + '/api/pay/katalog', { headers: { Origin: 'https://evil.example' } });
  assert.strictEqual(c.headers.get('access-control-allow-origin'), null);
  c = await fetch(B + '/api/pay/checkout', { method: 'OPTIONS', headers: { Origin: 'https://pilarmas.online' } });
  assert.strictEqual(c.status, 204); console.log('✓ CORS hanya untuk pilarmas.online');
  // harga dari browser diabaikan
  r = await post('/api/pay/checkout', { produk: 'tiket-harian', data: { jumlah: 1, amount: 1 }, customer: cust });
  assert.strictEqual(r.b.amount, 20000); console.log('✓ nominal dari browser diabaikan');
  // validasi
  r = await post('/api/pay/checkout', { produk: 'tiket-harian', data: { jumlah: 1 }, customer: { name: 'x', phone: '123' } });
  assert.strictEqual(r.s, 400); console.log('✓ validasi pelanggan');

  // 3. notifikasi palsu ditolak
  let n = await signedNotify({ order: { invoice_number: inv, amount: 60000 }, transaction: { status: 'SUCCESS' } }, 'SK-salah');
  assert.strictEqual(n.status, 401); assert.strictEqual((await j('/api/pay/order/' + inv)).b.status, 'PENDING');
  console.log('✓ notifikasi signature palsu ditolak');
  // nominal beda -> REVIEW
  const r2 = await post('/api/pay/checkout', { produk: 'tiket-harian', data: { jumlah: 2 }, customer: cust });
  n = await signedNotify({ order: { invoice_number: r2.b.invoice, amount: 1000 }, transaction: { status: 'SUCCESS' } });
  assert.strictEqual(n.status, 200); assert.strictEqual((await j('/api/pay/order/' + r2.b.invoice)).b.status, 'REVIEW');
  console.log('✓ nominal tidak cocok -> REVIEW');
  // asli -> PAID, ganda aman
  n = await signedNotify({ order: { invoice_number: inv, amount: 60000 }, transaction: { status: 'SUCCESS' }, channel: { id: 'VIRTUAL_ACCOUNT_BRI' } });
  assert.strictEqual(n.status, 200);
  n = await signedNotify({ order: { invoice_number: inv, amount: 60000 }, transaction: { status: 'SUCCESS' }, channel: { id: 'VIRTUAL_ACCOUNT_BRI' } });
  let o = (await j('/api/pay/order/' + inv)).b;
  assert.strictEqual(o.status, 'PAID'); assert.strictEqual(o.channel, 'VIRTUAL_ACCOUNT_BRI'); assert.strictEqual(o.payment_url, null);
  console.log('✓ notifikasi asli -> LUNAS (ganda aman)');

  // 4. tagihan admin + check status fallback
  r = await post('/api/pay/admin/tagihan', { amount: 300000, judul: 'Les renang Desember', divisi: 'edu', customer: cust });
  assert.strictEqual(r.s, 401);
  r = await post('/api/pay/admin/tagihan', { amount: 300000, judul: 'Les renang Desember', divisi: 'edu', customer: cust }, { 'X-Admin-Token': 'admintoken123' });
  assert.strictEqual(r.s, 200); const tinv = r.b.invoice; assert.ok(r.b.link.startsWith('https://pilarmas.online/#pm=')); console.log('✓ tagihan admin', r.b.link);
  r = await post(`/api/pay/order/${tinv}/bayar`, {});
  assert.strictEqual(r.s, 200); assert.strictEqual(lastCheckout.order.invoice_number, tinv);
  // ekspirasi -> bayar ulang memakai invoice turunan
  db.prepare("UPDATE orders SET expired_at='2000-01-01T00:00:00Z', created_at='2000-01-01T00:00:00Z' WHERE invoice=?").run(tinv);
  o = (await j('/api/pay/order/' + tinv)).b; assert.strictEqual(o.status, 'EXPIRED');
  r = await post(`/api/pay/order/${tinv}/bayar`, {});
  assert.strictEqual(lastCheckout.order.invoice_number, tinv + '-R2'); console.log('✓ link kedaluwarsa -> VA baru', tinv + '-R2');
  // check status SUCCESS untuk invoice turunan
  db.prepare("UPDATE orders SET created_at='2000-01-01T00:00:00Z' WHERE invoice=?").run(tinv);
  statusReply = { order: { invoice_number: tinv + '-R2', amount: 300000 }, transaction: { status: 'SUCCESS' }, channel: { id: 'VIRTUAL_ACCOUNT_BNI' } };
  o = (await j('/api/pay/order/' + tinv)).b; assert.strictEqual(o.status, 'PAID'); console.log('✓ check status API -> LUNAS');

  r = await j('/api/pay/admin/orders', { headers: { 'X-Admin-Token': 'admintoken123' } });
  console.log('✓ daftar admin', r.b.length, 'order:', r.b.map(x => x.status).join(','));
  const pg = await fetch(B + '/bayar/'); assert.strictEqual(pg.status, 200);
  assert.strictEqual((await fetch(B + '/bayar/../server.js')).status, 404);
  console.log('✓ halaman statis & path traversal aman');
  console.log('\nSEMUA TES LULUS'); process.exit(0);
})().catch(e => { console.error('GAGAL', e); process.exit(1); });

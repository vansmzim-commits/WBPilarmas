// Pilarmas Pay — layanan pembayaran DOKU untuk pilarmas.online
// Tanpa dependensi npm: node:http + node:sqlite (Node >= 22.13).
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const doku = require('./doku');
const { hitung, PRODUK, ULTAH_PAKET, ULTAH_TAMBAHAN } = require('./catalog');

const PORT = Number(process.env.PORT || 8088);
const PUBLIC_BASE = (process.env.PUBLIC_BASE || 'https://bayar.pilarmas.online').replace(/\/$/, '');
const NOTIFY_PATH = '/api/pay/doku/notify';
const SITE_BASE = (process.env.SITE_BASE || 'https://pilarmas.online').replace(/\/$/, '');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://pilarmas.online,https://www.pilarmas.online')
  .split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean).concat(PUBLIC_BASE);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const HOOK_URL = process.env.HOOK_URL || '';
const HOOK_SECRET = process.env.HOOK_SECRET || '';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'pay.db'));
db.exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS orders (
  invoice TEXT PRIMARY KEY,
  produk TEXT NOT NULL,
  divisi TEXT NOT NULL,
  judul TEXT NOT NULL,
  catatan TEXT,
  amount INTEGER NOT NULL,
  total INTEGER,
  data_json TEXT,
  cust_name TEXT, cust_phone TEXT, cust_email TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  payment_url TEXT,
  doku_invoice TEXT,
  attempts INTEGER DEFAULT 0,
  expired_at TEXT,
  channel TEXT,
  paid_at TEXT,
  last_check_at TEXT,
  hook_sent INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_doku ON orders(doku_invoice);
CREATE TABLE IF NOT EXISTS notif_log (
  request_id TEXT PRIMARY KEY,
  invoice TEXT,
  verified INTEGER,
  body TEXT,
  received_at TEXT
);
`);

const now = () => new Date().toISOString();
const getOrder = db.prepare('SELECT * FROM orders WHERE invoice = ?');
const getByDoku = db.prepare('SELECT * FROM orders WHERE doku_invoice = ? OR invoice = ? LIMIT 1');

function newInvoice() {
  const d = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '');
  const rnd = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `PM-${d}-${rnd}`;
}

// ---------- util HTTP ----------
function send(res, code, obj, headers = {}) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': typeof obj === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('Body terlalu besar')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const raw = await readBody(req);
  try { return JSON.parse(raw || '{}'); } catch { throw Object.assign(new Error('JSON tidak valid'), { status: 400 }); }
}

const hits = new Map();
function rateLimit(req, max = 10, windowMs = 10 * 60e3) {
  const ip = (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const t = Date.now();
  const list = (hits.get(ip) || []).filter((x) => t - x < windowMs);
  list.push(t); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length <= max;
}

function isAdmin(req) {
  if (!ADMIN_TOKEN) return false;
  const got = Buffer.from(String(req.headers['x-admin-token'] || ''));
  const exp = Buffer.from(ADMIN_TOKEN);
  return got.length === exp.length && crypto.timingSafeEqual(got, exp);
}

function cleanCustomer(c = {}) {
  const name = String(c.name || '').trim().slice(0, 60);
  let phone = String(c.phone || '').replace(/[^\d]/g, '');
  if (phone.startsWith('0')) phone = '62' + phone.slice(1);
  const email = String(c.email || '').trim().slice(0, 100);
  if (name.length < 2) throw Object.assign(new Error('Isi nama pemesan'), { status: 400 });
  if (!/^62\d{8,13}$/.test(phone)) throw Object.assign(new Error('Nomor WhatsApp tidak valid'), { status: 400 });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw Object.assign(new Error('Email tidak valid'), { status: 400 });
  return { name, phone, email };
}

const publicView = (o) => o && ({
  invoice: o.invoice, judul: o.judul, catatan: o.catatan, amount: o.amount, total: o.total,
  status: o.status, payment_url: o.status === 'PENDING' ? o.payment_url : null,
  expired_at: o.expired_at, paid_at: o.paid_at, channel: o.channel,
  nama: o.cust_name,
});

// ---------- hook ke n8n / Pilarmas One saat lunas ----------
async function fireHook(invoice) {
  if (!HOOK_URL) return;
  const o = getOrder.get(invoice);
  if (!o || o.status !== 'PAID' || o.hook_sent) return;
  const body = JSON.stringify({ event: 'payment.paid', order: { ...o, data: JSON.parse(o.data_json || '{}') } });
  const sig = crypto.createHmac('sha256', HOOK_SECRET).update(body).digest('hex');
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(HOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Pilarmas-Signature': sig }, body, signal: AbortSignal.timeout(15000) });
      if (r.ok) { db.prepare('UPDATE orders SET hook_sent=1 WHERE invoice=?').run(invoice); return; }
    } catch (e) { console.error('hook gagal', invoice, e.message); }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
}

// ---------- tandai lunas (dipakai notifikasi & cek status) ----------
function markPaid(dokuInvoice, amount, channel, source) {
  const o = getByDoku.get(dokuInvoice, dokuInvoice);
  if (!o) return { ok: false, reason: 'invoice tidak ditemukan' };
  const invoice = o.invoice;
  if (Number(amount) !== o.amount) {
    console.error(`[${source}] NOMINAL TIDAK COCOK ${dokuInvoice}: DOKU=${amount} order=${o.amount}`);
    db.prepare("UPDATE orders SET status='REVIEW', updated_at=? WHERE invoice=? AND status!='PAID'").run(now(), invoice);
    return { ok: false, reason: 'nominal tidak cocok' };
  }
  if (o.status === 'PAID') return { ok: true, already: true };
  db.prepare("UPDATE orders SET status='PAID', paid_at=?, channel=COALESCE(?,channel), updated_at=? WHERE invoice=?")
    .run(now(), channel || null, now(), invoice);
  console.log(`[${source}] LUNAS ${invoice} Rp${amount} via ${channel}`);
  fireHook(invoice).catch(() => {});
  return { ok: true };
}

// Halaman tujuan setelah bayar: kembali ke halaman asal di website (bukan link baru)
function safeReturn(u) {
  try {
    const x = new URL(String(u || ''));
    if (ALLOWED_ORIGINS.includes(x.origin)) return x.origin + x.pathname;
  } catch {}
  return SITE_BASE + '/';
}

// ---------- buat checkout DOKU untuk order ----------
// Nomor invoice Pilarmas tetap. Bila link lama kedaluwarsa, DOKU diberi nomor turunan
// (PM-...-R2) karena DOKU menolak invoice_number yang sama dua kali.
async function startCheckout(o, returnUrl) {
  if (o.status === 'PENDING' && o.payment_url && o.expired_at && new Date(o.expired_at) > new Date(Date.now() + 5 * 60e3)) {
    return o.payment_url;
  }
  const due = PRODUK[o.produk]?.mode === 'lunas' ? 180 : 1440;
  const data = JSON.parse(o.data_json || '{}');
  const items = data._items || [{ name: o.judul.slice(0, 255), price: o.amount, quantity: 1 }];
  const attempt = (o.attempts || 0) + 1;
  const dokuInv = attempt === 1 ? o.invoice : `${o.invoice}-R${attempt}`;
  db.prepare('UPDATE orders SET attempts=?, updated_at=? WHERE invoice=?').run(attempt, now(), o.invoice);
  const r = await doku.createCheckout({
    invoice: dokuInv,
    amount: o.amount,
    items,
    customer: { name: o.cust_name, phone: o.cust_phone, email: o.cust_email },
    callbackUrl: `${safeReturn(returnUrl)}#pm=${encodeURIComponent(o.invoice)}`,
    notifyUrl: PUBLIC_BASE + NOTIFY_PATH,
    dueMinutes: due,
  });
  const url = r?.response?.payment?.url;
  if (!url) throw new Error('DOKU tidak mengembalikan URL pembayaran');
  const exp = new Date(Date.now() + due * 60e3).toISOString();
  db.prepare("UPDATE orders SET status='PENDING', payment_url=?, doku_invoice=?, expired_at=?, last_check_at=NULL, updated_at=? WHERE invoice=?")
    .run(url, dokuInv, exp, now(), o.invoice);
  return url;
}

// ---------- cek status ke DOKU bila masih pending ----------
async function refreshStatus(o) {
  if (!o || o.status !== 'PENDING') return o;
  const age = Date.now() - new Date(o.created_at).getTime();
  const last = o.last_check_at ? Date.now() - new Date(o.last_check_at).getTime() : Infinity;
  if (age < 60e3 || last < 30e3) return o;
  db.prepare('UPDATE orders SET last_check_at=? WHERE invoice=?').run(now(), o.invoice);
  try {
    const r = await doku.checkStatus(o.doku_invoice || o.invoice);
    const st = r?.transaction?.status;
    if (st === 'SUCCESS') markPaid(o.doku_invoice || o.invoice, r?.order?.amount, r?.channel?.id || r?.service?.id, 'check-status');
    else if (st === 'EXPIRED') db.prepare("UPDATE orders SET status='EXPIRED', updated_at=? WHERE invoice=? AND status='PENDING'").run(now(), o.invoice);
  } catch (e) {
    if (e.dokuStatus !== 404) console.error('check status', o.invoice, e.message);
  }
  const fresh = getOrder.get(o.invoice);
  if (fresh.status === 'PENDING' && fresh.expired_at && new Date(fresh.expired_at) < new Date()) {
    db.prepare("UPDATE orders SET status='EXPIRED', updated_at=? WHERE invoice=?").run(now(), o.invoice);
    return getOrder.get(o.invoice);
  }
  return fresh;
}

// ---------- static ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
function serveStatic(req, res, p) {
  let rel = p.replace(/^\/bayar\/?/, '') || 'index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, { error: 'Tidak ditemukan' });
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}

// ---------- router ----------
async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  const m = req.method;

  // CORS: widget di pilarmas.online memanggil API ini langsung
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin) && p.startsWith('/api/pay/') && !p.startsWith('/api/pay/admin/') && p !== NOTIFY_PATH) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (m === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (m === 'GET' && p === '/') { res.writeHead(302, { Location: '/bayar/' }); return res.end(); }
  if (m === 'GET' && (p === '/bayar' || p.startsWith('/bayar/'))) return serveStatic(req, res, p);
  if (p === '/api/pay/health') return send(res, 200, { ok: true, env: process.env.DOKU_ENV || 'sandbox', methods: doku.PAYMENT_METHODS.length });

  if (m === 'GET' && p === '/api/pay/katalog') {
    return send(res, 200, { env: process.env.DOKU_ENV || 'sandbox', produk: PRODUK, ultah_paket: ULTAH_PAKET, ultah_tambahan: ULTAH_TAMBAHAN });
  }

  // Pelanggan memesan produk berharga tetap
  if (m === 'POST' && p === '/api/pay/checkout') {
    if (!rateLimit(req, Number(process.env.RATE_MAX || 15))) return send(res, 429, { error: 'Terlalu banyak percobaan, coba lagi nanti' });
    const b = await readJson(req);
    const customer = cleanCustomer(b.customer);
    let calc;
    try { calc = hitung(String(b.produk || ''), b.data || {}); }
    catch (e) { return send(res, 400, { error: e.message }); }
    const invoice = newInvoice();
    const data = { ...(b.data || {}), _items: calc.items };
    db.prepare(`INSERT INTO orders (invoice,produk,divisi,judul,catatan,amount,total,data_json,cust_name,cust_phone,cust_email,status,created_by,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,'OPEN','web',?,?)`)
      .run(invoice, b.produk, calc.divisi, calc.judul, calc.catatan || null, calc.amount, calc.total || calc.amount,
        JSON.stringify(data), customer.name, customer.phone, customer.email || null, now(), now());
    const payment_url = await startCheckout(getOrder.get(invoice), b.return_url);
    return send(res, 200, { invoice, amount: calc.amount, total: calc.total || calc.amount, payment_url });
  }

  // Detail & status order (publik, data terbatas)
  let mm;
  if (m === 'GET' && (mm = p.match(/^\/api\/pay\/order\/(PM-\d{8}-[0-9A-F]{6})$/))) {
    const o = await refreshStatus(getOrder.get(mm[1]));
    if (!o) return send(res, 404, { error: 'Tagihan tidak ditemukan' });
    return send(res, 200, publicView(o));
  }

  // Pelanggan membayar tagihan yang dibuat admin
  if (m === 'POST' && (mm = p.match(/^\/api\/pay\/order\/(PM-\d{8}-[0-9A-F]{6})\/bayar$/))) {
    if (!rateLimit(req, Number(process.env.RATE_MAX || 15))) return send(res, 429, { error: 'Terlalu banyak percobaan' });
    const b = await readJson(req).catch(() => ({}));
    const o = getOrder.get(mm[1]);
    if (!o) return send(res, 404, { error: 'Tagihan tidak ditemukan' });
    if (o.status === 'PAID') return send(res, 409, { error: 'Tagihan sudah lunas' });
    if (o.status === 'REVIEW') return send(res, 409, { error: 'Tagihan sedang dicek admin' });
    const payment_url = await startCheckout(o, b.return_url);
    return send(res, 200, { invoice: o.invoice, payment_url });
  }

  // Notifikasi dari DOKU
  if (m === 'POST' && p === NOTIFY_PATH) {
    const raw = await readBody(req, 256 * 1024);
    const v = doku.verifyNotification(req.headers, raw, NOTIFY_PATH);
    const rid = String(req.headers['request-id'] || crypto.randomUUID());
    let body = {}; try { body = JSON.parse(raw); } catch {}
    const inv = body?.order?.invoice_number || null;
    try {
      db.prepare('INSERT INTO notif_log (request_id,invoice,verified,body,received_at) VALUES (?,?,?,?,?)')
        .run(v.ok ? rid : `BAD-${crypto.randomUUID()}`, inv, v.ok ? 1 : 0, raw.slice(0, 20000), now());
    } catch { /* request_id sama = notifikasi ganda */ }
    if (!v.ok) { console.warn('Notifikasi DITOLAK:', v.reason, inv); return send(res, 401, { error: 'invalid signature' }); }
    const st = body?.transaction?.status;
    if (inv && st === 'SUCCESS') {
      markPaid(inv, body?.order?.amount, body?.channel?.id || body?.service?.id, 'notify');
    }
    // status FAILED diabaikan untuk Checkout (sesuai panduan DOKU)
    return send(res, 200, { ok: true });
  }

  // ---- Admin ----
  if (p.startsWith('/api/pay/admin/')) {
    if (!isAdmin(req)) return send(res, 401, { error: 'Token admin salah' });

    if (m === 'POST' && p === '/api/pay/admin/tagihan') {
      const b = await readJson(req);
      const amount = Math.floor(Number(b.amount));
      if (!Number.isFinite(amount) || amount < 10000 || amount > 100000000) return send(res, 400, { error: 'Nominal Rp10.000 - Rp100.000.000' });
      const judul = String(b.judul || '').trim().slice(0, 200);
      if (judul.length < 3) return send(res, 400, { error: 'Isi keterangan tagihan' });
      const divisi = ['edu', 'hydro', 'globe', 'hdstar', 'hospitality', 'pusat'].includes(b.divisi) ? b.divisi : 'edu';
      const customer = cleanCustomer(b.customer);
      const invoice = newInvoice();
      db.prepare(`INSERT INTO orders (invoice,produk,divisi,judul,catatan,amount,total,data_json,cust_name,cust_phone,cust_email,status,created_by,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,'OPEN','admin',?,?)`)
        .run(invoice, 'tagihan', divisi, judul, String(b.catatan || '').slice(0, 500) || null, amount, amount,
          '{}', customer.name, customer.phone, customer.email || null, now(), now());
      return send(res, 200, { invoice, link: `${SITE_BASE}/#pm=${invoice}` });
    }

    if (m === 'GET' && p === '/api/pay/admin/orders') {
      const st = url.searchParams.get('status');
      const rows = st
        ? db.prepare('SELECT * FROM orders WHERE status=? ORDER BY created_at DESC LIMIT 300').all(st)
        : db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 300').all();
      return send(res, 200, rows.map(({ data_json, ...r }) => r));
    }

    if (m === 'POST' && (mm = p.match(/^\/api\/pay\/admin\/cek\/(PM-\d{8}-[0-9A-F]{6})$/))) {
      const o = getOrder.get(mm[1]);
      if (!o) return send(res, 404, { error: 'Tidak ditemukan' });
      try { return send(res, 200, await doku.checkStatus(o.doku_invoice || o.invoice)); }
      catch (e) { return send(res, 502, { error: e.message }); }
    }
  }

  return send(res, 404, { error: 'Tidak ditemukan' });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    if (e.dokuStatus || !e.status) console.error(e.message || e);
    if (res.headersSent) return;
    if (e.dokuStatus || /DOKU/.test(e.message)) return send(res, 502, { error: 'Pembayaran online sedang tidak tersedia. Silakan coba lagi nanti atau chat admin.' });
    send(res, e.status || 500, { error: e.status ? e.message : 'Terjadi kesalahan, coba lagi atau hubungi admin' });
  });
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Pilarmas Pay jalan di :${PORT} (${process.env.DOKU_ENV || 'sandbox'})`));
}
module.exports = { server, db };

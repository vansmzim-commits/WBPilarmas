// Klien DOKU Checkout (Non-SNAP) + verifikasi signature notifikasi.
'use strict';
const crypto = require('node:crypto');

const BASE = process.env.DOKU_BASE_URL || (process.env.DOKU_ENV === 'production'
  ? 'https://api.doku.com'
  : 'https://api-sandbox.doku.com');
const CLIENT_ID = process.env.DOKU_CLIENT_ID || '';
const SECRET = process.env.DOKU_SECRET_KEY || '';

const digest = (body) => crypto.createHash('sha256').update(body, 'utf8').digest('base64');

function signature({ clientId, requestId, timestamp, target, body }) {
  let comp = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${target}`;
  if (body !== undefined && body !== null) comp += `\nDigest:${digest(body)}`;
  return 'HMACSHA256=' + crypto.createHmac('sha256', SECRET).update(comp).digest('base64');
}

const nowUtc = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

async function call(method, target, payload) {
  if (!CLIENT_ID || !SECRET) throw new Error('DOKU_CLIENT_ID / DOKU_SECRET_KEY belum diisi');
  const body = payload ? JSON.stringify(payload) : undefined;
  const requestId = crypto.randomUUID();
  const timestamp = nowUtc();
  const headers = {
    'Client-Id': CLIENT_ID,
    'Request-Id': requestId,
    'Request-Timestamp': timestamp,
    'Signature': signature({ clientId: CLIENT_ID, requestId, timestamp, target, body }),
  };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + target, { method, headers, body, signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`DOKU ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status; err.body = json; throw err;
  }
  return json;
}

const PAYMENT_METHODS = (process.env.DOKU_METHODS ||
  'VIRTUAL_ACCOUNT_BRI,VIRTUAL_ACCOUNT_BNI,VIRTUAL_ACCOUNT_BANK_MANDIRI,VIRTUAL_ACCOUNT_BANK_PERMATA,' +
  'VIRTUAL_ACCOUNT_BANK_CIMB,VIRTUAL_ACCOUNT_BANK_DANAMON,VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI,' +
  'VIRTUAL_ACCOUNT_BTN,VIRTUAL_ACCOUNT_DOKU,QRIS').split(',').map(s => s.trim()).filter(Boolean);

/** Membuat halaman pembayaran DOKU Checkout. Tiap invoice mendapat VA sendiri. */
function createCheckout({ invoice, amount, items, customer, callbackUrl, notifyUrl, dueMinutes }) {
  const payload = {
    order: {
      amount,
      invoice_number: invoice,
      currency: 'IDR',
      callback_url: callbackUrl,
      callback_url_cancel: callbackUrl,
      auto_redirect: true,
      line_items: items,
    },
    payment: {
      payment_due_date: dueMinutes,
      payment_method_types: PAYMENT_METHODS,
    },
    customer: {
      id: customer.phone,
      name: customer.name,
      phone: customer.phone,
      ...(customer.email ? { email: customer.email } : {}),
    },
    additional_info: { override_notification_url: notifyUrl },
  };
  return call('POST', '/checkout/v1/payment', payload);
}

/** Tanya status langsung ke DOKU (pengaman kedua). */
function checkStatus(invoice) {
  return call('GET', `/orders/v1/status/${encodeURIComponent(invoice)}`);
}

/** Verifikasi notifikasi dari DOKU. headers = objek header lowercase (Node). */
function verifyNotification(headers, rawBody, target) {
  const clientId = headers['client-id'];
  const requestId = headers['request-id'];
  const timestamp = headers['request-timestamp'];
  const sig = headers['signature'];
  if (!clientId || !requestId || !timestamp || !sig) return { ok: false, reason: 'header tidak lengkap' };
  if (clientId !== CLIENT_ID) return { ok: false, reason: 'Client-Id tidak cocok' };
  const expected = signature({ clientId, requestId, timestamp, target, body: rawBody });
  const a = Buffer.from(expected), b = Buffer.from(String(sig));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, reason: 'signature salah' };
  return { ok: true, requestId };
}

module.exports = { createCheckout, checkStatus, verifyNotification, signature, digest, BASE, PAYMENT_METHODS };

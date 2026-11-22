#!/usr/bin/env bash
# Pilarmas Pay: pemasangan di VPS (sekali jalan, aman dijalankan ulang untuk update).
#   bash <(curl -fsSL https://raw.githubusercontent.com/vansmzim-commits/WBPilarmas/main/_pembayaran/install.sh)
# Kode diambil dari GitHub ke /opt/pilarmas-pay. File .env & data tidak pernah ditimpa.
set -euo pipefail
NAME=pilarmas-pay
APP_DIR=/opt/pilarmas-pay
REPO_TGZ=https://codeload.github.com/vansmzim-commits/WBPilarmas/tar.gz/refs/heads/main
PAY_DOMAIN=${PAY_DOMAIN:-bayar.pilarmas.online}

say(){ printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn(){ printf '\033[1;33m[!] %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Jalankan sebagai root"; exit 1; }
command -v docker >/dev/null || { echo "Docker belum terpasang"; exit 1; }

# 1) Ambil kode terbaru dari GitHub
say "Mengambil kode dari GitHub"
TMP=$(mktemp -d)
curl -fsSL "$REPO_TGZ" | tar xz -C "$TMP"
SRC=$(find "$TMP" -maxdepth 2 -type d -name _pembayaran | head -1)
[ -n "$SRC" ] || { echo "Folder _pembayaran tidak ditemukan di repo"; exit 1; }
mkdir -p "$APP_DIR"
cp -r "$SRC"/. "$APP_DIR"/
rm -rf "$TMP"
cd "$APP_DIR"

# 2) .env (hanya dibuat sekali)
if [ ! -f .env ]; then
  say "Membuat .env"
  cp .env.example .env
  read -rp "DOKU Client ID (kosongkan bila belum ada): " CID </dev/tty || CID=
  read -rsp "DOKU Secret Key (kosongkan bila belum ada): " SK </dev/tty || SK=; echo
  read -rp "Mode [sandbox/production] (default sandbox): " ENVV </dev/tty || ENVV=; ENVV=${ENVV:-sandbox}
  ADM=$(head -c 32 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 28)
  sed -i "s|^DOKU_ENV=.*|DOKU_ENV=$ENVV|; s|^DOKU_CLIENT_ID=.*|DOKU_CLIENT_ID=$CID|; s|^DOKU_SECRET_KEY=.*|DOKU_SECRET_KEY=$SK|; s|^ADMIN_TOKEN=.*|ADMIN_TOKEN=$ADM|; s|^PUBLIC_BASE=.*|PUBLIC_BASE=https://$PAY_DOMAIN|" .env
  chmod 600 .env
  echo "Token admin: $ADM"
fi

# 3) Container
say "Build & jalankan container"
docker build -q -t $NAME:latest . >/dev/null
docker volume create ${NAME}-data >/dev/null
docker rm -f $NAME >/dev/null 2>&1 || true
docker run -d --name $NAME --restart unless-stopped --env-file .env \
  -p 127.0.0.1:8088:8088 -v ${NAME}-data:/app/data $NAME:latest >/dev/null
for i in 1 2 3 4 5 6 7 8 9 10; do curl -fsS http://127.0.0.1:8088/api/pay/health >/dev/null 2>&1 && break; sleep 1; done
curl -fsS http://127.0.0.1:8088/api/pay/health && echo || { docker logs --tail 30 $NAME; exit 1; }

# 4) Nginx + SSL untuk subdomain pembayaran
say "Nginx untuk $PAY_DOMAIN"
DNS_IP=$(getent ahostsv4 "$PAY_DOMAIN" | awk 'NR==1{print $1}' || true)
MY_IPS=" $(hostname -I) "
if ! command -v nginx >/dev/null; then
  warn "Nginx tidak ada di host (mungkin di dalam Docker). Arahkan $PAY_DOMAIN ke 127.0.0.1:8088 secara manual."
elif [ -z "$DNS_IP" ] || [[ "$MY_IPS" != *" $DNS_IP "* ]]; then
  warn "DNS $PAY_DOMAIN belum mengarah ke server ini (sekarang: ${DNS_IP:-tidak ada})."
  warn "Tambahkan record A: bayar -> $(hostname -I | awk '{print $1}') di pengelola DNS, tunggu 5-30 menit, lalu jalankan ulang perintah install."
else
  SITE=/etc/nginx/sites-available/$NAME
  if [ ! -f "$SITE" ]; then
    cat > "$SITE" <<NGX
server {
    listen 80;
    server_name $PAY_DOMAIN;
    client_max_body_size 256k;
    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
NGX
    ln -sf "$SITE" /etc/nginx/sites-enabled/$NAME
  fi
  nginx -t && systemctl reload nginx
  if ! grep -q "ssl_certificate" "$SITE"; then
    command -v certbot >/dev/null || apt-get install -y certbot python3-certbot-nginx >/dev/null
    certbot --nginx -d "$PAY_DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect \
      || warn "certbot gagal, cek: certbot --nginx -d $PAY_DOMAIN"
  fi
  sleep 1
  curl -fsS "https://$PAY_DOMAIN/api/pay/health" && echo "  <- https OK" || warn "https://$PAY_DOMAIN belum bisa diakses"
fi

ADM=$(grep ^ADMIN_TOKEN= .env | cut -d= -f2)
cat <<EOF

SELESAI.
  Halaman bayar : https://$PAY_DOMAIN/bayar/
  Admin         : https://$PAY_DOMAIN/bayar/admin.html   token: $ADM
  Ganti kunci   : nano $APP_DIR/.env  lalu jalankan ulang perintah install
  Log           : docker logs -f $NAME
EOF

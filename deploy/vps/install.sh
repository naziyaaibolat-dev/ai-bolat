#!/usr/bin/env bash
# AI-bolat — VPS-ке (Ubuntu 22.04/24.04 немесе Debian 12) бір командамен орнату.
# Қолдану (серверде, root ретінде, жоба папкасының ішінде):
#   sudo bash deploy/vps/install.sh
# Не істейді: Docker орнатады, .env жасайды (сұрақтар қояды), Caddy арқылы HTTPS-пен іске қосады.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "root ретінде іске қосыңыз: sudo bash deploy/vps/install.sh"; exit 1; }
SRC="$(cd "$(dirname "$0")/../.." && pwd)"; APP=/opt/ai-bolat
echo "== 1/5 Docker"
if ! command -v docker >/dev/null; then curl -fsSL https://get.docker.com | sh; fi
systemctl enable --now docker >/dev/null 2>&1 || true
echo "== 2/5 Файлдар -> $APP"
mkdir -p "$APP"; if [ "$SRC" != "$APP" ]; then cp -a "$SRC/." "$APP/"; fi; cd "$APP"; mkdir -p data
echo "== 3/5 Баптаулар (.env)"
if [ ! -f .env ]; then
  ask() { local v; read -r -p "$1: " v; echo "$v"; }
  DOMAIN=$(ask "Домен (мысалы aibolat.kz; DNS A-жазбасы осы сервердің IP-іне бағытталған болуы керек)")
  CONTACT=$(ask "Байланыс e-mail (құпиялылық саясатында көрсетіледі)")
  ORG=$(ask "Оператордың атауы (ЖК/мектеп/аты-жөні)")
  ADMINP=$(ask "Әкімші телефоны (+77XXXXXXXXX)")
  AIKEY=$(ask "AI_API_KEY (OpenAI кілті, sk-...; кейін де қосуға болады)")
  MOBI=$(ask "MOBIZON_API_KEY (кейін де қосуға болады, бос қалдыруға болады)")
  RND() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
  TOKEN=$(RND | cut -c1-24)
  cat > .env <<ENV
NODE_ENV=production
DOMAIN=$DOMAIN
PUBLIC_URL=https://$DOMAIN
DATA_DIR=/data
DATA_LOCATION=kz
APP_SECRET=$(RND)
ADMIN_SETUP_TOKEN=$TOKEN
ADMIN_PHONES=$ADMINP
CONTACT_EMAIL=$CONTACT
ORG_NAME=$ORG
AI_API_KEY=$AIKEY
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-5-mini,gpt-5-nano
SMS_PROVIDER=$( [ -n "$MOBI" ] && echo mobizon )
MOBIZON_API_KEY=$MOBI
MOBIZON_DOMAIN=api.mobizon.kz
ENV
  chmod 600 .env
  echo "   .env жасалды. Кейін өзгерту: nano $APP/.env  -> docker compose up -d"
fi
echo "== 4/5 Брандмауэр"
if command -v ufw >/dev/null; then ufw allow 22/tcp >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; ufw allow 443/udp >/dev/null; yes | ufw enable >/dev/null || true; fi
echo "== 5/5 Іске қосу"
docker compose up -d --build
# Күнделікті сыртқы көшірме: data/backups -> /root/ai-bolat-backups (сервердің өзінде; қосымша компьютерге де жүктеп алыңыз)
cat > /etc/cron.daily/ai-bolat-backup <<CRON
#!/bin/sh
mkdir -p /root/ai-bolat-backups && cp -u $APP/data/backups/*.db /root/ai-bolat-backups/ 2>/dev/null; find /root/ai-bolat-backups -name '*.db' -mtime +30 -delete
CRON
chmod +x /etc/cron.daily/ai-bolat-backup
. ./.env
echo
echo "✅ Дайын! 1–2 минуттан кейін ашыңыз: https://$DOMAIN"
echo "   Алғашқы әкімші: https://$DOMAIN/setup   токен: $ADMIN_SETUP_TOKEN"
echo "   Журнал: cd $APP && docker compose logs -f app"

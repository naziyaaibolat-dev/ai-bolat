#!/usr/bin/env bash
# Жаңарту: жаңа кодты /opt/ai-bolat ішіне көшіріңіз (git pull немесе zip), содан кейін: sudo bash deploy/vps/update.sh
set -euo pipefail; cd /opt/ai-bolat
[ -d .git ] && git pull --ff-only || true
docker compose up -d --build && docker image prune -f >/dev/null
curl -fsS "http://127.0.0.1:80" -o /dev/null -H "Host: $(grep ^DOMAIN= .env | cut -d= -f2)" && echo "✅ жаңартылды" || docker compose logs --tail 50 app

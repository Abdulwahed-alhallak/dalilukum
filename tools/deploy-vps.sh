#!/usr/bin/env bash
# deploy-vps.sh — الخيار A: النشر اليدوي على VPS (179.236.255.47)
# الاستخدام: bash tools/deploy-vps.sh    (من جذر syrialzeel أو من VPS نفسه)
# على VPS:  bash /home/dalilukum/tools/deploy-vps.sh
# محليا عبر SSH: ssh -i ~/.ssh/id_hostinger_root root@179.236.255.47 "bash /home/dalilukum/tools/deploy-vps.sh"
set -euo pipefail
ROOT="/home/dalilukum"
API="$ROOT/laravel-api"
WEB_SRC_CANDIDATES=("$ROOT/apps/dalilcom-web/dist" "$ROOT/dist")
PUBLIC_HTML="/home/dalilukum.sy/public_html"

red(){ echo -e "\033[31m$*\033[0m"; };
green(){ echo -e "\033[32m$*\033[0m"; };
yellow(){ echo -e "\033[33m$*\033[0m"; };

if [ ! -d "$ROOT/.git" ]; then red "no git at $ROOT"; exit 1; fi

echo "=== Deploy A (manual) — dalilukum.sy ==="
echo "Host: $(hostname) Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "[1/6] git pull..."
git -C "$ROOT" fetch --prune origin
git -C "$ROOT" reset --hard origin/main
git -C "$ROOT" log --oneline -3

echo "[2/6] backend: composer + migrate..."
cd "$API"
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts
php artisan migrate --force
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

echo "[3/6] frontend: npm build..."
cd "$ROOT"
npm ci --prefer-offline 2>/dev/null || npm install
npm run build:web 2>&1 | tail -30
WEB_DIST=""
for c in "${WEB_SRC_CANDIDATES[@]}"; do if [ -d "$c" ]; then WEB_DIST="$c"; break; fi; done
if [ -z "$WEB_DIST" ]; then yellow "WARN: no dist found"; else
  if [ -d "$PUBLIC_HTML" ]; then
    echo "[3b] copy $WEB_DIST -> $PUBLIC_HTML..."
    cp -a "$WEB_DIST"/* "$PUBLIC_HTML"/
  else yellow "WARN: skip web copy (no $PUBLIC_HTML)"; fi
fi

echo "[4/6] permissions..."
mkdir -p "$API/storage/framework/"{cache,sessions,views} "$API/bootstrap/cache"
chmod -R 775 "$API/storage" "$API/bootstrap/cache" || true

echo "[5/6] restart API..."
RESTARTED=""
if systemctl is-active --quiet dalilukum 2>/dev/null; then systemctl restart dalilukum && RESTARTED=dalilukum && green "restarted systemd:dalilukum"; fi
if [ -z "$RESTARTED" ] && systemctl is-active --quiet dalilukum-api 2>/dev/null; then systemctl restart dalilukum-api && RESTARTED=dalilukum-api && green "restarted systemd:dalilukum-api"; fi
if [ -z "$RESTARTED" ]; then
  echo "no systemd unit -- restart artisan serve on :8000"
  pkill -f "artisan serve.*8000" 2>/dev/null || true
  sleep 2
  nohup php "$API/artisan" serve --host=127.0.0.1 --port=8000 > /var/log/dalilukum-api.log 2>&1 &
  sleep 3
  green "artisan serve restarted"
fi
systemctl reload lsws 2>/dev/null && echo "reloaded lsws" || true

echo "[6/6] health checks..."
sleep 3
for i in 1 2 3 4 5; do if curl -sf http://127.0.0.1:8000/api/health | grep -q success; then green "OK: 127.0.0.1:8000/api/health"; break; fi; echo "retry $i/5..."; sleep 3; if [ "$i" = "5" ]; then red "WARN: local health failed"; curl -v http://127.0.0.1:8000/api/health 2>&1 | head -30; fi; done
for i in 1 2 3 4 5; do if curl -skf https://dalilukum.sy/api/health | grep -q success; then green "OK: https://dalilukum.sy/api/health"; break; fi; echo "retry public $i/5..."; sleep 3; if [ "$i" = "5" ]; then red "WARN: public health failed"; curl -skv https://dalilukum.sy/api/health 2>&1 | head -40; fi; done
curl -sk "https://dalilukum.sy/api/app/update-check?platform=android&version=18" | head -c 500; echo

green "=== Deploy A done ==="

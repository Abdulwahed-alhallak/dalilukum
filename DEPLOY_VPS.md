# نشر dalilukum.sy على السيرفر الجديد (Hostinger VPS + CyberPanel)

> السيرفر: `179.236.255.47` — KVM 8 (8 vCPU / 32GB / 400GB) — AlmaLinux 9 + CyberPanel
> الدومين: `dalilukum.sy` → سجل A → `179.236.255.47`
> المشروع: `dalilukum` — كل المراجع (مجلدات، ملفات، DB، كود، واجهات) باسم **دليلكم**
> نفس المستودع: `Abdulwahed-alhallak/dalilukum` (`main`, `v1.0.15/18`) — `/home/dalilukum` على VPS

---

## اختيار طريقة النشر — دائما خياران

> **القاعدة:** عند كل طلب نشر، اعرض للمستخدم الخيارين معا واترك له الاختيار. لا تفرض أحدهما.

| الخيار | الوصف | متى يستخدمه |
|--------|-------|--------------|
| **A — يدوي (Manual SSH)** | `bash tools/deploy-vps.sh` على VPS أو عبر SSH | تحكم كامل، فحص قبل النشر، لا يحتاج إعداد secrets |
| **B — تلقائي (GitHub Actions)** ⏸️ متوقف مؤقتا | `git push origin main` يشغل `.github/workflows/deploy-vps.yml` تلقائيا | نشر فوري بعد الدفع، يحتاج `VPS_*` secrets |

---

## الخيار A — النشر اليدوي على VPS

### على VPS مباشرة (CyberPanel → Terminal أو SSH):

```bash
bash /home/dalilukum/tools/deploy-vps.sh
```

### من جهازك المحلي عبر SSH:

```bash
ssh -i ~/.ssh/id_hostinger_root root@179.236.255.47 "bash /home/dalilukum/tools/deploy-vps.sh"
```

### ما يفعله السكربت `tools/deploy-vps.sh`:

1. `git fetch && git reset --hard origin/main` في `/home/dalilukum`
2. `composer install && php artisan migrate --force` في `laravel-api`
3. `npm ci && npm run build:web` ثم نسخ `apps/dalilcom-web/dist` → `/home/dalilukum.sy/public_html`
4. `chmod 775 storage` + `systemctl restart dalilukum` أو `artisan serve :8000` + `reload lsws`
5. `curl` فحص صحي محلي وعمومي + `update-check`

### يدوي مفصل (إذا أردت كل خطوة لوحدها):

```bash
cd /home/dalilukum && git fetch --prune origin && git reset --hard origin/main && git log --oneline -3
cd laravel-api && composer install --no-dev --optimize-autoloader --no-interaction && php artisan migrate --force
cd /home/dalilukum && npm ci && npm run build:web && cp -a apps/dalilcom-web/dist/* /home/dalilukum.sy/public_html/
mkdir -p laravel-api/storage/framework/{cache,sessions,views} laravel-api/bootstrap/cache && chmod -R 775 laravel-api/storage laravel-api/bootstrap/cache
systemctl restart dalilukum 2>/dev/null || (pkill -f "artisan serve.*8000"; nohup php laravel-api/artisan serve --host=127.0.0.1 --port=8000 > /var/log/dalilukum-api.log 2>&1 &)
systemctl reload lsws 2>/dev/null || true
curl -sf http://127.0.0.1:8000/api/health && curl -sk https://dalilukum.sy/api/health
curl -sk "https://dalilukum.sy/api/app/update-check?platform=android&version=18"
```

---

> **تنبيه — B متوقف مؤقتا:** حساب GitHub Abdulwahed-alhallak موقوف عن Actions بسبب ccount locked due to billing issue (خطة Pro).
> الحل: https://github.com/settings/billing → حدث طريقة الدفع. بعدها يعمل B تلقائيا دون أي تعديل — الـ workflow والـ secrets جاهزة.
> حتى ذلك الحين، استخدم **الخيار A** لكل نشر.

## الخيار B — النشر التلقائي عبر GitHub Actions

### التفعيل (مرة واحدة):

1. في GitHub: `Abdulwahed-alhallak/dalilukum` → **Settings → Secrets and variables → Actions** → **New repository secret**:

| Secret | القيمة | ملاحظة |
|--------|--------|---------|
| `VPS_HOST` | `179.236.255.47` |IP السيرفر |
| `VPS_USER` | `root` | |
| `VPS_PORT` | `22` | |
| `VPS_SSH_KEY` | محتوى `~/.ssh/id_hostinger_root` (المفتاح الخاص كاملا) | `cat ~/.ssh/id_hostinger_root` |

2. تأكد من أن المفتاح العام مضاف على VPS: `cat ~/.ssh/authorized_keys` يحتوي `ssh-ed25519 AAAAC3... hms.dion.sy`

3. بعد الحفظ، أي `git push origin main` سيطلق `.github/workflows/deploy-vps.yml` تلقائيا، أو شغله يدويا من **Actions → Deploy to VPS → Run workflow**.

### ما يفعله الـ workflow:

نفس خطوات الخيار A لكن عبر `appleboy/ssh-action@v1.2.0` من runner `ubuntu-latest` — نفس الأوامر الستة + فحوصات صحية.

### لقطع النشر التلقائي مؤقتا:

- احذف أو عطل `VPS_SSH_KEY` من Secrets، أو
- أضف `workflow_dispatch` فقط (احذف `push: branches: [main]`) في `.github/workflows/deploy-vps.yml`.

---

## 1) الدخول للسيرفر

**CyberPanel:**
- الرابط: `https://179.236.255.47:8090`
- المستخدم: `admin` — كلمة السر: (راجع Hostinger hPanel → VPS → Access)
- SSH: `ssh -i ~/.ssh/id_hostinger_root root@179.236.255.47` — (المفتاح المحلي `~/.ssh/id_hostinger_root`)

> إذا رفض SSH، استخدم CyberPanel → Terminal أو أضف المفتاح في Hostinger hPanel → VPS → SSH Keys.

---

## 2) إعداد PostgreSQL على السيرفر (مرة واحدة)

```bash
dnf install -y postgresql16-server postgresql16-contrib
/usr/pgsql-16/bin/postgresql-16-setup initdb
systemctl enable --now postgresql-16

sudo -u postgres psql <<''SQL''
CREATE USER dalilukum WITH PASSWORD ''CHANGE_ME_STRONG_PASSWORD'';
CREATE DATABASE dalilukum OWNER dalilukum;
GRANT ALL PRIVILEGES ON DATABASE dalilukum TO dalilukum;
\c dalilukum
GRANT ALL ON SCHEMA public TO dalilukum;
SQL

# pg_hba.conf — أضف:
# host  dalilukum  dalilukum  127.0.0.1/32  scram-sha-256
# host  dalilukum  dalilukum  ::1/128       scram-sha-256
systemctl restart postgresql-16
```

---

## 3) نشر Laravel API الأولي (مرة واحدة)

```bash
cd /home
git clone https://github.com/Abdulwahed-alhallak/dalilukum.git dalilukum
cd dalilukum/laravel-api

dnf install -y php php-pgsql php-mbstring php-xml php-curl php-zip php-bcmath php-tokenizer php-fileinfo unzip git
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
composer install --no-dev --optimize-autoloader --no-interaction

cp .env.example .env
php artisan key:generate

# عدّل .env:
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=https://dalilukum.sy
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=dalilukum
# DB_USERNAME=dalilukum
# DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD

php artisan migrate --force

# استيراد البيانات (dalilukum.sql — 16 إعلان، 85 ماركة):
pip install psycopg2-binary
DATABASE_URL=postgresql://dalilukum:CHANGE_ME@127.0.0.1:5432/dalilukum \
  python3 tools/import_mysql_dump_to_pgsql.py

mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

---

## 4) إنشاء Website على CyberPanel (مرة واحدة)

1. `https://179.236.255.47:8090` → **Websites → Create Website** → `dalilukum.sy`
2. **File Manager** → ارفع `apps/dalilcom-web/dist` إلى `public_html`
3. **SSL → Issue SSL** بعد توجيه الدومين
4. ربط الـ API: `https://dalilukum.sy/api/*` → Reverse Proxy إلى `127.0.0.1:8000`

---

## 5) بناء الواجهة (بديل يدوي)

```bash
cd /home/dalilukum
npm install
npm run build:web
# انسخ dist إلى /home/dalilukum.sy/public_html
```

---

## 6) التطبيق (Expo)

```bash
cd dalilukum/apps/dalilcom-app
npx eas build --platform android --profile preview      # APK
npx eas build --platform android --profile production   # AAB
npx eas build --platform ios --profile production        # IPA (يحتاج Apple Developer)
```

---

## 7) DNS

| Type | Name | Value |
|------|------|-------|
| A | @ | 179.236.255.47 |
| A | www | 179.236.255.47 |

---

## 8) التحقق (بعد كل نشر)

```bash
curl https://dalilukum.sy/api/health
curl "https://dalilukum.sy/api/app/update-check?platform=android&version=18"
curl https://dalilukum.sy/api/ads | head -c 500
psql postgresql://dalilukum:***@127.0.0.1:5432/dalilukum -c "\\dt"
```


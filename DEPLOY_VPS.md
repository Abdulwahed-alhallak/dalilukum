# نشر dalilukum.sy على السيرفر الجديد (Hostinger VPS + CyberPanel)

> السيرفر: `179.236.255.47` — KVM 8 (8 vCPU / 32GB / 400GB) — AlmaLinux 9 + CyberPanel
> الدومين: `dalilukum.sy` → سجل A → `179.236.255.47`

---

## 1) الدخول للسيرفر

**CyberPanel:**
- الرابط: `https://179.236.255.47:8090`
- المستخدم: `admin` — كلمة السر: (راجع Hostinger hPanel → VPS → Access)
- SSH: `ssh root@179.236.255.47` — كلمة سر root: (راجع Hostinger hPanel → VPS → Root Password / SSH Keys)

> إذا رفض SSH بكلمة السر، استخدم CyberPanel → Terminal أو أضف مفتاح SSH من Hostinger hPanel.

---

## 2) إعداد PostgreSQL على السيرفر

```bash
# عبر SSH (root)
dnf install -y postgresql16-server postgresql16-contrib
/usr/pgsql-16/bin/postgresql-16-setup initdb
systemctl enable --now postgresql-16

# إنشاء مستخدم وقاعدة — غيّر كلمة السر القوية
sudo -u postgres psql <<'SQL'
CREATE USER dalilukum WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE dalilukum OWNER dalilukum;
GRANT ALL PRIVILEGES ON DATABASE dalilukum TO dalilukum;
\c dalilukum
GRANT ALL ON SCHEMA public TO dalilukum;
SQL

# السماح بالاتصال المحلي فقط
# /var/lib/pgsql/16/data/pg_hba.conf — أضف:
# host  dalilukum  dalilukum  127.0.0.1/32  scram-sha-256
# host  dalilukum  dalilukum  ::1/128       scram-sha-256
systemctl restart postgresql-16
```

---

## 3) نشر Laravel API (PostgreSQL)

```bash
cd /home
git clone https://github.com/yousefalsabbagh10-tech/daleel-com.git dalilukum
cd dalilukum/syrialzeel/laravel-api

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
# (أو DATABASE_URL=postgresql://dalilukum:***@127.0.0.1:5432/dalilukum)

php artisan migrate --force

# استيراد البيانات القديمة (اختياري):
pip install psycopg2-binary
DATABASE_URL=postgresql://dalilukum:CHANGE_ME@127.0.0.1:5432/dalilukum \
  python3 tools/import_mysql_dump_to_pgsql.py

mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

---

## 4) إنشاء Website على CyberPanel

1. سجّل دخول `https://179.236.255.47:8090`
2. **Websites → Create Website** — Domain: `dalilukum.sy`
3. **File Manager** → ارفع `apps/dalilcom-web/dist` إلى `public_html`
4. **SSL → Issue SSL** بعد توجيه الدومين
5. ربط الـ API: `https://dalilukum.sy/api/*` → Reverse Proxy إلى `127.0.0.1:8000`
   أو Document Root = `laravel-api/public`

---

## 5) بناء الواجهة

```bash
cd /home/dalilukum/syrialzeel
npm install
npm run build:web
# انسخ dist إلى /home/dalilukum.sy/public_html
```

---

## 6) التطبيق (Expo)

```bash
cd syrialzeel/apps/dalilcom-app
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

## 8) التحقق

```bash
curl https://dalilukum.sy/api/health
curl https://dalilukum.sy/api/ads | head -c 500
psql postgresql://dalilukum:***@127.0.0.1:5432/dalilukum -c "\dt"
```

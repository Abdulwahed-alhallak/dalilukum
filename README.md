# dalilukum.sy — دليلكم — v1.0.15/18

> **دليل العقارات والسيارات —** واجهة ويب (React Vite) + تطبيقان موبايل (Expo Android/iOS) + واجهة برمجة Laravel 12 + PostgreSQL 17 — كلها على `main` فقط.

## الجذر
- **المحلي:** `F:\Apps\dalilukum.sy\syrialzeel` (قديماً `C:\...\dalilukum.sy\syrialzeel`)
- **النهائي (بعد التنظيم):** `F:\Apps\dalilukum.sy\{backend,frontend,mobile,database,docs,others}` — بلا `syrialzeel`
- **الإنتاج:** `https://dalilukum.sy` على `179.236.255.47` (CyberPanel/AlmaLinux + `dalilukum-pgsql` pgsql 17)
- **Git:** `Abdulwahed-alhallak/dalilukum` — `main` فقط — `origin/main` (`Abdulwahed-alhallak/dalilukum`) — الدفع والنشر تلقائيان
- **النسخة:** `1.0.15 / 18 / 18` (app.json `version` / `android.versionCode` / `ios.buildNumber`) — tag `v1.0.15` — DB `app_version=18`

## البنية

```
syrialzeel/
├── apps/
│   ├── dalilcom-api  ← Laravel 12 API — pgsql 17 — 33 جدول + app_update_logs
│   ├── dalilcom-app  ← Expo 52 — com.dalilukum.app — 1.0.15/18 — UpdateGate
│   └── dalilcom-web  ← Vite — 1.0.15 — dist مبني
├── laravel-api/      ← Laravel 12 — canonical — Dockerfile libpq-dev — .env pgsql
├── database/         ← schema.sql (dalilukum) + migrations
├── dalilukum.sql     ← 62KB — 16 إعلان، 85 ماركة، 12 دولة، admin/user
├── docker-compose.yml — pgsql 17 (dalilukum-pgsql healthy)
└── render.yaml       — rootDir laravel-api — APP_URL https://dalilukum.sy
```

## التشغيل المحلي

```bash
docker compose up -d                          # pgsql 17
cd laravel-api && php artisan migrate --force # 33 جدول + app_update_logs
cd .. && npm run build:web                    # dist
php artisan serve --host=127.0.0.1 --port=7000 # health: /api/health → {"api":true,"database":true}
```

## القوانين
- **main فقط** — الدفع والنشر تلقائيان على `main` فقط — أي فرع = خرق.
- **التوحيد 100%** — `pgsql 17`، `https://dalilukum.sy/api`، `1.0.15/18` في كل مكان.
- **الترقيم v1.x.x** — بعد كل تحديث bump في 4 أماكن + DB + tag + push — لا commit بلا ترقيم.

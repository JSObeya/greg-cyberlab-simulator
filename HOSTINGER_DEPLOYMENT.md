# Greg Cyberlab Simulator — Hostinger Deployment Guide

**Institution:** Greg & Co. ICT Academy, Makurdi, Benue State, Nigeria  
**Platform:** Laravel 11/12 + Inertia.js + React (TypeScript) + Tailwind CSS + MySQL 8  

---

## 1. Prerequisites for Hostinger Shared / Cloud Hosting (hPanel)

1. **PHP Version:** PHP 8.3 or PHP 8.4 enabled in hPanel under **Advanced → PHP Configuration**.
2. **Extensions Enabled:** `pdo_mysql`, `curl`, `mbstring`, `openssl`, `tokenizer`, `xml`, `zip`, `fileinfo`.
3. **Database:** Create a new MySQL Database in **Databases → MySQL Databases** and record the database name, username, and password.

---

## 2. Directory Structure Setup

Hostinger shared hosting serves from `public_html/`. 
To preserve Laravel's security boundary:
- Upload the complete application files into a directory outside or parallel to `public_html/` (e.g., `/home/u123456789/greg-cyberlab/`).
- Point your domain or subdomain Document Root to `/home/u123456789/greg-cyberlab/public`.
- Alternatively, if on basic hPanel without custom Document Root:
  1. Place the project files inside `/home/u123456789/laravel_app/`.
  2. Move the contents of `laravel_app/public/` directly into `public_html/`.
  3. Edit `public_html/index.php` to point to the correct vendor and bootstrap paths:
     ```php
     require __DIR__.'/../laravel_app/vendor/autoload.php';
     $app = require_once __DIR__.'/../laravel_app/bootstrap/app.php';
     ```

---

## 3. Production Environment (.env)
ssh -p 65002 u842010817@46.202.172.40

Create `.env` based on `.env.example`:
```env
APP_NAME="Greg Cyberlab Simulator"
APP_ENV=production
APP_KEY=base64:... (Generated via php artisan key:generate)
APP_DEBUG=false
APP_URL=https://your-domain.ng

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u842010817_cyberlab
DB_USERNAME=u842010817_cyberlab_user
DB_PASSWORD=Gregcyber1

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

---

## 4. Production Build & Deployment Commands

Execute locally or via Hostinger SSH terminal:

```bash
# 1. Install production PHP packages without development clutter
composer install --no-dev --optimize-autoloader

# 2. Build production React & Vite assets (if running locally, upload public/build/)
npm ci
npm run build

# 3. Generate Encryption Key & Run Database Migrations + Seeders
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force

# 4. Storage Link & Production Caching
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 5. Hostinger Cron Job Configuration

To automate background tasks and queues without requiring Redis or continuous daemons:
In hPanel under **Advanced → Cron Jobs**, add a cron job running every minute:
```bash
* * * * * cd /home/u123456789/greg-cyberlab && php artisan schedule:run >> /dev/null 2>&1
```

---

## 6. Seeded Demonstration Credentials

- **Super Administrator:** `admin@gregcyberlab.test` / `CyberAdmin2026!`
- **Lead Instructor:** `instructor@gregcyberlab.test` / `Instructor2026!`
- **Trainee Cadet:** `student@gregcyberlab.test` / `Trainee2026!`

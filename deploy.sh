#!/usr/bin/env bash
# ==============================================================================
# Greg CyberLab Simulator — Hostinger Deployment Script
# ==============================================================================
# Usage:
#   Option A (Run remotely on Hostinger via SSH):
#     bash deploy.sh
#
#   Option B (Run locally in Git Bash / WSL to deploy everything):
#     bash deploy.sh --local
# ==============================================================================

set -e

HOSTINGER_USER="u842010817"
HOSTINGER_HOST="46.202.172.40"
HOSTINGER_PORT="65002"
REMOTE_PATH="/home/u842010817/domains/gregicthub.com/public_html/cyberlab"

if [ "$1" == "--local" ]; then
    echo "=========================================="
    echo "  1. Building Frontend Assets Locally...  "
    echo "=========================================="
    npm run build

    echo "=========================================="
    echo "  2. Pushing Updates to GitHub...         "
    echo "=========================================="
    git add .
    git commit -m "Deploy: courses, cohorts, and programmes updates $(date '+%Y-%m-%d %H:%M:%S')" || true
    git push origin main

    echo "=========================================="
    echo "  3. Triggering Hostinger Deployment...   "
    echo "=========================================="
    ssh -p "${HOSTINGER_PORT}" "${HOSTINGER_USER}@${HOSTINGER_HOST}" << 'ENDSSH'
        cd /home/u842010817/domains/gregicthub.com/public_html/cyberlab
        git reset --hard HEAD
        git pull origin main
        php artisan migrate --force
        php artisan optimize:clear
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        php artisan storage:link --quiet || true
        echo "✓ Hostinger deployment completed successfully!"
ENDSSH
    exit 0
fi

# ==============================================================================
# Remote execution on Hostinger (when running directly in Hostinger SSH terminal)
# ==============================================================================
echo "==> Deploying on Hostinger Server..."
cd "${REMOTE_PATH}" || cd ~/domains/gregicthub.com/public_html/cyberlab

echo "==> Pulling latest changes from GitHub..."
git reset --hard HEAD
git pull origin main

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Clearing and caching routes, config, and views..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Verifying storage symlink..."
php artisan storage:link --quiet || true

echo "✓ Deployment complete! Greg CyberLab is live."

#!/bin/bash
# deploy.sh — pull latest code, build, and restart the app
# Run this on the server after pushing changes to GitHub:  bash deploy.sh

set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "[Deploy] Pulling latest code..."
git fetch origin main
git reset --hard origin/main

echo "[Deploy] Installing dependencies..."
npm install --omit=dev

echo "[Deploy] Building React app..."
npm run build

echo "[Deploy] Restarting app..."
pm2 restart padel-tournament

SHA=$(git log -1 --pretty=format:"%h")
MSG=$(git log -1 --pretty=format:"%s")
echo "[Deploy] Done. App is live at https://padeltournament.xyz ($SHA — $MSG)"

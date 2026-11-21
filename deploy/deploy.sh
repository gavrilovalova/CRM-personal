#!/usr/bin/env bash
# Deploys one app image on the server: migrations -> new image -> smoke /health.
# Usage: deploy.sh <image-tag>   (the tag is a commit SHA)
# GitHub Actions calls it on every push to main. Manual rollback: run it with an older tag.
# No automatic rollback: if anything fails, the script stops and reports.
set -euo pipefail

TAG="${1:?usage: deploy.sh <image-tag>}"
REPO="ghcr.io/gavrilovalova/crm-personal"
DIR="/opt/crm/prod"
NEW="$REPO:$TAG"

cd "$DIR"
if [ ! -f .env ]; then
  echo "Missing $DIR/.env with database settings" >&2
  exit 1
fi
chmod 600 .env

compose() { docker compose -p prod -f compose.yaml --env-file .env "$@"; }
PREVIOUS="$(cat current-image 2>/dev/null || true)"
export APP_IMAGE="$NEW"

echo "==> Pull $NEW"
docker pull --quiet "$NEW"

echo "==> Database"
compose up -d --wait db

echo "==> Migrations"
if ! compose run --rm migrate; then
  echo "Migrations failed: the new version was NOT started, the old one keeps running" >&2
  exit 1
fi

echo "==> Start new version"
compose up -d --wait app
echo "$NEW" > current-image
if [ -n "$PREVIOUS" ] && [ "$PREVIOUS" != "$NEW" ]; then
  echo "$PREVIOUS" > previous-image
fi

echo "==> Smoke /health"
if ! curl -fsS --retry 10 --retry-delay 3 --retry-all-errors http://127.0.0.1:3000/health; then
  echo
  echo "Smoke check FAILED for $NEW. Nothing was rolled back" >&2
  exit 1
fi
echo

echo "==> Clean up: keep only the current and previous app images"
KEEP=" $NEW ${PREVIOUS:-} "
for image in $(docker image ls "$REPO" --format '{{.Repository}}:{{.Tag}}'); do
  case "$KEEP" in
    *" $image "*) ;;
    *) docker image rm "$image" >/dev/null && echo "removed $image" ;;
  esac
done
docker image prune -f >/dev/null

echo "==> Deployed $NEW"

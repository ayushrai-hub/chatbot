#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found on PATH" >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "docker compose is required (Docker Desktop v2+ recommended)" >&2
  exit 1
fi

echo "Building & starting services..."
$DC up -d --build

echo "Waiting for web health via nginx proxy..."
deadline=$((SECONDS + 120))
until curl -fsS "http://localhost:8080/health" >/dev/null 2>&1; do
  if (( SECONDS > deadline )); then
    echo "Timed out waiting for http://localhost:8080/health" >&2
    echo "Logs:" >&2
    $DC ps >&2 || true
    $DC logs --tail=200 >&2 || true
    exit 1
  fi
  sleep 2
done

echo "Smoke test: POST /user"
curl -fsS -H 'Content-Type: application/json' -d '{"msg":"hello"}' "http://localhost:8080/user" >/dev/null

echo "OK"
echo "Web:  http://localhost:8080"


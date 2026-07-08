#!/usr/bin/env bash
# Envia variáveis do .env local para o Railway (sem digitar no painel).
# Requer: railway login + railway link (na pasta back/)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
CLI="npx -y @railway/cli@latest"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env não encontrado: $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

cd "$(dirname "$0")"

$CLI variable set \
  "SPRING_DATASOURCE_URL=${SPRING_DATASOURCE_URL}" \
  "SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME}" \
  "SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD}" \
  "JWT_SECRET=${JWT_SECRET}" \
  "JWT_EXPIRATION=${JWT_EXPIRATION}" \
  "CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-http://localhost:3000,https://sagui-mu.vercel.app}" \
  "SAGUI_ADMIN_EMAIL=${SAGUI_ADMIN_EMAIL}" \
  "SAGUI_ADMIN_PASSWORD=${SAGUI_ADMIN_PASSWORD}" \
  "SAGUI_ADMIN_NAME=${SAGUI_ADMIN_NAME}" \
  "JAVA_TOOL_OPTIONS=-Xmx384m"

echo "Variáveis enviadas. O Railway vai redeployar automaticamente."

#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYS="$ROOT/apps/api/keys"
mkdir -p "$KEYS"

openssl genrsa -out "$KEYS/private.pem" 2048
openssl rsa -in "$KEYS/private.pem" -pubout -out "$KEYS/public.pem"

openssl ecparam -name prime256v1 -genkey -noout -out "$KEYS/ec_private.pem"
openssl ec -in "$KEYS/ec_private.pem" -pubout -out "$KEYS/ec_public.pem"

echo "Keys written to $KEYS"

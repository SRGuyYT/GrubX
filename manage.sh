#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' was not found in PATH." >&2
    exit 1
  fi
}

require_command pnpm

echo "Installing dependencies with pnpm..."
pnpm install

echo "Building Grubed X..."
pnpm build

echo
echo "1) Dev Mode"
echo "2) Production Preview"
read -rp "Start (1) Dev Mode or (2) Production Preview? " selection

case "$selection" in
  1)
    echo "Starting Vite dev server on 0.0.0.0:3000..."
    exec pnpm dev --host 0.0.0.0 --port 3000
    ;;
  2)
    if command -v serve >/dev/null 2>&1; then
      echo "Serving dist with global 'serve' on 0.0.0.0:4173..."
      exec serve -s dist -l tcp://0.0.0.0:4173
    fi

    if pnpm exec serve --version >/dev/null 2>&1; then
      echo "Serving dist with local 'serve' on 0.0.0.0:4173..."
      exec pnpm exec serve -s dist -l tcp://0.0.0.0:4173
    fi

    echo "No static file server was found. Falling back to 'pnpm dlx serve' on 0.0.0.0:4173..."
    exec pnpm dlx serve -s dist -l tcp://0.0.0.0:4173
    ;;
  *)
    echo "Invalid selection. Enter 1 or 2." >&2
    exit 1
    ;;
esac

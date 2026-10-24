#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIST="$(mktemp)"
trap 'rm -f "$LIST"' EXIT

cd "$ROOT"
node scripts/check-release-version.mjs
node scripts/build-curated-rag.mjs --check
{
  find packages -type f -name '*.test.ts' -print0
  find apps/wallet-mobile -maxdepth 1 -type f -name '*.test.ts' -print0
  find scripts -maxdepth 1 -type f -name 'build-curated-rag.test.mjs' -print0
} > "$LIST"

COUNT="$(tr -cd '\0' < "$LIST" | wc -c | tr -d ' ')"
if [[ "$COUNT" == "0" ]]; then
  echo "No test files found. Refusing to report a successful empty run." >&2
  exit 1
fi

echo "Running $COUNT test files in batches of 10."
xargs -0 -n 10 node --test --test-concurrency=4 < "$LIST"
echo "Completed $COUNT/$COUNT test files."

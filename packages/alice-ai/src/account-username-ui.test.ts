import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// This repository carries the wallet surface only. The Alice App web dialog
// (AccountPasswordDialog.tsx) is checked by the same test in alice-btc/alice.
const mobileSource = readFileSync(
  decodeURIComponent(
    new URL('../../../apps/wallet-mobile/components/AccountPasswordModal.tsx', import.meta.url).pathname,
  ),
  'utf8',
);

for (const [surface, source] of [
  ['mobile', mobileSource],
] as const) {
  test(`${surface} account settings expose the supported username rotation`, () => {
    assert.match(source, /CHANGE USERNAME/);
    assert.match(source, /SAVE USERNAME/);
    assert.match(source, /account\.updateProfile\(\{/);
    assert.match(source, /once every 30 days/);
  });
}

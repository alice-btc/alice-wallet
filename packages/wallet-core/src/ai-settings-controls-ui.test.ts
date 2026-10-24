import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
// L'ecran mobile delegue ses interrupteurs a PixelToggle (alice-ui), qui
// porte le accessibilityRole="switch"; on lit les deux sources ensemble.
const mobile = fs.readFileSync(path.join(root, 'apps/wallet-mobile/app/ai-settings.tsx'), 'utf8')
  + fs.readFileSync(path.join(root, 'packages/alice-ui/src/components/PixelToggle.tsx'), 'utf8');
// Les interrupteurs IA de l'onglet IA d'Alice App (desktop et web) sont
// verifies par le meme test dans alice-btc/alice ; ce depot ne porte que le
// wallet.

test('mobile settings expose switches for local, cloud, and custom AI', () => {
  assert.match(mobile, /accessibilityRole="switch"/);
  assert.match(mobile, /chat\.backendEnabled\.local/);
  assert.match(mobile, /chat\.backendEnabled\.cloud/);
  assert.match(mobile, /chat\.backendEnabled\.custom/);
  assert.doesNotMatch(mobile, /<Switch/);
  assert.match(mobile, />ALICE AI</);
  assert.match(mobile, /disabled=\{!chat\.localAvailable\}/);
  assert.match(mobile, /import \{ PixelToggle, useTheme \}/);
});

// Checks the response constraints of ai-system-prompt.ts (one-sentence
// instructions, buffering) on fixed cases. Plain Node cannot import that file
// as is: its relative imports carry no extension. It is bundled with esbuild
// through the same helper the prompt tests use, from the repository root.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
process.chdir(repoRoot);
const { loadRagEvaluationRuntime } = await import('../../../scripts/rag-eval-runtime.mjs');

const {
  applyAliceResponseConstraints,
  requiresBufferedAliceResponse,
} = await loadRagEvaluationRuntime(
  "export { applyAliceResponseConstraints, requiresBufferedAliceResponse } from './packages/alice-ai/src/ai-system-prompt.ts';",
);

const cases = [
  {
    name: 'French one sentence instruction',
    instructions: 'Réponds en une seule phrase.',
    response: 'Bitcoin est une monnaie numérique décentralisée. Elle fonctionne sans banque.',
    expected: 'Bitcoin est une monnaie numérique décentralisée.',
  },
  {
    name: 'French numeric one sentence instruction',
    instructions: 'Réponds en 1 phrase max.',
    response: 'Bitcoin est rare. Il est limité à 21 millions.',
    expected: 'Bitcoin est rare.',
  },
  {
    name: 'English one sentence instruction',
    instructions: 'Answer in one sentence.',
    response: 'Bitcoin is a decentralized monetary network. It has no central issuer.',
    expected: 'Bitcoin is a decentralized monetary network.',
  },
  {
    name: 'Bullet cleanup',
    instructions: 'one sentence only',
    response: '- Bitcoin lets users transfer value without a central issuer. It uses proof of work.',
    expected: 'Bitcoin lets users transfer value without a central issuer.',
  },
  {
    name: 'No constraint leaves response unchanged',
    instructions: 'Be concise.',
    response: 'Bitcoin is a network. It is also an asset.',
    expected: 'Bitcoin is a network. It is also an asset.',
  },
];

let failures = 0;

for (const testCase of cases) {
  const actual = applyAliceResponseConstraints(testCase.instructions, testCase.response);
  const shouldBuffer = requiresBufferedAliceResponse(testCase.instructions);
  const expectedBuffer = testCase.name !== 'No constraint leaves response unchanged';

  if (actual !== testCase.expected || shouldBuffer !== expectedBuffer) {
    failures += 1;
    console.error(`FAIL ${testCase.name}`);
    console.error(`  expected: ${testCase.expected}`);
    console.error(`  actual:   ${actual}`);
    console.error(`  expected buffer: ${expectedBuffer}`);
    console.error(`  actual buffer:   ${shouldBuffer}`);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log('AI system prompt checks passed.');
}

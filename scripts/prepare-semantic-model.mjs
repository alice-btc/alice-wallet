import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Downloads (once, into a local cache) and copies the web semantic search
// stack, the ONNX E5 model and the onnxruntime WASM files, into a directory,
// so a web build can serve both
// from its own origin instead of Hugging Face and jsDelivr.
//
//   node scripts/prepare-semantic-model.mjs <target-dir>
//
// The target directory is required: this repository has no web or desktop
// export to default to. The wallet PWA stays on keyword retrieval and the
// Android app uses the native GGUF model, so neither build calls this script;
// it serves a web export kept outside this repository.
//
// The model is pinned to one revision of the hub repository, same posture as
// the PlanB corpus commit: what ships is named exactly. The ONNX runtime is
// copied from node_modules, where the lockfile already pins it to the very
// version transformers would fetch from jsDelivr.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');

const MODEL_REPO = 'Xenova/multilingual-e5-small';
const MODEL_REVISION = '761b726dd34fb83930e26aab4e9ac3899aa1fa78';
// The exact set transformers.js requests for this model on the WASM backend
// (q8 default), observed from the browser cache of a live session.
const MODEL_FILES = [
  'config.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'special_tokens_map.json',
  'onnx/model_quantized.onnx',
];
// WKWebView runs the asyncify build; the plain pair is the no-JSPI fallback.
// The jsep (WebGPU) variants are deliberately left out: the desktop pipeline
// runs on the WASM device.
const ORT_FILES = [
  'ort-wasm-simd-threaded.asyncify.mjs',
  'ort-wasm-simd-threaded.asyncify.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
];
const ORT_DIST = path.join(REPO_ROOT, 'node_modules/onnxruntime-web/dist');

// This repository carries no web or desktop export, so the target directory
// must be named explicitly (in the Alice monorepo it defaulted to
// apps/app-web/out/semantic-model).
if (!process.argv[2]) {
  console.error('Usage: node scripts/prepare-semantic-model.mjs <target-dir>');
  process.exit(1);
}
const TARGET = path.resolve(process.argv[2]);
const CACHE = path.join(__dirname, 'data', 'semantic-model', MODEL_REVISION.slice(0, 12));

async function download(file) {
  const cached = path.join(CACHE, file);
  if (fs.existsSync(cached) && fs.statSync(cached).size > 0) return cached;
  const url = `https://huggingface.co/${MODEL_REPO}/resolve/${MODEL_REVISION}/${file}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} pour ${file}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(cached), { recursive: true });
  // Via a temp name so an interrupted download can never pass the size check.
  fs.writeFileSync(`${cached}.part`, buffer);
  fs.renameSync(`${cached}.part`, cached);
  return cached;
}

let total = 0;
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  total += fs.statSync(to).size;
};

console.log(`Modèle sémantique: ${MODEL_REPO} @ ${MODEL_REVISION.slice(0, 8)}`);
for (const file of MODEL_FILES) {
  const cached = await download(file);
  copy(cached, path.join(TARGET, MODEL_REPO, file));
}

for (const file of ORT_FILES) {
  const from = path.join(ORT_DIST, file);
  if (!fs.existsSync(from)) {
    console.error(`Fichier ONNX runtime introuvable: ${file} (lance npm ci ?)`);
    process.exit(1);
  }
  copy(from, path.join(TARGET, 'ort', file));
}

console.log(`Copié vers ${path.relative(REPO_ROOT, TARGET)} (${(total / 1024 / 1024).toFixed(1)} Mo)`);

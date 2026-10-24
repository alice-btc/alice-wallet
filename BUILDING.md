# Building Alice Wallet

This document describes a reproducible local build from a clean checkout. It
does not grant access to production services, signing keys, or deployment
credentials.

## Requirements

- Node.js `>=22.12.0 <25` (Node `24` LTS recommended)
- npm compatible with the committed `package-lock.json`
- Android Studio and an Android SDK for local native Android builds
- An Expo account with access to the Alice project for EAS builds (release
  operators only)

## Clean install and checks

From the repository root:

```bash
npm ci
npm test
npm run check:types
npm run check:release-version
npm run check:npm-audit
cd apps/wallet-mobile && npm run check:ai-boundary && npm run check:ai-prompt
```

CI runs the test, typecheck, AI/wallet boundary, AI prompt and audit gates; `npm test`
also runs the release-version check and the curated-corpus freshness check
before the test files. The explicit version command above is useful when
bumping a release because it fails quickly and names every stale declaration.
`package-lock.json` is the dependency source of truth. Do not replace `npm ci`
with an unconstrained dependency update while reproducing a release.

## Install-time downloads

`llama.rn`, the on-device inference engine, downloads its prebuilt native
libraries (about 100 MB) from GitHub when it is installed. CI installs with
`npm ci --ignore-scripts`, which skips that download: nothing in the tests, the
type check or the PWA build needs the native libraries. An Android build does.
On a poor connection, `apps/wallet-mobile/scripts/eas-post-install.js` can
install a verified host copy instead of downloading (see its header for the
`RNLLAMA_ARTIFACTS_DIR` and `RNLLAMA_SKIP_POSTINSTALL` switches).

No chat model is bundled. The wallet ships the precomputed semantic index of
the curated knowledge base (`apps/wallet-mobile/assets/core-embeddings`) and
downloads the embedding and chat models the user selects from Settings.

## Local configuration

Copy `.env.example` (repository root) or `apps/wallet-mobile/.env.example`
for local development. The sample files contain no usable secret. Distributed
builds use Alice's Private Cloud proxy (`EXPO_PUBLIC_VENICE_PROXY_URL`) and
must never embed the Venice production API key: an APK can be inspected. The
proxy itself is a Cloudflare Worker maintained in
[alice-btc/alice](https://github.com/alice-btc/alice); this repository only
consumes it.

Do not copy production `.env` files, signing credentials, or test account data
into an issue, pull request, or release artifact.

## Builds

Alice Wallet, PWA (static export in `apps/wallet-mobile/dist`, with the
service worker and manifest injected):

```bash
cd apps/wallet-mobile && npm run build:pwa
```

Alice Wallet, Android. Run EAS from `apps/wallet-mobile`, not from the
repository root: the root `eas.json` has no mainnet environment and no APK
format.

```bash
cd apps/wallet-mobile && npx eas-cli@latest build --profile preview --platform android
```

The `preview` profile targets Mutinynet. The `beta` profile inherits the
`production` environment (Bitcoin mainnet, `EXPO_PUBLIC_NETWORK=bitcoin`) and
produces the internally distributed APK; see
[docs/BETA_TESTING.md](docs/BETA_TESTING.md). These commands require an Expo
account with access to the Alice project and are for authorised release
operators only.

Start Expo for development:

```bash
cd apps/wallet-mobile && npm start
```

## Releasing

Before a release, record the version, commit, and known limits in
`CHANGELOG.md` and update every release declaration. Do not maintain that file
list by hand: `npm run check:release-version` covers the root and workspace
manifests, the lockfile, `apps/wallet-mobile/app.json`,
`apps/wallet-mobile/eas.json`, both `.env.example` files, the newest entry of
`packages/alice-ai/src/whats-new.ts` (the in-app what's-new dialog) and the
changelog markers. Do not deploy or push a release merely because a local build
succeeded.

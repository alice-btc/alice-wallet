# Alice Wallet

Alice Wallet is a self-custodial Bitcoin wallet with the Alice AI companion
built in. It pays over Arkade, Lightning (through Boltz and Satora swaps) and
on-chain Bitcoin, keeps its seed on the device, and lets you ask Alice about
Bitcoin without her ever seeing your keys.

It is in **mainnet beta**, has **not been audited** by a third party, and is
validated with **small amounts only**. Do not keep funds in it that you cannot
afford to lose.

## Where to get it

- **Android**: an APK published with its SHA-256 checksum on a GitHub
  Release. The last one, Alice `0.2.0`, is still on the Alice App repository's
  release page; the next one is released from here. How to verify what you
  were given is in [docs/BETA_TESTING.md](docs/BETA_TESTING.md).
- **PWA**: <https://wallet.alicebtc.com> (Bitcoin mainnet, real funds) and
  <https://mutinynet.alicebtc.com> (Mutinynet, a test network whose coins are
  worthless by design). Both run the same code as the APK in a browser.

Do not rely on a URL alone to identify a build: check its version and commit
on the About screen. Never share your recovery phrase, and never send it to Alice: she
will never ask for it.

## Relationship to Alice App

Alice has two products. **Alice App** (<https://app.alicebtc.com>, web and
desktop) is the companion: Chat, Explorer, Learn and a Playground with
worthless coins. Its source, the website and the Private Cloud proxy live in
[alice-btc/alice](https://github.com/alice-btc/alice). **Alice Wallet**, this
repository, is the separate wallet that holds real funds.

The wallet embeds the Alice AI companion: `packages/alice-ai`,
`packages/alice-content` and `packages/alice-ui` are copies of the packages of
the same name in the Alice App repository. They were split on purpose so that
the wallet can be released on its own schedule; the two copies are allowed to
diverge. The wallet talks to the same Private Cloud proxy as the app
(`EXPO_PUBLIC_VENICE_PROXY_URL`), which this repository consumes but does not
contain.

Issue reports from the wallet's `Settings > REPORT A PROBLEM` go to
`support@alicebtc.com` or to the issue tracker of
[alice-btc/alice](https://github.com/alice-btc/alice/issues), which stays the
single tracker for every Alice surface.

## What Alice can never see

- your recovery phrase, wallet keys, balances and transaction history never
  leave the device for any Alice server;
- your conversations with Alice in Private Cloud mode are encrypted on the
  device before they reach the proxy, and decrypted on the device;
- recovery phrases and private keys pasted into the chat are blocked before
  they can be stored or sent to any AI backend.

**The AI/wallet boundary**: the AI code cannot import wallet custody, signing
or payment modules, and the wallet code cannot import AI modules. This is
enforced by an automated check that runs in CI on every pull request:

```bash
cd apps/wallet-mobile && npm run check:ai-boundary
```

## Honest limits

- **Private Cloud is "attested, but not pinned."** Alice verifies that
  Venice's AI runs inside a genuine, current, non-debug TDX enclave and that
  the encryption key is bound to it. She cannot yet verify *which* enclave
  image runs, because Venice has not published reference measurements. Short
  copy may say that messages are encrypted end-to-end; every detailed
  explanation states this limit, and nothing ever displays "E2EE verified".
  Details: [docs/security/private-cloud-e2ee.md](docs/security/private-cloud-e2ee.md).
- **Semantic search runs on Android, not on the PWA.** On Android, retrieval
  is hybrid (keyword matching fused with an on-device embedding model) and
  falls back to keywords alone whenever the model is not loaded. The PWA stays
  on keyword retrieval because its bundler cannot load the ONNX runtime.
- **External services fail visibly.** If Arkade, Boltz, Satora or Esplora is
  down, the wallet reports it rather than silently switching payment rails.

The broader map is in [docs/security/THREAT_MODEL.md](docs/security/THREAT_MODEL.md).

## AI modes

- **Private Cloud**: encrypted inference through Alice's blind proxy. The
  proxy holds the Venice API key server-side and relays ciphertext; no client
  build ever contains the key. 21 free requests are available without an
  account; an Alice account (email, username, password) exists only to manage
  quotas. The wallet itself never needs an account.
- **Local**: a model file (GGUF) downloaded from Settings and run entirely on
  the device. No chat model is preinstalled in any build.
- **Custom**: your own OpenAI-compatible endpoint.

## Repository map

```
apps/wallet-mobile        Alice Wallet (Expo/React Native: Android, PWA)
packages/wallet-core      wallet primitives
packages/shared-types     types shared across packages
packages/alice-ai         AI companion: chat, RAG, E2EE, memory
packages/alice-content    knowledge base, themes and shared content
packages/alice-ui         shared UI primitives
data/alice-corpus         curated knowledge base (source of the generated RAG pack)
scripts/                  checks, evaluation and release tooling
docs/                     wallet, testing and security documents
```

## Development

Use Node.js `>=22.12.0 <25` (Node `24` LTS is recommended). The lockfile is
the source of truth for a reproducible dependency tree.

```bash
npm ci
```

Start Expo (Android and PWA development):

```bash
cd apps/wallet-mobile && npm start
```

Build the PWA (static export in `apps/wallet-mobile/dist`):

```bash
cd apps/wallet-mobile && npm run build:pwa
```

The checks CI runs, from the repository root:

```bash
npm test
npm run check:types
npm run check:npm-audit
cd apps/wallet-mobile && npm run check:ai-boundary && npm run check:ai-prompt
```

Tests use Node's built-in runner (`node --test`) on the TypeScript sources
directly, so there is no test framework to install and no build step. One
constraint follows: Node resolves ES module specifiers literally, so imports
carry an explicit extension (`./venice-errors.ts`). Only pure modules are
testable this way: anything importing `expo/*` or `react-native` cannot be
loaded outside Metro.

For the Android build, the release declarations and the version check, see
[BUILDING.md](BUILDING.md). Never place production secrets in a client build.

### Environment

Copy `.env.example` to `.env` and adjust when needed:

```bash
cp .env.example .env
```

Never commit `.env`. Every distributed build routes Private Cloud through
`EXPO_PUBLIC_VENICE_PROXY_URL` (`https://proxy.alicebtc.com` for official
builds): an APK can be inspected, so none may contain the Venice API key.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md)
first. Report security issues privately to
[contact@alicebtc.com](mailto:contact@alicebtc.com).

## License

Alice Wallet is licensed under [GNU AGPL-3.0-or-later](LICENSE). See
[NOTICE](NOTICE) for copyright and third-party notices, and
[TRADEMARKS.md](TRADEMARKS.md) for the separate rules governing the Alice
name and visual identity.

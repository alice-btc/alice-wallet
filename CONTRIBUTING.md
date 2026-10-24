# Contributing to Alice Wallet

Thanks for your interest in Alice Wallet.

Alice Wallet is in mainnet beta and handles real funds. Contributions should
preserve user safety, privacy, and the separation between AI assistance and
wallet spending authority.

## Ground Rules

- Do not change mainnet behavior unless it is explicitly reviewed and approved.
- Do not log, upload, or expose recovery phrases, mnemonics, private keys, balances, or full wallet history.
- Do not let AI code sign or broadcast transactions without explicit user confirmation through wallet-controlled flows.
- Keep wallet logic deterministic and auditable.
- Prefer small focused pull requests.

## Shared packages

`packages/alice-ai`, `packages/alice-content` and `packages/alice-ui` are the
Alice AI companion the wallet embeds. The same packages exist in
[alice-btc/alice](https://github.com/alice-btc/alice), the Alice App
repository, and the two copies are allowed to diverge. A fix that matters to
both products should be proposed in both repositories; neither one is
synchronised from the other automatically.

## License of contributions

By submitting a contribution, you agree to license it under
`AGPL-3.0-or-later`, the license that applies to Alice Wallet. You retain
copyright in your contribution.

## Development Checks

Before opening a pull request, run the checks CI runs:

```bash
npm test
```

```bash
npm run check:types
```

```bash
npm run check:npm-audit
```

```bash
cd apps/wallet-mobile && npm run check:ai-boundary && npm run check:ai-prompt
```

`npm test` runs the release-version check and the curated-corpus freshness
check before the test files. Type-checking is a separate command because the
tests run on the TypeScript sources with type-stripping and do not catch type
errors; `check:types` type-checks the wallet app, whose `tsconfig.json`
includes every shared package's sources.

When touching AI or wallet modules, the AI/wallet boundary check above is the
one that matters: the AI packages must not import wallet custody, signing or
payment modules, and the wallet core must not import AI modules.
`check:ai-prompt` runs fixed cases against the response constraints of
`packages/alice-ai/src/ai-system-prompt.ts` (one-sentence instructions and
when a reply must be buffered).

## Issues

When reporting a bug, include:

- platform: Alice Wallet on Android (APK) or in a browser (PWA);
- app version or commit;
- expected behavior;
- actual behavior;
- steps to reproduce;
- screenshots only if they do not reveal sensitive data.

Never include seed phrases, private keys, real invoices tied to private
activity, or screenshots containing sensitive wallet data. Security
vulnerabilities follow [SECURITY.md](SECURITY.md), not a public issue.

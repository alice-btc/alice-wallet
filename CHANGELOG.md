# Changelog

Alice Wallet is versioned on its own from this repository. One number names
one source tree: a tester, a log line and a release tag refer to the same
code. The Android build, the PWA and the embedded Alice AI packages share it.

- `0.1.0`, current release

Before `0.1.0`, the wallet shipped from the Alice monorepo
(<https://github.com/alice-btc/alice>) under Alice's own version numbers; the
last Android build published that way is Alice `0.2.0`. The changelog of that
repository covers those releases.

## 0.1.0

First release of Alice Wallet in its own repository.

The code is taken from the Alice monorepo (`alice-btc/alice-private`, branch
`infra/patch-0.2.5`, release candidate 0.2.5) at commit `1a6f4e81`. It carries
the wallet app (`apps/wallet-mobile`), the wallet primitives
(`packages/wallet-core`, `packages/shared-types`) and the Alice AI companion
the wallet embeds (`packages/alice-ai`, `packages/alice-content`,
`packages/alice-ui`). The same AI packages keep living in the Alice App
repository; the two copies may diverge from here on.

What this release changes for a user: nothing that the move itself adds. The
code is the wallet as it stood in the 0.2.5 candidate, so compared with the
last Android build (Alice `0.2.0`) it carries every wallet change made in the
monorepo since: the Alice releases 0.2.1 to 0.2.4 (a PIN before a web wallet
opens, keyboard and screen-reader fixes, the new branding, the user memory,
among others) and the 0.2.5 repairs (reports go to support@alicebtc.com and
warn that GitHub is public). The Alice changelog describes each of them.

What this release changes for a contributor:

- one repository for the wallet only, with its own tests, type check,
  AI/wallet boundary check, AI prompt check and dependency-audit gate in CI;
- a coordinated version check (`npm run check:release-version`) that covers
  the root and workspace manifests, the lockfile, the Expo and EAS
  configuration, both `.env.example` files, the in-app what's-new list and
  this changelog;
- the Alice App, the website, the desktop shell, the Private Cloud proxy
  Worker and the Playground wallet are not part of this repository.

Known limits, unchanged from Alice 0.2.5:

- Private Cloud is `attested-unpinned`: Alice verifies a genuine, current,
  non-debug TDX enclave and the key binding, but Venice has not published
  reference measurements, so the exact enclave image cannot be pinned.
- Semantic retrieval runs on Android; the PWA stays on keyword retrieval.
- Mainnet beta, small amounts only. The wallet has not been audited by a
  third party.

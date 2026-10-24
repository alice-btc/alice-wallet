# Alice Wallet Closed Beta

Alice Wallet, the self-custodial wallet that holds real bitcoin, is a closed
mainnet beta: its Android build is intended for known testers using a fresh
wallet and small amounts only. The PWA at <https://wallet.alicebtc.com> runs
the same code in a browser.

## Tested Release

Alice Wallet's source lives at <https://github.com/alice-btc/alice-wallet>.
Until this repository existed, the wallet shipped from the Alice monorepo,
<https://github.com/alice-btc/alice>, under Alice's version numbers.

- Current Android build: Alice `0.2.0`, APK published in the `v0.2.0` GitHub
  Release of <https://github.com/alice-btc/alice>. No newer Android build has
  shipped since; its checksum and signature below still apply.
- This repository restarts the wallet's own numbering at `0.1.0`: Alice
  Wallet `0.1.0` is the first release of this repository, not the older
  closed-beta APK named Alice `0.1.0` (see below). The first Android build cut
  from here will carry that version name and a higher Android version code
  than the Alice `0.2.0` build, which is what Android uses to accept an
  update.
- From Alice Wallet `0.1.0` on, the APK, its version code and its SHA-256
  are published together in the GitHub Release attached to each tag of
  <https://github.com/alice-btc/alice-wallet>. The website links the current
  APK at the foot of its home page (`ANDROID_VERSION` and `ANDROID_APK_URL`
  in `apps/site/src/lib/site.ts` of alice-btc/alice); until the first wallet
  release it still points at Alice `0.2.0` on the Alice release page.

The earlier Alice `0.0.1` APK predated the public source snapshot and was
not reproducible from its tag. Do not distribute it as the closed-beta
release. Starting with the closed-beta APK of August 2026, shipped from the
Alice monorepo as Alice `0.1.0`, the APK is built from the validated public
tree and its checksum is published with the binary.

### Verifying the APK you were given

Two checks, and they answer different questions.

**Is this the file Alice published?** Compare its checksum with the
`SHA256SUMS` file from the same release:

```bash
shasum -a 256 -c SHA256SUMS-v0.2.0.txt
```

**Was it signed by Alice?** This is the one that matters when an APK reaches
you through someone else. Alice releases are signed with one key, and its
certificate fingerprint is published here. A build signed by anyone else
carries a different fingerprint, whatever its file name says:

```
SHA-256  1f52d235f5d404242cf974819338e168406867c2fbc448f20623bf776cad744b
```

```bash
apksigner verify --print-certs Alice-Wallet-beta-0.2.0-v9.apk
```

The key changed once, between the August 2026 closed-beta APK (Alice
`0.1.0`, from the Alice monorepo) and Alice `0.2.0`, together with the
Android application id (see "Updating from the August 2026 closed beta"
below). That Alice `0.1.0` APK was signed with
`189bf5a7bb13f8ddde59074bcdba4b8799368c8cf50b249e1c9d7b4455eef26c`; that
fingerprint is only valid for that release. From Alice `0.2.0` on, the key
above is the one to expect: an Alice Wallet build from this repository
installs over Alice `0.2.0` only if it is signed with that same key.

Android enforces this on its own: it refuses to install an update signed with
a different key than the app already on the device. The manual check is for
the first install, which is exactly when you have nothing to compare against.

### How the current build was produced

| | |
| --- | --- |
| Tag | `v0.2.0` in `alice-btc/alice` |
| Commit | the commit the `v0.2.0` tag points to, listed in the GitHub Release |
| Android application id | `com.alicebtc.wallet` |
| Android version code | `9` |
| Expo SDK | `54.0.35` |
| React Native | `0.81.5` |
| Node | `24` |
| Build service | Expo Application Services (EAS), `beta` profile, local build (`--local`) signed with the EAS-held keystore |
| Native AI engine | llama.rn compiled from its bundled sources during the build (`rnllamaBuildFromSource=true`); its prebuilt download is skipped with `RNLLAMA_SKIP_POSTINSTALL=1` and `scripts/eas-post-install.js` |

Stated plainly: this describes the build, it does not let you reproduce it.
An EAS build is not byte-for-byte reproducible, so the checksum proves the
file is intact, not that it was compiled from this source. Reproducible
builds are on the roadmap; until they land, the fingerprint above is what ties
a binary to Alice.

Always verify the version and checksum supplied with the APK. Do not install an
APK forwarded by an unknown person.

## Available Surfaces

- Alice Wallet, mainnet beta: <https://wallet.alicebtc.com>
- Alice Wallet on Mutinynet (test network, worthless coins):
  <https://mutinynet.alicebtc.com>
- Android: APK distributed directly through the closed-beta channel

Alice App, the companion with Chat, Explorer, Learn and the Playground, is a
separate product at <https://app.alicebtc.com>; its source is
<https://github.com/alice-btc/alice>.

## Updating from the August 2026 closed beta

This concerns the closed-beta APK of August 2026, shipped from the Alice
monorepo as Alice `0.1.0`, not Alice Wallet `0.1.0` from this repository.
Alice `0.2.0` ships under a new Android application id
(`com.alicebtc.wallet`), so it installs as a separate app next to that old
APK rather than over it. Back up your recovery phrase from the old APK first,
install Alice `0.2.0` or a later Alice Wallet build, import the phrase, check
your balance, then uninstall the old APK.

## Publishing an Android APK

This operation requires the maintainer's Expo account. Run every EAS command
from `apps/wallet-mobile`, not from the repository root. The root contains a
different `eas.json` without Alice Wallet's mainnet environment or APK format.

The distributed APK uses the `beta` profile: it inherits the `production`
environment (`EXPO_PUBLIC_NETWORK=bitcoin`, remote credentials,
auto-incremented remote version code) and marks the build as internal
distribution, which is what a GitHub Release installation is.

1. Authenticate with the `alicebitcoin` Expo account, enter the mobile
   workspace, inspect the currently stored version code, then start the build:

   ```bash
   cd apps/wallet-mobile
   npx eas-cli@latest login
   npx eas-cli@latest build:version:get --platform android --profile beta
   npx eas-cli@latest build --platform android --profile beta
   ```

2. Wait for the build to finish. Copy its build ID and record the exact
   `versionCode` displayed on the EAS build page. Download that build only:

   ```bash
   export EAS_BUILD_ID="paste-build-id-here"
   npx eas-cli@latest build:download --build-id "$EAS_BUILD_ID"
   ```

3. EAS does not guarantee Alice's public release filename. The suffix is the
   `versionCode` Android actually reads from the file, never a number chosen
   to fit an existing URL. Read it from the APK itself:

   ```bash
   aapt dump badging path/to/downloaded.apk | head -1
   ```

   Rename the file with the version name and that code, for example
   `Alice-Wallet-beta-0.1.0-v10.apk`.

4. Calculate and verify its SHA-256 digest:

   ```bash
   shasum -a 256 Alice-Wallet-beta-<version>-v<code>.apk \
     > SHA256SUMS-v<version>.txt
   shasum -a 256 -c SHA256SUMS-v<version>.txt
   ```

5. Upload the APK and checksum to the draft release, then inspect both assets
   in the GitHub interface before publishing:

   ```bash
   gh release upload v<version> -R alice-btc/alice-wallet \
     Alice-Wallet-beta-<version>-v<code>.apk \
     SHA256SUMS-v<version>.txt \
     --clobber
   ```

6. The GitHub Release of this repository is where the APK is published.
   Then point the website at it: `ANDROID_VERSION` and `ANDROID_APK_URL` in
   `apps/site/src/lib/site.ts` of alice-btc/alice, which still name Alice
   `0.2.0` on the Alice release page. Once the release is published, confirm
   that both assets download from it
   and that the checksum matches:

   ```bash
   gh release download v<version> -R alice-btc/alice-wallet \
     --pattern 'Alice-Wallet-beta-*.apk' --pattern 'SHA256SUMS-*.txt'
   shasum -a 256 -c SHA256SUMS-v<version>.txt
   ```

## Safety Rules

- Create a new wallet dedicated to the beta.
- Back up its recovery phrase before funding it.
- Never send a recovery phrase, private key, or sensitive screenshot to Alice,
  a tester, or a bug-report form.
- Start with `335` to `2,000` sats per action.
- Keep no more than `25,000` sats in the beta wallet.
- Wait for an operation to reach a clear final state before starting another.
- Stop immediately if the amount, fees, status, or recovery path is ambiguous.

Alice Wallet is self-custodial beta software. Do not use funds you cannot
afford to lose.

## Suggested Test

1. Create a new wallet and back up the recovery phrase.
2. Receive a small Arkade or Bitcoin payment.
3. Open the transaction history and transaction details.
4. Send a small payment and verify the final state.
5. Open Alice and ask one basic and one technical Bitcoin question.
6. Open `ALICE MEMORY`, inspect what was retained, forget one item, and confirm
   that the other items remain.
7. Restart the application and check the wallet, history, selected AI mode, and
   retained memory.
8. Submit one real or simulated report from Settings.

## Reporting Problems

In Alice Wallet, open `Settings > REPORT A PROBLEM`.

The report can be copied, sent to `support@alicebtc.com`, or opened as an issue
in the public [`alice`](https://github.com/alice-btc/alice/issues) repository,
which remains the single issue tracker for every Alice surface. Nothing is
sent until you choose one of these. Include the platform, version, action,
expected result, and actual result. Never include wallet secrets. Security
vulnerabilities follow `SECURITY.md`, not a public issue.

Reports opened from older builds still land in
[`alice-support-contribute`](https://github.com/alice-btc/alice-support-contribute),
which stays open.

## Known Limits

- Private Cloud is currently `attested-unpinned`. Transport encryption and TDX
  attestation verification are implemented, but Venice has not yet published
  the reference measurements required to pin the exact enclave identity.
- Alice Memory is stored on the device only. The few facts relevant to a
  message travel with it to the model you chose: inside the encrypted payload
  for Private Cloud, to your own server for Custom AI, nowhere for Local.
- Semantic retrieval runs on Android; the installable PWA stays on keyword
  retrieval over the same knowledge base. Result quality was validated on
  Android.
- Satora is an external swap service. If it is unavailable, direct Arkade and
  Bitcoin functions may still work, but swaps can fail.
- The Android Lite model is intended for constrained phones and provides lower
  answer quality than larger local models or Private Cloud.

Current service availability is not a release guarantee. External providers
can be temporarily unavailable.

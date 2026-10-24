# Alice threat model

Alice is a self-custodial Bitcoin wallet and an AI companion. This document
summarises the security boundaries of the current mainnet beta. It is a map of
the system, not a claim that all risks are eliminated.

## Scope

This repository is Alice Wallet: the Android APK and the PWA, with the Alice
AI companion they embed. Alice App (web and desktop), the alicebtc.com
website and the proxy Worker live in <https://github.com/alice-btc/alice> and
are out of scope here, except that the Worker remains a dependency the wallet
talks to (accounts, quota, Private Cloud relay, update check); its boundaries
are described below as the wallet sees them.

## Assets that must remain private

- Wallet recovery phrase and derived wallet private keys
- Wallet signing state and locally held transaction data
- Alice account passwords and session tokens
- Chat content and the locally stored learning profile
- Worker secrets, including Venice, Resend and session-signing keys

## Trust boundaries

### Wallet custody

The wallet creates and holds its seed on the device. Alice account credentials
never derive, wrap, encrypt, decrypt, restore, or export the wallet seed. The
AI code cannot import wallet custody or payment modules, and deterministic
wallet code still requires explicit user confirmation to spend.

### Alice account service

The Worker holds only account and quota data needed for Private Cloud access.
It does not receive the wallet seed, wallet private keys, or chat plaintext.
The internal `user_id` is not a public identifier. Passwords are stored as
password hashes, never plaintext.

### Private Cloud

Private Cloud encrypts messages on the client before they cross Alice's proxy.
The proxy relays ciphertext and attaches the Venice API key, but does not
decrypt prompts or responses. The current assurance is **attested-unpinned**:
Alice verifies a genuine, current, non-debug TDX attestation and key binding,
but Venice has not published the reference measurements needed to identify the
exact enclave image. It must not be described as full E2EE.

### Local AI

Local AI runs on the device. The learning profile is local only and stores
bounded topic-level counters, not a copy of a user message. In the wallet,
semantic retrieval runs on Android (an on-device embedding model); the PWA
stays on lexical retrieval.

### Third-party services

Arkade, Satora, Boltz, Esplora, Venice and Cloudflare are external services
with their own availability and privacy boundaries. Alice should fail clearly
when one is unavailable rather than silently changing a payment rail or
downgrading Private Cloud to plaintext.

## Non-goals and known limits

- Mainnet beta is for small amounts only.
- Private Cloud does not currently provide full measurement-pinned E2EE.
- The Worker does not provide a cloud backup of wallet seeds or chats.
- The admin console is local and aggregate by design. It cannot expose a seed,
  wallet key, password, conversation, or AI request body.

## Related documents

- [Private Cloud trust model](private-cloud-e2ee.md)
- [Local chat encryption](local-chat-encryption.md)
- [Recovery bundle](recovery-bundle.md)
- [Admin dashboard privacy model](admin-dashboard.md)

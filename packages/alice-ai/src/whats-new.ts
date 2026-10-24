// What each release wants the user to actually try, said inside the app the
// first time the new version opens. Feature highlights only: bug fixes and
// the full detail live in the release notes, one link away. Add an entry per
// release, newest first, the release checklist in BUILDING.md points here.

export type WhatsNewEntry = {
  version: string;
  highlights: string[];
};

export const RELEASE_NOTES_URL = 'https://github.com/alice-btc/alice-wallet/releases';

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    version: '0.1.0',
    highlights: [
      'Alice Wallet now ships from its own repository and counts its versions from 0.1.0.',
      'The web wallet asks for a PIN before it opens, and keyboard and screen reader use is fixed across the wallet.',
      'Report an issue emails support@alicebtc.com, and warns you that a GitHub issue is public before you open one.',
    ],
  },
];

export function whatsNewFor(version: string): WhatsNewEntry | null {
  return WHATS_NEW.find(entry => entry.version === version) ?? null;
}

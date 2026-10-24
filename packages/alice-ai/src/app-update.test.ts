import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkForAppUpdate, fetchLatestAppVersion } from './app-update.ts';

const PROXY = 'https://proxy.example';

function answering(body: unknown, status = 200): typeof fetch {
  return (async (input: string | URL | Request) => {
    assert.equal(String(input), `${PROXY}/app-version`);
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}

function memoryStore() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

describe('wallet update check', () => {
  const saved = {
    proxy: process.env.EXPO_PUBLIC_VENICE_PROXY_URL,
    version: process.env.EXPO_PUBLIC_ALICE_APP_VERSION,
  };

  beforeEach(() => {
    process.env.EXPO_PUBLIC_VENICE_PROXY_URL = `${PROXY}/`;
    process.env.EXPO_PUBLIC_ALICE_APP_VERSION = '0.1.0';
  });

  afterEach(() => {
    for (const [name, value] of [
      ['EXPO_PUBLIC_VENICE_PROXY_URL', saved.proxy],
      ['EXPO_PUBLIC_ALICE_APP_VERSION', saved.version],
    ] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it('reports a newer wallet release from the wallet field', async () => {
    const fetchImpl = answering({ version: '0.2.5', wallet: '0.1.1' });
    assert.equal(await fetchLatestAppVersion(fetchImpl), '0.1.1');
    assert.equal(await checkForAppUpdate(memoryStore(), 0, fetchImpl), '0.1.1');
  });

  it('stays silent on the same wallet release', async () => {
    assert.equal(await checkForAppUpdate(memoryStore(), 0, answering({ version: '0.2.5', wallet: '0.1.0' })), null);
  });

  it('ignores the Alice App version when the wallet field is absent', async () => {
    const fetchImpl = answering({ version: '0.2.5' });
    assert.equal(await fetchLatestAppVersion(fetchImpl), null);
    assert.equal(await checkForAppUpdate(memoryStore(), 0, fetchImpl), null);
  });

  it('treats a malformed wallet field as no update', async () => {
    for (const wallet of ['0.2', 'v0.2.0', '0.2.0-beta', 2, null, { version: '0.2.0' }]) {
      const fetchImpl = answering({ version: '0.2.5', wallet });
      assert.equal(await fetchLatestAppVersion(fetchImpl), null, JSON.stringify(wallet));
      assert.equal(await checkForAppUpdate(memoryStore(), 0, fetchImpl), null, JSON.stringify(wallet));
    }
    assert.equal(await fetchLatestAppVersion(answering(null)), null);
    assert.equal(await fetchLatestAppVersion(answering('0.2.0')), null);
  });

  it('fails open on an error status, a network error or no proxy', async () => {
    assert.equal(await fetchLatestAppVersion(answering({ wallet: '9.9.9' }, 503)), null);
    assert.equal(await fetchLatestAppVersion((async () => { throw new Error('offline'); }) as typeof fetch), null);
    delete process.env.EXPO_PUBLIC_VENICE_PROXY_URL;
    assert.equal(await fetchLatestAppVersion(answering({ wallet: '9.9.9' })), null);
  });
});

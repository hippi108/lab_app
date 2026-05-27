import type { Protocol } from '@/types/protocol';
import { sampleProtocols } from '@/data/sample-protocols';

const STORAGE_KEY = 'lab_app_protocols_v1';

function loadFromStorage(): Protocol[] {
  if (typeof window === 'undefined') {
    return sampleProtocols;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProtocols));
      return sampleProtocols;
    }
    return JSON.parse(raw) as Protocol[];
  } catch (error) {
    return sampleProtocols;
  }
}

export function getProtocols(): Protocol[] {
  return loadFromStorage();
}

export function getProtocolById(id: string): Protocol | undefined {
  return loadFromStorage().find((protocol) => protocol.id === id);
}

export function saveProtocols(protocols: Protocol[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
}

export function saveProtocol(updated: Protocol) {
  if (typeof window === 'undefined') return;
  const protocols = loadFromStorage();
  const idx = protocols.findIndex((p) => p.id === updated.id);
  if (idx >= 0) {
    protocols[idx] = { ...updated, updatedAt: new Date().toISOString() };
  } else {
    protocols.unshift({ ...updated, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
}

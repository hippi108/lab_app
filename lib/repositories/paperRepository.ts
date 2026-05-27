import type { Paper } from '@/types/paper';

const STORAGE_KEY = 'lab_app_papers_v1';

function loadFromStorage(): Paper[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw) as Paper[];
  } catch (error) {
    return [];
  }
}

export function getPapers(): Paper[] {
  return loadFromStorage();
}

export function savePapers(papers: Paper[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
}

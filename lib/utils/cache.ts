import { CacheData, Script } from '@/lib/types/github';
import { CACHE_KEY, CACHE_DURATION } from '@/lib/config/github';

export function getCachedData(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp <= CACHE_DURATION) {
      return data;
    }

    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export function setCachedData(scripts: Script[]): void {
  try {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      scripts,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}
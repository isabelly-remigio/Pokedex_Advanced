import AsyncStorage from '@react-native-async-storage/async-storage';

type CacheEntry<T> = {
  timestamp: number;
  data: T;
};

const cacheMemoria: Record<string, any> = {};
const TTL = 30 * 60 * 1000; // 30 minutos

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry exponencial + jitter
async function retryFetch<T>(
  fetcher: () => Promise<T>,
  tentativas = 3,
  baseDelay = 500
): Promise<T> {
  for (let attempt = 0; attempt < tentativas; attempt++) {
    try {
      return await fetcher();
    } catch (err: any) {
      const status5xx = err.status >= 500 && err.status < 600;
      if (attempt === tentativas - 1 || !status5xx) throw err;

      const jitter = Math.random() * 100;
      const delay = baseDelay * 2 ** attempt + jitter;
      await sleep(delay);
    }
  }
  throw new Error('Tentativas esgotadas');
}

export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000,
  usarCache = true
): Promise<T> {
  // 1️⃣ Verificar cache em memória
  if (usarCache && cacheMemoria[url]) {
    const entry: CacheEntry<T> = cacheMemoria[url];
    if (Date.now() - entry.timestamp < TTL) return entry.data;
  }

  // 2️⃣ Verificar AsyncStorage
  if (usarCache) {
    const stored = await AsyncStorage.getItem(url);
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (Date.now() - entry.timestamp < TTL) return entry.data;
    }
  }

  // 3️⃣ Configurar AbortController + timeout
  const controller = new AbortController();
  const idTimeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const data = await retryFetch<T>(async () => {
      const res = await fetch(url, { ...options, signal: controller.signal });
      if (!res.ok) {
        const error: any = new Error(`HTTP ${res.status}`);
        error.status = res.status;
        throw error;
      }
      return (await res.json()) as T;
    });

    // 4️⃣ Salvar no cache memória + AsyncStorage
    if (usarCache) {
      const entry: CacheEntry<T> = { timestamp: Date.now(), data };
      cacheMemoria[url] = entry;
      AsyncStorage.setItem(url, JSON.stringify(entry));
    }

    return data;
  } finally {
    clearTimeout(idTimeout);
  }
}

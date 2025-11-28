// src/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'https://pokeapi.co/api/v2';
const TIMEOUT_MS = 8000;
const TENTATIVAS = 3;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos
const STORAGE_PREFIX = '@meu-pokedex:';

export type ResultadoLista = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
};

/* ---------------- CACHE EM MEMÓRIA ---------------- */
type CacheEntry = { ts: number; dados: any };
const cacheMemoria = new Map<string, CacheEntry>();

/* ---------------- HELPERS ---------------- */
function gerarChave(url: string) {
  return `${STORAGE_PREFIX}${encodeURIComponent(url)}`;
}

async function lerCachePersistente(chave: string): Promise<CacheEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(chave);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

async function salvarCachePersistente(chave: string, dados: any) {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify({ ts: Date.now(), dados }));
  } catch {
    // fail silently
  }
}

function cacheValido(entry?: CacheEntry | null) {
  if (!entry) return false;
  return Date.now() - entry.ts < CACHE_TTL;
}

/* ---------------- REQUISIÇÃO SIMPLES (timeout + retry) ---------------- */
async function fetchComRetry(
  url: string,
  opts: { timeoutMs?: number; tentativas?: number; sinalAbort?: AbortSignal | null } = {}
) {
  const timeoutMs = opts.timeoutMs ?? TIMEOUT_MS;
  const tentativas = opts.tentativas ?? TENTATIVAS;
  let tentativa = 0;
  let ultimoErro: any = null;

  while (tentativa < tentativas) {
    tentativa++;
    const controller = new AbortController();
    const sinal = opts.sinalAbort ?? controller.signal;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(url, { signal: sinal });
      clearTimeout(timer);

      if (!resp.ok) {
        const texto = await resp.text().catch(() => '');
        const erro = new Error(`HTTP ${resp.status} - ${resp.statusText} ${texto}`);
        ultimoErro = erro;
        // retry apenas para 5xx
        if (resp.status >= 500 && tentativa < tentativas) {
          await new Promise((r) => setTimeout(r, 200 * tentativa));
          continue;
        } else {
          throw erro;
        }
      }

      const dados = await resp.json();
      return dados;
    } catch (err: any) {
      clearTimeout(timer);
      ultimoErro = err;
      // se foi abort explícito do sinal passado, não retry
      if (err?.name === 'AbortError' && opts.sinalAbort) {
        throw new Error('Requisição abortada/timeout');
      }
      // pequeno backoff antes de retry
      if (tentativa < tentativas) {
        await new Promise((r) => setTimeout(r, 200 * tentativa));
        continue;
      } else {
        throw ultimoErro;
      }
    }
  }

  throw ultimoErro ?? new Error('Erro desconhecido');
}

/* ---------------- FUNÇÕES PÚBLICAS ---------------- */

/**
 * Listar Pokémons (limit/offset)
 */
export async function listarPokemons({
  limite = 20,
  offset = 0,
  usarCache = true,
  sinalAbort = null,
}: {
  limite?: number;
  offset?: number;
  usarCache?: boolean;
  sinalAbort?: AbortSignal | null;
}): Promise<ResultadoLista> {
  const endpoint = `${BASE_URL}/pokemon?limit=${limite}&offset=${offset}`;
  const chave = gerarChave(endpoint);

  // tentar cache memória
  const mem = cacheMemoria.get(chave);
  if (usarCache && cacheValido(mem)) return mem!.dados;

  // tentar cache persistente
  if (usarCache) {
    const pers = await lerCachePersistente(chave);
    if (cacheValido(pers)) {
      cacheMemoria.set(chave, pers!);
      return pers!.dados;
    }
  }

  // fetch
  const dados = await fetchComRetry(endpoint, { timeoutMs: TIMEOUT_MS, tentativas: TENTATIVAS, sinalAbort });

  // salvar cache
  const entry: CacheEntry = { ts: Date.now(), dados };
  cacheMemoria.set(chave, entry);
  salvarCachePersistente(chave, dados).catch(() => {});

  return dados as ResultadoLista;
}

/**
 * Listar pokemons por tipo (ex.: "fire", "water")
 * Retorna um array simples com { name, url } para compatibilidade
 */
export async function listarPorTipo({
  tipo,
  usarCache = true,
  sinalAbort = null,
}: {
  tipo: string;
  usarCache?: boolean;
  sinalAbort?: AbortSignal | null;
}): Promise<{ pokemon: { name: string; url: string }[] }> {
  const endpoint = `${BASE_URL}/type/${tipo}`;
  const chave = gerarChave(endpoint);

  const mem = cacheMemoria.get(chave);
  if (usarCache && cacheValido(mem)) return mem!.dados;

  if (usarCache) {
    const pers = await lerCachePersistente(chave);
    if (cacheValido(pers)) {
      cacheMemoria.set(chave, pers!);
      return pers!.dados;
    }
  }

  const dados = await fetchComRetry(endpoint, { timeoutMs: TIMEOUT_MS, tentativas: TENTATIVAS, sinalAbort });

  // o endpoint /type/{name} retorna objetos; normalizamos para { pokemon: [...] }
  const lista = (dados.pokemon ?? []).map((p: any) => p.pokemon);
  const resultado = { pokemon: lista };

  const entry: CacheEntry = { ts: Date.now(), dados: resultado };
  cacheMemoria.set(chave, entry);
  salvarCachePersistente(chave, resultado).catch(() => {});

  return resultado;
}


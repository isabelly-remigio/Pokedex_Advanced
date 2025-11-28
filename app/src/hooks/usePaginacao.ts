
import { useEffect, useRef, useState } from 'react';
import { listarPokemons } from '../api/api';

export function usePaginacao(limiteInicial = 20) {
  const [items, setItems] = useState<Array<{ name: string; url: string }>>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const carregouTudo = total !== null && items.length >= total;

  async function carregarPagina(limite = limiteInicial, reiniciar = false) {
    if (carregando) return;
    if (reiniciar) {
      setItems([]);
      setOffset(0);
      setTotal(null);
    }
    setCarregando(true);
    setErro(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await listarPokemons({
        limite,
        offset: reiniciar ? 0 : offset,
        sinalAbort: abortRef.current.signal,
        usarCache: true,
      });
      setItems((ant) => (reiniciar ? res.results : [...ant, ...res.results]));
      setOffset((o) => (reiniciar ? res.results.length : o + res.results.length));
      setTotal(res.count);
    } catch (e: any) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPagina();
    return () => abortRef.current?.abort();
  }, []);

  return {
    items,
    carregarMais: () => {
      if (!carregouTudo) carregarPagina();
    },
    recarregar: () => carregarPagina(undefined, true),
    carregando,
    erro,
    vazio: !carregando && items.length === 0,
    total,
  };
}

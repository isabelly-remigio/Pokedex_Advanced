// src/hooks/useBusca.ts
import { useEffect, useRef, useState } from 'react';
import { buscarDetalhesPokemon, listarPokemons } from '../api/api';

export function useBusca(debounceMs = 450) {
  const [termo, setTermo] = useState('');
  const [resultado, setResultado] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<Error | null>(null);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // limpar debounce ao desmontar
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!termo) {
      // quando limpar, volta lista paginada (a tela que usa esse hook decide)
      setResultado([]);
      setCarregando(false);
      setErro(null);
      abortRef.current?.abort();
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCarregando(true);
      setErro(null);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        // estratégia: primeiro tenta buscar pelo endpoint de detalhe (nome exato)
        const detalhe = await buscarDetalhesPokemon({
          nomeOuId: termo.toLowerCase(),
          sinalAbort: abortRef.current.signal,
          usarCache: true,
        });

        // transformar em formato de lista simples
        setResultado([detalhe]);
      } catch (e) {
        // se falhar (não encontrado) — fazemos fallback simples:
        // buscar páginas iniciais e filtrar client-side por nome
        try {
          const list = await listarPokemons({ limite: 200, offset: 0, sinalAbort: abortRef.current.signal, usarCache: true });
          const filtrado = list.results.filter((p) => p.name.includes(termo.toLowerCase()));
          setResultado(filtrado);
        } catch (e2: any) {
          setErro(e2);
        }
      } finally {
        setCarregando(false);
      }
    }, debounceMs);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termo]);

  return {
    termo,
    setTermo,
    resultado,
    carregando,
    erro,
    limpar: () => setTermo(''),
  };
}

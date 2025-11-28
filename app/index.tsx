
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, SafeAreaView, Text, ActivityIndicator } from 'react-native';
import BarraBusca from './src/components/BarraBusca';
import FiltroTipos from './src/components/FiltroTipos';
import PokemonCard from './src/components/CardPokemon';
import SkeletonCard from './src/components/SkeletonCard';
import { listarPokemons, listarPorTipo } from './src/api/api';
import { useConectividade } from './src/hooks/useConectividade';

function extrairIdDaUrl(url: string) {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const limite = 20;
  const [carregando, setCarregando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('');
  const [total, setTotal] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null); // para paginação/detalhes
  const searchAbortRef = useRef<AbortController | null>(null); // para pesquisa
  const { online } = useConectividade();
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  const [resultadoBusca, setResultadoBusca] = useState<any[]>([]);
  const [buscaCarregando, setBuscaCarregando] = useState(false);
  const [buscaErro, setBuscaErro] = useState<string | null>(null);
  const [nenhumEncontrado, setNenhumEncontrado] = useState<string | null>(null);

  const carregarPagina = useCallback(async (lim = limite, newOffset = offset) => {
    if (carregando) return;
    setCarregando(true);
    setErro(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      let res;
      if (tipo) {
        const data = await listarPorTipo({ tipo, sinalAbort: abortRef.current.signal });
        const pagina = data.pokemon.slice(newOffset, newOffset + lim);
        res = { results: pagina, count: data.pokemon.length };
      } else {
        res = await listarPokemons({ limite: lim, offset: newOffset, sinalAbort: abortRef.current.signal });
      }

const concurrency = 5; // 5 vezes simultâneas
const mapeados: any[] = [];

for (let i = 0; i < res.results.length; i += concurrency) {
  const chunk = res.results.slice(i, i + concurrency);

  const detalhesChunk = await Promise.all(
    chunk.map(async (r: any) => {
      const id = extrairIdDaUrl(r.url);
      const imagem = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      const detalhes = await fetch(`https://pokeapi.co/api/v2/pokemon/${r.name}`).then(res => res.json());
      const tipos = detalhes.types.map((t: any) => t.type.name);

      return { id, nome: r.name, imagem, tipos };
    })
  );

  mapeados.push(...detalhesChunk);
}


    //quando api dar erro, avisa o usuário que tem um problema
      if (newOffset === 0) setItems(mapeados);
      else setItems(prev => [...prev, ...mapeados]);

      setTotal(res.count ?? null);
      setOffset(newOffset + mapeados.length);

    } catch (e: any) {
      console.warn('Erro ao carregar pokemons', e);
      setErro('Erro ao carregar. Verifique sua conexão.');
    } finally {
      setCarregando(false);
    }
  }, [carregando, tipo, offset]);

  useEffect(() => {
    // reset quando troca tipo
    setItems([]);
    setOffset(0);
    carregarPagina(limite, 0);
    return () => abortRef.current?.abort();
  }, [tipo]);

  const carregarMais = async () => {
    if (buscaAtiva) return; // não paginar durante busca
    if (carregandoMais || carregando) return;
    if (total !== null && items.length >= total) return;

    setCarregandoMais(true);
    await carregarPagina(limite, offset);
    setCarregandoMais(false);
  };

//buuca ativa apartir de 3 letrar
  useEffect(() => {
    if (!busca || busca.trim().length < 3) {

        searchAbortRef.current?.abort();
      setBuscaAtiva(false);
      setResultadoBusca([]);
      setBuscaCarregando(false);
      setBuscaErro(null);
      setNenhumEncontrado(null);
      return;
    }

    // quando aqui, temos >= 3 palavras -> fazer busca
    const termo = busca.trim().toLowerCase();
    setBuscaAtiva(true);
    setBuscaCarregando(true);
    setBuscaErro(null);
    setNenhumEncontrado(null);
    searchAbortRef.current?.abort();
    searchAbortRef.current = new AbortController();

    let mounted = true;

    (async () => {
      try {
        // pegar lista grande (client-side filter). limit alto para cobrir todos os pokemons.
        const res = await listarPokemons({ limite: 2000, offset: 0, sinalAbort: searchAbortRef.current!.signal, usarCache: true });

        if (!mounted) return;

        const encontrados = (res.results ?? []).filter((r: any) => r.name.includes(termo));

        if (encontrados.length === 0) {
          setResultadoBusca([]);
          setNenhumEncontrado(`Nenhum Pokémon encontrado para "${busca}"`);
        } else {
          // mapear para estrutura visivel (id + imagem)
          const mapeados = encontrados.map((r: any) => {
            const id = extrairIdDaUrl(r.url);
            const imagem = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
            return { id, nome: r.name, imagem, tipos: [] as string[] };
          });
          setResultadoBusca(mapeados);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') {

            return;
        }
        console.warn('Erro na busca', e);
        setBuscaErro('Erro ao buscar Pokémon. Verifique a conexão.');
      } finally {
        if (mounted) setBuscaCarregando(false);
      }
    })();

    return () => {
      mounted = false;
      searchAbortRef.current?.abort();
    };
  }, [busca]);

  const listaParaRender = buscaAtiva ? resultadoBusca : items;
  const estaCarregandoInicial = carregando && items.length === 0;


  // pagina principal
  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
  <View style={{ flex: 1, padding: 16, paddingTop: 32 }}>
        <BarraBusca texto={busca} aoMudar={setBusca} />
       <FiltroTipos 
  tipoAtual={tipo}
  onSelectType={setTipo}
  onClearType={() => {
    setTipo('');
    setBusca(''); 
  }}
/>

        {online === false && (
          <Text style={{ color: '#b00', textAlign: 'center', marginBottom: 8 }}>
            Você está offline — mostrando dados em cache (se houver).
          </Text>
        )}

        {buscaAtiva && buscaCarregando && (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Buscando por "{busca}"...</Text>
          </View>
        )}

        {buscaAtiva && buscaErro && (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <Text style={{ color: 'red' }}>{buscaErro}</Text>
          </View>
        )}

        {buscaAtiva && nenhumEncontrado && (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <Text style={{ color: '#333' }}>{nenhumEncontrado}</Text>
          </View>
        )}

        {/* conteúdo principal */}
        {estaCarregandoInicial ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : erro && items.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text>{erro}</Text>
          </View>
        ) : (
          <FlatList
            data={listaParaRender}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <PokemonCard
  pokemon={item}
  onPress={(pokemon) => navigation.navigate('Detalhes', { pokemonId: pokemon.id })}
/>
}
            onEndReached={carregarMais}
            onEndReachedThreshold={0.4}
            ListFooterComponent={carregandoMais && !buscaAtiva ? <ActivityIndicator style={{ margin: 12 }} /> : null}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

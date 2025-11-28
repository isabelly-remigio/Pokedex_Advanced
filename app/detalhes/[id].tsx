import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchJson } from '../src/utils/http';
import { estilosDetalhes } from '../src/styles/Detalhes.styles';

export async function buscarDetalhesPokemon({ nomeOuId, sinalAbort }: { nomeOuId: string; sinalAbort?: AbortSignal }) {
  return fetchJson(`https://pokeapi.co/api/v2/pokemon/${nomeOuId}`, { signal: sinalAbort });
}

export async function buscarEspeciePokemon({ nomeOuId, sinalAbort }: { nomeOuId: string; sinalAbort?: AbortSignal }) {
  return fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${nomeOuId}`, { signal: sinalAbort });
}

export default function Detalhes() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [dados, setDados] = useState<any | null>(null);
  const [especie, setEspecie] = useState<any | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    async function carregar() {
      try {
        setCarregando(true);
        setErro(null);

        const detalhe = await buscarDetalhesPokemon({ nomeOuId: id, sinalAbort: abortRef.current.signal });
        setDados(detalhe);

        try {
          const specie = await buscarEspeciePokemon({ nomeOuId: id, sinalAbort: abortRef.current.signal });
          setEspecie(specie);
        } catch {
          setEspecie(null);
        }

      } catch {
        setErro('Não foi possível carregar detalhes.');
      } finally {
        setCarregando(false);
      }
    }

    carregar();
    return () => abortRef.current?.abort();
  }, [id]);

  if (carregando) return <View style={estilosDetalhes.center}><ActivityIndicator size="large" /></View>;
  if (erro || !dados) {
    return (
      <View style={estilosDetalhes.center}>
        <Text>{erro ?? 'Detalhes não encontrados.'}</Text>
        <TouchableOpacity style={estilosDetalhes.botao} onPress={() => router.back()}>
          <Text style={estilosDetalhes.botaoText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imagem = dados.sprites?.other?.['official-artwork']?.front_default ?? dados.sprites?.front_default;
  const flavorEntry = (especie?.flavor_text_entries ?? []).find((f: any) => f.language.name === 'pt') ||
                      (especie?.flavor_text_entries ?? []).find((f: any) => f.language.name === 'en');

  return (
    <ScrollView style={estilosDetalhes.container}>
      <TouchableOpacity style={estilosDetalhes.voltar} onPress={() => router.back()}>
        <Ionicons name="arrow-back-circle" size={36} color="#ef5350" />
      </TouchableOpacity>

      <View style={estilosDetalhes.card}>
        <Image source={{ uri: imagem }} style={estilosDetalhes.imagem} />
        <Text style={estilosDetalhes.nome}>{dados.name} #{dados.id}</Text>

        <View style={estilosDetalhes.tipoRow}>
          {dados.types.map((t: any) => (
            <View key={t.type.name} style={estilosDetalhes.tipoBadge}>
              <Text style={estilosDetalhes.tipoText}>{t.type.name}</Text>
            </View>
          ))}
        </View>

        <View style={estilosDetalhes.infoRow}>
          <Text>Altura: {dados.height}</Text>
          <Text>Peso: {dados.weight}</Text>
        </View>

        <View style={estilosDetalhes.statsContainer}>
          <Text style={estilosDetalhes.statsTitle}>Stats</Text>
          {dados.stats.map((s: any) => (
            <View key={s.stat.name} style={estilosDetalhes.statRow}>
              <Text style={estilosDetalhes.statName}>{s.stat.name}</Text>
              <View style={estilosDetalhes.statBarFundo}>
                <View style={[estilosDetalhes.statBar, { width: `${Math.min(100, s.base_stat)}%` }]} />
              </View>
              <Text style={estilosDetalhes.statValue}>{s.base_stat}</Text>
            </View>
          ))}
        </View>

        {flavorEntry && (
          <View style={estilosDetalhes.descricaoContainer}>
            <Text style={estilosDetalhes.descricaoTitle}>Descrição</Text>
            <Text style={estilosDetalhes.descricaoText}>
              {flavorEntry.flavor_text.replace(/\n|\f/g, ' ')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { estilosCard } from '../styles/CardPokemon.styles';
import { coresPorTipo } from '../styles/tiposCores';
import { useRouter } from 'expo-router';

export default function PokemonCard({ pokemon }: { pokemon: any }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/detalhes/${pokemon.id}`)}
    >
      <View style={estilosCard.container}>
        <Image source={{ uri: pokemon.imagem }} style={estilosCard.imagem} />
        <View style={estilosCard.info}>
          <Text style={estilosCard.nome}>{pokemon.nome}</Text>
          <View style={estilosCard.tipoContainer}>
            {pokemon.tipos.map((t: string) => (
              <View
                key={t}
                style={[
                  estilosCard.tipoBadge,
                  { backgroundColor: coresPorTipo[t] || '#777' },
                ]}
              >
                <Text style={estilosCard.tipoTexto}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

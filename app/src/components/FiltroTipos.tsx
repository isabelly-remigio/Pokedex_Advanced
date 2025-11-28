import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { coresPorTipo } from '../styles/tiposCores';

const tipos = [
  'fire','water','grass','electric','normal','bug','poison',
  'ground','fairy','fighting','psychic','rock','ghost','dragon',
];

export default function FiltroTipos({ tipoAtual, onSelectType }: any) {
  return (
    <View style={{ marginTop: 10, marginBottom: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
      >
        {tipos.map((t) => {
          const ativo = tipoAtual === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => onSelectType(ativo ? '' : t)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: coresPorTipo[t] + '33', // cor do tipo com transparência
                borderWidth: ativo ? 1 : 0,
                borderColor: coresPorTipo[t],
              }}
            >
              <Text
                style={{
                  textTransform: 'capitalize',
                  fontWeight: ativo ? 'bold' : 'normal',
                  color: '#000',
                }}
              >
                {t}
              </Text>
              {ativo && (
                <Text style={{ marginLeft: 6, fontWeight: 'bold', fontSize: 14, color: '#900' }}>
                  ×
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

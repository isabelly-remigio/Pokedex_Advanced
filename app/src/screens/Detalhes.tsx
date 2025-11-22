import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Detalhes() {
  return (
    <View style={estilos.container}>
      <Text>Tela de Detalhes</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
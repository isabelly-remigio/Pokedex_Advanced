import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Loading from '../components/Loading';

export default function Home() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Mini Pokédex</Text>
      <Loading />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
});
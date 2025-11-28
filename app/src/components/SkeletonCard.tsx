import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function SkeletonCard() {
  return (
    <View style={styles.container}>
      <View style={styles.imagem} />
      <View style={styles.textoLinha} />
      <View style={[styles.textoLinha, { width: '50%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 12,
  },
  imagem: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#e6e6e6',
  },
  textoLinha: {
    height: 16,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    width: '70%',
    marginBottom: 8,
  },
});

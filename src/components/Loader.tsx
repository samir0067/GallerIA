/**
 * components/Loader.tsx
 *
 * Composant réutilisable qui affiche un indicateur de chargement.
 * On le montre pendant que les données se chargent depuis l'API,
 * pour informer l'utilisateur que l'application travaille.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export function Loader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C63FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

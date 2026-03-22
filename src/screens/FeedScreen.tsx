/**
 * screens/FeedScreen.tsx
 *
 * Écran principal de l'application : affiche le fil de photos chargées depuis l'API.
 * Un "écran" (screen) représente une page complète de l'application.
 * C'est ici que l'utilisateur voit les photos et peut en ajouter depuis sa galerie.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TODO (étape suivante) : afficher la liste de photos avec usePhotos + PhotoCard
export function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>📷 Le feed arrive bientôt…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  placeholder: {
    fontSize: 18,
    color: '#aaa',
  },
});

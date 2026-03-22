/**
 * screens/FavoritesScreen.tsx
 *
 * Écran des favoris : affiche les photos que l'utilisateur a marquées comme favorites.
 * Les favoris sont persistés localement avec AsyncStorage (via le hook useFavorites),
 * ce qui signifie qu'ils sont conservés même après redémarrage de l'application.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TODO (étape suivante) : afficher les favoris avec useFavorites + PhotoCard
export function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>❤️ Tes favoris apparaîtront ici…</Text>
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

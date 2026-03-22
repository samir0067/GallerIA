/**
 * components/Loader.tsx
 *
 * Composant réutilisable qui affiche un indicateur de chargement.
 * On le montre pendant que les données se chargent depuis l'API,
 * pour informer l'utilisateur que l'application travaille.
 *
 * Notions abordées : ActivityIndicator, centrage avec Flexbox (justifyContent + alignItems)
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Couleur principale de l'application (indigo)
const PRIMARY_COLOR = '#6366f1';

export function Loader() {
  return (
    // flex:1 fait que la View occupe tout l'espace disponible
    // justifyContent + alignItems centrent les enfants au milieu
    <View style={styles.container}>
      <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      <Text style={styles.label}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Conteneur qui occupe tout l'écran et centre son contenu
  container: {
    flex: 1,
    justifyContent: 'center',  // centrage vertical
    alignItems: 'center',      // centrage horizontal
    backgroundColor: '#ffffff',
  },

  // Texte affiché sous le spinner
  label: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});

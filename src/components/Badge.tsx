/**
 * components/Badge.tsx
 *
 * Petit badge circulaire pour afficher un compteur ou une étiquette.
 * Ce composant illustre comment créer un cercle en React Native :
 * il suffit que width = height ET borderRadius = width / 2.
 *
 * Utilisations typiques :
 *   - Nombre de favoris sur l'onglet navigation
 *   - Nombre de notifications non lues
 *   - Compteur dans un SectionHeader
 *
 * Props :
 *   - count : le nombre à afficher (obligatoire)
 *   - color : couleur de fond du badge (optionnel, défaut : #6366f1)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  count: number;
  color?: string;
};

// Taille fixe du badge — centralisée pour cohérence entre styles.badge et styles.text
const BADGE_SIZE = 20;

export function Badge({ count, color = '#6366f1' }: Props) {
  return (
    <View
      style={[
        styles.badge,
        // StyleSheet.create + tableau de styles : permet de surcharger une couleur
        // dynamiquement sans perdre les autres propriétés du style de base
        { backgroundColor: color },
      ]}
    >
      {/*
        Si count > 99, on affiche "99+" pour éviter que le badge déborde.
        Sinon on affiche le nombre tel quel.
      */}
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Cercle coloré — la règle : borderRadius = taille / 2 pour un cercle parfait
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,  // → 10, ce qui donne un cercle parfait
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: BADGE_SIZE,          // s'étire si le nombre est à 2 chiffres ("99+")
  },

  // Texte blanc centré dans le badge
  text: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
});

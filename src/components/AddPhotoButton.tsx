/**
 * components/AddPhotoButton.tsx
 *
 * Bouton d'action flottant (FAB — Floating Action Button) pour ajouter
 * une photo depuis la galerie du téléphone.
 *
 * Le FAB est un pattern UI très courant sur mobile (voir Gmail, Google Maps).
 * Il est positionné en "position: absolute" pour flotter par-dessus le contenu.
 *
 * Props :
 *   - onPress   : callback déclenché au tap
 *   - isLoading : si true, remplace le "+" par un spinner
 *
 * Notions abordées :
 *   - position: 'absolute' pour superposer un élément au contenu
 *   - ActivityIndicator comme feedback de chargement dans un bouton
 *   - Rendu conditionnel dans un composant bouton
 */

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

type Props = {
  onPress: () => void;
  isLoading: boolean;
};

// Taille du bouton circulaire — centralisée pour le borderRadius
const BUTTON_SIZE = 60;

export function AddPhotoButton({ onPress, isLoading }: Props) {
  return (
    /*
     * position: 'absolute' retire le bouton du flux normal.
     * bottom + right le placent dans le coin inférieur droit.
     * Le composant PARENT (FavoritesScreen) doit avoir position: 'relative'
     * (c'est le cas par défaut pour les View en React Native).
     */
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={isLoading}   // désactivé pendant le chargement
      activeOpacity={0.85}
    >
      {isLoading ? (
        // Spinner blanc pendant que la galerie s'ouvre ou que l'image charge
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        // Icône "+" grande et blanche
        <Text style={styles.icon}>+</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Bouton rond positionné en bas à droite de l'écran parent
  button: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,  // cercle parfait : radius = taille / 2
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    // Ombre prononcée pour que le bouton "flotte" visuellement au-dessus du contenu
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // Icône "+" blanche et grande
  icon: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
    lineHeight: 36,
    marginTop: -2, // ajustement visuel pour centrer le "+" optiquement
  },
});

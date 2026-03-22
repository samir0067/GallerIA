/**
 * components/PhotoCard.tsx
 *
 * Composant réutilisable qui affiche une photo sous forme de carte.
 * Un "composant" est un bloc d'interface indépendant que l'on peut utiliser
 * plusieurs fois dans différents écrans — ici, dans le Feed et dans les Favoris.
 *
 * Notions abordées : View, Image, Text, TouchableOpacity, StyleSheet, position absolute
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Photo } from '../types';

// Définition des props (paramètres) que le composant accepte
type Props = {
  photo: Photo;
  isFavorite: boolean;
  onPress: () => void;          // appelée quand l'utilisateur tape sur la carte
  onFavoritePress: () => void;  // appelée quand l'utilisateur tape sur le cœur
};

export function PhotoCard({ photo, isFavorite, onPress, onFavoritePress }: Props) {
  return (
    // TouchableOpacity rend toute la carte cliquable et ajoute un effet de transparence au tap
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>

      {/* Image miniature de la photo — aspectRatio:1 la force en carré */}
      <Image
        source={{ uri: photo.thumbnailUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Titre de la photo, tronqué à 2 lignes si trop long */}
      <Text style={styles.title} numberOfLines={2}>
        {photo.title}
      </Text>

      {/*
        Bouton favori positionné en absolu en haut à droite de la carte.
        "position: 'absolute'" extrait l'élément du flux normal et permet
        de le placer précisément par rapport à son parent.
      */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onFavoritePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.favoriteIcon}>
          {isFavorite ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal de la carte
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',      // masque ce qui dépasse les coins arrondis (image)
    // Ombre sur iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    // Ombre sur Android
    elevation: 3,
  },

  // Image carrée qui prend toute la largeur de la carte
  image: {
    width: '100%',
    aspectRatio: 1,           // hauteur = largeur → image toujours carrée
    backgroundColor: '#f0f0f0', // fond gris pendant le chargement de l'image
  },

  // Titre en bas de la carte
  title: {
    padding: 8,
    fontSize: 12,
    lineHeight: 16,
    color: '#374151',
    fontWeight: '500',
  },

  // Bouton cœur positionné en absolu en haut à droite
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // fond semi-transparent pour la lisibilité
    borderRadius: 20,
    padding: 4,
  },

  // Taille de l'icône cœur
  favoriteIcon: {
    fontSize: 16,
  },
});

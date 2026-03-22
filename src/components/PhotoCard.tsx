/**
 * components/PhotoCard.tsx
 *
 * Composant réutilisable qui affiche une photo sous forme de carte.
 * Un "composant" est un bloc d'interface indépendant que l'on peut utiliser
 * plusieurs fois dans différents écrans — ici, dans le Feed et dans les Favoris.
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Photo } from '../types';

type Props = {
  photo: Photo;
  isFavorite: boolean;
  onToggleFavorite: (photo: Photo) => void;
};

// TODO (étape suivante) : implémenter l'affichage complet de la carte
export function PhotoCard({ photo, isFavorite, onToggleFavorite }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: photo.thumbnailUrl }} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>{photo.title}</Text>
      <TouchableOpacity onPress={() => onToggleFavorite(photo)} style={styles.favoriteButton}>
        <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  title: {
    padding: 8,
    fontSize: 13,
    color: '#333',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoriteIcon: {
    fontSize: 20,
  },
});

/**
 * components/PhotoCard.tsx
 *
 * Composant réutilisable qui affiche une photo sous forme de carte.
 * Accepte maintenant 2 types de photos :
 *   - Photo API (thumbnailUrl comme source d'image)
 *   - LocalPhoto (uri local comme source d'image)
 *
 * La prop "imageSource" découple la source de l'image du type de photo,
 * ce qui rend le composant utilisable dans les deux contextes.
 *
 * Notions abordées : View, Image, Text, TouchableOpacity, StyleSheet,
 * position absolute, badge conditionnel, union de types TypeScript
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Photo, LocalPhoto } from '../types';

type Props = {
  /** La photo à afficher — peut être une Photo API ou une LocalPhoto */
  photo: Photo | LocalPhoto;

  /**
   * Source de l'image à afficher dans la carte.
   * Pour une Photo API : passer photo.thumbnailUrl
   * Pour une LocalPhoto : passer photo.uri
   * Ce champ est explicite pour ne pas avoir de logique de détection dans le composant.
   */
  imageSource: string;

  /** Si true, affiche un badge "📱 Local" pour distinguer les photos locales */
  isLocal?: boolean;

  /** true si cette photo est dans la liste des favoris */
  isFavorite: boolean;

  /** Appelée quand l'utilisateur tape sur la carte */
  onPress: () => void;

  /** Appelée quand l'utilisateur tape sur le cœur */
  onFavoritePress: () => void;
};

export function PhotoCard({
  photo,
  imageSource,
  isLocal = false,
  isFavorite,
  onPress,
  onFavoritePress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>

      {/* Image — source fournie explicitement en prop pour supporter les deux types */}
      <Image
        source={{ uri: imageSource }}
        style={styles.image}
        resizeMode="cover"
      />

      {/*
        Badge "📱 Local" — affiché uniquement pour les photos venant de la galerie.
        Positionné en absolu en haut à GAUCHE (le cœur est à droite).
      */}
      {isLocal && (
        <View style={styles.localBadge}>
          <Text style={styles.localBadgeText}>📱 Local</Text>
        </View>
      )}

      {/* Titre tronqué à 2 lignes */}
      <Text style={styles.title} numberOfLines={2}>
        {photo.title}
      </Text>

      {/* Bouton cœur positionné en absolu en haut à droite */}
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  // Image carrée qui prend toute la largeur de la carte
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },

  // Titre en bas de la carte
  title: {
    padding: 8,
    fontSize: 12,
    lineHeight: 16,
    color: '#374151',
    fontWeight: '500',
  },

  // Badge "📱 Local" en haut à gauche — positionné en absolu
  localBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  localBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Bouton cœur positionné en absolu en haut à droite
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 4,
  },

  favoriteIcon: {
    fontSize: 16,
  },
});

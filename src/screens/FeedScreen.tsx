/**
 * screens/FeedScreen.tsx
 *
 * Écran principal : affiche la grille de photos avec gestion d'état complète.
 * Cet écran NE GÈRE PLUS d'état directement — il délègue tout à des hooks :
 *   - usePhotos()    → photos, loading, error, reload
 *   - useFavorites() → favorites, isFavorite, toggleFavorite
 *
 * C'est le principe de "séparation des responsabilités" :
 *   FeedScreen = affichage uniquement
 *   Hooks      = logique et état
 *
 * Notions abordées :
 *   - Rendu conditionnel selon l'état (loading / error / données)
 *   - Composition de hooks dans un écran
 *   - Passage de callbacks aux composants enfants
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Photo } from '../types';
import { PhotoCard } from '../components/PhotoCard';
import { SectionHeader } from '../components/SectionHeader';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { usePhotos } from '../hooks/usePhotos';
import { useFavorites } from '../hooks/useFavorites';

// --- Calcul de la largeur des cartes (identique à l'étape précédente) ---
const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 12;
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export function FeedScreen() {
  /*
   * usePhotos() fournit tout ce qui concerne les données photos :
   *   photos  → tableau de photos (vide pendant loading)
   *   loading → true pendant les 1500ms de simulation
   *   error   → string si échec, null si ok
   *   reload  → fonction pour relancer le chargement
   */
  const { photos, loading, error, reload } = usePhotos();

  /*
   * useFavorites() lit depuis le FavoritesContext (partagé avec FavoritesScreen).
   * Tout changement ici se reflète instantanément dans l'onglet Favoris
   * ET dans le Badge de la barre de navigation.
   */
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const handleFavoritePress = (photo: Photo) => {
    const wasAlreadyFavorite = isFavorite(photo.id);
    toggleFavorite(photo);
    // Feedback visuel sonore uniquement à l'ajout (pas au retrait)
    if (!wasAlreadyFavorite) {
      Alert.alert('Favori ajouté !', `"${photo.title}" sauvegardé dans tes favoris ❤️`);
    }
  };

  const handleCardPress = (photo: Photo) => {
    Alert.alert('📷 Photo', photo.title);
  };

  return (
    <View style={styles.screen}>

      {/* Bandeau d'en-tête — toujours visible, même pendant le chargement */}
      <View style={styles.headerBand}>
        <Text style={styles.headerTitle}>🖼️ GallerIA</Text>
        <Text style={styles.headerSubtitle}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''} · {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/*
        Rendu conditionnel — les 3 états possibles de l'écran :
        1. loading=true  → Loader (spinner centré)
        2. error≠null    → ErrorMessage (avec bouton Réessayer)
        3. sinon         → grille de photos

        C'est le pattern standard de gestion d'état asynchrone en React :
        on teste loading en premier (priorité sur error et data).
      */}
      {loading ? (
        // État 1 : chargement en cours — Loader occupe tout l'espace restant
        <Loader />
      ) : error ? (
        // État 2 : erreur — onRetry est connecté à reload() du hook
        <ErrorMessage
          message={error}
          onRetry={reload}
        />
      ) : (
        // État 3 : données disponibles — affichage de la grille
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SectionHeader
            title="Découvrir"
            subtitle="Photos du moment"
          />

          <View style={styles.grid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.cardWrapper}>
                <PhotoCard
                  photo={photo}
                  isFavorite={isFavorite(photo.id)}
                  onPress={() => handleCardPress(photo)}
                  onFavoritePress={() => handleFavoritePress(photo)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal
  screen: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  // Bandeau coloré permanent en haut de l'écran
  headerBand: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  // Sous-titre dynamique : se met à jour dès que photos ou favorites changent
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
  },

  // Conteneur scrollable (colonne par défaut — laisse SectionHeader pleine largeur)
  scrollContent: {
    paddingBottom: 32,
  },

  // Grille 2 colonnes
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },

  // Wrapper d'une carte avec largeur calculée dynamiquement
  cardWrapper: {
    width: CARD_WIDTH,
  },
});
